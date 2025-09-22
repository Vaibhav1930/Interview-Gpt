import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser } from "@clerk/clerk-react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import mammoth from "mammoth";

// configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// ✅ Retry helper
async function generateWithRetry(prompt, modelName = "gemini-1.5-flash", retries = 3) {
  let lastError = null;
  for (let i = 0; i < retries; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err;
      if (err.status === 503) {
        console.warn(`${modelName} overloaded. Retry ${i + 1}/${retries}...`);
        await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

// ⭐ Star rating
const StarRating = ({ score }) => (
  <div className="flex gap-1 mt-1">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < score ? "text-yellow-500" : "text-gray-300"}>
        ★
      </span>
    ))}
  </div>
);

// 🔊 Waveform
const Waveform = () => {
  const bars = Array.from({ length: 15 });
  return (
    <div className="flex items-end justify-center gap-1 h-12 my-4">
      {bars.map((_, i) => (
        <div
          key={i}
          className="w-1 bg-blue-500 rounded animate-pulse"
          style={{
            height: `${Math.random() * 30 + 10}px`,
            transition: "height 0.3s ease",
          }}
        />
      ))}
    </div>
  );
};

function ResumeInterview() {
  const { user } = useUser();
  const candidateName = user?.firstName || user?.username || "Candidate";

  const [resumeContent, setResumeContent] = useState("");
  const [resumeValid, setResumeValid] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [finalFeedback, setFinalFeedback] = useState(null);
  const [feedbackError, setFeedbackError] = useState(null);

  const [islistening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const INTERVIEW_DURATION = 20 * 60 * 1000; // 20 minutes in ms

  // 🎤 Recognition
  useEffect(() => {
    recognition.onresult = (e) => {
      let finalTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        finalTranscript += e.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };
    recognition.onend = () => {
      if (islistening && timeLeft > 0) recognition.start();
    };
  }, [islistening, timeLeft]);

  // ⏳ Answer timer
  useEffect(() => {
    if (islistening && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (islistening && timeLeft === 0) {
      handleStopListening();
    }
  }, [islistening, timeLeft]);

  // ⏳ 20-min Interview timer
  useEffect(() => {
    if (!interviewStartTime || !isInterviewActive) return;
    const timer = setInterval(() => {
      const elapsed = Date.now() - interviewStartTime;
      if (elapsed >= INTERVIEW_DURATION) {
        clearInterval(timer);
        endInterview();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [interviewStartTime, isInterviewActive]);

  // ✅ Resume Validation
  const validateResume = async () => {
    const keywords = ["experience", "education", "skills", "projects", "internship"];
    const content = resumeContent.toLowerCase();
    if (resumeContent.length < 200 || resumeContent.split("\n").length < 2) {
      setResumeValid(false);
      return false;
    }
    if (!keywords.some((kw) => content.includes(kw))) {
      setResumeValid(false);
      return false;
    }
    const prompt = `
Check if the following text is a valid resume.
Respond ONLY with one word: "valid" or "invalid".

Resume:
${resumeContent}
    `;
    const response = await generateWithRetry(prompt, "gemini-1.5-flash");
    const normalized = response.trim().toLowerCase();
    if (normalized.includes("valid") && !normalized.includes("invalid")) {
      setResumeValid(true);
      return true;
    } else {
      setResumeValid(false);
      return false;
    }
  };

  // ✅ Ask next question (Professional Flow)
  const askNextQuestion = async () => {
    setLoadingQuestion(true);
    setCurrentQuestion(null);

    const sessionHistory = answers
      .map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`)
      .join("\n") || "No questions asked yet.";

    const prompt = `
You are acting as a professional interviewer conducting a structured, resume-based interview.

Candidate: ${candidateName}

Resume:
${resumeContent}

Interview Transcript so far:
${sessionHistory}

Follow this professional interview flow strictly:

1. Introduction & Warm-Up
2. Company & Role Overview
3. Candidate Background
4. Technical / Role-Specific Assessment
5. Behavioral / HR Questions (STAR method)
6. Candidate Questions
7. Closing

Rules:
- Do NOT repeat questions or focus too long on one project/skill.
- Cover multiple resume areas: education, projects, skills, experience, achievements.
- Transition naturally through stages (Intro → Closing).
- Keep it conversational and professional.
- Plain text only.

Return ONLY the next interviewer statement or question.
    `;

    const q = await generateWithRetry(prompt, "gemini-1.5-flash");
    setCurrentQuestion(q);
    setLoadingQuestion(false);
    setTimeLeft(60);
    setIsStarting(false);
  };

  // ✅ Submit answer
  const submitAnswer = async () => {
    const newAnswers = [...answers, { question: currentQuestion, answer: transcript }];
    setAnswers(newAnswers);
    setTranscript("");
    await askNextQuestion();
  };

  // ✅ End interview
  const endInterview = async () => {
    setIsInterviewActive(false);
    setInterviewComplete(true);
    await generateFinalFeedback();
  };

  // ✅ Final evaluation
  const generateFinalFeedback = async () => {
    const sessionTranscript = answers
      .map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`)
      .join("\n\n");

    const prompt = `
You are an expert interviewer. Candidate: ${candidateName}.

Resume:
${resumeContent}

Interview Transcript:
${sessionTranscript || "⚠️ No answers provided by the candidate."}

Rules:
- Base scores ONLY on answers provided.
- If no answers given, assign score 0 for all categories except resume_consistency.
- Be strict and realistic.

Return ONLY JSON in this format:

{
  "communication": { "score": 0-5, "strengths": "string", "improvements": "string" },
  "technical": { "score": 0-5, "strengths": "string", "improvements": "string" },
  "problem_solving": { "score": 0-5, "strengths": "string", "improvements": "string" },
  "behavioral": { "score": 0-5, "strengths": "string", "improvements": "string" },
  "resume_consistency": { "score": 0-5, "strengths": "string", "improvements": "string" },
  "conclusion": "string"
}
    `;

    try {
      const fb = await generateWithRetry(prompt, "gemini-2.5-pro");
      let cleaned = fb.trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) cleaned = match[0];
      let parsed = JSON.parse(cleaned);
      setFinalFeedback(parsed);
      setFeedbackError(null);
    } catch (err) {
      setFeedbackError("⚠️ AI service overloaded. Please retry.");
    }
  };

  // 🎤 Mic
  const handleStartListening = () => {
    setIsListening(true);
    setTimeLeft(60);
    recognition.start();
  };
  const handleStopListening = async () => {
    setIsListening(false);
    recognition.stop();
    await submitAnswer();
  };

  // 📂 File upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
      let text = "";
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        text += content.items.map((s) => s.str).join(" ") + "\n";
      }
      setResumeContent(text);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });
        setResumeContent(result.value);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a PDF or DOCX file.");
    }
  };

  // ⏱ Remaining time
  const remainingTime = interviewStartTime
    ? Math.max(0, Math.floor((INTERVIEW_DURATION - (Date.now() - interviewStartTime)) / 60000))
    : 0;

  return (
    <div className="p-8 overflow-auto">
      <h1 className="text-3xl font-bold mb-4">Resume-Based Interview</h1>

      {/* Step 1: Resume Input */}
      {!isInterviewActive && !interviewComplete && (
        <>
          <textarea
            className="w-full h-40 border p-2 mb-4"
            placeholder="Paste your resume here..."
            value={resumeContent}
            onChange={(e) => setResumeContent(e.target.value)}
          />

          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            className="mb-4"
          />

          {resumeValid === false && (
            <p className="text-red-600 mb-3">
              ⚠️ Please enter a valid resume (Education, Experience, Skills required).
            </p>
          )}

          <button
            onClick={async () => {
              if (isStarting) return;
              setIsStarting(true);
              const valid = await validateResume();
              if (valid) {
                setIsInterviewActive(true);
                setInterviewStartTime(Date.now());
                await askNextQuestion();
              } else {
                setIsStarting(false);
              }
            }}
            disabled={!resumeContent.trim() || isStarting || loadingQuestion}
            className="px-6 py-2 bg-blue-600 text-white rounded-full disabled:bg-gray-400"
          >
            {isStarting
              ? "Validating & Generating..."
              : resumeValid === false
              ? "Re-Upload Resume"
              : "Start Interview"}
          </button>
        </>
      )}

      {/* Step 2: Active Interview */}
      {isInterviewActive && !interviewComplete && (
        <div className="mt-6">
          <p className="text-gray-600 mb-2">Time remaining: {remainingTime} min</p>
          {loadingQuestion ? (
            <p className="text-gray-500">Loading next question...</p>
          ) : (
            <p className="text-lg font-semibold">{currentQuestion}</p>
          )}
          <div className="mt-4 flex gap-2 items-center">
            <button
              onClick={islistening ? handleStopListening : handleStartListening}
              disabled={loadingQuestion}
              className={`${islistening ? "bg-black" : "bg-blue-600"} text-white px-5 py-2 rounded-full`}
            >
              {islistening ? "Submit Answer" : "Start Answering"}
            </button>
            <button
              onClick={endInterview}
              className="py-2 px-5 rounded-full bg-red-500 text-white"
            >
              End Interview
            </button>
            {islistening && (
              <span className="ml-4 text-gray-700 font-medium">
                Time left: {timeLeft}s
              </span>
            )}
          </div>
          {islistening && <Waveform />}
          <p className="text-red-600 mt-4">{transcript}</p>
        </div>
      )}

      {/* Step 3: Final Report */}
      {interviewComplete && (
        <div className="mt-6 p-6 border rounded-lg bg-gray-50">
          <h2 className="font-bold text-2xl mb-4">Final Evaluation</h2>
          {feedbackError && <p className="text-red-600">{feedbackError}</p>}
          {finalFeedback ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "communication", label: "Communication Skills" },
                { key: "technical", label: "Technical Competence" },
                { key: "problem_solving", label: "Problem-Solving Ability" },
                { key: "behavioral", label: "Behavioral Traits" },
                { key: "resume_consistency", label: "Consistency with Resume", fullWidth: true },
              ].map((param) => (
                <div
                  key={param.key}
                  className={`p-4 border rounded-lg shadow bg-white ${
                    param.fullWidth ? "col-span-1 md:col-span-2" : ""
                  }`}
                >
                  <h3 className="font-semibold">{param.label}</h3>
                  <StarRating score={finalFeedback[param.key]?.score || 0} />
                  <div className="mt-2 text-sm text-green-600 max-h-24 overflow-y-auto">
                    <strong>Strengths:</strong> {finalFeedback[param.key]?.strengths}
                  </div>
                  <div className="mt-1 text-sm text-red-600 max-h-24 overflow-y-auto">
                    <strong>Improvements:</strong> {finalFeedback[param.key]?.improvements}
                  </div>
                </div>
              ))}
              <div className="col-span-1 md:col-span-2 p-4 border rounded-lg bg-white">
                <h3 className="font-bold mb-2">Conclusion</h3>
                <div className="max-h-40 overflow-y-auto">{finalFeedback.conclusion}</div>
              </div>
            </div>
          ) : (
            !feedbackError && <p className="text-gray-500">Generating final evaluation...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeInterview;
