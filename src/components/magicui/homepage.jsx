import React from "react";
import { TypingAnimation } from "./typing-animation";

// 🎤 Simple waveform animation
const Waveform = ({ isListening }) => {
  const bars = Array.from({ length: 10 });
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
      {!topic && (
        <div>
          <h1 className="text-5xl text-center p-4">👋 Welcome!</h1>
          <h1 className="text-4xl text-center p-3">
            Get ready to boost your skills. Please select a topic to start generating your interview questions!
          </h1>
          {selectedFeedback && !close && (
            <div className="p-5 bg-gray-100 text-left">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Selected Feedback</h2>
                <span onClick={() => setClose(true)}>❌</span>
              </div>
              <p className="mt-2"><strong>Question:</strong> {selectedFeedback.question}</p>
              <p className="mt-2"><strong>Answer:</strong> {selectedFeedback.answer}</p>
              <p className="mt-2"><strong>Feedback:</strong> {selectedFeedback.feedback}</p>
            </div>
          )}
        </div>
      )}

      {topic && (
        <div className="flex flex-1">
          <div
            className={`max-w-4xl mx-auto ${
              feedbackloadingStatus || feedback ? "flex" : "text-center"
            } w-full`}
          >
            {/* Question + Controls */}
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

              {islistening && <Waveform isListening={islistening} />}

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

            {/* Feedback Panel */}
            <div
              className={`transition-all ${
                feedbackloadingStatus || feedback
                  ? "w-1/2 border-l h-screen p-5"
                  : "w-0"
              }`}
            >
              {feedbackloadingStatus && (
                <p className="text-gray-500">Analyzing your answer...</p>
              )}

              {!feedbackloadingStatus && feedback && (
                <div>
                  <div className="flex gap-2">
                    {/* Correctness */}
                    <div className="border rounded-lg w-1/2 shadow p-2">
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

                    {/* Completeness */}
                    <div className="border rounded-lg w-1/2 shadow p-2">
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

                  {/* Feedback Text */}
                  <p className="mt-3 font-bold text-2xl">Feedback</p>
                  <p className="border-2 p-1 h-36 overflow-y-scroll">
                    {feedback.feedback}
                  </p>

                  {/* Correct Answer */}
                  <p className="mt-3 font-bold text-2xl">Correct Answer</p>
                  <p className="border-2 p-1 h-56 overflow-y-scroll">
                    {feedback.correct_answer}
                  </p>
                </div>
              )}
            </div>

            {selectedFeedback && !close && (
              <div className="p-4 w-[65vw] bg-gray-100 text-left">
                <h2 className="text-xl font-bold">Selected Feedback</h2>
                <p className="mt-2"><strong>Question:</strong> {selectedFeedback.question}</p>
                <p className="mt-2"><strong>Answer:</strong> {selectedFeedback.answer}</p>
                <p className="mt-2"><strong>Feedback:</strong> {selectedFeedback.feedback}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Homepage;
