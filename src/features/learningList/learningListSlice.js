import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

export const learningListSlice = createSlice({
  name: 'learningList',
  initialState,
  reducers: {
    getLearningList: (state, action) => {
      state.items = action.payload;
    },
    addToLearningList: (state, action) => {
      state.items.push({
        id: Date.now(),
        ...action.payload,
        status: 'current',
      });
    },
    updateStatus: (state, action) => {
      const { id, status } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.status = status;
      }
    },
    removeFromLearningList: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const { addToLearningList, updateStatus, removeFromLearningList, getLearningList } = learningListSlice.actions;

export default learningListSlice.reducer; 