import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  expenses: [],
  loading: false,
  error: null,
};

const expenseSlice = createSlice({
  name: "expenses",

  initialState,

  reducers: {
    setExpenses: (state, action) => {
      state.expenses = action.payload;
    },

    addExpense: (state, action) => {
      state.expenses.unshift(action.payload);
    },

    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
    },

    updateExpense: (state, action) => {
      const index = state.expenses.findIndex(
        (expense) => expense.id === action.payload.id
      );

      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },

    clearExpenses: (state) => {
      state.expenses = [];
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
  clearExpenses,
  setLoading,
  setError,
} = expenseSlice.actions;

export default expenseSlice.reducer;