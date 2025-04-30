import React from 'react';
import Logo from "./logo.webp";

function display() {
  return (
    <div className="flex flex-col h-[90vw]">
      <div className="flex flex-col items-center flex-grow mt-10">
        <img
          src={Logo}
          className="w-52 sm:w-72 md:w-80 lg:w-96 rounded-full"
          alt="Logo"
        />
        <h1 className="text-center text-4xl">Train with AI. Win the Job.</h1>
        <h2 className="text-center text-xl mt-2">
          Select a Topic to Sharpen Your Skills.
        </h2>
      </div>
      <div className="text-center text-gray-500">
        Your personal AI powered Technical Interview Assistant
      </div>
    </div>
  );
}

export default display;
