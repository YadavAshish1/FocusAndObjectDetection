import { Link } from 'react-router-dom'
import  useInterviewerStore  from '../store/useInterviewerStore'

function InterviewerMain() {
  const {interviewerName, setInterviewerName, interviewerRoomId, setInterviewerRoomId} = useInterviewerStore()
  console.log(interviewerName);
  
  return (
    <>
      <div className='justify-center items-center flex flex-col'>
        <h1 className="text-3xl font-bold underline">
         AI Proctoring Interview
        </h1>
         <input
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mt-4"
                placeholder="Enter name"
              />
              
                <input
                type="text"
                value={interviewerRoomId}
                onChange={(e) => setInterviewerRoomId(e.target.value)}
                className="w-full p-2 border  border-gray-300 rounded-md mt-4"
                placeholder="Enter Room Id"
              />


          <Link to="/dashboard"
          className="mt-4 py-2 px-4 w-full bg-blue-500 text-black rounded-md hover:bg-blue-600"
          > 
          Start
          </Link>
          
      </div>
    </>
  )
}

export default InterviewerMain
