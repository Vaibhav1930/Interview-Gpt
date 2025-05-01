import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react';
import { FlickeringGrid } from "./components/magicui/flickering-grid";
import { Link } from "react-router-dom";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TypingAnimation } from "./components/magicui/typing-animation";
import Landingpage from './components/magicui/Landingpage';
import Sidebar from './components/magicui/sidebar';
import { useUser } from "@clerk/clerk-react";
import Homepage from './components/magicui/homepage';
import Display from './components/magicui/display';
import { Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';



const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;

// Instantiate model safely
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function App() {
  const [islistening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedbackloadingStatus, setfeedbackloadingStatus] = useState(false);
  const [feedback, setfeedback] = useState(null);
  const [reAttempt, setReAttempt] = useState(false);
  const [Question, setQuestion] = useState(null);
  const [questionStatus, setQuestionStatus] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("");
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
    navigate("/interview"); // navigate to homepage after setting topic
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

  const getQuestion = async () => {
    setQuestionStatus(true);
    setReAttempt(null);
    setTranscript("");
    try {
      const result = await model.generateContent([
        `Generate a new, random ${selectedTopic} js theoretical simple and easy difference interview question. Ensure the question is unique and different from the previous ones. Return only the question in plain text.`,
      ]);
      const response = await result.response.text();
      setQuestion(response);
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setQuestionStatus(false);
    }
  };

  const getFeedback = async () => {
    if (!transcript.trim()) return;
    setfeedbackloadingStatus(true);
  
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `You are an interview coach. The answers you'll review are from speech-to-text transcription. Ignore minor speech recognition errors, filler words, or slight grammatical issues that are common in spoken responses. You must respond ONLY with a JSON object containing four fields: correctness (0-5), completeness (0-5), feedback (string), correct_answer (string).
  
  Question: ${Question}
  Answer: ${transcript}
  
  Respond only with the JSON object. Do NOT include code blocks like \`\`\`json.`
            }]
          }]
        }),
      });
  
      if (response.status === 429) {
        console.warn('Rate limit hit, try slowing down.');
      }
  
      const data = await response.json();
      const modelResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
  
      let cleanedResponse = modelResponse.trim();
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      }
  
      let feedbackObject;
      try {
        feedbackObject = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Error parsing model response:', cleanedResponse);
        feedbackObject = {
          correctness: 0,
          completeness: 0,
          feedback: "Could not parse feedback correctly. Please try again.",
          correct_answer: "Ideal answer not available."
        };
      }
  
      setfeedback(feedbackObject);
      console.log(feedbackObject)
      console.log(feedback)
      // Save feedback to backend
      try {
        await fetch("http://localhost:5000/api/feedbacks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.username,
            question: Question,
            answer: transcript,
            feedback: feedbackObject.feedback,
            correctness: feedbackObject.correctness,
            completeness: feedbackObject.completeness,
            correct_answer:feedbackObject.correct_answer
          }),
        });
      } catch (err) {
        console.error("Failed to save feedback to backend:", err);
      }
  
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setfeedback({
        correctness: 0,
        completeness: 0,
        feedback: "Error fetching feedback.",
        correct_answer: "Ideal answer not available."
      });
    } finally {
      setfeedbackloadingStatus(false);
    }
  };
  

  const handleReattempt = () => {
    setfeedback(null);
    handleStartListening();
  };

  // Attach recognition events once
  useEffect(() => {
    recognition.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        finalTranscript += e.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onend = async () => {
      if (islistening) {
        setIsListening(false);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedTopic && window.location.pathname === "/interview") {
      getQuestion();
    }
  }, [selectedTopic]);
  useEffect(()=>{
    if (location.pathname==="/"){
      setSelectedTopic("");
    }
  },[location.pathname]);
  
  return (
    <>
      <header>
        <SignedOut />
        <SignedIn />
      </header>

      <SignedIn>
        <div className="flex h-screen w-screen overflow-hidden bg-white">
          <Sidebar />

          <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="mt-2 h-12 flex items-center justify-between bg-neutral-300/70 pl-16 pr-10 rounded-full">
              <Link to="/">
                <h1 className="text-4xl text-black">Interview GPT</h1>
              </Link>
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
                    <option key={index} value={topic}>
                      {topic}
                    </option>
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
