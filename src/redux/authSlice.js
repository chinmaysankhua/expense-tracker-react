import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  userId: null,
  email: null,
  idToken: null,
  emailVerified: false,

  // Firebase is checking the existing session
  authLoading: true,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.idToken = action.payload.idToken;
      state.emailVerified = action.payload.emailVerified;

      state.authLoading = false;
    },

    logout: (state) => {
      state.isLoggedIn = false;
      state.userId = null;
      state.email = null;
      state.idToken = null;
      state.emailVerified = false;

      state.authLoading = false;
    },

    updateToken: (state, action) => {
      state.idToken = action.payload;
    },

    updateEmailVerified: (state, action) => {
      state.emailVerified = action.payload;
    },

    setAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },
  },
});

export const {
  login,
  logout,
  updateToken,
  updateEmailVerified,
  setAuthLoading,
} = authSlice.actions;

export default authSlice.reducer;