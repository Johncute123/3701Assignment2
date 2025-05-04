import { configureStore } from '@reduxjs/toolkit';
import learningListReducer from '../features/learningList/learningListSlice';
import drugReducer from '../features/drug/drugSlice';
import audioReducer from '../features/audio/audioSlice';

export const store = configureStore({
  reducer: {
    learningList: learningListReducer,
    drug: drugReducer,
    audio: audioReducer,
  },
}); 