(() => {
  const AI_URL = "https://kxuszpixwfecawdeqkrx.supabase.co/functions/v1/ai-tutor";

  async function generate(form, button) {
    const title = form.querySelector('[name="title"]');
    const level = form.querySelector('[name="level"]');
    const content = form.querySelector('[name="content"]');
    if (!title || !level || !content) return;

    const topic = window.prompt("What topic should the AI lesson teach?", title.value || "Verbs");
    if (!topic) return;

    const old = button.innerHTML;
    button.disabled = true;
    button.textContent = "✨ Generating lesson…";
    try {
      const response = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "create-lesson",
          messages: [{
            role: "user",
            content: `Create a complete English lesson about ${topic} for ${level.value || "English learners"}. Include objectives, clear teaching explanation, examples, vocabulary where useful, guided practice, student activity, a quick check, homework and teacher notes.`
          }]
        })
      });
      const data = await response.json();
      if (!response.ok || !data.reply) throw new Error(data.error || "AI could not generate the lesson.");
      title.value = topic;
      content.value = data.reply;
      title.dispatchEvent(new Event("input", { bubbles: true }));
      content.dispatchEvent(new Event("input", { bubbles: true }));
      content.focus();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "AI could not generate the lesson.");
    } finally {
      button.disabled = false;
      button.innerHTML = old;
    }
  }

  function enhance() {
    document.querySelectorAll(".lesson-editor form").forEach((form) => {
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.querySelector('[name="content"]') || form.dataset.aiLessonReady) return;
      form.dataset.aiLessonReady = "true";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ai-assist ai-lesson-generator";
      button.innerHTML = "✨ Generate lesson with AI";
      button.style.cssText = "width:100%;margin:10px 0 18px;padding:14px 18px;border:0;border-radius:14px;background:#e2f5ed;color:#125b46;font-weight:800;font-size:16px;cursor:pointer";
      const heading = form.querySelector("h3");
      if (heading) heading.insertAdjacentElement("afterend", button);
      else form.prepend(button);
      button.addEventListener("click", () => generate(form, button));
    });
  }

  const observer = new MutationObserver(enhance);
  function start() {
    enhance();
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();