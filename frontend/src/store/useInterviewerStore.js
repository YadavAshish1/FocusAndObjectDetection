import {create} from 'zustand'

const useInterviewerStore = create((set) => ({
    interviewerRoomId: "",
    interviewerName: "",
    setInterviewerRoomId: (id) => set({interviewerRoomId: id}),
    setInterviewerName: (name) => set({interviewerName: name})
})) 
export default useInterviewerStore