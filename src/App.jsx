import { useState, useEffect } from "react";

const PRICE = 3.99;

export default function App() {
  const [view, setView] = useState("home"); // home | input | loading | result | canceled
  const [tool, setTool] = useState(null); // "plan" | "quiz" | "both"
  const [content, setContent] = useState("");
  const [courseName, setCourseName] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  // Check for Stripe redirect on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const canceled = params.get("canceled");

    if (canceled) {
      setView("canceled");
      window.history.replaceState({}, "", "/");
      return;
    }

    if (sessionId) {
      window.history.replaceState({}, "", "/");
      const savedContent = sessionStorage.getItem("cramkit_content");
      const savedCourse = sessionStorage.getItem("cramkit_course");
      const savedTool = sessionStorage.getItem("cramkit_tool");

      if (savedContent && savedTool) {
        setContent(savedContent);
        setCourseName(savedCourse || "");
        setTool(savedTool);
        setView("loading");
        generateResult(savedContent, savedCourse || "", savedTool, sessionId);
      }
    }
  }, []);

  async function generateResult(text, course, selectedTool, sessionId) {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          courseName: course,
          tool: selectedTool,
          sessionId,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setView("home");
      } else {
        setResult(data.result);
        setView("result");
        sessionStorage.removeItem("cramkit_content");
        sessionStorage.removeItem("cramkit_course");
        sessionStorage.removeItem("cramkit_tool");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setView("home");
    }
  }

  async function handleGenerate() {
    if (!content.trim()) return;

    // Save to sessionStorage before redirect
    sessionStorage.setItem("cramkit_content", content);
    sessionStorage.setItem("cramkit_course", courseName);
    sessionStorage.setItem("cramkit_tool", tool);

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Could not create checkout session.");
      }
    } catch (err) {
      setError("Could not connect to payment. Please try again.");
    }
  }

  function selectTool(t) {
    setTool(t);
    setView("input");
    setError("");
  }

  function goHome() {
    setView("home");
    setTool(null);
    setContent("");
    setCourseName("");
    setResult("");
    setError("");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Karla:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{
          --bg:#08080a;--surface:#111114;--surface2:#1a1a1f;--surface3:#222228;
          --border:#2a2a32;--border2:#3a3a44;
          --text:#ece9e1;--text2:#9e9a90;--text3:#6a665e;
          --amber:#e8a830;--amber2:#f0c050;--amber-dim:rgba(232,168,48,0.1);--amber-dim2:rgba(232,168,48,0.05);
          --green:#34d399;--red:#f87171;
          --radius:16px;--radius-sm:10px;
        }
        body{font-family:'Karla',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;-webkit-font-smoothing:antialiased}

        .page{max-width:720px;margin:0 auto;padding:40px 24px 100px}

        /* NAV */
        .nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:64px;padding-top:8px}
        .logo{font-family:'Instrument Serif',serif;font-size:28px;font-style:italic;color:var(--amber);cursor:pointer;letter-spacing:-0.5px}
        .logo span{color:var(--text)}
        .nav-pill{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--amber);border:1px solid var(--amber);border-radius:100px;padding:6px 14px;opacity:0.8}

        /* HERO */
        .hero{text-align:center;margin-bottom:64px}
        .hero h1{font-family:'Instrument Serif',serif;font-size:52px;line-height:1.1;letter-spacing:-1.5px;margin-bottom:16px;color:var(--text)}
        .hero h1 em{font-style:italic;color:var(--amber)}
        .hero p{color:var(--text2);font-size:18px;line-height:1.6;max-width:480px;margin:0 auto 8px;font-weight:300}
        .hero-price{color:var(--text3);font-size:14px;margin-top:16px;font-weight:400}
        .hero-price strong{color:var(--amber);font-weight:600}

        /* TOOL CARDS */
        .tools{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}
        .tool-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px 24px;cursor:pointer;transition:all 0.25s ease;position:relative;overflow:hidden}
        .tool-card:hover{border-color:var(--amber);background:var(--surface2);transform:translateY(-2px)}
        .tool-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--amber);opacity:0;transition:opacity 0.25s}
        .tool-card:hover::after{opacity:1}
        .tool-icon{font-size:32px;margin-bottom:16px}
        .tool-card h3{font-family:'Instrument Serif',serif;font-size:22px;margin-bottom:8px;letter-spacing:-0.3px}
        .tool-card p{color:var(--text2);font-size:14px;line-height:1.5;font-weight:300}

        .both-btn{width:100%;background:var(--amber-dim);border:1px solid rgba(232,168,48,0.25);border-radius:var(--radius);padding:18px 24px;cursor:pointer;transition:all 0.25s;color:var(--amber);font-family:'Karla',sans-serif;font-size:15px;font-weight:600;text-align:center}
        .both-btn:hover{background:rgba(232,168,48,0.15);border-color:var(--amber)}

        /* INPUT VIEW */
        .back-btn{background:none;border:none;color:var(--text2);font-family:'Karla',sans-serif;font-size:14px;cursor:pointer;margin-bottom:32px;display:flex;align-items:center;gap:6px;transition:color 0.15s}
        .back-btn:hover{color:var(--text)}

        .input-section{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:32px;margin-bottom:24px}
        .input-section h2{font-family:'Instrument Serif',serif;font-size:28px;margin-bottom:6px;letter-spacing:-0.5px}
        .input-section .subtitle{color:var(--text2);font-size:14px;margin-bottom:24px;font-weight:300;line-height:1.5}

        .field-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:var(--text2);margin-bottom:8px;display:block}

        .course-input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 16px;color:var(--text);font-family:'Karla',sans-serif;font-size:15px;outline:none;transition:border-color 0.2s;margin-bottom:20px}
        .course-input:focus{border-color:var(--amber)}
        .course-input::placeholder{color:var(--text3)}

        .text-area{width:100%;min-height:220px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;color:var(--text);font-family:'Karla',sans-serif;font-size:14px;line-height:1.6;outline:none;resize:vertical;transition:border-color 0.2s}
        .text-area:focus{border-color:var(--amber)}
        .text-area::placeholder{color:var(--text3)}

        .char-count{text-align:right;font-size:12px;color:var(--text3);margin-top:8px}

        .generate-btn{width:100%;padding:16px 24px;background:var(--amber);color:var(--bg);font-family:'Karla',sans-serif;font-size:16px;font-weight:700;border:none;border-radius:var(--radius-sm);cursor:pointer;transition:all 0.2s;letter-spacing:0.3px}
        .generate-btn:hover{background:var(--amber2);transform:translateY(-1px)}
        .generate-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
        .generate-btn .price-tag{font-weight:400;opacity:0.8;margin-left:8px}

        .trust-row{display:flex;justify-content:center;gap:24px;margin-top:16px}
        .trust-item{font-size:12px;color:var(--text3);display:flex;align-items:center;gap:4px}

        /* LOADING */
        .loading-wrap{text-align:center;padding:80px 0}
        .spinner{width:48px;height:48px;border:3px solid var(--border);border-top-color:var(--amber);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 24px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .loading-wrap h2{font-family:'Instrument Serif',serif;font-size:28px;margin-bottom:8px}
        .loading-wrap p{color:var(--text2);font-size:15px;font-weight:300}

        /* RESULT */
        .result-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:36px 32px;position:relative;overflow:hidden}
        .result-wrap::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--amber),var(--green))}
        .result-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
        .result-header h2{font-family:'Instrument Serif',serif;font-size:28px}
        .result-content{font-size:15px;line-height:1.8;color:var(--text);white-space:pre-wrap;font-weight:300}
        .result-content h1,.result-content h2,.result-content h3{font-family:'Instrument Serif',serif;font-weight:400;margin:24px 0 12px;color:var(--amber)}
        .result-content strong{color:var(--amber2);font-weight:600}
        .result-content ul,.result-content ol{padding-left:20px;margin:8px 0}
        .result-content li{margin-bottom:6px}

        .result-actions{display:flex;gap:12px;margin-top:28px}
        .action-btn{flex:1;padding:12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:'Karla',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.15s;text-align:center}
        .action-btn:hover{border-color:var(--amber);color:var(--amber)}
        .action-btn.primary{background:var(--amber);color:var(--bg);border-color:var(--amber)}
        .action-btn.primary:hover{background:var(--amber2)}

        /* ERROR */
        .error-bar{background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);border-radius:var(--radius-sm);padding:12px 16px;color:var(--red);font-size:14px;margin-bottom:20px}

        /* CANCELED */
        .canceled-wrap{text-align:center;padding:80px 0}
        .canceled-wrap h2{font-family:'Instrument Serif',serif;font-size:28px;margin-bottom:12px}
        .canceled-wrap p{color:var(--text2);font-size:15px;margin-bottom:24px;font-weight:300}

        /* HOW IT WORKS */
        .how-section{margin-top:64px;text-align:center}
        .how-section h2{font-family:'Instrument Serif',serif;font-size:28px;margin-bottom:32px;color:var(--text2)}
        .steps{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
        .step{padding:24px 16px}
        .step-num{font-family:'Instrument Serif',serif;font-size:36px;color:var(--amber);opacity:0.5;margin-bottom:8px}
        .step h4{font-size:14px;font-weight:600;margin-bottom:6px}
        .step p{font-size:13px;color:var(--text2);line-height:1.5;font-weight:300}

        .footer{text-align:center;margin-top:64px;color:var(--text3);font-size:12px}

        @media(max-width:560px){
          .hero h1{font-size:36px}
          .tools{grid-template-columns:1fr}
          .steps{grid-template-columns:1fr}
          .input-section{padding:24px 20px}
          .result-wrap{padding:24px 20px}
          .result-actions{flex-direction:column}
        }
      `}</style>

      <div className="page">
        {/* NAV */}
        <div className="nav">
          <div className="logo" onClick={goHome}>
            Cram<span>Kit</span>
          </div>
          <div className="nav-pill">Finals 2026</div>
        </div>

        {/* HOME VIEW */}
        {view === "home" && (
          <>
            <div className="hero">
              <h1>
                Drop your notes.
                <br />
                Get <em>actually</em> ready.
              </h1>
              <p>
                Paste your syllabus, lecture notes, or study guide. CramKit
                builds you a personalized study plan and practice exam in
                seconds.
              </p>
              <div className="hero-price">
                <strong>${PRICE}</strong> per generation — no subscription, no
                signup
              </div>
            </div>

            {error && <div className="error-bar">{error}</div>}

            <div className="tools">
              <div className="tool-card" onClick={() => selectTool("plan")}>
                <div className="tool-icon">📋</div>
                <h3>Study Plan</h3>
                <p>
                  Get a day-by-day breakdown of what to study, in what order,
                  with time estimates based on your exam schedule and topic
                  weights.
                </p>
              </div>
              <div className="tool-card" onClick={() => selectTool("quiz")}>
                <div className="tool-icon">✏️</div>
                <h3>Practice Exam</h3>
                <p>
                  AI-generated questions with detailed answer explanations,
                  matched to your actual course material. Like a practice
                  final, instantly.
                </p>
              </div>
            </div>
            <button className="both-btn" onClick={() => selectTool("both")}>
              Get both — study plan + practice exam — ${PRICE}
            </button>

            <div className="how-section">
              <h2>How it works</h2>
              <div className="steps">
                <div className="step">
                  <div className="step-num">1</div>
                  <h4>Paste your material</h4>
                  <p>
                    Syllabus, lecture notes, study guide, or even just a
                    description of what your final covers.
                  </p>
                </div>
                <div className="step">
                  <div className="step-num">2</div>
                  <h4>Pay once</h4>
                  <p>
                    ${PRICE}, no account needed. Secure checkout via Stripe.
                    No subscriptions ever.
                  </p>
                </div>
                <div className="step">
                  <div className="step-num">3</div>
                  <h4>Get your prep</h4>
                  <p>
                    Personalized study plan, practice questions, or both —
                    ready in about 30 seconds.
                  </p>
                </div>
              </div>
            </div>

            <div className="footer">
              cramkit · built by a student, for students
            </div>
          </>
        )}

        {/* INPUT VIEW */}
        {view === "input" && (
          <>
            <button className="back-btn" onClick={goHome}>
              ← Back
            </button>
            <div className="input-section">
              <h2>
                {tool === "plan"
                  ? "Generate Study Plan"
                  : tool === "quiz"
                  ? "Generate Practice Exam"
                  : "Generate Study Plan + Practice Exam"}
              </h2>
              <p className="subtitle">
                {tool === "plan"
                  ? "Paste your syllabus or describe what your final covers. Include exam dates and topic weights if you have them."
                  : tool === "quiz"
                  ? "Paste your lecture notes, study guide, or describe the topics. The more detail, the better the questions."
                  : "Paste your syllabus, notes, or study guide. You'll get a personalized study plan and a full practice exam."}
              </p>

              {error && <div className="error-bar">{error}</div>}

              <label className="field-label">Course name (optional)</label>
              <input
                type="text"
                className="course-input"
                placeholder="e.g. CHEM 201 — Organic Chemistry"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />

              <label className="field-label">
                Your material — syllabus, notes, or description
              </label>
              <textarea
                className="text-area"
                placeholder={
                  tool === "plan"
                    ? "Paste your syllabus here, or describe what your final covers...\n\ne.g. \"My Organic Chemistry final is on May 2nd, worth 35% of my grade. It covers chapters 8-14: alkene reactions, alcohols & ethers, aldehydes & ketones, carboxylic acids, amines, and spectroscopy (IR and NMR). I'm weakest on spectroscopy and carbonyl chemistry.\""
                    : "Paste your lecture notes or study guide here...\n\ne.g. \"Chapter 12: Carbonyl Chemistry. Key reactions: nucleophilic addition, Grignard reactions, Wittig reaction, aldol condensation. Know mechanisms for: acid-catalyzed and base-catalyzed hydration, hemiacetal/acetal formation, imine and enamine formation...\""
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="char-count">
                {content.length.toLocaleString()} characters
              </div>

              <button
                className="generate-btn"
                disabled={content.trim().length < 20}
                onClick={handleGenerate}
              >
                Generate{" "}
                {tool === "plan"
                  ? "Study Plan"
                  : tool === "quiz"
                  ? "Practice Exam"
                  : "Study Plan + Practice Exam"}
                <span className="price-tag">· ${PRICE}</span>
              </button>

              <div className="trust-row">
                <span className="trust-item">🔒 Secure checkout</span>
                <span className="trust-item">⚡ Ready in ~30s</span>
                <span className="trust-item">💳 No subscription</span>
              </div>
            </div>
          </>
        )}

        {/* LOADING VIEW */}
        {view === "loading" && (
          <div className="loading-wrap">
            <div className="spinner" />
            <h2>Building your prep...</h2>
            <p>
              Analyzing your material and generating{" "}
              {tool === "plan"
                ? "your study plan"
                : tool === "quiz"
                ? "practice questions"
                : "your study plan and practice exam"}
              . This takes about 30 seconds.
            </p>
          </div>
        )}

        {/* RESULT VIEW */}
        {view === "result" && (
          <>
            <button className="back-btn" onClick={goHome}>
              ← Generate another
            </button>
            <div className="result-wrap">
              <div className="result-header">
                <h2>
                  {tool === "plan"
                    ? "Your Study Plan"
                    : tool === "quiz"
                    ? "Your Practice Exam"
                    : "Your Study Plan + Practice Exam"}
                </h2>
              </div>
              <div className="result-content">{result}</div>
              <div className="result-actions">
                <button
                  className="action-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                  }}
                >
                  Copy to clipboard
                </button>
                <button
                  className="action-btn"
                  onClick={() => {
                    const blob = new Blob([result], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `cramkit-${tool}-${
                      courseName || "prep"
                    }.txt`;
                    a.click();
                  }}
                >
                  Download .txt
                </button>
                <button className="action-btn primary" onClick={goHome}>
                  Generate another
                </button>
              </div>
            </div>
          </>
        )}

        {/* CANCELED VIEW */}
        {view === "canceled" && (
          <div className="canceled-wrap">
            <h2>Payment canceled</h2>
            <p>No worries — nothing was charged. Your material is still here.</p>
            <button className="generate-btn" style={{ maxWidth: 300, margin: "0 auto" }} onClick={goHome}>
              Go back
            </button>
          </div>
        )}
      </div>
    </>
  );
}
