import React, { useState, useEffect, useRef } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import useInterviewerStore from '../store/useInterviewerStore'
import ScoreCard from '../components/ScoreCard'
const InterviewerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [activeTab, setActiveTab] = useState('events');
  const [score, setScore] = useState({})
  const [isScoreVisible , setIsScoreVisible] = useState(false)
  const {interviewerRoomId} = useInterviewerStore()
  const { alerts, isConnected, remoteStream, canvasRef} = useWebSocket(interviewerRoomId);



  //   console.log("Connection Status:", isConnected);
  useEffect(() => {
    if (alerts.length > 0) {
      setEvents(prevEvents => {
        const newAlerts = alerts.filter(alert =>
          !prevEvents.some(event => event.id === alert.id)
        );
        return [...newAlerts, ...prevEvents];
      });
    }
  }, [alerts]);


  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'warnings') return event.type === 'Warning';
    if (filter === 'violations') return event.type === 'Violation';
    if (filter === 'info') return event.type === 'Info';
    return true;
  });


  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else {
      return new Date(a.timestamp) - new Date(b.timestamp);
    }
  });

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'violation':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'violation':
        return 'Violation';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'Unknown';
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };


  const clearEvents = () => {
    setEvents([]);
  };


  const exportToCSV = () => {
    const headers = ['Timestamp', 'Type', 'Candidate Name', 'Message'];
    const csvData = events.map(event => [
      event.timestamp,
      event.type,
      event.candidateName,
      event.message
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `proctoring-events-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateScore = () => {
    setIsScoreVisible(!isScoreVisible)
    if (!events || events.length === 0) {
      return "No events found.";
    }

    const candidateName = events[0].candidateName;

    const endTime = new Date(events[0].timestamp);
    const startTime = new Date(events[events.length - 1].timestamp);

    const durationMs = endTime - startTime;
    const durationSec = Math.floor(durationMs / 1000);
    const durationStr = `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`;

    
    const violations = events.filter((log) => log.type === "Violation").length;
    const suspiciousEvents = events.filter((log) => log.isWarning).length;


    const integrityScore = Math.max(100 - suspiciousEvents * 5, 0);

    let report =  {
      candidateName,
      interviewDuration: durationStr,
      focusLost: violations,
      suspiciousEvents,
      integrityScore,
    };
    
    setScore(report)
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Interviewer Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of exam proctoring events</p>

          <div className="flex items-center mt-4">
            <div className={`flex items-center mr-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <span className="text-gray-500">{events.length} events received</span>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'events' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('liveVideo')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'liveVideo' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Live Video
          </button>
        </div>

        {activeTab === 'events' ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">


              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="font-medium">Filter:</span>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('violations')}
                    className={`px-3 py-1 rounded-full text-sm ${filter === 'violations' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Violations
                  </button>
                  <button
                    onClick={() => setFilter('warnings')}
                    className={`px-3 py-1 rounded-full text-sm ${filter === 'warnings' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Warnings
                  </button>
                  <button
                    onClick={() => setFilter('info')}
                    className={`px-3 py-1 rounded-full text-sm ${filter === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Info
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium">Sort by:</span>
                  <button
                    onClick={() => setSortOrder('newest')}
                    className={`px-3 py-1 rounded-full text-sm ${sortOrder === 'newest' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => setSortOrder('oldest')}
                    className={`px-3 py-1 rounded-full text-sm ${sortOrder === 'oldest' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Oldest First
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={clearEvents}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"

                  >
                    Clear All
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="px-3 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"

                  >
                    Export CSV
                  </button>
                  <button
                    onClick={generateScore}
                    className="px-3 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"

                  >
                    Score
                  </button>
                </div>
              </div>
            </div>

             {/* Score */}
        {
          score && Object.keys(score).length && isScoreVisible && <ScoreCard report={score} />
        }

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedEvents.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                          No events to display
                        </td>
                      </tr>
                    ) : (
                      sortedEvents.map((event, index) => (
                        <tr key={event.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatTime(event.timestamp)}</div>
                            <div className="text-sm text-gray-500">{formatDate(event.timestamp)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">
                              {event.type.replace(/_/g, ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full`}>
                              {event.candidateName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{event.message}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="video-container">
           
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-h-94 bg-black rounded-lg"
              style={{ display: remoteStream ? 'block' : 'none' }}
            />
          </div>
        )
        }

        {/* Statistics Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Violations</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {events.filter(e => e.severity === 'violation').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {events.filter(e => e.severity === 'warning').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isConnected ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerDashboard;