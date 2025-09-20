import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import ExamProctoringSystem from "./pages/ExamProctoringSystem";
import InterviewerDashboard from "./pages/Interviewer";
import Student from "./pages/Student"
import InterviewerMain from "./pages/InterviewerMain";
import './App.css'

function App() {
  return (
    <div className="p-2">
     
      <div >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/proctor" element={<ExamProctoringSystem />} />
          <Route path="/dashboard" element={<InterviewerDashboard />} />
          <Route path ="/candidate" element={<Student/>}/>
          <Route path="/intv" element={<InterviewerMain/>}/>
        </Routes>
      </div>
    </div>
  );
}

export default App;
