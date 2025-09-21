// components/Waveform.jsx
import React, { useEffect, useRef } from "react";

const Waveform = ({ isListening }) => {
  const barsRef = useRef([]);

  useEffect(() => {
    if (!isListening) return;

    const animate = () => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          const height = Math.random() * 30 + 10; // random height for bar
          bar.style.height = `${height}px`;
        }
      });
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isListening]);

  return (
    <div className="flex items-end justify-center gap-1 h-10">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (barsRef.current[i] = el)}
          className="w-1 bg-blue-500 rounded"
          style={{ height: "10px", transition: "height 0.2s ease" }}
        />
      ))}
    </div>
  );
};

export default Waveform;
