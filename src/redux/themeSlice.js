import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDarkMode: false,
  premiumActivated: false,
};

const themeSlice = createSlice({
  name: "theme",

  initialState,

  reducers: {
    activatePremium: (state) => {
      state.premiumActivated = true;
    },

    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },

    enableDarkMode: (state) => {
      state.isDarkMode = true;
    },

    disableDarkMode: (state) => {
      state.isDarkMode = false;
    },

    setPremiumStatus: (state, action) => {
      state.premiumActivated = action.payload;
    },

    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const {
  activatePremium,
  toggleTheme,
  enableDarkMode,
  disableDarkMode,
  setPremiumStatus,
  setTheme,
} = themeSlice.actions;

export default themeSlice.reducer;