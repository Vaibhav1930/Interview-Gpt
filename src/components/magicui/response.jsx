import React from 'react'

function response({feedbackloadingStatus, feedback}) {
  return (
    <div className={`transition-all ${feedbackloadingStatus || feedback ? "w-1/2 border-l h-screen p-5" : "w-0"}`}>
          {feedback && (
            <div className="mt-24">
              <p>{feedbackloadingStatus && "Let's see how you answered"}</p>

              <div className="border p-3 rounded-lg">
                <div>Correctness</div>
                <h1>{feedback.correctness}</h1>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < Number(feedback.correctness) ? "bg-blue-600" : "bg-neutral-200"}`}></div>
                  ))}
                </div>
              </div>

              <div className="border py-3 p-3 rounded-lg mt-4">
                <div>Completeness</div>
                <h1>{feedback.completeness}</h1>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < Number(feedback.completeness) ? "bg-blue-600" : "bg-neutral-200"}`}></div>
                  ))}
                </div>
              </div>

              <p className="mt-5">{feedback.feedback}</p>
            </div>
          )}
        </div>
  )
}

export default response
