import { configureStore } from '@reduxjs/toolkit';
import learningListReducer from '../features/learningList/learningListSlice';
import drugReducer from '../features/drug/drugSlice';

export const store = configureStore({
  reducer: {
    learningList: learningListReducer,
    drug: drugReducer,
  },
}); 