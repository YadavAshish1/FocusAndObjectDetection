import {create} from 'zustand'

const useCondidateStore = create((set) => ({
    candidateName: '',
    candidateRoomId: "",
    setCandidateRoomId: (id) => set({candidateRoomId: id}),
    setCandidateName: (name) => set({candidateName: name}),
})) 
export default useCondidateStore