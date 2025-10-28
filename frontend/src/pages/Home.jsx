import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to CivicReporter</h1>
      <p className="mb-6 text-gray-700">Report civic issues by uploading image, audio or text. Admins will verify and forward to departments.</p>
      <div className="flex gap-4">
        <Link to="/report" className="bg-blue-600 text-white px-4 py-2 rounded">Report Issue</Link>
        <Link to="/my-reports" className="bg-gray-200 px-4 py-2 rounded">My Reports</Link>
        <Link to="/admin" className="bg-gray-200 px-4 py-2 rounded">Admin</Link>
      </div>
    </div>
  );
}
