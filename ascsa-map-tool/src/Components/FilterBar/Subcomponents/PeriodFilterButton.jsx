import { Button, Text, VStack, Box, HStack } from "@chakra-ui/react";

const PeriodFilterButton = ({
  title = "Title",
  value = "value",
  date = "-",
  color = "gray.900",
  checked = false,
  onClick,
}) => {

  return (
    <Button
      key={value}
      variant="subtle"
      h="auto"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.300"
      rounded="md"
      onClick={onClick}
      justifyContent="start"
      px="2"
      whiteSpace="normal"
      textAlign="start"
      _hover={{ bg: "gray.200" }}
    >
      <HStack align="center" gap={0} >
        <Box
          bg={checked ? color : "white"}
          border="1px solid"
          borderColor={color}
          w="10px"
          h="30px"
          rounded="sm"
          transition="all 0.25s ease-out"
        />

        <VStack
          align={"flex-start"}
          zIndex={1}
          gap={1}
          p="1.5"
        >
          <Text
            fontSize="sm"
            fontWeight="normal"
            color="gray.950"
            transition="color 0.3s ease"
          >
            {title}
          </Text>
          <Text
            fontSize="xs"
            fontWeight="normal"
            color="gray.600"
            transition="color 0.3s ease"
          >
            {date}
          </Text>
        </VStack>
      </HStack>
      <Box
        bg="gray.300"
        w="100%"
        h={checked ? "100%" : "0"}
        bottom="0"
        left="0"
        pos="absolute"
        transition="height 0.25s ease-out"
        zIndex={-2}
      />
    </Button>
  );
};

export default PeriodFilterButton;
