import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, test, expect, vi } from "vitest";

import Signup from "./Signup";
import authReducer from "../redux/authSlice";

// Mock Firebase
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
}));

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

describe("Signup - userEvent tests", () => {

  // 1
  test("1. user types email on Signup", async () => {
    const user = userEvent.setup();

    renderSignup();

    const emailInput = screen.getByPlaceholderText("Enter email");

    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });


  // 2
  test("2. user types password on Signup", async () => {
    const user = userEvent.setup();

    renderSignup();

    const passwordInput =
      screen.getByPlaceholderText("Enter password");

    await user.type(passwordInput, "password123");

    expect(passwordInput).toHaveValue("password123");
  });


  // 3
  test("3. user types confirm password", async () => {
    const user = userEvent.setup();

    renderSignup();

    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm password");

    await user.type(confirmPasswordInput, "password123");

    expect(confirmPasswordInput).toHaveValue("password123");
  });


  // 4
  test("4. user clicks Sign Up", async () => {
    const user = userEvent.setup();

    renderSignup();

    const emailInput = screen.getByPlaceholderText("Enter email");
    const passwordInput =
      screen.getByPlaceholderText("Enter password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    const signupButton = screen.getByRole("button", {
      name: /sign up/i,
    });

    await user.click(signupButton);

    // Firebase is mocked, so we only verify
    // that the button can be clicked successfully.
    expect(signupButton).toBeInTheDocument();
  });


  // 5
  test("5. user gets validation for empty fields", async () => {
    const user = userEvent.setup();

    renderSignup();

    const signupButton = screen.getByRole("button", {
      name: /sign up/i,
    });

    await user.click(signupButton);

    expect(
      screen.getByText("Please fill in all fields.")
    ).toBeInTheDocument();
  });


  // 6
  test("6. user gets validation for mismatched passwords", async () => {
    const user = userEvent.setup();

    renderSignup();

    const emailInput = screen.getByPlaceholderText("Enter email");
    const passwordInput =
      screen.getByPlaceholderText("Enter password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "different123");

    const signupButton = screen.getByRole("button", {
      name: /sign up/i,
    });

    await user.click(signupButton);

    expect(
      screen.getByText("Passwords do not match.")
    ).toBeInTheDocument();
  });

});