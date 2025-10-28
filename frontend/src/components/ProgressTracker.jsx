import React from "react";

export default function ProgressTracker({ status }) {
  const steps = ["Pending Verification", "Verified", "In Progress", "Resolved"];
  return (
    <div className="flex gap-2 mt-2">
      {steps.map((step, idx) => (
        <div
          key={idx}
          className={`flex-1 p-2 text-center text-xs rounded ${
            steps.indexOf(status) >= idx ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {step}
        </div>
      ))}
    </div>
  );
}
