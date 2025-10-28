import React, {useEffect, useState} from "react";
import { useLocation, Link } from "react-router-dom";
import ProgressTracker from "../components/ProgressTracker";

export default function Result(){
  const { state } = useLocation();
  const [issue, setIssue] = useState(null);
  useEffect(()=>{
    if (state && state.issueId){
      fetch(`http://127.0.0.1:5000/issues/${state.issueId}`)
        .then(r=>r.json())
        .then(setIssue)
        .catch(console.error);
    }
  },[state]);

  if (!issue) return <div className="p-6">Loading result...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Report Submitted</h2>
      <div className="bg-white p-6 rounded shadow">
        <p><strong>Category:</strong> {issue.category}</p>
        <p><strong>Department:</strong> {issue.department}</p>
        <p className="mt-2"><strong>Status:</strong> {issue.status}</p>
        <ProgressTracker status={issue.status} />
        <div className="mt-4">
          {issue.image && (<img src={`http://127.0.0.1:5000/uploads/${issue.image}`} alt="uploaded" className="w-full max-w-sm rounded"/>)}
        </div>
        <Link to="/my-reports" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded">View All Reports</Link>
      </div>
    </div>
  );
}
