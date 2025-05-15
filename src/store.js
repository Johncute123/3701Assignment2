import { configureStore } from '@reduxjs/toolkit'
import learningListReducer from './features/learningList/learningListSlice'
import audioReducer from './features/audio/audioSlice'
import authReducer from './features/auth/authSlice'

export const store = configureStore({
  reducer: {
    learningList: learningListReducer,
    audio: audioReducer,
    auth: authReducer,
  },
}) 
