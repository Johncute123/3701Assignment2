import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  drugs: [],
  selectedDrug: null,
};

export const drugSlice = createSlice({
  name: 'drug',
  initialState,
  reducers: {
    setDrugs: (state, action) => {
      state.drugs = action.payload;
    },
    setSelectedDrug: (state, action) => {
      state.selectedDrug = action.payload;
    },
    updateDrug: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.drugs.findIndex(drug => drug.id === id);
      if (index !== -1) {
        state.drugs[index] = { ...state.drugs[index], ...updates };
      }
    },
  },
});

export const { setDrugs, setSelectedDrug, updateDrug } = drugSlice.actions;

export default drugSlice.reducer; 