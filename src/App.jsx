import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { FlickeringGrid } from "./components/magicui/flickering-grid";
import {Link} from "react-router-dom"
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TypingAnimation } from "./components/magicui/typing-animation";
import Landingpage from './components/magicui/Landingpage';
const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)
recognition.continuous = true;
recognition.interimResults = true;
const genAI=new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
function App() {
  const [islistening, setIsListening]=useState(false)
  const [transcript,setTranscript]=useState('')
  const [feedbackloadingStatus,setfeedbackloadingStatus]=useState(false)
  const [feedback,setfeedback]=useState(null)
  const [reAttempt,setReAttempt]=useState(false)
  const [Question,setQuestion]=useState(null);
  const [questionStatus,setQuestionStatus]=useState(true)
  
  const handelstartlistening=()=>{
    setIsListening(true)
    recognition.start()
  }
  const handelstoplistening=async()=>{
    setIsListening(false)
    recognition.stop()
    await getFeedback();
  }

  const getQuestion = async () => {
    setQuestionStatus(true);
    setReAttempt(null);
    setTranscript("");
    try {
      const result = await model.generateContent([
        "Generate a new, random React js theoretical simple and easy difference interview question. Ensure the question is unique and different from the previous ones. Return only the question in plain text.",
      ]);
      const response = await result.response.text();
      setQuestion(response); // Ensure a new question is set
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setQuestionStatus(false);
    }
  };
  
  const getFeedback = async () => {
    setfeedbackloadingStatus(true);
  
    try {
      const prompt = `
        Question: ${Question}
        Answer: ${transcript}
        Evaluate the response and provide feedback in **valid JSON format only**.
        The JSON must be structured as follows:
        {"correctness": number, "completeness": number, "feedback": string}
        - correctness and completeness must be numbers between 0 and 5.
        - also provide the correct answer 
        - The response **must not contain any extra text**—only valid JSON.
      `;
  
      const result = await model.generateContent([prompt]);
      const response = await result.response.text().trim(); // Ensure clean text
  
      let feedbackObject;
      try {
        const jsonResponse = response.match(/\{.*?\}/s);
        feedbackObject = jsonResponse ? JSON.parse(jsonResponse[0]) : null;
      } catch (error) {
        console.error("Error parsing JSON feedback:", error);
        feedbackObject = { correctness: 0, completeness: 0, feedback: "Error parsing AI response." };
      }
  
      setfeedback(feedbackObject);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setfeedback({ correctness: 0, completeness: 0, feedback: "Error fetching feedback." });
    } finally {
      setfeedbackloadingStatus(false)
    }
  };
  
  

  useEffect(()=>{
    getQuestion();
    recognition.onresult=(e)=>{
      const current = e.resultIndex;
      const transcript =e.results[current][0].transcript;
      setTranscript(transcript)
    
    recognition.onend=async()=>{
      setIsListening(false);
      await getFeedback();
      }
    }
  },[])
  const handleReattempt=()=>{
    setfeedback(null)
    handelstartlistening();
  }
  return (
    <>
    <header>
      <SignedOut>
      </SignedOut>
      <SignedIn>
      </SignedIn>
    </header>

    <SignedIn>
    <div className="relative h-screen w-screen overflow-hidden rounded-lg border bg-white ">
      <div className='absolute w-screen h-screen'>
      <div className="flex justify-between place-items-center h-16 w-full">
      <div className="px-10 w-full">
      <div className=" w-full flex justify-between bg-neutral-300/70 rounded-full pl-4 pr-3">
      <Link to="/" ><h1 className='text-4xl  '>Interview GPT</h1></Link>
      <UserButton className=""/>
      </div>
      </div>
      </div>
      <div className="flex w-full h-full">
      <div className="w-full h-screen overflow-hidden">
      <div className={`max-w-4xl mx-auto ${feedbackloadingStatus|| feedback ?"flex":"text-center"}`}>
        <div className={`transition-all ${feedbackloadingStatus|| feedback ?'w-1/2  h-screen p-5':'max-w-xl mx-auto'}`}>
          <div className="text-xl text-black font-semibold mt-24"><TypingAnimation className="text-xl" duration={50}>{questionStatus?"loading question..":Question}</TypingAnimation></div>
          <p className='mt-10 text-black'>Record your answer</p>
          <p className='text-sm text-black mb-5'>Try to answer question in acurate manner</p>
          <div className={`flex gap-2 ${feedbackloadingStatus|| feedback ?"":"justify-center"}`}>
          <button onClick={islistening? handelstoplistening:handelstartlistening} className={`${islistening?'bg-black':'bg-blue-600'} ${feedback?"hidden":""} text-white px-5 py-2 rounded-full`}>{islistening?'Submit Answere':'Star Answering'}</button>
          <button onClick={handleReattempt} className={`py-2 px-5 rounded-full ${feedback?'bg-white':'hidden'}`}>{feedback?"Re Attempt question":""}</button>
          <button onClick={getQuestion} className={`py-2 px-5 rounded-full ${islistening?"hidden":"bg-white  border"}`}>{islistening?"":"Next question"}</button>
          </div>
          <p className='text-red-600 mt-8'>{transcript}</p>
        </div>
        <div className={` transition-all ${feedbackloadingStatus|| feedback ?'w-1/2 border-l h-screen p-5':'w-0'}`}>
        {feedback && (
          <div className="mt-24">
            <p>{feedbackloadingStatus?'lets see how you asnwered':""}</p>
            <div className=" border p-3 rounded-lg">
              <div>correctness</div>
              <h1>{feedback.correctness}</h1>
              <div className="flex gap-1 mt-2">
              {[...Array(5)].map((_,i)=>{
                return <div key={i} className={`h-1 flex-1 rounded-full ${i<Number(feedback.correctness)? 'bg-blue-600':'bg-neutral-200'}`}></div>
              })}
              </div>
              </div>
              <div className=" border py-3 p-3 rounded-lg">
              <div>completeness</div>
              <h1>{feedback.completeness}</h1>
              <div className="flex gap-1 mt-2">
              {[...Array(5)].map((_,i)=>{
                return <div key={i} className={`h-1 flex-1 rounded-full ${i<Number(feedback.correctness)? 'bg-blue-600':'bg-neutral-200'}`}></div>
              })}
              </div>
              </div>
            <p>{feedback.feedback}</p>
          </div>
        )}
        </div>
      </div>
    </div>
    </div>
    </div>
    </div>
      </SignedIn>
    <SignedOut>
      <Landingpage></Landingpage>
    </SignedOut>
    
    </>
  )
}

export default App
