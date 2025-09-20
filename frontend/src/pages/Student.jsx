import { Link } from 'react-router-dom'
import  useCondidateStore  from '../store/useCondidateStore'

function Student() {
  const {candidateName, setCandidateName, setCandidateRoomId, candidateRoomId} = useCondidateStore()
  
  return (
    <>
      <div className='justify-center items-center flex flex-col'>
        <h1 className="text-3xl font-bold underline">
         AI Proctoring Interview
        </h1>
         <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full p-2 border  border-gray-300 rounded-md mt-4"
                placeholder="Enter candidate name"
              />
              
                <input
                type="text"
                value={candidateRoomId}
                onChange={(e) => setCandidateRoomId(e.target.value)}
                className="w-full p-2 border  border-gray-300 rounded-md mt-4"
                placeholder="Enter Room Id"
              />


          <Link to="/proctor"
          className="mt-4 py-2 px-4 w-full bg-blue-500 text-black rounded-md hover:bg-blue-600"
          > 
          Start
          </Link>
          
      </div>
    </>
  )
}

export default Student
