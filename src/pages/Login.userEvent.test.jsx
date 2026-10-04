import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, test, expect, vi } from "vitest";

import Login from "./Login";
import authReducer from "../redux/authSlice";

import { signInWithEmailAndPassword } from "firebase/auth";

// Mock Firebase Auth
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
}));

// Mock Firebase configuration
vi.mock("../firebase/firebase", () => ({
  auth: {},
}));

const renderLogin = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  );
};

describe("Login - userEvent tests", () => {

  test("7. user types email on Login", async () => {
    const user = userEvent.setup();

    renderLogin();

    const emailInput = screen.getByPlaceholderText("Enter email");

    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });


  test("8. user types password on Login", async () => {
    const user = userEvent.setup();

    renderLogin();

    const passwordInput =
      screen.getByPlaceholderText("Enter password");

    await user.type(passwordInput, "password123");

    expect(passwordInput).toHaveValue("password123");
  });


  test("9. user clicks Login with valid data", async () => {
    const user = userEvent.setup();

    // Mock successful Firebase login
    signInWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: "test-user-id",
        email: "test@example.com",
        emailVerified: true,
        getIdToken: vi.fn().mockResolvedValue("test-token"),
      },
    });

    renderLogin();

    const emailInput = screen.getByPlaceholderText("Enter email");
    const passwordInput =
      screen.getByPlaceholderText("Enter password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    const loginButton = screen.getByRole("button", {
      name: /^login$/i,
    });

    await user.click(loginButton);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      "test@example.com",
      "password123"
    );
  });

});