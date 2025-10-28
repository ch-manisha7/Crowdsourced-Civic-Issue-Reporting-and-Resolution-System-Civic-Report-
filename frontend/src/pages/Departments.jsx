import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Departments() {
  const [departments, setDepartments] = useState({});
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await axios.get("http://127.0.0.1:5000/departments_with_priority");
    setDepartments(res.data);
  };

  const handleStatusChange = async (id, status) => {
    await axios.post(`http://127.0.0.1:5000/update_status/${id}`, { status });
    fetchDepartments();
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // sort departments by priority (1 = high → 5 = low)
  const sortedDepartments = Object.entries(departments).sort(
    (a, b) => a[1].priority - b[1].priority
  );

  const getPriorityBadge = (priority) => {
    if (priority === 1)
      return <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">High</span>;
    if (priority === 2)
      return <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">Medium</span>;
    if (priority === 3)
      return <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Normal</span>;
    if (priority === 4)
      return <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Low</span>;
    return <span className="bg-gray-400 text-white px-2 py-1 rounded text-xs">Very Low</span>;
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
          🏢 Departments
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full shadow-md bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
        >
          {darkMode ? "🌞" : "🌙"}
        </button>
      </div>

      {/* Department List */}
      {sortedDepartments.length === 0 ? (
        <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          No issues reported yet.
        </p>
      ) : (
        sortedDepartments.map(([dept, info]) => (
          <div key={dept} className="mb-8">
            <h2
              className={`text-xl font-semibold mb-3 flex items-center gap-2 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {dept} {getPriorityBadge(info.priority)}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {info.reports.map((issue) => (
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

                  {/* Status + Actions */}
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
                    <div className="flex gap-2">
                      {issue.status === "Pending Verification" && (
                        <button
                          onClick={() => handleStatusChange(issue.id, "Verified")}
                          className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Verify
                        </button>
                      )}
                      {issue.status !== "Resolved" && (
                        <button
                          onClick={() => handleStatusChange(issue.id, "Resolved")}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
