import {
  describe,
  test,
  expect,
} from "vitest";

import expenseReducer, {
  setExpenses,
} from "./expenseSlice";


describe("Expense Reducer", () => {
  test("7. stores expenses in Redux", () => {
    const expenses = [
      {
        id: "1",
        amount: 500,
        description: "Lunch",
        category: "Food",
      },
    ];

    const initialState = {
      expenses: [],
      loading: false,
      error: null,
    };

    const newState = expenseReducer(
      initialState,
      setExpenses(expenses)
    );

    expect(newState.expenses).toHaveLength(1);

    expect(
      newState.expenses[0].amount
    ).toBe(500);

    expect(
      newState.expenses[0].description
    ).toBe("Lunch");
  });


  test("8. clears expenses when empty array is provided", () => {
    const initialState = {
      expenses: [
        {
          id: "1",
          amount: 500,
          description: "Lunch",
          category: "Food",
        },
      ],
      loading: false,
      error: null,
    };

    const newState = expenseReducer(
      initialState,
      setExpenses([])
    );

    expect(
      newState.expenses
    ).toHaveLength(0);
  });
});