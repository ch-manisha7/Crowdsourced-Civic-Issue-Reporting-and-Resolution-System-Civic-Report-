import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Trending() {
  const [issues, setIssues] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    const res = await axios.get("http://127.0.0.1:5000/issues");
    // sort issues by upvotes (descending)
    const sorted = res.data.sort((a, b) => b.upvotes - a.upvotes);
    setIssues(sorted);
  };

  const handleUpvote = async (id) => {
    await axios.post(`http://127.0.0.1:5000/upvote/${id}`);
    fetchIssues(); // refresh after upvote
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
          🔥 Trending Issues
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full shadow-md bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
        >
          {darkMode ? "🌞" : "🌙"}
        </button>
      </div>

      {/* Issues List */}
      {issues.length === 0 ? (
        <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          No issues reported yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <motion.div
              key={issue.id}
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl shadow-lg p-4 border ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              {issue.image && (
                <img
                  src={`http://127.0.0.1:5000/${issue.image}`}
                  alt="Issue"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <p
                className={`text-sm mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {issue.description}
              </p>
              <p className="text-xs text-blue-500">📍 {issue.location}</p>
              <p className="text-xs text-gray-500">🏢 {issue.department}</p>

              {/* Status + Upvotes */}
              <div className="flex justify-between items-center mt-3">
                <span
                  className={`text-xs font-bold ${
                    issue.status === "Resolved"
                      ? "text-green-500"
                      : issue.status === "Verified"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {issue.status}
                </span>
                <button
                  onClick={() => handleUpvote(issue.id)}
                  className="px-3 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  👍 {issue.upvotes || 0}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
