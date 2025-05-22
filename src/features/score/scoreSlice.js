import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  scores: {}, 
};

export const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    setScore: (state, action) => {
      const { drugId, score } = action.payload;
      state.scores[drugId] = score;
    },
    updateScore: (state, action) => {
      const { drugId, score } = action.payload;
      if (!state.scores[drugId] || score > state.scores[drugId]) {
        state.scores[drugId] = score;
      }
    },
    clearScores: (state) => {
      state.scores = {};
    }
  },
});

export const { setScore, updateScore, clearScores } = scoreSlice.actions;

export const selectScoreByDrugId = (state, drugId) => state.score.scores[drugId] || 0;
export const selectAllScores = (state) => state.score.scores;

export default scoreSlice.reducer; 