import { Stack, IconButton, Box } from "@chakra-ui/react";
import { LuSquareCheck, LuSquareMinus } from "react-icons/lu";

// Labels are hidden (icon-only buttons) where the accordion header is too narrow.
const labelDisplay = { base: "none", "2xl": "inline" };

export const QuickSelectButton = ({ onClick }) => {
  return (
    <IconButton
      aria-label="Select all"
      title="Select all"
      size="2xl"
      w="fit"
      minW="auto"
      h="fit"
      variant="plain"
      // Disable event bubbling to not trigger accordion expansion/contraction
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      _hover={{ bg: "gray.300" }}
      p={2}
      fontSize="md"
      gap={1}
    >
      <LuSquareCheck />
      <Box as="span" display={labelDisplay}>
        Select all
      </Box>
    </IconButton>
  );
};

export const QuickClearButton = ({ onClick }) => {
  return (
    <IconButton
      aria-label="Clear"
      title="Clear"
      size="2xl"
      w="fit"
      minW="auto"
      h="fit"
      variant="plain"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      _hover={{ bg: "gray.300" }}
      p={2}
      fontSize="md"
      gap={1}
    >
      <LuSquareMinus size={"xl"} />
      <Box as="span" display={labelDisplay}>
        Clear
      </Box>
    </IconButton>
  );
};

const QuickSelectionButtons = ({ handleSelectAll, handleClearAll }) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-around"
      gap={0}
    >
      <QuickSelectButton onClick={handleSelectAll} />
      <QuickClearButton onClick={handleClearAll} />
    </Stack>
  );
};

export default QuickSelectionButtons;
