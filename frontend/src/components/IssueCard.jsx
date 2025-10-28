import React from "react";

export default function IssueCard({ issue, onUpdate }) {
  return (
    <div className="bg-white p-4 rounded shadow mb-3">
      <div className="flex items-start gap-4">
        {/* Image */}
        {issue.image ? (
          <img
            src={`http://127.0.0.1:5000/${issue.image}`}
            alt="thumb"
            className="w-24 h-24 object-cover rounded"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded" />
        )}

        {/* Info */}
        <div className="flex-1">
          <div className="font-semibold text-lg">{issue.category}</div>
          <div className="text-sm text-gray-600">{issue.department}</div>
          <div className="text-sm text-gray-700 mt-1">{issue.description}</div>
          <div className="text-xs text-gray-500 mt-2">{issue.location}</div>

          {/* Audio */}
          {issue.audio && (
            <audio controls src={`http://127.0.0.1:5000/${issue.audio}`} className="mt-2 w-full" />
          )}

          <div className="mt-2 flex gap-2">
            <span className="text-sm px-2 py-1 bg-gray-100 rounded">{issue.status}</span>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {onUpdate && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onUpdate(issue.id, { status: "Verified" })}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            Verify
          </button>
          <button
            onClick={() => onUpdate(issue.id, { status: "In Progress" })}
            className="px-3 py-1 bg-yellow-500 text-white rounded"
          >
            Start
          </button>
          <button
            onClick={() => onUpdate(issue.id, { status: "Resolved" })}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Resolve
          </button>
        </div>
      )}
    </div>
  );
}
