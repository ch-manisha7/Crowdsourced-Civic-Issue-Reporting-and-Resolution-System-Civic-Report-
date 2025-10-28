import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ReportIssue from "./pages/ReportIssue";
import MyReports from "./pages/MyReports";
import AdminDashboard from "./pages/AdminDashboard";
import Result from "./pages/Result";
import Navbar from "./components/Navbar";
import Departments from "./pages/Departments";
import Trending from "./pages/Trending";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/result" element={<Result />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/trending" element={<Trending />} /> 
      </Routes>
    </div>
  );
}
