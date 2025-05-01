import React from 'react';
import { TypingAnimation } from "./typing-animation";

function Homepage({feedbackloadingStatus, feedback, handleStartListening, handleStopListening, islistening, handleReattempt, getQuestion, transcript, questionStatus, Question }) {
  return (
    
    <div className="flex flex-1">
      <div className={`max-w-4xl mx-auto ${feedbackloadingStatus || feedback ? "flex" : "text-center"} w-full`}>

        <div className={`transition-all ${feedbackloadingStatus || feedback ? "w-1/2 h-screen p-5" : "max-w-xl mx-auto"}`}>
          <div className="text-xl text-black font-semibold mt-24">
            <TypingAnimation className="text-xl" duration={50}>
              {questionStatus ? "Loading question..." : Question||""}
            </TypingAnimation>
          </div>
          <p className="mt-10 text-black">Record your answer</p>
          <p className="text-sm text-black mb-5">Try to answer the question accurately</p>

          <div className={`flex gap-2 ${feedbackloadingStatus || feedback ? "" : "justify-center"}`}>
            <button
              onClick={islistening ? handleStopListening : handleStartListening}
              className={`${islistening ? "bg-black" : "bg-blue-600"} ${feedback ? "hidden" : ""} text-white px-5 py-2 rounded-full`}
            >
              {islistening ? "Submit Answer" : "Start Answering"}
            </button>

            {feedback && (
              <button onClick={handleReattempt} className="py-2 px-5 rounded-full bg-white">
                Re-Attempt Question
              </button>
            )}

            {!islistening && (
              <button onClick={getQuestion} className="py-2 px-5 rounded-full bg-white border">
                Next Question
              </button>
            )}
          </div>

          <p className="text-red-600 mt-8">{transcript}</p>
        </div>

        <div className={`transition-all ${feedbackloadingStatus || feedback ? "w-1/2 border-l h-screen p-5" : "w-0"}`}>
          {feedback && (
            <div className="">
              <p>{feedbackloadingStatus && "Let's see how you answered"}</p>
              <div className="flex gap-2">
              <div className="border rounded-lg w-1/2 shadow">
                <div>Correctness</div>
                <h1>{feedback.correctness}</h1>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < Number(feedback.correctness) ? "bg-blue-600" : "bg-neutral-200"}`}></div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg w-1/2">
                <div>Completeness</div>
                <h1>{feedback.completeness}</h1>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < Number(feedback.completeness) ? "bg-blue-600" : "bg-neutral-200"}`}></div>
                  ))}
                </div>
              </div>
                </div>              
              <p className="mt-3 font-bold text-2xl">Feedback </p>
              <p className="border-2 p-1 h-36 overflow-y-scroll">{feedback.feedback}</p>
              <p className="mt-3 font-bold text-2xl">Correct Answer </p>
              <p className="border-2 p-1 h-56 overflow-y-scroll">{feedback.correct_answer}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Homepage;
