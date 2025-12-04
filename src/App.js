import React, { useState, useEffect, useRef } from "react";

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing tests are a fun way to improve your speed and accuracy.",
  "React makes building interactive user interfaces much easier.",
  "Practice makes perfect, keep typing daily to see improvements.",
  "Consistent practice leads to remarkable typing proficiency gains.",
  "Programming requires precise typing skills for efficient coding.",
  "Touch typing can dramatically increase your productivity at work.",
];

function App() {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);

  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    generateNewText();
    const savedScores =
      JSON.parse(localStorage.getItem("typingLeaderboard")) || [];
    setLeaderboard(savedScores);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const generateNewText = () => {
    const randomText =
      sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setText(randomText);
    setInput("");
    setCurrentCharIndex(0);
    setIsComplete(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setCurrentCharIndex(value.length);

    if (!isRunning && value.length > 0) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev >= selectedDuration) {
            handleTimeUp();
            return selectedDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }

    if (value === text) {
      handleComplete(value);
    }
  };

  const handleComplete = (typed) => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsComplete(true);
    calculateStats(typed);

    if (accuracy >= 90) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleTimeUp = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    calculateStats(input);
  };

  const calculateStats = (typed) => {
    const wordsTyped = typed
      .trim()
      .split(/\s+/)
      .filter((word) => word).length;
    const minutes = time / 60;
    const correctChars = typed
      .split("")
      .filter((char, i) => char === text[i]).length;
    const totalChars = text.length;
    const acc =
      totalChars > 0 ? ((correctChars / totalChars) * 100).toFixed(1) : 0;

    const calculatedWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
    setWpm(calculatedWpm);
    setAccuracy(parseFloat(acc));

    if (calculatedWpm > 0 && parseFloat(acc) > 70) {
      const newScore = {
        wpm: calculatedWpm,
        accuracy: parseFloat(acc),
        text: text.slice(0, 30),
        date: new Date().toLocaleDateString(),
        time: selectedDuration,
      };

      const updatedLeaderboard = [...leaderboard, newScore]
        .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
        .slice(0, 10);

      setLeaderboard(updatedLeaderboard);
      localStorage.setItem(
        "typingLeaderboard",
        JSON.stringify(updatedLeaderboard)
      );
    }
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    generateNewText();
    setTime(0);
    setIsRunning(false);
    setWpm(0);
    setAccuracy(0);
    setIsComplete(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const renderTextWithHighlight = () => {
    return text.split("").map((char, index) => {
      let style = {
        padding: "2px",
        borderRadius: "3px",
        transition: "all 0.2s ease",
      };

      if (index < input.length) {
        if (input[index] === char) {
          style.color = "#10b981";
          style.backgroundColor = "rgba(16, 185, 129, 0.1)";
        } else {
          style.color = "#ef4444";
          style.backgroundColor = "rgba(239, 68, 68, 0.1)";
          style.textDecoration = "line-through";
        }
      }

      if (index === currentCharIndex) {
        style.backgroundColor = "#6366f1";
        style.color = "white";
        style.animation = "blink 1s infinite";
      }

      return (
        <span key={index} style={style}>
          {char}
        </span>
      );
    });
  };

  const progressPercentage = (time / selectedDuration) * 100;
  const accuracyColor =
    accuracy >= 90 ? "#10b981" : accuracy >= 70 ? "#f59e0b" : "#ef4444";
  const wpmColor = wpm >= 60 ? "#10b981" : wpm >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
      }}
    >
      {showConfetti && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 1000,
            background:
              "radial-gradient(circle at 50% 50%, transparent 20%, rgba(255, 255, 255, 0.1) 100%)",
            animation: "confettiFall 3s linear",
          }}
        ></div>
      )}

      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          padding: "1.5rem 2rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ fontSize: "2rem" }}>⌨️</span>
          <h1
            style={{
              color: "white",
              fontSize: "2rem",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Typing Speed Test
          </h1>
        </div>
        <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "1rem" }}>
          Test and improve your typing speed
        </p>
      </div>

      {/* Main Content */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
          width: "100%",
        }}
      >
        {/* Dashboard */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
            animation: "slideUp 0.5s ease-out",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
            {/* Time Stat */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                Time
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  color: "#6366f1",
                  marginBottom: "0.5rem",
                }}
              >
                {time}s
              </div>
              <div
                style={{
                  height: "6px",
                  background: "#e5e7eb",
                  borderRadius: "3px",
                  marginTop: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    borderRadius: "3px",
                    width: `${progressPercentage}%`,
                    transition: "width 0.3s ease",
                  }}
                ></div>
              </div>
            </div>

            {/* WPM Stat */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                WPM
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  color: wpmColor,
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {wpm}
                {wpm > 0 && (
                  <span
                    style={{
                      fontSize: "1.5rem",
                      animation: "bounce 1s infinite",
                    }}
                  >
                    {wpm >= 60 ? "🔥" : wpm >= 40 ? "⚡" : "📈"}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#999" }}>
                Words per minute
              </div>
            </div>

            {/* Accuracy Stat */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                Accuracy
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  color: accuracyColor,
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {accuracy}%
                {accuracy >= 90 && (
                  <span
                    style={{
                      fontSize: "1.5rem",
                      animation: "bounce 1s infinite",
                    }}
                  >
                    🎯
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#999" }}>
                Typing precision
              </div>
            </div>
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "1rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontWeight: 600, color: "#666" }}>Duration:</span>
              {[15, 30, 60].map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  disabled={isRunning}
                  style={{
                    padding: "0.5rem 1.5rem",
                    border: `2px solid ${
                      selectedDuration === duration ? "#6366f1" : "#e5e7eb"
                    }`,
                    background:
                      selectedDuration === duration ? "#6366f1" : "white",
                    color: selectedDuration === duration ? "white" : "#333",
                    borderRadius: "50px",
                    fontWeight: 600,
                    cursor: isRunning ? "not-allowed" : "pointer",
                    opacity: isRunning ? 0.5 : 1,
                    transition: "all 0.3s ease",
                  }}
                >
                  {duration}s
                </button>
              ))}
            </div>
            <button
              onClick={handleReset}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 10px 20px rgba(99, 102, 241, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              <span>🔄</span>
              New Test
            </button>
          </div>
        </div>

        {/* Typing Section */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
            animation: "slideUp 0.5s ease-out 0.1s both",
          }}
        >
          {/* Text Display */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: "1rem",
                fontWeight: 600,
              }}
            >
              Type the text below:
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                lineHeight: "1.8",
                padding: "1.5rem",
                background: "#f9fafb",
                borderRadius: "12px",
                border: "2px solid #e5e7eb",
                minHeight: "120px",
                transition: "border-color 0.3s ease",
              }}
            >
              {renderTextWithHighlight()}
            </div>
          </div>

          {/* Input Section */}
          <div style={{ position: "relative" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              placeholder="Start typing here to begin the test..."
              rows={3}
              disabled={isComplete}
              style={{
                width: "100%",
                padding: "1.5rem",
                fontSize: "1.2rem",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                resize: "none",
                transition: "all 0.3s ease",
                fontFamily: "'Segoe UI', monospace",
                opacity: isComplete ? 0.5 : 1,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />

            {isComplete && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255, 255, 255, 0.95)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  animation: "fadeIn 0.5s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                    animation: "celebration 1s ease",
                  }}
                >
                  🎉
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "#10b981",
                  }}
                >
                  Test Complete!{" "}
                  {accuracy >= 90 ? "Excellent accuracy!" : "Good job!"}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
            animation: "slideUp 0.5s ease-out 0.2s both",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ color: "#1f2937", fontSize: "1.5rem" }}>
              🏆 Top Typists
            </h2>
            <span
              style={{
                background: "#f3f4f6",
                color: "#6b7280",
                padding: "0.25rem 0.75rem",
                borderRadius: "50px",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {leaderboard.length} records
            </span>
          </div>

          {leaderboard.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {leaderboard.map((score, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr 2fr auto",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "1rem 1.5rem",
                    background:
                      idx === 0
                        ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                        : idx === 1
                        ? "linear-gradient(135deg, #f3f4f6, #e5e7eb)"
                        : idx === 2
                        ? "linear-gradient(135deg, #fcd9b4, #f8b06c)"
                        : "#f9fafb",
                    borderRadius: "12px",
                    border: `1px solid ${
                      idx === 0
                        ? "#f59e0b"
                        : idx === 1
                        ? "#9ca3af"
                        : idx === 2
                        ? "#f97316"
                        : "#e5e7eb"
                    }`,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateX(5px)";
                    e.target.style.borderColor = "#6366f1";
                    e.target.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateX(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      minWidth: "40px",
                    }}
                  >
                    {idx === 0
                      ? "🥇"
                      : idx === 1
                      ? "🥈"
                      : idx === 2
                      ? "🥉"
                      : `#${idx + 1}`}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      <strong>{score.wpm}</strong> WPM
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {score.accuracy}% accuracy
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#4b5563",
                      fontStyle: "italic",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    "{score.text}..."
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                    {score.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}
            >
              <div
                style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}
              >
                📝
              </div>
              <p>No scores yet. Complete a test to appear here!</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          padding: "1.5rem 2rem",
          textAlign: "center",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          marginTop: "auto",
        }}
      >
        <p
          style={{ color: "rgba(255, 255, 255, 0.9)", marginBottom: "0.5rem" }}
        >
          Keep practicing daily to improve your typing speed
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.875rem",
          }}
        >
          <span>Made with ❤️</span>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes blink {
          0%, 100% { background-color: #6366f1; }
          50% { background-color: #8b5cf6; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes celebration {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes confettiFall {
          0% { opacity: 0; }
          10%, 90% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @media (max-width: 768px) {
          main { padding: 1rem; }
          .stats-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .controls { flex-direction: column; gap: 1rem; }
          .leaderboard-item { grid-template-columns: 1fr; gap: 0.5rem; }
          .text-display { font-size: 1.2rem; }
          h1 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}

export default App;
