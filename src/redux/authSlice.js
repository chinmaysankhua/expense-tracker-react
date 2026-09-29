import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  userId: null,
  email: null,
  idToken: null,
  emailVerified: false,
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
    },

    logout: (state) => {
      state.isLoggedIn = false;
      state.userId = null;
      state.email = null;
      state.idToken = null;
      state.emailVerified = false;
    },

    updateToken: (state, action) => {
      state.idToken = action.payload;
    },

    updateEmailVerified: (state, action) => {
      state.emailVerified = action.payload;
    },
  },
});

export const {
  login,
  logout,
  updateToken,
  updateEmailVerified,
} = authSlice.actions;

export default authSlice.reducer;