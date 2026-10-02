import { Icon, IconButton } from "@chakra-ui/react";

const ActionButton = ({ icon, event, isActive, id }) => {
  return (
    <IconButton
      variant="solid"
      rounded="sm"
      overflow="hidden"
      bg={isActive ? "gray.950" : "white"}
      color={isActive ? "white" : "gray.900"}
      border="1px solid #d4d4d8"
      backgroundClip="padding-box"
      _hover={
        isActive
          ? { bg: "#161616", backgroundClip: "padding-box" }
          : { bg: "gray.300", transform: "scale(1.1)" }
      }
      id={id}
      p={{ base: "1.5", md: "2.5" }}
      w="fit"
      h="fit"
      onClick={event}
    >
      <Icon>{icon}</Icon>
    </IconButton>
  );
};

export default ActionButton;
