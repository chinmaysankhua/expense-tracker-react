import {
  render,
  screen,
} from "@testing-library/react";
import {
  describe,
  test,
  expect,
} from "vitest";

import userEvent from "@testing-library/user-event";

import { MemoryRouter } from "react-router-dom";

import { Provider } from "react-redux";

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../redux/authSlice";

import Signup from "./Signup";

import { vi } from "vitest";


// Mock Firebase
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
}));


// Mock firebase config
vi.mock("../firebase/firebase", () => ({
  auth: {},
}));


const renderSignup = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    </Provider>
  );
};


describe("Signup Page", () => {
  test("4. renders signup form fields", () => {
    renderSignup();

    expect(
      screen.getByText("Create Account")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter email")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Confirm password"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /sign up/i,
      })
    ).toBeInTheDocument();
  });


  test("5. shows error when fields are empty", async () => {
    const user = userEvent.setup();

    renderSignup();

    const signupButton =
      screen.getByRole("button", {
        name: /sign up/i,
      });

    await user.click(signupButton);

    expect(
      screen.getByText(
        "Please fill in all fields."
      )
    ).toBeInTheDocument();
  });


  test("6. shows error when passwords do not match", async () => {
    const user = userEvent.setup();

    renderSignup();

    const emailInput =
      screen.getByPlaceholderText(
        "Enter email"
      );

    const passwordInput =
      screen.getByPlaceholderText(
        "Enter password"
      );

    const confirmPasswordInput =
      screen.getByPlaceholderText(
        "Confirm password"
      );

    await user.type(
      emailInput,
      "test@example.com"
    );

    await user.type(
      passwordInput,
      "password123"
    );

    await user.type(
      confirmPasswordInput,
      "different123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /sign up/i,
      })
    );

    expect(
      screen.getByText(
        "Passwords do not match."
      )
    ).toBeInTheDocument();
  });
});