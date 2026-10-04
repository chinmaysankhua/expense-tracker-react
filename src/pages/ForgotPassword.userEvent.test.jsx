import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi } from "vitest";

import ForgotPassword from "./ForgotPassword";

// Mock Firebase
vi.mock("firebase/auth", () => ({
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock("../firebase/firebase", () => ({
  auth: {},
}));

describe("Forgot Password - userEvent tests", () => {

  // 10
  test("10. user clicks Forgot Password", async () => {
    const user = userEvent.setup();

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

    expect(resetButton).toBeInTheDocument();
  });

});