import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordInput from "./PasswordInput";
import {
  describe,
  test,
  expect,
} from "vitest";

describe("PasswordInput", () => {
  test("1. renders password input", () => {
    render(
      <PasswordInput
        placeholder="Enter password"
        value=""
        onChange={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    );

    expect(input).toBeInTheDocument();
  });

  test("2. password is hidden by default", () => {
    render(
      <PasswordInput
        placeholder="Enter password"
        value="secret123"
        onChange={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    );

    expect(input).toHaveAttribute(
      "type",
      "password"
    );
  });

  test("3. clicking eye button shows password", async () => {
    const user = userEvent.setup();

    render(
      <PasswordInput
        placeholder="Enter password"
        value="secret123"
        onChange={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    );

    const button = screen.getByRole("button", {
      name: /show password/i,
    });

    await user.click(button);

    expect(input).toHaveAttribute(
      "type",
      "text"
    );
  });
});