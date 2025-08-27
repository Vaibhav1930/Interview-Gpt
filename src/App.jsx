import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react';
import { FlickeringGrid } from "./components/magicui/flickering-grid";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TypingAnimation } from "./components/magicui/typing-animation";
import Landingpage from './components/magicui/Landingpage';
import Sidebar from './components/magicui/sidebar';
import { useUser } from "@clerk/clerk-react";
import Homepage from './components/magicui/homepage';
import Display from './components/magicui/display';
import { Helmet } from "react-helmet";

// ✅ Preload logo
<Helmet>
  <link rel="preload" as="image" href="/assets/logo.webp" type="image/webp" />
</Helmet>

// 🎤 Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;

// 🤖 Gemini setup
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

async function generateWithRetry(prompt, retries = 3) {
  const proModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  for (let i = 0; i < retries; i++) {
    try {
      const result = await proModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (err.status === 503 && i < retries - 1) {
        console.warn(`503 from Gemini Pro. Retrying in ${2 ** i}s...`);
        await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
      } else if (err.status === 503) {
        console.warn("⚠️ Gemini Pro overloaded. Falling back to Flash...");
        const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const fallback = await flashModel.generateContent(prompt);
        return fallback.response.text();
      } else {
        throw err;
      }
    }
  }
}

function App() {
  const [islistening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedbackloadingStatus, setfeedbackloadingStatus] = useState(false);
  const [feedback, setfeedback] = useState(null);
  const [reAttempt, setReAttempt] = useState(false);
  const [Question, setQuestion] = useState(null);
  const [questionStatus, setQuestionStatus] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [close,setClose]=useState(false);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const topics = [
    "Python", "JavaScript", "Java", "C++", "C#", "Go", "Ruby",
    "React.js", "Node.js", "Next.js", "SQL", "MongoDB",
    "Data Structures", "Algorithms", "System Design",
    "Operating Systems", "Database Management",
    "Cloud Computing", "Machine Learning", "Behavioral Questions"
  ];

  const handleChange = (e) => {
    const topic = e.target.value;
    setSelectedTopic(topic);
    navigate("/interview");
  };

  const handleStartListening = () => {
    setIsListening(true);
    recognition.start();
  };

  const handleStopListening = async () => {
    setIsListening(false);
    recognition.stop();
    await getFeedback();
  };

  // ✅ Question Generation with retry + fallback
  const getQuestion = async () => {
    setQuestionStatus(true);
    setReAttempt(null);
    setTranscript("");
    try {
      const response = await generateWithRetry([
        `Generate a new, random ${selectedTopic} theoretical interview question. Ensure it's simple, unique, and plain text only.`
      ]);
      setQuestion(response);
    } catch (error) {
      console.error("Error fetching question:", error);
      setQuestion("⚠️ Gemini is overloaded. Please retry later.");
    } finally {
      setQuestionStatus(false);
    }
  };

  // ✅ Feedback Generation with retry + fallback
  const getFeedback = async () => {
    if (!transcript.trim()) return;
    setfeedbackloadingStatus(true);

    try {
      const responseText = await generateWithRetry([{
        role: "user",
        parts: [{
          text: `You are an interview coach. The answers you'll review are from speech-to-text transcription. Ignore minor speech recognition errors, filler words, or slight grammatical issues.
          
Return ONLY a JSON object with four fields: correctness (0-5), completeness (0-5), feedback (string), correct_answer (string).

Question: ${Question}
Answer: ${transcript}`
        }]
      }]);

      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      }

      let feedbackObject;
      try {
        feedbackObject = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("Error parsing model response:", cleanedResponse);
        feedbackObject = {
          correctness: 0,
          completeness: 0,
          feedback: "⚠️ Could not parse feedback. Please retry.",
          correct_answer: "N/A"
        };
      }

      setfeedback(feedbackObject);

      // Save feedback to backend
      await fetch("https://interview-gpt.onrender.com/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.username,
          question: Question,
          answer: transcript,
          feedback: feedbackObject.feedback,
          correctness: feedbackObject.correctness,
          completeness: feedbackObject.completeness,
          correct_answer: feedbackObject.correct_answer
        }),
      });

    } catch (error) {
      console.error("Error fetching feedback:", error);
      setfeedback({
        correctness: 0,
        completeness: 0,
        feedback: "⚠️ Error fetching feedback.",
        correct_answer: "N/A"
      });
    } finally {
      setfeedbackloadingStatus(false);
    }
  };

  const handleReattempt = () => {
    setfeedback(null);
    handleStartListening();
  };

  // Speech recognition listeners
  useEffect(() => {
    recognition.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        finalTranscript += e.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };
    recognition.onend = () => {
      if (islistening) setIsListening(false);
    };
  }, []);

  // Auto-generate question when topic selected
  useEffect(() => {
    if (selectedTopic && window.location.pathname === "/interview") {
      getQuestion();
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (location.pathname === "/") {
      setSelectedTopic("");
    }
  }, [location.pathname]);

  return (
    <>
      <header>
        <SignedOut />
        <SignedIn />
      </header>

      <SignedIn>
        <div className="flex h-screen w-screen overflow-hidden bg-white">
          <Sidebar onSelectFeedback={setSelectedFeedback} setClose={setClose} />

          <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="mt-2 h-12 flex items-center justify-between bg-neutral-300/70 pl-16 pr-10 rounded-full">
              <Link to="/"><h1 className="text-4xl text-black">Interview GPT</h1></Link>
              <div className="flex gap-2 items-center">
                <label htmlFor="topic-select" className="sr-only">Select a topic</label>
                <select
                  id="topic-select"
                  value={selectedTopic}
                  onChange={handleChange}
                  className="rounded-full w-28 text-center text-sm"
                >
                  <option className='text-sm' value="" disabled>Select a topic</option>
                  {topics.map((topic, index) => (
                    <option key={index} value={topic}>{topic}</option>
                  ))}
                </select>
                <UserButton />
              </div>
            </div>

            <Routes>
              <Route path="/" element={<Display />} />
              <Route path="/interview" element={
                <Homepage
                  feedbackloadingStatus={feedbackloadingStatus}
                  feedback={feedback}
                  handleStartListening={handleStartListening}
                  handleStopListening={handleStopListening}
                  islistening={islistening}
                  handleReattempt={handleReattempt}
                  getQuestion={getQuestion}
                  transcript={transcript}
                  questionStatus={questionStatus}
                  Question={Question}
                  selectedFeedback={selectedFeedback}
                  close={close}
                  setClose={setClose}
                  topic={selectedTopic}
                />
              } />
            </Routes>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <Landingpage />
      </SignedOut>
    </>
  );
}

export default App;
