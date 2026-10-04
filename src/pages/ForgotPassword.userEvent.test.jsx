import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi } from "vitest";

import ForgotPassword from "./ForgotPassword";

import { sendPasswordResetEmail } from "firebase/auth";

// Mock Firebase Auth
vi.mock("firebase/auth", () => ({
  sendPasswordResetEmail: vi.fn(),
}));

// Mock Firebase configuration
vi.mock("../firebase/firebase", () => ({
  auth: {},
}));

describe("Forgot Password - userEvent tests", () => {

  test("10. user submits Forgot Password form", async () => {
    const user = userEvent.setup();

    sendPasswordResetEmail.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText("Enter your email");

    await user.type(emailInput, "test@example.com");

    const resetButton = screen.getByRole("button", {
      name: /reset password|send reset|forgot password/i,
    });

    await user.click(resetButton);

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      {},
      "test@example.com"
    );
  });

});