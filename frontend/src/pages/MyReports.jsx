import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Sun, Moon, Clock, CheckCircle } from "lucide-react";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Fetch reports from backend
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/issues").then((res) => setReports(res.data));
  }, []);

  // Handle Dark Mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900" : "bg-gray-100"} transition-all`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
          📋 My Reports
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full shadow-md bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
        >
          {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-800" />}
        </button>
      </div>

      {/* Reports List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.length === 0 ? (
          <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            No reports submitted yet.
          </p>
        ) : (
          reports.map((report) => (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl shadow-lg p-4 border ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              {/* Image */}
              {report.image && (
                <img
                  src={`http://127.0.0.1:5000/${report.image}`}
                  alt="Issue"
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
              )}

              {/* Description */}
              <p className={`text-sm mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {report.description}
              </p>

              {/* Location */}
              <p className={`text-xs mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                📍 {report.location}
              </p>

              {/* Category & Department */}
              <p className="text-xs font-semibold">
                🏷 Category: <span className="text-blue-500">{report.category}</span>
              </p>
              <p className="text-xs font-semibold mb-3">
                🏢 Department: <span className="text-green-500">{report.department}</span>
              </p>

              {/* Status */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  report.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {report.status}
              </span>

              {/* Timestamp */}
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Clock size={14} />
                {report.created_at}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
