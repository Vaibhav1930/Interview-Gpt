import React, { useState } from "react";
import { TypingAnimation } from "./typing-animation";

function Homepage({
  selectedFeedback,
  feedbackloadingStatus,
  feedback,
  handleStartListening,
  handleStopListening,
  islistening,
  handleReattempt,
  getQuestion,
  transcript,
  questionStatus,
  Question,
  close,
  setClose,
  topic
}) {
  
  return (
    <>
    {!topic && (<div className="">
      <h1 className="text-5xl text-center p-4">👋 Welcome!</h1>
      <h1 className="text-4xl text-center p-3">Get ready to boost your skills.Please select a topic to start generating your interview questions!</h1>
      {selectedFeedback && !close && (
            <div className="p-5 bg-gray-100 text-left">
              <div className=" flex items-center justify-between">
              <h2 className="text-xl font-bold">Selected Feedback</h2>
              <span onClick={() => setClose(true)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.63603 5.63604C6.02656 5.24552 6.65972 5.24552 7.05025 5.63604L12 10.5858L16.9497 5.63604C17.3403 5.24552 17.9734 5.24552 18.364 5.63604C18.7545 6.02657 18.7545 6.65973 18.364 7.05025L13.4142 12L18.364 16.9497C18.7545 17.3403 18.7545 17.9734 18.364 18.364C17.9734 18.7545 17.3403 18.7545 16.9497 18.364L12 13.4142L7.05025 18.364C6.65972 18.7545 6.02656 18.7545 5.63603 18.364C5.24551 17.9734 5.24551 17.3403 5.63603 16.9497L10.5858 12L5.63603 7.05025C5.24551 6.65973 5.24551 6.02657 5.63603 5.63604Z" fill="currentColor"></path></svg></span>
              </div>
              <p className="mt-2"> 
                <strong>Question :  </strong> {selectedFeedback.question}
              </p>
              <p className="mt-2">
                <strong>Answer:  </strong> {selectedFeedback.answer}
              </p>
              <p className="mt-2">
                <strong>Feedback :  </strong> {selectedFeedback.feedback}
              </p>
            </div>
          )}
      </div>)}
      {topic && (<div className="flex flex-1">
      <div
        className={`max-w-4xl mx-auto ${
          feedbackloadingStatus || feedback ? "flex" : "text-center"
        } w-full`}
      >
        <div
          className={`transition-all ${
            feedbackloadingStatus || feedback
              ? "w-1/2 h-screen p-5"
              : "max-w-xl mx-auto"
          }`}
        >
          <div className="text-xl text-black font-semibold mt-24">
            <TypingAnimation className="text-xl" duration={50}>
              {questionStatus ? "Loading question..." : Question || ""}
            </TypingAnimation>
          </div>
          <p className="mt-10 text-black">Record your answer</p>
          <p className="text-sm text-black mb-5">
            Try to answer the question accurately
          </p>

          <div
            className={`flex gap-2 ${
              feedbackloadingStatus || feedback ? "" : "justify-center"
            }`}
          >
            <button
              onClick={islistening ? handleStopListening : handleStartListening}
              className={`${islistening ? "bg-black" : "bg-blue-600"} ${
                feedback ? "hidden" : ""
              } text-white px-5 py-2 rounded-full`}
            >
              {islistening ? "Submit Answer" : "Start Answering"}
            </button>

            {feedback && (
              <button
                onClick={handleReattempt}
                className="py-2 px-5 rounded-full bg-white"
              >
                Re-Attempt Question
              </button>
            )}

            {!islistening && (
              <button
                onClick={getQuestion}
                className="py-2 px-5 rounded-full bg-white border"
              >
                Next Question
              </button>
            )}
          </div>

          <p className="text-red-600 mt-8">{transcript}</p>
        </div>

        <div
          className={`transition-all ${
            feedbackloadingStatus || feedback
              ? "w-1/2 border-l h-screen p-5"
              : "w-0"
          }`}
        >
          {feedback && (
            <div className="">
              <p>{feedbackloadingStatus && "Let's see how you answered"}</p>
              <div className="flex gap-2">
                <div className="border rounded-lg w-1/2 shadow">
                  <div>Correctness</div>
                  <h1>{feedback.correctness}</h1>
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < Number(feedback.correctness)
                            ? "bg-blue-600"
                            : "bg-neutral-200"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg w-1/2">
                  <div>Completeness</div>
                  <h1>{feedback.completeness}</h1>
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < Number(feedback.completeness)
                            ? "bg-blue-600"
                            : "bg-neutral-200"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 font-bold text-2xl">Feedback </p>
              <p className="border-2 p-1 h-36 overflow-y-scroll">
                {feedback.feedback}
              </p>
              <p className="mt-3 font-bold text-2xl">Correct Answer </p>
              <p className="border-2 p-1 h-56 overflow-y-scroll">
                {feedback.correct_answer}
              </p>
            </div>
          )}
          
        </div>
        {selectedFeedback && !close && (
            <div className="p-4 w-[65vw] bg-gray-100 text-left">
              <div className=" flex items-center justify-between">
              <h2 className="text-xl font-bold">Selected Feedback</h2>
              <span onClick={() => setClose(true)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.63603 5.63604C6.02656 5.24552 6.65972 5.24552 7.05025 5.63604L12 10.5858L16.9497 5.63604C17.3403 5.24552 17.9734 5.24552 18.364 5.63604C18.7545 6.02657 18.7545 6.65973 18.364 7.05025L13.4142 12L18.364 16.9497C18.7545 17.3403 18.7545 17.9734 18.364 18.364C17.9734 18.7545 17.3403 18.7545 16.9497 18.364L12 13.4142L7.05025 18.364C6.65972 18.7545 6.02656 18.7545 5.63603 18.364C5.24551 17.9734 5.24551 17.3403 5.63603 16.9497L10.5858 12L5.63603 7.05025C5.24551 6.65973 5.24551 6.02657 5.63603 5.63604Z" fill="currentColor"></path></svg></span>
              </div>
              <p className="mt-2"> 
                <strong>Question :  </strong> {selectedFeedback.question}
              </p>
              <p className="mt-2">
                <strong>Answer:  </strong> {selectedFeedback.answer}
              </p>
              <p className="mt-2">
                <strong>Feedback :  </strong> {selectedFeedback.feedback}
              </p>
            </div>
          )}
      </div>
    </div>)}
    </>
    
  );
}

export default Homepage;
