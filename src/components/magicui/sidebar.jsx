// components/Sidebar.jsx
import { Trash2 } from "lucide-react";
import { Button } from "./button";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import Messagebox from "./messagebox";

export default function Sidebar({ onSelectFeedback, setClose }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const { isSignedIn, user } = useUser();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  useEffect(() => {
    if (selectedFeedback && onSelectFeedback) {
      onSelectFeedback(selectedFeedback);
    }
  }, [selectedFeedback, onSelectFeedback]);

  // Log selected feedback when it changes
  useEffect(() => {
    if (selectedFeedback) {
      console.log("Selected Feedback:", selectedFeedback);
    }
  }, [selectedFeedback]);

  // Fetch feedbacks on component mount and when user changes
  useEffect(() => {
    if (!user) return;
    fetch(`${BACKEND_URL}/api/feedbacks`)
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(data);
      })
      .catch((err) => {
        console.error("Error fetching feedback:", err);
      });
  }, [user]);

  // Clear feedbacks from DB
  const handleClearChats = async () => {
    const confirmed = window.confirm("Are you sure you want to clear all chats?");
    if (!confirmed || !user) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/feedbacks/${user.username}`);
      setFeedbacks([]);
      console.log("Feedbacks cleared");
    } catch (error) {
      console.error("Error clearing feedbacks:", error);
    }
  };

  return (
    <div className="relative h-screen">
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-3 left-4 z-50 p-2 bg-gray-800 text-white rounded"
        >
          {/* Hamburger Icon */}
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {isSidebarOpen && (
        <div className="w-64 bg-gray-900 text-white h-full p-4 flex flex-col transition-all duration-300 ease-in-out">
          {/* Close Button */}
          <div className="flex items-center justify-between mb-4 mt-2">
            <svg
              className="hover:cursor-pointer"
              onClick={() => setIsSidebarOpen(false)}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.2426 7.75736C16.6332 7.36683 16.6332 6.73367 16.2426 6.34315C15.8521 5.95262 15.219 5.95262 14.8284 6.34315L12 9.17157L9.17157 6.34315C8.78105 5.95262 8.14788 5.95262 7.75736 6.34315C7.36683 6.73367 7.36683 7.36683 7.75736 7.75736L10.5858 10.5858L7.75736 13.4142C7.36683 13.8047 7.36683 14.4379 7.75736 14.8284C8.14788 15.219 8.78105 15.219 9.17157 14.8284L12 12L14.8284 14.8284C15.219 15.219 15.8521 15.219 16.2426 14.8284C16.6332 14.4379 16.6332 13.8047 16.2426 13.4142L13.4142 10.5858L16.2426 7.75736Z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Feedback Messages */}
          {isSignedIn && (
            <div className="mt-6 flex-1 overflow-y-auto space-y-2">
              {feedbacks
                .filter((fb) => fb.name === user.username)
                .map((fb) => (
                  <Messagebox
                    key={fb._id}
                    question={fb.question}
                    onClick={() =>{setSelectedFeedback(fb) 
                      setClose(false)
                    }}
                  />
                ))}
            </div>
          )}

          {/* Clear Chats Button */}
          <Button
            variant="ghost"
            className="w-full rounded-full justify-start text-red-400 hover:bg-gray-800 mt-4"
            onClick={handleClearChats}
          >
            <Trash2 className="mr-2 w-4 h-4" />
            Clear Chats
          </Button>
        </div>
      )}
    </div>
  );
}
