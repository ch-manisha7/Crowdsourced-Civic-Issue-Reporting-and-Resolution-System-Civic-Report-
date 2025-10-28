import React from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
  return (
    <nav className="bg-white shadow p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">CivicReporter</Link>
        <div className="space-x-4">
          <Link to="/Report" className="text-sm text-blue-600">Report</Link>
          <Link to="/my-reports" className="text-sm text-gray-700">My Reports</Link>
          <Link to="/admin" className="text-sm text-gray-700">Admin</Link>
          <Link to="/departments" className="text-sm text-gray-700">Departments</Link>
          <Link to="/trending"className="text-sm text-gray-700" > Trending</Link>
        </div>
      </div>
    </nav>
  );
}
