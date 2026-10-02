// Shared responsive layout values for the floating cards on the map.

// Width of the left-hand cards (filters, collections, layers).
// Full width (minus margins) on phones, proportional on larger screens.
export const CARD_WIDTH = {
  base: "calc(100vw - 24px)",
  md: "max(25vw, 340px)",
  lg: "max(22.5vw, 340px)",
  xl: "22.5vw",
};

// Distance from the top of the left column to the cards (just below the EasyButtons bar).
export const CARD_TOP = { base: "52px", md: "calc(3.5vh + 5px)" };

// Height of the EasyButtons bar.
export const EASY_BUTTONS_HEIGHT = { base: "44px", md: "3.5vh" };
