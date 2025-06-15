import React from 'react'

function messagebox({question,onClick}) {
  return (
    <div onClick={onClick}> 
      <div className=" rounded-full p-1 px-2 text-m bg-gray-900 truncate  hover:bg-gray-800">{question}</div>
          </div>
  ) 
}

export default messagebox
