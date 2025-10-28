import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [departments, setDepartments] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

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

  // ----------------------
  // Collect all issues
  // ----------------------
  const allIssues = Object.entries(departments).flatMap(([dept, info]) =>
    info.reports.map((r) => ({ ...r, department: dept, priority: info.priority }))
  );

  // ----------------------
  // Stats
  // ----------------------
  const total = allIssues.length;
  const pending = allIssues.filter((i) => i.status === "Pending Verification").length;
  const verified = allIssues.filter((i) => i.status === "Verified").length;
  const resolved = allIssues.filter((i) => i.status === "Resolved").length;

  // ----------------------
  // Filters
  // ----------------------
  const filteredIssues = allIssues.filter((i) => {
    return (
      (statusFilter === "All" || i.status === statusFilter) &&
      (departmentFilter === "All" || i.department === departmentFilter) &&
      (search === "" ||
        i.description.toLowerCase().includes(search.toLowerCase()) ||
        i.location.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // ----------------------
  // Chart Data
  // ----------------------
  const deptCounts = {};
  allIssues.forEach((i) => {
    deptCounts[i.department] = (deptCounts[i.department] || 0) + 1;
  });
  const deptData = Object.entries(deptCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = [
    { name: "Pending", value: pending },
    { name: "Verified", value: verified },
    { name: "Resolved", value: resolved },
  ];

  const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"];

  // ----------------------
  // Priority Sorting
  // ----------------------
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
          📊 Admin Dashboard
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full shadow-md bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
        >
          {darkMode ? "🌞" : "🌙"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 text-center">
          <h2 className="text-lg font-bold text-gray-500 dark:text-gray-300">Total</h2>
          <p className="text-2xl font-bold text-blue-500">{total}</p>
        </div>
        <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 text-center">
          <h2 className="text-lg font-bold text-gray-500 dark:text-gray-300">Pending</h2>
          <p className="text-2xl font-bold text-yellow-500">{pending}</p>
        </div>
        <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 text-center">
          <h2 className="text-lg font-bold text-gray-500 dark:text-gray-300">Verified</h2>
          <p className="text-2xl font-bold text-indigo-500">{verified}</p>
        </div>
        <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 text-center">
          <h2 className="text-lg font-bold text-gray-500 dark:text-gray-300">Resolved</h2>
          <p className="text-2xl font-bold text-green-500">{resolved}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Issues by Department
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={deptData} dataKey="value" nameKey="name" outerRadius={100} label>
                {deptData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Issues by Status
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by description/location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option>All</option>
          <option>Pending Verification</option>
          <option>Verified</option>
          <option>Resolved</option>
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option>All</option>
          {[...new Set(allIssues.map((i) => i.department))].map((dept, idx) => (
            <option key={idx}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Issues grouped by department (priority order) */}
      {sortedDepartments.map(([dept, info]) => (
        <div
          key={dept}
          className={`mb-6 p-4 rounded-xl shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            {dept} {getPriorityBadge(info.priority)}
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {info.reports
              .filter(
                (i) =>
                  (statusFilter === "All" || i.status === statusFilter) &&
                  (departmentFilter === "All" || dept === departmentFilter) &&
                  (search === "" ||
                    i.description.toLowerCase().includes(search.toLowerCase()) ||
                    i.location.toLowerCase().includes(search.toLowerCase()))
              )
              .map((issue) => (
                <motion.div
                  key={issue.id}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-xl shadow-md p-4 border ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
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
                  <p className="text-xs text-gray-500">🏢 {dept}</p>

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
      ))}
    </div>
  );
}
