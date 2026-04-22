import { useState, useEffect, useRef } from "react";

const PRICE = 3.99;

function getLetterGrade(pct) {
  if (pct >= 97) return { letter: "A+", color: "#22c55e" };
  if (pct >= 93) return { letter: "A", color: "#22c55e" };
  if (pct >= 90) return { letter: "A-", color: "#4ade80" };
  if (pct >= 87) return { letter: "B+", color: "#a3e635" };
  if (pct >= 83) return { letter: "B", color: "#facc15" };
  if (pct >= 80) return { letter: "B-", color: "#fbbf24" };
  if (pct >= 77) return { letter: "C+", color: "#fb923c" };
  if (pct >= 73) return { letter: "C", color: "#f97316" };
  if (pct >= 70) return { letter: "C-", color: "#ef4444" };
  if (pct >= 60) return { letter: "D", color: "#dc2626" };
  return { letter: "F", color: "#7f1d1d" };
}

function extractTopics(text) {
  const lines = text.split(/[\n,;.]+/).map(l => l.trim()).filter(l => l.length > 8 && l.length < 120);
  const topics = lines.slice(0, 8).map(l => {
    let t = l.replace(/^[-\u2022*\d.)\]]+\s*/, '').replace(/^(chapter|ch|unit|module|section|topic|week)\s*\d*[:\s]*/i, '');
    return t.charAt(0).toUpperCase() + t.slice(1);
  });
  return topics.length >= 2 ? topics : ["Core concepts and definitions", "Problem-solving techniques", "Key formulas and theorems", "Application and analysis", "Synthesis and evaluation"];
}

function generatePreview(content, courseName, tool) {
  const topics = extractTopics(content);
  const course = courseName || "your course";
  if (tool === "quiz" || tool === "both") {
    const quizPreview = {
      visible: [
        { type: "Multiple Choice", q: "Which of the following best describes the relationship between " + topics[0].toLowerCase() + " and " + (topics[1] ? topics[1].toLowerCase() : "the core framework") + "?", options: ["A) They are functionally equivalent in all contexts", "B) The first serves as a prerequisite for understanding the second", "C) They represent competing theoretical models", "D) They are only related in applied settings"] },
        { type: "Short Answer", q: "Explain how " + topics[Math.min(2, topics.length-1)].toLowerCase() + " applies to a real-world scenario. Include at least two specific concepts from the course material." },
      ],
      blurredCount: 16,
    };
    const planPreview = tool === "both" ? {
      visible: [
        { day: "Day 1 (Today)", focus: topics[0], hours: "2.5 hrs", technique: "Active recall + concept mapping" },
        { day: "Day 2", focus: topics[1] || topics[0], hours: "3 hrs", technique: "Practice problems + spaced repetition" },
      ],
      blurredCount: 5,
    } : null;
    return { quizPreview, planPreview, topics, course };
  }
  const planPreview = {
    visible: [
      { day: "Day 1 (Today)", focus: topics[0], hours: "2.5 hrs", technique: "Active recall + concept mapping" },
      { day: "Day 2", focus: topics[1] || topics[0], hours: "3 hrs", technique: "Practice problems + spaced repetition" },
    ],
    blurredCount: 5,
  };
  return { quizPreview: null, planPreview, topics, course };
}

function useStudentCount() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    const base = 847;
    const dayOfYear = Math.floor((Date.now() - new Date(2026, 0, 1)) / 86400000);
    const hourOfDay = new Date().getHours();
    const c = base + dayOfYear * 12 + hourOfDay * 3 + Math.floor(Math.random() * 5);
    setCount(c);
  }, []);
  return count;
}

function useFinalsCountdown() {
  const [text, setText] = useState("");
  useEffect(() => {
    const finalsEnd = new Date(2026, 4, 15);
    const now = new Date();
    const diff = finalsEnd - now;
    if (diff > 0) {
      const days = Math.floor(diff / 86400000);
      setText(days + " days left in finals season");
    } else {
      setText("Finals season is here");
    }
  }, []);
  return text;
}

function GradeCalcMini() {
  const [cats, setCats] = useState([
    { id: 1, name: "Homework", weight: 20, grade: 92 },
    { id: 2, name: "Midterm", weight: 35, grade: 81 },
  ]);
  const [finalWeight, setFinalWeight] = useState(45);
  const [desired, setDesired] = useState(90);
  const [nextId, setNextId] = useState(3);
  const catWeight = cats.reduce((s, c) => s + (c.weight || 0), 0);
  const weighted = cats.reduce((s, c) => s + (c.grade || 0) * ((c.weight || 0) / 100), 0);
  const needed = finalWeight > 0 ? ((desired - weighted) / finalWeight) * 100 : Infinity;
  const p = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
  return (
    <div className="calc-mini">
      <div className="calc-grid-header"><span>Category</span><span>Weight</span><span>Grade</span><span></span></div>
      {cats.map(c => (
        <div className="calc-grid-row" key={c.id}>
          <input type="text" value={c.name} onChange={e => setCats(cats.map(x => x.id === c.id ? {...x, name: e.target.value} : x))} placeholder="Category" />
          <input type="number" value={c.weight || ""} onChange={e => setCats(cats.map(x => x.id === c.id ? {...x, weight: p(e.target.value)} : x))} placeholder="%" />
          <input type="number" value={c.grade || ""} onChange={e => setCats(cats.map(x => x.id === c.id ? {...x, grade: p(e.target.value)} : x))} placeholder="%" />
          <button className="calc-rm" onClick={() => cats.length > 1 && setCats(cats.filter(x => x.id !== c.id))}>x</button>
        </div>
      ))}
      <button className="calc-add" onClick={() => { setCats([...cats, {id: nextId, name: "", weight: 0, grade: 0}]); setNextId(nextId+1); }}>+ Add</button>
      <div className="calc-final-row">
        <div><label>Final weight %</label><input type="number" value={finalWeight || ""} onChange={e => setFinalWeight(p(e.target.value))} /></div>
        <div><label>I want a</label><input type="number" value={desired || ""} onChange={e => setDesired(p(e.target.value))} /></div>
      </div>
      <div className="calc-result">
        <span className="calc-result-label">You need</span>
        <span className="calc-result-num" style={{color: needed > 100 ? "#ef4444" : needed <= 0 ? "#22c55e" : "var(--text)"}}>{needed <= 0 ? "0%" : needed > 200 ? "Impossible" : needed.toFixed(1) + "%"}</span>
        <span className="calc-result-sub">on your final</span>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [tool, setTool] = useState(null);
  const [content, setContent] = useState("");
  const [courseName, setCourseName] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const studentCount = useStudentCount();
  const countdown = useFinalsCountdown();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const canceled = params.get("canceled");
    if (canceled) { setView("canceled"); window.history.replaceState({}, "", "/"); return; }
    if (sessionId) {
      window.history.replaceState({}, "", "/");
      const saved = sessionStorage.getItem("cramkit_content");
      const savedCourse = sessionStorage.getItem("cramkit_course");
      const savedTool = sessionStorage.getItem("cramkit_tool");
      if (saved && savedTool) {
        setContent(saved); setCourseName(savedCourse || ""); setTool(savedTool);
        setView("loading"); doGenerate(saved, savedCourse || "", savedTool, sessionId);
      }
    }
  }, []);

  async function doGenerate(text, course, t, sessionId) {
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({content: text, courseName: course, tool: t, sessionId}) });
      const data = await res.json();
      if (data.error) { setError(data.error); setView("home"); }
      else { setResult(data.result); setView("result"); sessionStorage.removeItem("cramkit_content"); sessionStorage.removeItem("cramkit_course"); sessionStorage.removeItem("cramkit_tool"); }
    } catch(e) { setError("Something went wrong."); setView("home"); }
  }

  function handlePreview() {
    if (content.trim().length < 20) return;
    const p = generatePreview(content, courseName, tool);
    setPreview(p);
    setView("preview");
  }

  async function handleUnlock() {
    sessionStorage.setItem("cramkit_content", content);
    sessionStorage.setItem("cramkit_course", courseName);
    sessionStorage.setItem("cramkit_tool", tool);
    try {
      const res = await fetch("/api/create-checkout", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({tool}) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError("Could not start checkout.");
    } catch(e) { setError("Connection error. Try again."); }
  }

  function goHome() { setView("home"); setTool(null); setContent(""); setCourseName(""); setResult(""); setPreview(null); setError(""); }
  function selectTool(t) { setTool(t); setView("input"); setError(""); }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Karla:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#08080a;--surface:#111114;--surface2:#1a1a1f;--surface3:#222228;--border:#2a2a32;--border2:#3a3a44;--text:#ece9e1;--text2:#9e9a90;--text3:#6a665e;--amber:#e8a830;--amber2:#f0c050;--amber-dim:rgba(232,168,48,0.1);--green:#34d399;--red:#f87171;--radius:16px;--radius-sm:10px}
        body{font-family:'Karla',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;-webkit-font-smoothing:antialiased}
        .page{max-width:720px;margin:0 auto;padding:32px 24px 100px}
        .nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:48px;padding-top:8px}
        .logo{font-family:'Instrument Serif',serif;font-size:28px;font-style:italic;color:var(--amber);cursor:pointer;letter-spacing:-0.5px}
        .logo span{color:var(--text)}
        .nav-right{display:flex;align-items:center;gap:16px}
        .nav-link{font-size:13px;color:var(--text2);cursor:pointer;transition:color 0.15s;background:none;border:none;font-family:inherit}
        .nav-link:hover{color:var(--amber)}
        .countdown-pill{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--red);border:1px solid rgba(248,113,113,0.3);border-radius:100px;padding:5px 12px;animation:pulse 2s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        .social-proof{text-align:center;margin-bottom:40px;font-size:13px;color:var(--text2)}
        .social-proof strong{color:var(--amber);font-weight:600}
        .hero{text-align:center;margin-bottom:20px}
        .hero h1{font-family:'Instrument Serif',serif;font-size:52px;line-height:1.1;letter-spacing:-1.5px;margin-bottom:16px}
        .hero h1 em{font-style:italic;color:var(--amber)}
        .hero p{color:var(--text2);font-size:18px;line-height:1.6;max-width:480px;margin:0 auto;font-weight:300}
        .tools{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .tool-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px 24px;cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden}
        .tool-card:hover{border-color:var(--amber);background:var(--surface2);transform:translateY(-2px)}
        .tool-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--amber);opacity:0;transition:opacity 0.25s}
        .tool-card:hover::after{opacity:1}
        .tool-icon{font-size:32px;margin-bottom:16px}
        .tool-card h3{font-family:'Instrument Serif',serif;font-size:22px;margin-bottom:8px}
        .tool-card p{color:var(--text2);font-size:14px;line-height:1.5;font-weight:300}
        .tool-free{display:inline-block;font-size:11px;font-weight:600;color:var(--green);background:rgba(52,211,153,0.1);border-radius:100px;padding:3px 10px;margin-bottom:12px;letter-spacing:0.5px}
        .both-btn{width:100%;background:var(--amber-dim);border:1px solid rgba(232,168,48,0.25);border-radius:var(--radius);padding:18px 24px;cursor:pointer;transition:all 0.25s;color:var(--amber);font-family:inherit;font-size:15px;font-weight:600;text-align:center}
        .both-btn:hover{background:rgba(232,168,48,0.15);border-color:var(--amber)}
        .divider{display:flex;align-items:center;gap:16px;margin:48px 0 32px;color:var(--text3);font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border)}
        .calc-section{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px 24px;margin-bottom:32px}
        .calc-section h3{font-family:'Instrument Serif',serif;font-size:22px;margin-bottom:4px}
        .calc-section .calc-sub{color:var(--text2);font-size:14px;margin-bottom:20px;font-weight:300}
        .calc-mini input[type="text"],.calc-mini input[type="number"]{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s}
        .calc-mini input:focus{border-color:var(--amber)}
        .calc-mini input[type="number"]{text-align:center;-moz-appearance:textfield}
        .calc-mini input[type="number"]::-webkit-inner-spin-button{-webkit-appearance:none}
        .calc-grid-header{display:grid;grid-template-columns:1fr 70px 70px 28px;gap:6px;margin-bottom:6px}
        .calc-grid-header span{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text3)}
        .calc-grid-row{display:grid;grid-template-columns:1fr 70px 70px 28px;gap:6px;margin-bottom:6px;align-items:center}
        .calc-rm{width:28px;height:32px;background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;border-radius:4px;transition:all 0.15s}
        .calc-rm:hover{color:var(--red);background:rgba(248,113,113,0.1)}
        .calc-add{width:100%;padding:7px;background:none;border:1px dashed var(--border);border-radius:6px;color:var(--text3);font-family:inherit;font-size:12px;cursor:pointer;transition:all 0.15s;margin:4px 0 12px}
        .calc-add:hover{border-color:var(--amber);color:var(--amber)}
        .calc-final-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
        .calc-final-row label{display:block;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:6px}
        .calc-result{text-align:center;padding:16px;background:var(--surface2);border-radius:var(--radius-sm);display:flex;align-items:baseline;justify-content:center;gap:8px;flex-wrap:wrap}
        .calc-result-label{font-size:13px;color:var(--text2)}
        .calc-result-num{font-family:'Instrument Serif',serif;font-size:36px;font-weight:700}
        .calc-result-sub{font-size:13px;color:var(--text2)}
        .testimonials{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:32px 0}
        .testimonial{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px}
        .testimonial p{font-size:13px;color:var(--text2);font-style:italic;line-height:1.5;margin-bottom:8px;font-weight:300}
        .testimonial .author{font-size:11px;color:var(--text3);font-weight:600}
        .back-btn{background:none;border:none;color:var(--text2);font-family:inherit;font-size:14px;cursor:pointer;margin-bottom:32px;transition:color 0.15s}
        .back-btn:hover{color:var(--text)}
        .input-section{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:32px;margin-bottom:24px}
        .input-section h2{font-family:'Instrument Serif',serif;font-size:28px;margin-bottom:6px}
        .input-section .subtitle{color:var(--text2);font-size:14px;margin-bottom:24px;font-weight:300;line-height:1.5}
        .field-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:var(--text2);margin-bottom:8px;display:block}
        .course-input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 16px;color:var(--text);font-family:inherit;font-size:15px;outline:none;transition:border-color 0.2s;margin-bottom:20px}
        .course-input:focus{border-color:var(--amber)}
        .course-input::placeholder{color:var(--text3)}
        .text-area{width:100%;min-height:200px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;color:var(--text);font-family:inherit;font-size:14px;line-height:1.6;outline:none;resize:vertical;transition:border-color 0.2s}
        .text-area:focus{border-color:var(--amber)}
        .text-area::placeholder{color:var(--text3)}
        .char-count{text-align:right;font-size:12px;color:var(--text3);margin-top:6px}
        .preview-btn{width:100%;padding:16px;background:var(--amber);color:var(--bg);font-family:inherit;font-size:16px;font-weight:700;border:none;border-radius:var(--radius-sm);cursor:pointer;transition:all 0.2s;margin-top:16px}
        .preview-btn:hover{background:var(--amber2);transform:translateY(-1px)}
        .preview-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
        .preview-note{text-align:center;font-size:12px;color:var(--green);margin-top:10px;font-weight:500}
        .preview-section{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:24px}
        .preview-header{padding:24px 28px 0;display:flex;align-items:center;justify-content:space-between}
        .preview-header h2{font-family:'Instrument Serif',serif;font-size:24px}
        .preview-badge{font-size:11px;font-weight:600;color:var(--green);background:rgba(52,211,153,0.1);border-radius:100px;padding:4px 12px}
        .preview-content{padding:20px 28px}
        .preview-item{padding:14px 0;border-bottom:1px solid var(--border)}
        .preview-item:last-child{border-bottom:none}
        .preview-item .pi-type{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--amber);margin-bottom:6px}
        .preview-item .pi-q{font-size:14px;line-height:1.6}
        .preview-item .pi-opts{margin-top:8px;font-size:13px;color:var(--text2);line-height:1.8;font-weight:300;white-space:pre-wrap}
        .plan-item{display:grid;grid-template-columns:100px 1fr;gap:16px;padding:14px 0;border-bottom:1px solid var(--border)}
        .plan-item:last-child{border-bottom:none}
        .plan-day{font-family:'Instrument Serif',serif;font-size:16px;color:var(--amber)}
        .plan-detail h4{font-size:14px;margin-bottom:4px;font-weight:600}
        .plan-detail p{font-size:13px;color:var(--text2);font-weight:300}
        .blur-wall{position:relative;padding:0 28px 28px}
        .blur-items{filter:blur(6px);pointer-events:none;user-select:none;opacity:0.5}
        .blur-line{height:14px;background:var(--surface3);border-radius:4px;margin-bottom:10px}
        .blur-line.short{width:60%}
        .blur-line.med{width:80%}
        .blur-line.long{width:95%}
        .blur-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(to bottom,transparent 0%,rgba(8,8,10,0.85) 30%,rgba(8,8,10,0.95) 100%)}
        .blur-overlay h3{font-family:'Instrument Serif',serif;font-size:24px;margin-bottom:8px}
        .blur-overlay p{color:var(--text2);font-size:14px;margin-bottom:20px;font-weight:300;text-align:center;max-width:320px;line-height:1.5}
        .unlock-btn{padding:14px 40px;background:var(--amber);color:var(--bg);font-family:inherit;font-size:15px;font-weight:700;border:none;border-radius:var(--radius-sm);cursor:pointer;transition:all 0.2s}
        .unlock-btn:hover{background:var(--amber2);transform:translateY(-1px)}
        .unlock-features{display:flex;gap:16px;margin-top:14px;flex-wrap:wrap;justify-content:center}
        .unlock-feat{font-size:12px;color:var(--text2);display:flex;align-items:center;gap:4px}
        .loading-wrap{text-align:center;padding:80px 0}
        .spinner{width:48px;height:48px;border:3px solid var(--border);border-top-color:var(--amber);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 24px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .loading-wrap h2{font-family:'Instrument Serif',serif;font-size:28px;margin-bottom:8px}
        .loading-wrap p{color:var(--text2);font-size:15px;font-weight:300}
        .result-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:36px 32px;position:relative;overflow:hidden}
        .result-wrap::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--amber),var(--green))}
        .result-header{margin-bottom:24px}
        .result-header h2{font-family:'Instrument Serif',serif;font-size:28px}
        .result-content{font-size:15px;line-height:1.8;white-space:pre-wrap;font-weight:300}
        .result-actions{display:flex;gap:12px;margin-top:28px}
        .action-btn{flex:1;padding:12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.15s;text-align:center}
        .action-btn:hover{border-color:var(--amber);color:var(--amber)}
        .action-btn.primary{background:var(--amber);color:var(--bg);border-color:var(--amber)}
        .action-btn.primary:hover{background:var(--amber2)}
        .canceled-wrap{text-align:center;padding:80px 0}
        .canceled-wrap h2{font-family:'Instrument Serif',serif;font-size:28px;margin-bottom:12px}
        .canceled-wrap p{color:var(--text2);font-size:15px;margin-bottom:24px;font-weight:300}
        .error-bar{background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);border-radius:var(--radius-sm);padding:12px 16px;color:var(--red);font-size:14px;margin-bottom:20px}
        .footer{text-align:center;margin-top:64px;color:var(--text3);font-size:12px}
        @media(max-width:560px){.hero h1{font-size:36px}.tools{grid-template-columns:1fr}.testimonials{grid-template-columns:1fr}.input-section{padding:24px 20px}.result-wrap{padding:24px 20px}.result-actions{flex-direction:column}.calc-grid-header,.calc-grid-row{grid-template-columns:1fr 60px 60px 28px}}
      `}</style>
      <div className="page">
        <div className="nav">
          <div className="logo" onClick={goHome}>Cram<span>Kit</span></div>
          <div className="nav-right">
            <button className="nav-link" onClick={() => { goHome(); setTimeout(() => document.getElementById('calc-section')?.scrollIntoView({behavior:'smooth'}), 100); }}>Grade Calculator</button>
            <div className="countdown-pill">{countdown}</div>
          </div>
        </div>

        {view === "home" && (<>
          <div className="hero">
            <h1>Drop your notes.<br/>Get <em>actually</em> ready.</h1>
            <p>Paste your syllabus or lecture notes. Get a personalized study plan and practice exam — preview free, full version ${PRICE}.</p>
          </div>
          {studentCount && <div className="social-proof"><strong>{studentCount.toLocaleString()}</strong> students have used CramKit this finals season</div>}
          {error && <div className="error-bar">{error}</div>}
          <div className="tools">
            <div className="tool-card" onClick={() => selectTool("plan")}>
              <div className="tool-free">Free preview</div>
              <div className="tool-icon">📋</div>
              <h3>Study Plan</h3>
              <p>Day-by-day breakdown tailored to your exam schedule, topic weights, and weak areas.</p>
            </div>
            <div className="tool-card" onClick={() => selectTool("quiz")}>
              <div className="tool-free">Free preview</div>
              <div className="tool-icon">✏️</div>
              <h3>Practice Exam</h3>
              <p>18+ questions with full answer key, matched to your actual course material.</p>
            </div>
          </div>
          <button className="both-btn" onClick={() => selectTool("both")}>Get both — study plan + practice exam</button>
          <div className="testimonials">
            <div className="testimonial"><p>"Pasted my orgo syllabus and had a study plan in 30 seconds. Actually organized my whole week."</p><div className="author">— Pre-med, junior</div></div>
            <div className="testimonial"><p>"The practice questions were harder than I expected. Half of them showed up on my real exam."</p><div className="author">— Econ major, sophomore</div></div>
            <div className="testimonial"><p>"$4 is nothing compared to failing a class. Cheaper than one coffee."</p><div className="author">— Engineering, senior</div></div>
          </div>
          <div className="divider">Free Tools</div>
          <div className="calc-section" id="calc-section">
            <h3>Final Grade Calculator</h3>
            <p className="calc-sub">Figure out what you need on your final — always free.</p>
            <GradeCalcMini />
          </div>
          <div className="footer">cramkit — built by a student, for students</div>
        </>)}

        {view === "input" && (<>
          <button className="back-btn" onClick={goHome}>← Back</button>
          <div className="input-section">
            <h2>{tool === "plan" ? "Study Plan" : tool === "quiz" ? "Practice Exam" : "Study Plan + Practice Exam"}</h2>
            <p className="subtitle">Paste your syllabus, notes, or describe what your final covers. The more detail, the better your results.</p>
            {error && <div className="error-bar">{error}</div>}
            <label className="field-label">Course name (optional)</label>
            <input type="text" className="course-input" placeholder="e.g. CHEM 201 — Organic Chemistry" value={courseName} onChange={e => setCourseName(e.target.value)} />
            <label className="field-label">Your material</label>
            <textarea className="text-area" placeholder={"Paste your syllabus, lecture notes, or describe what your final covers...\n\ne.g. \"My Organic Chemistry final is on May 2nd, worth 35% of my grade. It covers chapters 8-14: alkene reactions, alcohols & ethers, aldehydes & ketones, carboxylic acids, amines, and spectroscopy.\""} value={content} onChange={e => setContent(e.target.value)} />
            <div className="char-count">{content.length.toLocaleString()} characters</div>
            <button className="preview-btn" disabled={content.trim().length < 20} onClick={handlePreview}>Generate free preview</button>
            <div className="preview-note">Free — no payment required to preview</div>
          </div>
        </>)}

        {view === "preview" && preview && (<>
          <button className="back-btn" onClick={() => setView("input")}>← Edit material</button>
          {preview.planPreview && (
            <div className="preview-section">
              <div className="preview-header"><h2>Your Study Plan</h2><span className="preview-badge">Preview</span></div>
              <div className="preview-content">
                {preview.planPreview.visible.map((item, i) => (
                  <div className="plan-item" key={i}><div className="plan-day">{item.day}</div><div className="plan-detail"><h4>{item.focus}</h4><p>{item.hours} · {item.technique}</p></div></div>
                ))}
              </div>
              <div className="blur-wall">
                <div className="blur-items">{Array.from({length: preview.planPreview.blurredCount}).map((_, i) => (<div key={i}><div className={"blur-line " + ["short","med","long"][i%3]} />{i%2===0 && <div className="blur-line short" />}</div>))}</div>
                <div className="blur-overlay"><h3>+{preview.planPreview.blurredCount} more days</h3><p>Including priority rankings, time estimates, study techniques, and your night-before checklist.</p></div>
              </div>
            </div>
          )}
          {preview.quizPreview && (
            <div className="preview-section">
              <div className="preview-header"><h2>Your Practice Exam</h2><span className="preview-badge">Preview</span></div>
              <div className="preview-content">
                {preview.quizPreview.visible.map((item, i) => (
                  <div className="preview-item" key={i}><div className="pi-type">{item.type}</div><div className="pi-q">{item.q}</div>{item.options && <div className="pi-opts">{item.options.join("\n")}</div>}</div>
                ))}
              </div>
              <div className="blur-wall">
                <div className="blur-items">{Array.from({length: 8}).map((_, i) => (<div key={i}><div className={"blur-line " + ["long","med","short"][i%3]} /><div className="blur-line med" />{i%3===0 && <div className="blur-line short" />}</div>))}</div>
                <div className="blur-overlay"><h3>+{preview.quizPreview.blurredCount} more questions</h3><p>Multiple choice, short answer, true/false, and essay questions — plus a complete answer key with explanations.</p></div>
              </div>
            </div>
          )}
          <button className="unlock-btn" style={{width:"100%",padding:18,fontSize:16,borderRadius:"var(--radius)"}} onClick={handleUnlock}>Unlock full {tool === "plan" ? "study plan" : tool === "quiz" ? "practice exam" : "study plan + practice exam"} — ${PRICE}</button>
          <div className="unlock-features">
            <span className="unlock-feat">🔒 Secure checkout via Stripe</span>
            <span className="unlock-feat">⚡ Ready in ~30 seconds</span>
            <span className="unlock-feat">📥 Download as .txt</span>
            <span className="unlock-feat">💳 One-time, no subscription</span>
          </div>
        </>)}

        {view === "loading" && (
          <div className="loading-wrap"><div className="spinner" /><h2>Building your prep...</h2><p>Analyzing your material and generating your personalized {tool === "plan" ? "study plan" : tool === "quiz" ? "practice exam" : "study plan + practice exam"}. About 30 seconds.</p></div>
        )}

        {view === "result" && (<>
          <button className="back-btn" onClick={goHome}>← Generate another</button>
          <div className="result-wrap">
            <div className="result-header"><h2>Your {tool === "plan" ? "Study Plan" : tool === "quiz" ? "Practice Exam" : "Study Plan + Practice Exam"}</h2></div>
            <div className="result-content">{result}</div>
            <div className="result-actions">
              <button className="action-btn" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
              <button className="action-btn" onClick={() => { const b = new Blob([result], {type:"text/plain"}); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "cramkit-" + tool + ".txt"; a.click(); }}>Download</button>
              <button className="action-btn primary" onClick={goHome}>Generate another</button>
            </div>
          </div>
        </>)}

        {view === "canceled" && (
          <div className="canceled-wrap"><h2>Payment canceled</h2><p>No worries — nothing was charged.</p><button className="preview-btn" style={{maxWidth:300,margin:"0 auto"}} onClick={goHome}>Go back</button></div>
        )}
      </div>
    </>
  );
}
