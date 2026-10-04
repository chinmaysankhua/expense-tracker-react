import {
  describe,
  test,
  expect,
} from "vitest";

import themeReducer, {
  activatePremium,
  toggleTheme,
} from "./themeSlice";


describe("Theme Reducer", () => {
  test("9. activates premium", () => {
    const initialState = {
      isDarkMode: false,
      premiumActivated: false,
    };

    const newState = themeReducer(
      initialState,
      activatePremium()
    );

    expect(
      newState.premiumActivated
    ).toBe(true);
  });


  test("10. toggles dark mode", () => {
    const initialState = {
      isDarkMode: false,
      premiumActivated: true,
    };

    const newState = themeReducer(
      initialState,
      toggleTheme()
    );

    expect(
      newState.isDarkMode
    ).toBe(true);
  });
});