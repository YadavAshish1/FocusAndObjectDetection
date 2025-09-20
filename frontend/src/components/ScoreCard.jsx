import React from "react";

export default function ProctoringReport({ report }) {
    console.log(report);
    
  if (!report) return <p>No report data available.</p>;

  return (
    <div className="mb-4 mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-center">
        Proctoring Report
      </h2>

      <div className="space-y-2 text-gray-700">
        <p><strong>Candidate Name:</strong> {report.candidateName}</p>
        <p><strong>Interview Duration:</strong> {report.interviewDuration}</p>
        <p><strong>Focus Lost:</strong> {report.focusLost} times</p>
        <p><strong>Suspicious Events:</strong> {report.suspiciousEvents}</p>
      </div>

      {/* Score Bar */}
      <div className="mt-6">
        <p className="mb-2 font-semibold text-gray-800">
          Integrity Score: {report.integrityScore}/100
        </p>
        <div className="w-full bg-gray-200 rounded-full h-5">
          <div
            className={`h-5 rounded-full transition-all duration-500 ${
              report.integrityScore >= 80
                ? "bg-green-500"
                : report.integrityScore >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${report.integrityScore}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
