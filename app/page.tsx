"use client";
import { FormEvent, useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import {
  Award,
  BookMarked,
  Bookmark,
  BookOpen,
  Bot,
  CheckCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Headphones,
  Lightbulb,
  LogOut,
  Menu,
  MessageCircle,
  Monitor,
  PenLine,
  Search,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  Volume2,
  X,
} from "lucide-react";
const db = createClient(
  "https://kxuszpixwfecawdeqkrx.supabase.co",
  "sb_publishable__auyhjNpepXiYdGV5HEJ_A_AGsPbBuS",
);
async function callAI<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await db.functions.invoke("ai-tutor", { body });
  if (error)
    throw new Error(error.message || "The AI service could not be reached.");
  if (data?.error) throw new Error(data.error);
  return data as T;
}
type Profile = {
  id: string;
  full_name: string;
  username: string;
  role: string;
};
type Group = {
  id: string;
  name: string;
  level: string;
  invite_code: string;
  teacher_id: string;
};
type Msg = {
  id: number;
  body: string;
  created_at: string;
  user_id: string;
  english_profiles?: { username: string } | null;
};
type GroupLesson = {
  id: string;
  title: string;
  content: string;
  level: string;
  created_at: string;
  teacher_id: string;
};
type Assignment = {
  id: string;
  title: string;
  instructions: string;
  due_at: string | null;
  max_points: number;
  created_at: string;
  teacher_id: string;
};
type Submission = {
  id: string;
  assignment_id: string;
  student_id: string;
  answer: string;
  submitted_at: string;
  score: number | null;
  feedback: string;
  english_profiles?: { username: string } | null;
};
type DictEntry = {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
    synonyms?: string[];
    antonyms?: string[];
  }[];
};
type SavedWord = {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  created_at: string;
};

function LessonContent({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).filter(Boolean);
  return <div className="lesson-content">{blocks.map((block, index) => {
    const lines = block.split("\n"), heading = lines[0].replace(/^#+\s*/, "").replace(/:$/, ""), body = lines.slice(1).join("\n");
    const kind = /objective|goal/i.test(heading) ? "objectives" : /example/i.test(heading) ? "examples" : /practice|exercise|try/i.test(heading) ? "practice" : "explanation";
    if (lines.length === 1 && index === 0) return <p className="lesson-intro" key={index}>{block}</p>;
    return <section className={`lesson-block ${kind}`} key={index}><h4>{kind === "objectives" ? "◎" : kind === "examples" ? "💡" : kind === "practice" ? "✎" : "▣"} {heading}</h4><p>{body || block}</p></section>;
  })}</div>;
}
const lessons = [
  {
    level: "Beginner",
    title: "Greetings & introductions",
    summary: "Introduce yourself and greet people naturally.",
    time: "8 min",
    content:
      "Goal: Greet someone and introduce yourself.\n\nUseful words\n• Hello / Hi — a friendly greeting\n• Good morning — use before midday\n• My name is… — say your name\n• Nice to meet you — say this when meeting someone\n\nExample conversation\nA: Hello! My name is Lufuno. What is your name?\nB: Hi, Lufuno. I’m Thandi. Nice to meet you.\nA: Nice to meet you too.\n\nPractice\nWrite four sentences introducing yourself. Include your name, where you live, one thing you enjoy, and “Nice to meet you.”",
  },
  {
    level: "Elementary",
    title: "Everyday conversations",
    summary: "Ask useful questions for school and daily life.",
    time: "12 min",
    content:
      "Goal: Ask and answer common everyday questions.\n\nUseful questions\n• How are you today?\n• Where are you going?\n• What time does the lesson start?\n• Could you please help me?\n\nExample conversation\nA: Good morning. What time does the English lesson start?\nB: It starts at ten o’clock.\nA: Thank you. Could you please show me the classroom?\nB: Of course. Follow me.\n\nLanguage tip\nUse “please” and “thank you” to sound polite. Use “Could you…?” when requesting help.\n\nPractice\nCreate a six-line conversation between a student and a teacher. Use at least two questions.",
  },
  {
    level: "Intermediate",
    title: "Speak with confidence",
    summary: "Build clear sentences and fluent responses.",
    time: "15 min",
    content:
      "Goal: Give longer, clearer answers without rushing.\n\nA strong answer has three parts:\n1. Answer the question directly.\n2. Give a reason.\n3. Add an example.\n\nQuestion: Why are you learning English?\nShort answer: For university.\nStrong answer: I am learning English because I want to communicate confidently at university. For example, I want to participate in class discussions and present my projects clearly.\n\nSpeaking tip\nPause between ideas. Words such as “because”, “for example”, “however” and “therefore” connect your thoughts.\n\nPractice\nAnswer this question in four sentences: What skill would you like to learn this year, and why?",
  },
  {
    level: "Beginner",
    title: "Verbs: action and being words",
    summary: "Use verbs correctly to describe actions and states.",
    time: "12 min",
    content:
      "Goal: Identify and use verbs in complete sentences.\n\nA verb tells us what someone or something does, or what state it is in.\n\nAction verbs\n• run, study, write, speak, cook\nExample: Lerato writes a letter.\n\nBeing verbs\n• am, is, are, was, were\nExample: I am ready. They are students.\n\nVerb agreement\nUse -s with he, she and it in the simple present.\n• I study English.\n• She studies English.\n• They play football.\n• He plays football.\n\nPractice\nUnderline the verb in each sentence, then write five sentences using five different action verbs.",
  },
  {
    level: "Beginner",
    title: "Nouns and pronouns",
    summary: "Name people, places and things without repeating words.",
    time: "11 min",
    content:
      "Goal: Recognise nouns and replace them with suitable pronouns.\n\nA noun names a person, place, thing or idea.\n• person: teacher\n• place: school\n• thing: book\n• idea: courage\n\nA pronoun replaces a noun.\n• Lufuno reads. He reads.\n• The learners listen. They listen.\n\nCommon pronouns\nI, you, he, she, it, we, they\n\nPractice\nWrite six nouns you can see around you. Then write three sentences and replace one noun in each sentence with a pronoun.",
  },
  {
    level: "Elementary",
    title: "Adjectives and adverbs",
    summary: "Add clear details about nouns, verbs and actions.",
    time: "13 min",
    content:
      "Goal: Make sentences more descriptive.\n\nAn adjective describes a noun.\n• a helpful teacher\n• a difficult question\n\nAn adverb often describes a verb and tells us how, when or where.\n• She speaks clearly.\n• We arrived early.\n\nCompare\nPlain: The student answered.\nDetailed: The confident student answered politely.\n\nPractice\nDescribe your classroom using five adjectives. Then write three sentences containing adverbs.",
  },
  {
    level: "Elementary",
    title: "Present, past and future tenses",
    summary: "Talk clearly about when an action happens.",
    time: "16 min",
    content:
      "Goal: Choose the correct tense for time.\n\nPresent: action happens now or regularly.\n• I study English every day.\n\nPast: action already happened.\n• I studied English yesterday.\n\nFuture: action will happen later.\n• I will study English tomorrow.\n\nTime clues\n• usually, every day → present\n• yesterday, last week → past\n• tomorrow, next year → future\n\nPractice\nWrite one sentence about school in each tense. Then change “She plays netball” into the past and future tenses.",
  },
];
const mindsetVideos = [
  {
    id: "Z53K13j2afE",
    title: "Concord errors",
    level: "English FAL · Grammar",
  },
  {
    id: "4UXbNbpCY6A",
    title: "South African English — FAL",
    level: "English FAL · Language",
  },
  {
    id: "aagAL9q4z2I",
    title: "Understanding cartoons",
    level: "English FAL · Visual literacy",
  },
  {
    id: "t62Q2CHI3QM",
    title: "Active voice, passive voice, antonyms and tag questions",
    level: "English FAL · Grammar",
  },
  { id: "hf_erpYjCgU", title: "Parts of speech", level: "English · Grammar" },
  {
    id: "36_ioED8-Bg",
    title: "More parts of speech",
    level: "English · Grammar",
  },
  {
    id: "3cpBNt0hwnU",
    title: "Getting full marks for comprehension",
    level: "English · Comprehension",
  },
  {
    id: "9No6EAXYKXc",
    title: "Reported speech",
    level: "English FAL · Grammar",
  },
  {
    id: "wGkIvhKXxus",
    title: "How to write an obituary",
    level: "English · Writing",
  },
  {
    id: "GPACl724A38",
    title: "Format of a formal letter",
    level: "English · Writing",
  },
  {
    id: "BeyfzaNlsig",
    title: "Instructions and directions",
    level: "English · Writing",
  },
  {
    id: "kSDWSTj8RoY",
    title: "Common exam mistakes — Paper 1",
    level: "English FAL · Exam preparation",
  },
];
export default function Home() {
  const [s, setS] = useState<Session | null>(null),
    [p, setP] = useState<Profile | null>(null),
    [groups, setGroups] = useState<Group[]>([]),
    [group, setGroup] = useState<Group | null>(null),
    [msgs, setMsgs] = useState<Msg[]>([]),
    [auth, setAuth] = useState(false),
    [signup, setSignup] = useState(false),
    [chat, setChat] = useState(false),
    [dictionary, setDictionary] = useState(false),
    [pdfLibrary, setPdfLibrary] = useState(false),
    [ai, setAi] = useState(false),
    [videoView, setVideoView] = useState<"landscape" | "portrait">("landscape"),
    [roomTab, setRoomTab] = useState<"lessons" | "chat">("lessons"),
    [menu, setMenu] = useState(false),
    [mobileView, setMobileView] = useState<"lessons" | "videos" | "groups">(
      "lessons",
    ),
    [selectedLesson, setSelectedLesson] = useState<
      (typeof lessons)[number] | null
    >(null);
  useEffect(() => {
    db.auth.getSession().then((r) => setS(r.data.session));
    const { data } = db.auth.onAuthStateChange((_e, x) => setS(x));
    let v = localStorage.getItem("english-visit");
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem("english-visit", v);
    }
    db.from("english_visits")
      .insert({ session_id: v, path: location.pathname })
      .then(() => {});
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!s) {
      setP(null);
      setGroups([]);
      return;
    }
    db.from("english_profiles")
      .select("*")
      .eq("id", s.user.id)
      .single()
      .then((r) => setP(r.data));
    load();
  }, [s]);
  useEffect(() => {
    if (!group) return;
    const c = db
      .channel("chat-" + group.id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "english_messages",
          filter: "group_id=eq." + group.id,
        },
        async (e) => {
          const { data } = await db
            .from("english_messages")
            .select("id,body,created_at,user_id,english_profiles(username)")
            .eq("id", e.new.id)
            .single();
          if (data)
            setMsgs((a) => [
              ...a.filter((x) => x.id !== data.id),
              data as unknown as Msg,
            ]);
        },
      )
      .subscribe();
    return () => {
      db.removeChannel(c);
    };
  }, [group]);
  async function load() {
    const { data } = await db
      .from("english_groups")
      .select("*")
      .order("created_at", { ascending: false });
    setGroups(data || []);
  }
  async function open(g: Group, tab: "lessons" | "chat" = "lessons") {
    if (!s) {
      setAuth(true);
      return;
    }
    setGroup(g);
    setRoomTab(tab);
    setChat(true);
    const { data } = await db
      .from("english_group_members")
      .select("group_id")
      .eq("group_id", g.id)
      .eq("user_id", s.user.id)
      .maybeSingle();
    if (!data && g.teacher_id !== s.user.id)
      await db
        .from("english_group_members")
        .insert({ group_id: g.id, user_id: s.user.id });
    const r = await db
      .from("english_messages")
      .select("id,body,created_at,user_id,english_profiles(username)")
      .eq("group_id", g.id)
      .order("created_at");
    setMsgs((r.data as unknown as Msg[]) || []);
  }
  function showMobile(view: "lessons" | "videos" | "groups") {
    setMobileView(view);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <main id="main-content" data-mobile-view={mobileView}>
      <nav className="nav wrap">
        <a className="brand" href="#" onClick={() => showMobile("lessons")}>
          <b>E</b>
          <span>
            English Study
            <br />
            <strong>Co.Master</strong>
          </span>
        </a>
        <div className={"links " + (menu ? "show" : "")}>
          <a href="#lessons" onClick={() => showMobile("lessons")}>
            Lessons
          </a>
          <a href="#videos" onClick={() => showMobile("videos")}>
            Videos
          </a>
          <a href="#community" onClick={() => showMobile("groups")}>
            Community
          </a>
          <a href="#how">How it works</a>
        </div>
        <div className="actions">
          {s ? (
            <>
              <span>Hi, {p?.full_name?.split(" ")[0] || "learner"}</span>
              <button
                className="plain nav-profile"
                aria-label="Open my profile"
                onClick={() =>
                  window.dispatchEvent(new Event("english-open-profile"))
                }
              >
                <UserRound />
              </button>
              <button className="plain" onClick={() => db.auth.signOut()}>
                <LogOut />
              </button>
            </>
          ) : (
            <>
              <button
                className="plain hide-mobile"
                onClick={() => {
                  setSignup(false);
                  setAuth(true);
                }}
              >
                Sign in
              </button>
              <button
                className="primary"
                onClick={() => {
                  setSignup(true);
                  setAuth(true);
                }}
              >
                Start learning
              </button>
            </>
          )}
          <button className="plain hamburger" onClick={() => setMenu(!menu)}>
            <Menu />
          </button>
        </div>
      </nav>
      <section className="hero wrap">
        <div>
          <label>✦ A FRIENDLY PLACE TO PRACTISE</label>
          <h1>
            English grows
            <br />
            when you <em>speak.</em>
          </h1>
          <p>
            Short, practical lessons and a supportive community—built for
            students who want to use English with confidence.
          </p>
          <div className="hero-actions">
            <a className="primary" href="#lessons">
              Explore lessons →
            </a>
            <button
              className="talk"
              onClick={() => (s ? setChat(true) : setAuth(true))}
            >
              ▶ Join the conversation
            </button>
          </div>
          <small>Students and teachers are welcome</small>
        </div>
        <div className="visual">
          <i>Hello!</i>
          <strong>Aa</strong>
          <article>
            <small>Today’s phrase</small>
            <b>“How are you doing?”</b>
            <small>A friendly way to ask how someone is.</small>
          </article>
          <aside>
            <CheckCircle /> Lesson complete
          </aside>
        </div>
      </section>
      <section id="lessons" className="lessons">
        <div className="wrap">
          <header>
            <div>
              <label>LEARN AT YOUR PACE</label>
              <h2>Start with a short lesson</h2>
            </div>
            <p>
              Clear explanations, useful examples and a practice task in every
              lesson.
            </p>
          </header>
          <div className="cards">
            {lessons.map((l, i) => (
              <article className={"c" + i} key={l.title}>
                <div>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <small>{l.time}</small>
                </div>
                <label>{l.level}</label>
                <h3>{l.title}</h3>
                <p>{l.summary}</p>
                <button onClick={() => setSelectedLesson(l)}>
                  Open lesson ↗
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="videos" className="video-lessons">
        <div className="wrap">
          <header>
            <div>
              <label>WATCH AND LEARN</label>
              <h2>English lessons from Mindset Learn</h2>
            </div>
            <a
              href="https://www.youtube.com/@MindsetLearn"
              target="_blank"
              rel="noreferrer"
            >
              Visit Mindset Learn on YouTube ↗
            </a>
          </header>
          <div className="video-tools" aria-label="Video orientation">
            <span>Video view</span>
            <div>
              <button
                className={videoView === "landscape" ? "active" : ""}
                onClick={() => setVideoView("landscape")}
              >
                <Monitor /> Landscape
              </button>
              <button
                className={videoView === "portrait" ? "active" : ""}
                onClick={() => setVideoView("portrait")}
              >
                <Smartphone /> Portrait
              </button>
            </div>
          </div>
          <div className={"video-grid " + videoView}>
            {mindsetVideos.map((video) => (
              <article key={video.id}>
                <div className="video-frame">
                  <iframe
                    src={"https://www.youtube-nocookie.com/embed/" + video.id}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <small>{video.level}</small>
                <h3>{video.title}</h3>
              </article>
            ))}
          </div>
          <p className="video-credit">
            Videos are provided by Mindset Learn through YouTube. English Study
            Co.Master does not own these videos.
          </p>
        </div>
      </section>
      <section id="community" className="community wrap">
        <div>
          <label>PRACTISE TOGETHER</label>
          <h2>A safe place to try, ask and improve.</h2>
          <p>
            Mistakes are welcome. Create or join a group, open full lessons and
            learn through conversation.
          </p>
          <Feature
            icon={<MessageCircle />}
            title="Live group chat"
            text="Practise with students and teachers in real time."
          />
          <Feature
            icon={<Users />}
            title="Learning groups"
            text="Create a group, invite learners and share lessons."
          />
        </div>
        <div className="panel">
          <header>
            <b>● Community groups</b>
            {s && (
              <NewGroup
                userId={s.user.id}
                add={(g) =>
                  setGroups((a) => [g, ...a.filter((x) => x.id !== g.id)])
                }
                remove={(id) => setGroups((a) => a.filter((x) => x.id !== id))}
              />
            )}
          </header>
          {!s ? (
            <Empty
              title="Sign in to join the conversation"
              text="Accounts keep every group chat members-only."
              action={() => setAuth(true)}
            />
          ) : groups.length ? (
            <div className="group-list">
              {groups.map((g) => (
                <button key={g.id} onClick={() => open(g)}>
                  <b>{g.name[0]}</b>
                  <span>
                    <strong>{g.name}</strong>
                    <small>
                      {g.level} · Code {g.invite_code}
                    </small>
                  </span>
                  <i>→</i>
                </button>
              ))}
            </div>
          ) : (
            <Empty
              title="No groups yet"
              text="Create the first learning group."
            />
          )}
        </div>
      </section>
      <section id="how" className="steps">
        <div className="wrap">
          <label>THREE SIMPLE STEPS</label>
          <h2>Begin your English journey</h2>
          <div>
            {[
              [
                "1",
                "Create your profile",
                "Register as a student or teacher and verify your email.",
              ],
              [
                "2",
                "Learn something useful",
                "Open a practical lesson made for your level.",
              ],
              [
                "3",
                "Use English together",
                "Join a group and practise in the live chat.",
              ],
            ].map((x) => (
              <article key={x[0]}>
                <b>{x[0]}</b>
                <h3>{x[1]}</h3>
                <p>{x[2]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <footer>
        <div className="wrap">
          <span>
            English Study <b>Co.Master</b>
          </span>
          <i>Learn English. Teach with confidence. Grow together.</i>
          <strong>Powered by tivalsdeveloper</strong>
        </div>
      </footer>
      <div className="utility-launchers">
        <button
          className="dictionary-launch"
          aria-label="Open English dictionary"
          onClick={() => setDictionary(true)}
        >
          <BookOpen />
          <span>Dictionary</span>
        </button>
        {s && !chat && (
          <button
            className="chat-launch"
            aria-label="Open group chat"
            onClick={() =>
              group
                ? open(group, "chat")
                : groups[0]
                  ? open(groups[0], "chat")
                  : document.getElementById("community")?.scrollIntoView()
            }
          >
            <MessageCircle />
            <span>Chat</span>
          </button>
        )}
      </div>
      <button
        className="pdf-launch"
        aria-label="Open downloadable PDF lessons"
        onClick={() => setPdfLibrary(true)}
      >
        <FileText />
        <b>1</b>
        <span>PDF lessons</span>
      </button>
      <button
        className="ai-launch"
        aria-label="Open AI English tutor"
        onClick={() => setAi(true)}
      >
        <Bot />
        <i>
          <Sparkles />
        </i>
        <span>AI Tutor</span>
      </button>
      <nav className="mobile-dock" aria-label="Mobile navigation">
        <button
          className={
            mobileView === "lessons" && !dictionary && !chat ? "active" : ""
          }
          onClick={() => showMobile("lessons")}
        >
          <BookOpen />
          <span>Lessons</span>
        </button>
        <button
          className={
            mobileView === "videos" && !dictionary && !chat ? "active" : ""
          }
          onClick={() => showMobile("videos")}
        >
          <Monitor />
          <span>Videos</span>
        </button>
        <button
          className={
            (mobileView === "groups" && !dictionary && !chat ? "active " : "") +
            "dock-groups"
          }
          onClick={() => showMobile("groups")}
        >
          <Users />
          {groups.length > 0 && (
            <b>{groups.length > 9 ? "9+" : groups.length}</b>
          )}
          <span>Groups</span>
        </button>
        <button
          className={dictionary ? "active" : ""}
          onClick={() => {
            setChat(false);
            setDictionary(true);
          }}
        >
          <Search />
          <span>Dictionary</span>
        </button>
        <button
          className={chat ? "active" : ""}
          onClick={() => {
            setDictionary(false);
            s
              ? group
                ? open(group, "chat")
                : groups[0]
                  ? open(groups[0], "chat")
                  : showMobile("groups")
              : setAuth(true);
          }}
        >
          <MessageCircle />
          <span>Chat</span>
        </button>
      </nav>
      {selectedLesson && (
        <div className="shade">
          <section className="lesson-modal">
            <button className="close" onClick={() => setSelectedLesson(null)}>
              <X />
            </button>
            <label>
              {selectedLesson.level} · {selectedLesson.time}
            </label>
            <h2>{selectedLesson.title}</h2>
            <p>{selectedLesson.content}</p>
            <button className="primary" onClick={() => setSelectedLesson(null)}>
              Finish lesson
            </button>
          </section>
        </div>
      )}
      {auth && (
        <Auth signup={signup} change={setSignup} close={() => setAuth(false)} />
      )}{" "}
      {chat && (
        <Chat
          group={group}
          msgs={msgs}
          s={s}
          profile={p}
          initialTab={roomTab}
          close={() => setChat(false)}
        />
      )}{" "}
      {dictionary && (
        <Dictionary
          session={s}
          signIn={() => {
            setDictionary(false);
            setSignup(false);
            setAuth(true);
          }}
          close={() => setDictionary(false)}
        />
      )}{" "}
      {pdfLibrary && <PdfLibrary close={() => setPdfLibrary(false)} />}{" "}
      {ai && <AiTutor close={() => setAi(false)} />}
    </main>
  );
}
type AiMessage = { role: "user" | "assistant"; content: string };
function AiTutor({ close }: { close: () => void }) {
  const [messages, setMessages] = useState<AiMessage[]>([
      {
        role: "assistant",
        content:
          "Hello! I’m your AI English tutor. Ask me to explain grammar, correct a sentence, practise a conversation, or help with an assignment.",
      },
    ]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [models, setModels] = useState<{ id: string; name: string }[]>([
      { id: "free/gemini-3.1-pro", name: "Gemini 3.1 Pro" },
    ]),
    [model, setModel] = useState("free/gemini-3.1-pro");
  useEffect(() => {
    void callAI<{ models?: { id: string; name: string }[] }>({
      action: "models",
    })
      .then((x) => {
        if (x.models?.length) {
          setModels(x.models);
          setModel(x.models[0].id);
        }
      })
      .catch(() => {});
  }, []);
  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget,
      input = form.elements.namedItem("message") as HTMLTextAreaElement;
    const text = input.value.trim();
    if (!text) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    input.value = "";
    setBusy(true);
    setError("");
    try {
      const data = await callAI<{
        error?: string;
        reply?: string;
      }>({ messages: next.slice(-10), model });
      if (!data.reply) throw new Error("The tutor returned an empty response.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The tutor could not answer.",
      );
    } finally {
      setBusy(false);
    }
  }
  const suggestions = [
    { title: "Correct my English sentence", note: "Get instant feedback", icon: <PenLine /> },
    { title: "Explain verbs simply", note: "Easy examples", icon: <BookOpen /> },
    { title: "Practise a conversation", note: "Improve your speaking", icon: <MessageCircle /> },
    { title: "Help with an assignment", note: "Step-by-step support", icon: <ClipboardList /> },
  ];
  return (
    <div className="shade ai-shade">
      <section className="ai-tutor">
        <header>
          <span>
            <Bot />
            <b>AI English Tutor</b>
            <small>Learn · Practise · Improve · Succeed</small>
          </span>
          <i className="online-pill">● Online</i>
          <button aria-label="Close AI tutor" onClick={close}>
            <X />
          </button>
        </header>
        <label className="ai-model">
          AI model
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {models.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="ai-messages">
          {messages.map((m, i) => (
            <article className={m.role} key={i}>
              <b>{m.role === "assistant" ? "AI Tutor" : "You"}</b>
              <p>{m.content}</p>
            </article>
          ))}
          {busy && (
            <article className="assistant ai-thinking" aria-live="polite">
              <b>AI Tutor</b>
              <p>
                <i />
                <i />
                <i /> Thinking…
              </p>
            </article>
          )}
          {error && (
            <div className="ai-error" role="alert">
              {error}
            </div>
          )}
        </div>
        {messages.length === 1 && (
          <div className="ai-suggestions">
            {suggestions.map((x) => (
              <button
                key={x.title}
                onClick={() => {
                  const input = document.querySelector<HTMLTextAreaElement>(
                    ".ai-compose textarea",
                  );
                  if (input) {
                    input.value = x.title;
                    input.focus();
                  }
                }}
              >
                {x.icon}<span><b>{x.title}</b><small>{x.note}</small></span><ChevronRight />
              </button>
            ))}
          </div>
        )}
        {messages.length === 1 && <div className="ai-topics"><button><Lightbulb />Grammar</button><button><BookOpen />Vocabulary</button><button><Headphones />Listening</button><button><PenLine />Writing</button><button><MessageCircle />Speaking</button></div>}
        <form className="ai-compose" onSubmit={sendMessage}>
          <textarea
            name="message"
            required
            maxLength={2000}
            rows={1}
            placeholder="Ask your English question…"
            aria-label="Message the AI English tutor"
          />
          <button disabled={busy} aria-label="Send message">
            <Send />
          </button>
        </form>
        <small className="ai-note">
          AI can make mistakes. Check important answers with your teacher.
        </small>
      </section>
    </div>
  );
}
function PdfLibrary({ close }: { close: () => void }) {
  const [reading, setReading] = useState(false),
    [page, setPage] = useState(1);
  const total = 11;
  function changePage(next: number) {
    setPage(Math.min(total, Math.max(1, next)));
    document
      .querySelector(".pdf-reader-page")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <div className="shade pdf-shade">
      <section className={"pdf-library " + (reading ? "reader-open" : "")}>
        <header>
          <span>
            <FileText />
            <b>{reading ? "English Essay Writing" : "PDF lesson library"}</b>
          </span>
          <button aria-label="Close PDF library" onClick={close}>
            <X />
          </button>
        </header>
        {reading ? (
          <div className="pdf-reader">
            <div className="pdf-reader-toolbar">
              <button
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft /> <span>Previous</span>
              </button>
              <strong>
                Page {page} of {total}
              </strong>
              <button
                disabled={page === total}
                onClick={() => changePage(page + 1)}
                aria-label="Next page"
              >
                <span>Next</span> <ChevronRight />
              </button>
            </div>
            <div className="pdf-reader-page">
              <img
                src={`/pdf-pages/essay-${String(page).padStart(2, "0")}.jpg`}
                alt={`English Essay Writing lesson, page ${page} of ${total}`}
              />
            </div>
            <footer>
              <button className="pdf-back" onClick={() => setReading(false)}>
                Back to documents
              </button>
              <a
                className="primary pdf-download"
                href="/English_Essay_Writing_Lessons_1-11.pdf"
                download="English_Essay_Writing_Lessons_1-11.pdf"
              >
                <Download /> Download PDF
              </a>
            </footer>
          </div>
        ) : (
          <div className="pdf-body">
            <p className="pdf-count">1 document available</p>
            <article>
              <div className="pdf-cover">
                <FileText />
                <span>PDF</span>
              </div>
              <div className="pdf-info">
                <small>ENGLISH WRITING · 11 LESSONS</small>
                <h2>English Essay Writing</h2>
                <p>
                  Beginner-to-advanced handwritten lessons covering essay
                  structure, planning, introductions, paragraphs, grammar and
                  more.
                </p>
                <span>11 pages · 2.7 MB</span>
                <div>
                  <button
                    className="pdf-preview"
                    onClick={() => {
                      setPage(1);
                      setReading(true);
                    }}
                  >
                    Read on website
                  </button>
                  <a
                    className="primary pdf-download"
                    href="/English_Essay_Writing_Lessons_1-11.pdf"
                    download="English_Essay_Writing_Lessons_1-11.pdf"
                  >
                    <Download /> Download PDF
                  </a>
                </div>
              </div>
            </article>
          </div>
        )}
      </section>
    </div>
  );
}
function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="feature">
      {icon}
      <span>
        <b>{title}</b>
        <small>{text}</small>
      </span>
    </div>
  );
}
function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: () => void;
}) {
  return (
    <div className="empty">
      <Users />
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <button className="primary" onClick={action}>
          Sign in to continue
        </button>
      )}
    </div>
  );
}
function Auth({
  signup,
  change,
  close,
}: {
  signup: boolean;
  change: (x: boolean) => void;
  close: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [verify, setVerify] = useState(false),
    [email, setEmail] = useState(""),
    [code, setCode] = useState(["", "", "", "", "", "", "", ""]),
    [wait, setWait] = useState(60);
  useEffect(() => {
    if (!verify || wait <= 0) return;
    const timer = setInterval(() => setWait((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [verify, wait]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget),
      mail = String(f.get("email")),
      password = String(f.get("password"));
    setEmail(mail);
    const r = signup
      ? await db.auth.signUp({
          email: mail,
          password,
          options: {
            data: {
              full_name: String(f.get("name")),
              username: String(f.get("username")),
              role: String(f.get("role")),
            },
          },
        })
      : await db.auth.signInWithPassword({ email: mail, password });
    if (r.error) setError(r.error.message);
    else if (signup) {
      setVerify(true);
      setWait(60);
    } else close();
    setBusy(false);
  }
  function digit(i: number, value: string) {
    const d = value.replace(/\D/g, "").slice(-1),
      next = [...code];
    next[i] = d;
    setCode(next);
    if (d)
      (
        document.getElementById("otp-" + (i + 1)) as HTMLInputElement | null
      )?.focus();
  }
  async function confirm() {
    const token = code.join("");
    if (token.length !== 8) {
      setError("Enter the complete eight-digit code.");
      return;
    }
    setBusy(true);
    setError("");
    const { error } = await db.auth.verifyOtp({ email, token, type: "email" });
    if (error) setError(error.message);
    else close();
    setBusy(false);
  }
  async function resend() {
    setBusy(true);
    setError("");
    const { error } = await db.auth.resend({ type: "signup", email });
    if (error) setError(error.message);
    else setWait(60);
    setBusy(false);
  }
  async function signInWithGoogle() {
    setBusy(true);
    setError("");
    const { error } = await db.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }
  return (
    <div className="shade">
      <section className="auth">
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className="logo">E</div>
        {verify ? (
          <div className="verify">
            <h2>Enter verification code</h2>
            <p>
              We sent an eight-digit code to <b>{email}</b>. It expires shortly.
            </p>
            <div className="otp">
              {code.map((d, i) => (
                <input
                  id={"otp-" + i}
                  key={i}
                  value={d}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={"Digit " + (i + 1)}
                  onChange={(e) => digit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !d)
                      (
                        document.getElementById(
                          "otp-" + (i - 1),
                        ) as HTMLInputElement | null
                      )?.focus();
                  }}
                />
              ))}
            </div>
            {error && <div className="error">{error}</div>}
            <button
              className="primary verify-btn"
              disabled={busy}
              onClick={confirm}
            >
              {busy ? "Checking…" : "Verify account"}
            </button>
            <button
              className="resend"
              disabled={busy || wait > 0}
              onClick={resend}
            >
              {wait > 0 ? "Resend code in " + wait + "s" : "Resend code"}
            </button>
            <button
              className="wrong"
              onClick={() => {
                setVerify(false);
                setCode(["", "", "", "", "", "", "", ""]);
                setError("");
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h2>{signup ? "Create your account" : "Welcome back"}</h2>
            <p>
              {signup
                ? "Join students and teachers learning together."
                : "Continue your English journey."}
            </p>
            <button
              type="button"
              className="google-signin"
              disabled={busy}
              onClick={signInWithGoogle}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.5 14.1a6 6 0 0 1 0-3.9V7.6H3.2a10 10 0 0 0 0 9.1l3.3-2.6Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6a5.4 5.4 0 0 1 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.8 5.6l3.3 2.6A5.8 5.8 0 0 1 12 6Z"
                />
              </svg>
              Continue with Google
            </button>
            <div className="auth-divider">
              <span>or use email</span>
            </div>
            <form onSubmit={submit}>
              {signup && (
                <>
                  <label>
                    Full name
                    <input required name="name" placeholder="Your full name" />
                  </label>
                  <label>
                    Username
                    <input
                      required
                      name="username"
                      pattern="[A-Za-z0-9_]{3,24}"
                      placeholder="e.g. lufuno_07"
                    />
                  </label>
                  <label>
                    I am a
                    <select name="role">
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </label>
                </>
              )}
              <label>
                Email address
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Password
                <input
                  required
                  type="password"
                  minLength={8}
                  name="password"
                  placeholder="At least 8 characters"
                />
              </label>
              {error && <div className="error">{error}</div>}
              <button disabled={busy} className="primary">
                {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
              </button>
            </form>
            <small>
              {signup ? "Already registered?" : "New here?"}{" "}
              <button onClick={() => change(!signup)}>
                {signup ? "Sign in" : "Create an account"}
              </button>
            </small>
          </>
        )}
      </section>
    </div>
  );
}
function Dictionary({
  session,
  signIn,
  close,
}: {
  session: Session | null;
  signIn: () => void;
  close: () => void;
}) {
  const [query, setQuery] = useState(""),
    [entries, setEntries] = useState<DictEntry[]>([]),
    [saved, setSaved] = useState<SavedWord[]>([]),
    [tab, setTab] = useState<"search" | "saved">("search"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!session) return;
    db.from("english_saved_words")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then((r) => setSaved((r.data as SavedWord[]) || []));
  }, [session]);
  async function findWord(word: string) {
    const cleanWord = word.trim();
    if (!cleanWord) return;
    if (!session) {
      setError("Sign in to use the AI dictionary.");
      return;
    }
    setBusy(true);
    setError("");
    setEntries([]);
    try {
      const payload = await callAI<{ entry?: DictEntry; error?: string }>({
        task: "dictionary",
        word: cleanWord,
      });
      if (!payload.entry)
        throw new Error(
          payload.error ||
            "We could not explain that word. Check the spelling and try again.",
        );
      setEntries([payload.entry]);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Dictionary is unavailable. Try again shortly.",
      );
    } finally {
      setBusy(false);
    }
  }
  function lookup(e: FormEvent) {
    e.preventDefault();
    void findWord(query);
  }
  function audio() {
    const source = entries
      .flatMap((x) => x.phonetics || [])
      .find((x) => x.audio)?.audio;
    if (source)
      new Audio(source.startsWith("//") ? "https:" + source : source).play();
  }
  async function save() {
    if (!session) {
      signIn();
      return;
    }
    const entry = entries[0],
      definition = entry?.meanings[0]?.definitions[0]?.definition;
    if (!entry || !definition) return;
    const item = {
      user_id: session.user.id,
      word: entry.word.toLowerCase(),
      phonetic:
        entry.phonetic || entry.phonetics?.find((x) => x.text)?.text || "",
      definition,
    };
    const { data, error: problem } = await db
      .from("english_saved_words")
      .upsert(item, { onConflict: "user_id,word" })
      .select()
      .single();
    if (problem) {
      setError(problem.message);
      return;
    }
    setSaved((a) => [
      data as SavedWord,
      ...a.filter((x) => x.word !== item.word),
    ]);
  }
  async function remove(item: SavedWord) {
    setSaved((a) => a.filter((x) => x.id !== item.id));
    const { error: problem } = await db
      .from("english_saved_words")
      .delete()
      .eq("id", item.id);
    if (problem) {
      setSaved((a) => [item, ...a]);
      setError(problem.message);
    }
  }
  const entry = entries[0],
    isSaved = entry && saved.some((x) => x.word === entry.word.toLowerCase());
  return (
    <div className="shade dictionary-shade">
      <section className="dictionary">
        <header>
          <span>
            <BookOpen />
            <b>English dictionary<small>Search · Learn · Save · Grow</small></b>
          </span>
          <button aria-label="Close dictionary" onClick={close}>
            <X />
          </button>
        </header>
        <nav>
          <button
            className={tab === "search" ? "active" : ""}
            onClick={() => setTab("search")}
          >
            <Search /> Search
          </button>
          <button
            className={tab === "saved" ? "active" : ""}
            onClick={() => setTab("saved")}
          >
            <Bookmark /> Saved words
          </button>
        </nav>
        {tab === "search" ? (
          <div className="dictionary-body">
            <form onSubmit={lookup}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type an English word…"
                autoFocus
              />
              <button disabled={busy} aria-label="Search">
                <Search />
              </button>
            </form>
            {busy && (
              <p className="dict-status">AI is explaining “{query}”…</p>
            )}
            {error && <div className="error">{error}</div>}
            {entry && (
              <article className="word-result">
                <div className="word-heading">
                  <div>
                    <h2>{entry.word}</h2>
                    <span>
                      {entry.phonetic ||
                        entry.phonetics?.find((x) => x.text)?.text}
                    </span>
                  </div>
                  <div>
                    {entry.phonetics?.some((x) => x.audio) && (
                      <button aria-label="Hear pronunciation" onClick={audio}>
                        <Volume2 />
                      </button>
                    )}
                    <button
                      className={isSaved ? "saved" : ""}
                      aria-label="Save word"
                      disabled={!!isSaved}
                      onClick={save}
                    >
                      <Bookmark />
                      {isSaved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
                {entry.meanings.slice(0, 4).map((meaning, i) => (
                  <section key={meaning.partOfSpeech + i}>
                    <h3>{meaning.partOfSpeech}</h3>
                    <ol>
                      {meaning.definitions.slice(0, 3).map((definition, j) => (
                        <li key={j}>
                          <p>{definition.definition}</p>
                          {definition.example && (
                            <blockquote>“{definition.example}”</blockquote>
                          )}
                        </li>
                      ))}
                    </ol>
                    {meaning.synonyms?.length ? (
                      <p className="word-list">
                        <b>Synonyms:</b>{" "}
                        {meaning.synonyms.slice(0, 6).join(", ")}
                      </p>
                    ) : null}
                    {meaning.antonyms?.length ? (
                      <p className="word-list">
                        <b>Antonyms:</b>{" "}
                        {meaning.antonyms.slice(0, 6).join(", ")}
                      </p>
                    ) : null}
                  </section>
                ))}
              </article>
            )}
            {!busy && !entry && !error && (
              <div className="dict-welcome">
                <BookOpen />
                <h2>Discover a new word</h2>
                <p>
                  Search with AI for simple definitions, examples,
                  pronunciation, synonyms and antonyms.
                </p>
                <div className="dict-features">
                  <span><BookOpen /><b>Simple definitions</b><small>Easy to understand</small></span>
                  <span><FileText /><b>Example sentences</b><small>See how it’s used</small></span>
                  <span><Volume2 /><b>Pronunciation</b><small>Hear the word</small></span>
                  <span><ChevronRight /><b>Synonyms</b><small>Similar words</small></span>
                  <span><ChevronLeft /><b>Antonyms</b><small>Opposite words</small></span>
                  <span><Bookmark /><b>Save words</b><small>Build your vocabulary</small></span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="saved-words">
            {!session ? (
              <div className="dict-welcome">
                <Bookmark />
                <h2>Build your vocabulary</h2>
                <p>Sign in to save words and return to them anytime.</p>
                <button className="primary" onClick={signIn}>
                  Sign in to save words
                </button>
              </div>
            ) : saved.length ? (
              saved.map((item) => (
                <article key={item.id}>
                  <button
                    className="saved-word"
                    onClick={() => {
                      setQuery(item.word);
                      setTab("search");
                      void findWord(item.word);
                    }}
                  >
                    <b>{item.word}</b>
                    <small>{item.phonetic}</small>
                    <p>{item.definition}</p>
                  </button>
                  <button
                    className="delete-word"
                    aria-label={"Remove " + item.word}
                    onClick={() => remove(item)}
                  >
                    <Trash2 />
                  </button>
                </article>
              ))
            ) : (
              <div className="dict-welcome">
                <Bookmark />
                <h2>No saved words yet</h2>
                <p>Search for a word, then tap Save to add it here.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
function NewGroup({
  userId,
  add,
  remove,
}: {
  userId: string;
  add: (group: Group) => void;
  remove: (id: string) => void;
}) {
  const [show, setShow] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      id = crypto.randomUUID(),
      invite_code = crypto
        .randomUUID()
        .replaceAll("-", "")
        .slice(0, 8)
        .toUpperCase(),
      group: Group = {
        id,
        teacher_id: userId,
        name: String(f.get("name")).trim(),
        level: String(f.get("level")),
        invite_code,
      };
    add(group);
    setShow(false);
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 10000);
    void (async () => {
      try {
        const { error } = await db
          .from("english_groups")
          .insert({ ...group, description: "" })
          .abortSignal(controller.signal);
        clearTimeout(timer);
        if (error) {
          remove(id);
          alert("The group was not saved: " + error.message);
        }
      } catch {
        clearTimeout(timer);
        remove(id);
        alert(
          "The group was not saved. Check your internet connection and try again.",
        );
      }
    })();
  }
  return (
    <>
      <button className="new" onClick={() => setShow(true)}>
        + New group
      </button>
      {show && (
        <div className="mini">
          <form onSubmit={submit}>
            <b>Create a group</b>
            <input
              required
              minLength={3}
              maxLength={80}
              name="name"
              placeholder="Group name"
            />
            <select name="level">
              {[
                "Beginner",
                "Elementary",
                "Intermediate",
                "Upper-intermediate",
                "Advanced",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <div>
              <button type="button" onClick={() => setShow(false)}>
                Cancel
              </button>
              <button className="primary">Create</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
function Chat({
  group,
  msgs,
  s,
  profile,
  initialTab,
  close,
}: {
  group: Group | null;
  msgs: Msg[];
  s: Session | null;
  profile: Profile | null;
  initialTab: "lessons" | "chat";
  close: () => void;
}) {
  const [body, setBody] = useState(""),
    [tab, setTab] = useState<"lessons" | "assignments" | "chat">(initialTab),
    [items, setItems] = useState<GroupLesson[]>([]),
    [assignments, setAssignments] = useState<Assignment[]>([]),
    [posting, setPosting] = useState(false),
    [postingAssignment, setPostingAssignment] = useState(false),
    [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
      null,
    ),
    [submissions, setSubmissions] = useState<Submission[]>([]),
    [aiBusy, setAiBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!group) return;
    void Promise.all([
      db
        .from("english_lessons")
        .select("*")
        .eq("group_id", group.id)
        .order("created_at", { ascending: false }),
      db
        .from("english_assignments")
        .select("*")
        .eq("group_id", group.id)
        .order("created_at", { ascending: false }),
    ]).then(([lessonsResult, assignmentResult]) => {
      setItems((lessonsResult.data as GroupLesson[]) || []);
      setAssignments((assignmentResult.data as Assignment[]) || []);
    });
  }, [group]);
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!group || !s || !body.trim()) return;
    const v = body.trim();
    setBody("");
    await db
      .from("english_messages")
      .insert({ group_id: group.id, user_id: s.user.id, body: v });
  }
  async function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!group || !s) return;
    setError("");
    const f = new FormData(e.currentTarget);
    const { data, error: problem } = await db
      .from("english_lessons")
      .insert({
        group_id: group.id,
        teacher_id: s.user.id,
        title: String(f.get("title")),
        level: String(f.get("level")),
        content: String(f.get("content")),
      })
      .select()
      .single();
    if (problem) {
      setError(problem.message);
      return;
    }
    setItems((a) => [data as GroupLesson, ...a]);
    setPosting(false);
  }
  async function generateLesson(form: HTMLFormElement) {
    const titleInput = form.querySelector('[name="title"]') as HTMLInputElement | null,
      levelSelect = form.querySelector('[name="level"]') as unknown as HTMLSelectElement | null,
      contentInput = form.querySelector('[name="content"]') as HTMLTextAreaElement | null;
    if (!titleInput || !levelSelect || !contentInput) return;
    const topic = window.prompt(
      "What topic should the lesson teach?",
      titleInput.value || "Verbs",
    );
    if (!topic) return;
    setAiBusy(true);
    setError("");
    try {
      const level = levelSelect.value;
      const data = await callAI<{ reply?: string; error?: string }>({
        task: "create-lesson",
        messages: [
          {
            role: "user",
            content: `Create a complete English lesson about ${topic} for ${level}.`,
          },
        ],
      });
      if (!data.reply)
        throw new Error(data.error || "AI could not create the lesson.");
      titleInput.value = topic;
      contentInput.value = data.reply;
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "AI could not create the lesson.",
      );
    } finally {
      setAiBusy(false);
    }
  }
  async function createAssignment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!group || !s) return;
    setError("");
    const f = new FormData(e.currentTarget),
      due = String(f.get("due"));
    const { data, error: problem } = await db
      .from("english_assignments")
      .insert({
        group_id: group.id,
        teacher_id: s.user.id,
        title: String(f.get("title")),
        instructions: String(f.get("instructions")),
        due_at: due ? new Date(due).toISOString() : null,
        max_points: Number(f.get("points")),
      })
      .select()
      .single();
    if (problem) {
      setError(problem.message);
      return;
    }
    setAssignments((a) => [data as Assignment, ...a]);
    setPostingAssignment(false);
  }
  async function generateAssignment(form: HTMLFormElement) {
    const topic = window.prompt(
      "What topic should the assignment cover?",
      "Verbs",
    );
    if (!topic) return;
    setAiBusy(true);
    setError("");
    try {
      const points = (form.elements.namedItem("points") as HTMLInputElement)
        .value;
      const data = await callAI<{ reply?: string; error?: string }>({
        task: "create-assignment",
        messages: [
          {
            role: "user",
            content: `Create an assignment about ${topic} for ${group?.level || "English learners"}, worth ${points} marks.`,
          },
        ],
      });
      if (!data.reply)
        throw new Error(data.error || "AI could not create the assignment.");
      (form.elements.namedItem("title") as HTMLInputElement).value =
        topic + " assignment";
      (form.elements.namedItem("instructions") as HTMLTextAreaElement).value =
        data.reply;
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "AI could not create the assignment.",
      );
    } finally {
      setAiBusy(false);
    }
  }
  async function suggestGrade(form: HTMLFormElement, submission: Submission) {
    if (!selectedAssignment) return;
    setAiBusy(true);
    setError("");
    try {
      const context = `Assignment: ${selectedAssignment.title}\nInstructions: ${selectedAssignment.instructions}\nMaximum: ${selectedAssignment.max_points}\nStudent answer: ${submission.answer}`;
      const data = await callAI<{ reply?: string; error?: string }>({
        task: "grade-assignment",
        context,
        messages: [
          {
            role: "user",
            content: "Suggest a fair score and helpful feedback.",
          },
        ],
      });
      if (!data.reply)
        throw new Error(data.error || "AI could not mark this answer.");
      const match = data.reply.match(/SUGGESTED SCORE:\s*(\d+(?:\.\d+)?)/i);
      const feedback =
        data.reply.match(/FEEDBACK:\s*([\s\S]*)/i)?.[1]?.trim() || data.reply;
      if (match)
        (form.elements.namedItem("score") as HTMLInputElement).value = String(
          Math.min(Number(match[1]), selectedAssignment.max_points),
        );
      (form.elements.namedItem("feedback") as HTMLTextAreaElement).value =
        feedback;
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "AI could not mark this answer.",
      );
    } finally {
      setAiBusy(false);
    }
  }
  async function openAssignment(item: Assignment) {
    setSelectedAssignment(item);
    setError("");
    if (!s) return;
    const query = db
      .from("english_assignment_submissions")
      .select(
        "id,assignment_id,student_id,answer,submitted_at,score,feedback,english_profiles(username)",
      )
      .eq("assignment_id", item.id)
      .order("submitted_at", { ascending: false });
    if (group?.teacher_id !== s.user.id) query.eq("student_id", s.user.id);
    const { data } = await query;
    setSubmissions((data as unknown as Submission[]) || []);
  }
  async function submitAnswer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAssignment || !s) return;
    setError("");
    const f = new FormData(e.currentTarget);
    const { data, error: problem } = await db
      .from("english_assignment_submissions")
      .insert({
        assignment_id: selectedAssignment.id,
        student_id: s.user.id,
        answer: String(f.get("answer")),
      })
      .select("id,assignment_id,student_id,answer,submitted_at,score,feedback")
      .single();
    if (problem) {
      setError(
        problem.code === "23505"
          ? "You have already submitted this assignment."
          : problem.message,
      );
      return;
    }
    setSubmissions([data as Submission]);
  }
  async function grade(e: FormEvent<HTMLFormElement>, submission: Submission) {
    e.preventDefault();
    if (!selectedAssignment) return;
    const f = new FormData(e.currentTarget),
      score = Number(f.get("score")),
      feedback = String(f.get("feedback"));
    if (score > selectedAssignment.max_points) {
      setError(
        "The mark cannot be higher than " + selectedAssignment.max_points + ".",
      );
      return;
    }
    const { data, error: problem } = await db
      .from("english_assignment_submissions")
      .update({ score, feedback })
      .eq("id", submission.id)
      .select(
        "id,assignment_id,student_id,answer,submitted_at,score,feedback,english_profiles(username)",
      )
      .single();
    if (problem) {
      setError(problem.message);
      return;
    }
    setSubmissions((a) =>
      a.map((x) =>
        x.id === submission.id ? (data as unknown as Submission) : x,
      ),
    );
  }
  const canPost = !!s && group?.teacher_id === s.user.id;
  return (
    <aside className="chat room">
      <header>
        <span>
          <BookMarked className="room-logo" />
          <b>{group?.name || "Community"}</b>
          <small>English Learning Platform</small>
          <em>{group?.level || "Choose a group"}</em>
        </span>
        <button onClick={close}>
          <X />
        </button>
      </header>
      {group && (
        <nav className="room-tabs">
          <button
            className={tab === "lessons" ? "active" : ""}
            onClick={() => setTab("lessons")}
          >
            <BookOpen /> Lessons
          </button>
          <button
            className={tab === "assignments" ? "active" : ""}
            onClick={() => setTab("assignments")}
          >
            <ClipboardList /> Assignments
          </button>
          <button
            className={tab === "chat" ? "active" : ""}
            onClick={() => setTab("chat")}
          >
            <MessageCircle /> Chat
          </button>
        </nav>
      )}
      {tab === "lessons" ? (
        <div className="lesson-room">
          {canPost && (
            <button
              className="primary post-button"
              onClick={() => setPosting(true)}
            >
              + Post new lesson
            </button>
          )}
          {!group ? (
            <Empty
              title="Choose a group"
              text="Select a community group to begin."
            />
          ) : items.length ? (
            <div className="published-lessons">
              {items.map((x) => (
                <article key={x.id}>
                  <div className="lesson-title"><span><label>{x.level}</label><h3>{x.title}</h3></span><small><CalendarDays />{new Date(x.created_at).toLocaleDateString()}</small></div>
                  <LessonContent content={x.content} />
                </article>
              ))}
            </div>
          ) : (
            <Empty
              title="No lessons yet"
              text={
                canPost
                  ? "Post the first complete lesson for this group."
                  : "Your teacher has not posted a lesson yet."
              }
            />
          )}
        </div>
      ) : tab === "assignments" ? (
        <div className="lesson-room assignment-room">
          {canPost && (
            <button
              className="primary post-button"
              onClick={() => setPostingAssignment(true)}
            >
              + Create assignment
            </button>
          )}
          {assignments.length ? (
            <div className="assignment-list">
              {assignments.map((item) => (
                <button key={item.id} onClick={() => openAssignment(item)}>
                  <ClipboardList />
                  <span>
                    <b>{item.title}</b>
                    <em>English practice</em>
                    <small>
                      {item.due_at
                        ? "Due " + new Date(item.due_at).toLocaleString()
                        : "No deadline"}{" "}
                      · {item.max_points} marks
                    </small>
                  </span>
                  <i>Start →</i>
                </button>
              ))}
            </div>
          ) : (
            <Empty
              title="No assignments yet"
              text={
                canPost
                  ? "Create the first assignment for your students."
                  : "Your teacher has not sent an assignment yet."
              }
            />
          )}
        </div>
      ) : (
        <>
          {group && <div className="class-chat-card"><Users /><span><b>Class Chat</b><small>Learn · Ask · Share · Grow Together</small><em>● {Math.max(1, msgs.length)} messages</em></span></div>}
          {group && <div className="chat-notice">📣 Be respectful, help each other, and keep the conversation in English.</div>}
          <div className="messages">
            {!group ? (
              <Empty
                title="Choose a group"
                text="Select a community group to begin."
              />
            ) : msgs.length ? (
              msgs.map((m) => (
                <article
                  className={m.user_id === s?.user.id ? "mine" : ""}
                  key={m.id}
                >
                  <small>@{m.english_profiles?.username || "learner"}</small>
                  <p>{m.body}</p>
                  <time>
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </article>
              ))
            ) : (
              <Empty
                title="No messages yet"
                text="Say hello and begin the conversation!"
              />
            )}
          </div>
          {group && (
            <><div className="chat-prompts"><button onClick={() => setBody("Can you help me with my assignment?")}>💡 Ask a question</button><button onClick={() => setBody("Please explain this grammar rule.")}>📖 Grammar help</button><button onClick={() => setBody("Can we practise a conversation?")}>🎙 Speaking practice</button></div><form onSubmit={send}>
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={1500}
                placeholder="Write a message…"
              />
              <button>
                <Send />
              </button>
            </form></>
          )}
        </>
      )}
      {posting && (
        <div className="lesson-editor">
          <form onSubmit={publish}>
            <h3>Post a new lesson</h3>
            <button
              className="ai-assist"
              type="button"
              disabled={aiBusy}
              onClick={(e) => generateLesson(e.currentTarget.form!)}
            >
              <Sparkles /> {aiBusy ? "Creating lesson…" : "Create lesson with AI"}
            </button>
            <label>
              Lesson title
              <input
                required
                name="title"
                minLength={3}
                maxLength={120}
                placeholder="e.g. Ordering food politely"
              />
            </label>
            <label>
              Level
              <select name="level" defaultValue={group?.level}>
                {[
                  "Beginner",
                  "Elementary",
                  "Intermediate",
                  "Upper-intermediate",
                  "Advanced",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Lesson content
              <textarea
                required
                name="content"
                minLength={20}
                maxLength={12000}
                rows={10}
                placeholder="Add the explanation, examples, vocabulary and practice task…"
              />
            </label>
            {error && <div className="error">{error}</div>}
            <div>
              <button type="button" onClick={() => setPosting(false)}>
                Cancel
              </button>
              <button className="primary">Publish lesson</button>
            </div>
          </form>
        </div>
      )}
      {postingAssignment && (
        <div className="lesson-editor">
          <form onSubmit={createAssignment}>
            <h3>Create an assignment</h3>
            <button
              className="ai-assist"
              type="button"
              disabled={aiBusy}
              onClick={(e) => generateAssignment(e.currentTarget.form!)}
            >
              <Sparkles /> {aiBusy ? "Creating…" : "Create with AI"}
            </button>
            <label>
              Title
              <input
                required
                name="title"
                minLength={3}
                maxLength={140}
                placeholder="e.g. Verbs practice"
              />
            </label>
            <label>
              Instructions
              <textarea
                required
                name="instructions"
                minLength={10}
                maxLength={8000}
                rows={8}
                placeholder="Write the questions and explain what students must do…"
              />
            </label>
            <label>
              Deadline (optional)
              <input name="due" type="datetime-local" />
            </label>
            <label>
              Total marks
              <input
                required
                name="points"
                type="number"
                min="1"
                max="1000"
                defaultValue="100"
              />
            </label>
            {error && <div className="error">{error}</div>}
            <div>
              <button type="button" onClick={() => setPostingAssignment(false)}>
                Cancel
              </button>
              <button className="primary">Send assignment</button>
            </div>
          </form>
        </div>
      )}
      {selectedAssignment && (
        <div className="assignment-detail">
          <section>
            <button
              className="close"
              onClick={() => setSelectedAssignment(null)}
            >
              <X />
            </button>
            <label>ASSIGNMENT · {selectedAssignment.max_points} MARKS</label>
            <h2>{selectedAssignment.title}</h2>
            <small>
              {selectedAssignment.due_at
                ? "Due " + new Date(selectedAssignment.due_at).toLocaleString()
                : "No deadline"}
            </small>
            <p>{selectedAssignment.instructions}</p>
            {error && <div className="error">{error}</div>}
            {canPost ? (
              <div className="submission-list">
                <h3>Student submissions ({submissions.length})</h3>
                {submissions.length ? (
                  submissions.map((sub) => (
                    <article key={sub.id}>
                      <b>@{sub.english_profiles?.username || "student"}</b>
                      <small>
                        Submitted {new Date(sub.submitted_at).toLocaleString()}
                      </small>
                      <p>{sub.answer}</p>
                      <form onSubmit={(e) => grade(e, sub)}>
                        <button
                          className="ai-assist"
                          type="button"
                          disabled={aiBusy}
                          onClick={(e) =>
                            suggestGrade(e.currentTarget.form!, sub)
                          }
                        >
                          <Sparkles />{" "}
                          {aiBusy ? "Checking…" : "AI suggest mark"}
                        </button>
                        <label>
                          Mark
                          <input
                            name="score"
                            type="number"
                            min="0"
                            max={selectedAssignment.max_points}
                            defaultValue={sub.score ?? ""}
                            required
                          />{" "}
                          / {selectedAssignment.max_points}
                        </label>
                        <label>
                          Feedback
                          <textarea
                            name="feedback"
                            rows={3}
                            defaultValue={sub.feedback}
                            placeholder="Write feedback for the student…"
                          />
                        </label>
                        <button className="primary">
                          <Award /> Save mark
                        </button>
                      </form>
                    </article>
                  ))
                ) : (
                  <p>No students have submitted answers yet.</p>
                )}
              </div>
            ) : submissions[0] ? (
              <div className="my-submission">
                <CheckCircle />
                <h3>Assignment submitted</h3>
                <p>{submissions[0].answer}</p>
                {submissions[0].score !== null && (
                  <strong>
                    Mark: {submissions[0].score} /{" "}
                    {selectedAssignment.max_points}
                  </strong>
                )}
                {submissions[0].feedback && (
                  <blockquote>
                    <b>Teacher feedback</b>
                    {submissions[0].feedback}
                  </blockquote>
                )}
              </div>
            ) : (
              <form className="answer-form" onSubmit={submitAnswer}>
                <label>
                  Your answer
                  <textarea
                    required
                    name="answer"
                    minLength={1}
                    maxLength={12000}
                    rows={10}
                    placeholder="Type your complete answer here…"
                  />
                </label>
                <button className="primary">Submit assignment</button>
                <small>
                  You can submit once. Check your answer carefully first.
                </small>
              </form>
            )}
          </section>
        </div>
      )}
    </aside>
  );
}
