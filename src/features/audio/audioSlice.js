import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  recordings: [],
};

export const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    getRecordings: (state, action) => {
      state.recordings = action.payload
    },
    addRecording: (state, action) => {
      state.recordings.push({
        id: Date.now(),
        drugId: action.payload.drugId,
        drugName: action.payload.drugName,
        recordingUri: action.payload.recordingUri,
        timestamp: action.payload.timestamp
      });
    },
    removeRecording: (state, action) => {
      state.recordings = state.recordings.filter(recording => recording.id !== action.payload);
    },
    clearRecordings: (state) => {
      state.recordings = [];
    }
  },
});

export const { addRecording, removeRecording, getRecordings, clearRecordings } = audioSlice.actions;

export default audioSlice.reducer; 