import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null
};

export const learningListSlice = createSlice({
  name: 'learningList',
  initialState,
  reducers: {
    getLearningList: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
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
    addScore: (state, action) => {
      const { id, score } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        if (!item.scores) {
          item.scores = [];
        }
        item.scores.push({
          score,
          timestamp: new Date().toISOString()
        });
        // Update the highest score
        item.score = Math.max(...item.scores.map(s => s.score));
      }
    },
    clearLearningList: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    }
  },
});

export const { 
  addToLearningList, 
  updateStatus, 
  removeFromLearningList, 
  getLearningList, 
  addScore, 
  clearLearningList,
  setLoading,
  setError
} = learningListSlice.actions;

export default learningListSlice.reducer; 