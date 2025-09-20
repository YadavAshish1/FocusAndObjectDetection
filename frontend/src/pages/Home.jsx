import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
const Home = () => {
    const navigate = useNavigate()
    const studentNavigation = () => {
           navigate('/candidate')
    }

    const interviewerNavigation = () => {
            navigate('/intv')
    }

  return (
    <div>
        <button className='bg-blue-500 px-6 py-2 w-full my-2 text-2xl rounded-2xl' onClick={studentNavigation}>Student</button>
        <button className='bg-blue-500 px-6 py-2 w-full my-2 text-2xl rounded-2xl'><Link to="/intv">Interviewer</Link></button>
    </div>
  )
}

export default Home