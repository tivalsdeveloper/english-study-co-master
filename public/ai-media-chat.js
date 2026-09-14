(() => {
  const SUPABASE_URL = "https://kxuszpixwfecawdeqkrx.supabase.co";
  const ANON_KEY = "sb_publishable__auyhjNpepXiYdGV5HEJ_A_AGsPbBuS";
  const STORE = "english-ai-media-history";
  let mode = null;
  let busy = false;

  const css = document.createElement("style");
  css.textContent = `
    .ai-media-tools{display:flex;gap:8px;padding:8px 12px 2px;flex-wrap:wrap}
    .ai-media-tools button{border:1px solid #d9dee8;background:#fff;border-radius:999px;padding:8px 12px;font:inherit;display:flex;align-items:center;gap:6px;cursor:pointer}
    .ai-media-tools button.active{background:#111827;color:#fff;border-color:#111827}
    .ai-media-tools button:disabled{opacity:.55;cursor:not-allowed}
    .ai-media-card{margin-top:8px;overflow:hidden;border-radius:14px;border:1px solid #e5e7eb;background:#fff}
    .ai-media-card img,.ai-media-card video{display:block;width:100%;max-height:430px;object-fit:contain;background:#0b1020}
    .ai-media-card footer{display:flex;gap:8px;padding:10px;align-items:center;flex-wrap:wrap}
    .ai-media-card a,.ai-media-card button{border:1px solid #d9dee8;background:#fff;border-radius:9px;padding:7px 10px;text-decoration:none;color:inherit;font:inherit;cursor:pointer}
    .ai-media-label{font-size:12px;opacity:.7;margin-right:auto}
  `;
  document.head.appendChild(css);

  function history() {
    try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch { return []; }
  }
  function save(item) {
    const items = [...history(), item].slice(-30);
    localStorage.setItem(STORE, JSON.stringify(items));
  }
  function mediaUrls(value) {
    const found = [];
    const visit = v => {
      if (typeof v === "string" && /^https?:\/\//i.test(v) && /\.(png|jpe?g|webp|mp4|webm)(\?|$)/i.test(v)) found.push(v);
      else if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === "object") Object.values(v).forEach(visit);
    };
    visit(value);
    return [...new Set(found)];
  }
  async function invoke(type, prompt) {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/pixazo-studio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({ type, prompt })
    });
    let data;
    try { data = await r.json(); } catch { data = {}; }
    if (!r.ok || data?.error) throw new Error(data?.error || `Generation failed (${r.status}).`);
    return data;
  }
  function addCard(messages, item, persist = false) {
    if (!messages || messages.querySelector(`[data-media-id="${item.id}"]`)) return;
    const article = document.createElement("article");
    article.className = "assistant";
    article.dataset.mediaId = item.id;
    article.innerHTML = `<b>AI Tutor</b><div class="ai-message-content"><p>${item.type === "video" ? "Generated video" : "Generated image"}: ${escapeHtml(item.prompt)}</p><div class="ai-media-card"></div></div>`;
    const card = article.querySelector(".ai-media-card");
    const media = item.type === "video" ? document.createElement("video") : document.createElement("img");
    media.src = item.url;
    if (item.type === "video") { media.controls = true; media.playsInline = true; }
    else media.alt = item.prompt;
    const footer = document.createElement("footer");
    footer.innerHTML = `<span class="ai-media-label">${item.type === "video" ? "Video" : "Image"} generated in chat</span><a href="${item.url}" target="_blank" rel="noopener" download>Download</a><button type="button">Regenerate</button>`;
    footer.querySelector("button").onclick = () => generate(item.type, item.prompt, messages);
    card.append(media, footer);
    messages.appendChild(article);
    messages.scrollTop = messages.scrollHeight;
    if (persist) save(item);
  }
  function escapeHtml(s) {
    const d = document.createElement("div"); d.textContent = s; return d.innerHTML;
  }
  async function generate(type, prompt, messages) {
    if (busy) return;
    busy = true;
    setButtonsDisabled(true);
    const pending = document.createElement("article");
    pending.className = "assistant ai-thinking ai-media-pending";
    pending.innerHTML = `<b>AI Tutor</b><p>Generating ${type}…</p>`;
    messages.appendChild(pending);
    messages.scrollTop = messages.scrollHeight;
    try {
      const data = await invoke(type, prompt);
      const urls = mediaUrls(data);
      if (!urls.length) throw new Error("Generation completed but no media URL was returned.");
      pending.remove();
      addCard(messages, { id: crypto.randomUUID(), type, prompt, url: urls[0] }, true);
    } catch (e) {
      pending.innerHTML = `<b>AI Tutor</b><div class="ai-error">${escapeHtml(e?.message || "Generation failed.")}</div>`;
    } finally {
      busy = false;
      setButtonsDisabled(false);
      mode = null;
      updateActive();
    }
  }
  function setButtonsDisabled(value) {
    document.querySelectorAll(".ai-media-tools button").forEach(b => b.disabled = value);
  }
  function updateActive() {
    document.querySelectorAll(".ai-media-tools button").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  }
  function detect(text) {
    if (/^\s*(generate|create|make|draw)\s+(an?\s+)?(image|picture|photo|illustration)\b/i.test(text)) return "image";
    if (/^\s*(generate|create|make)\s+(an?\s+)?(video|clip|animation)\b/i.test(text)) return "video";
    return null;
  }
  function cleanPrompt(text, type) {
    const rx = type === "image"
      ? /^\s*(generate|create|make|draw)\s+(an?\s+)?(image|picture|photo|illustration)\s*(of|showing|about)?\s*/i
      : /^\s*(generate|create|make)\s+(an?\s+)?(video|clip|animation)\s*(of|showing|about)?\s*/i;
    return text.replace(rx, "").trim() || text.trim();
  }
  function enhance() {
    const tutor = document.querySelector(".ai-tutor");
    const form = tutor?.querySelector("form.ai-compose");
    const messages = tutor?.querySelector(".ai-messages");
    if (!tutor || !form || !messages || form.dataset.mediaEnhanced) return;
    form.dataset.mediaEnhanced = "1";

    const tools = document.createElement("div");
    tools.className = "ai-media-tools";
    tools.innerHTML = `<button type="button" data-mode="image">🖼️ Generate image</button><button type="button" data-mode="video">🎬 Generate video</button>`;
    form.parentNode.insertBefore(tools, form);
    tools.querySelectorAll("button").forEach(btn => btn.onclick = () => {
      mode = mode === btn.dataset.mode ? null : btn.dataset.mode;
      updateActive();
      const input = form.querySelector("textarea[name=message]");
      if (input) { input.placeholder = mode ? `Describe the ${mode} you want…` : "Ask your English question…"; input.focus(); }
    });

    history().forEach(item => addCard(messages, item, false));

    form.addEventListener("submit", e => {
      const input = form.querySelector("textarea[name=message]");
      const text = input?.value?.trim();
      const type = mode || detect(text || "");
      if (!type || !text) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const user = document.createElement("article");
      user.className = "user";
      user.innerHTML = `<b>You</b><div class="ai-message-content"><p>${escapeHtml(text)}</p></div>`;
      messages.appendChild(user);
      input.value = "";
      generate(type, cleanPrompt(text, type), messages);
    }, true);
  }

  const observer = new MutationObserver(enhance);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhance();
})();
