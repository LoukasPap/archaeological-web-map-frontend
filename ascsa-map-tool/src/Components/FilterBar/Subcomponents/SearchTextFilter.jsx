import {
  SegmentGroup,
  Stack,
  Field,
  Text,
  Portal,
  Select,
  createListCollection,
  HStack,
  Input,
  Group,
  VStack,
  InputGroup,
  Box,
  Flex,
  List,
  NumberInput,
  Icon,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { Tooltip } from "../../ui/tooltip";
import { LuInfo } from "react-icons/lu";

const SearchTextFilter = ({ searchTextObj, setSearchText }) => {
  return (
    <Stack mb="5" w="100%" alignItems={"stretch"}>
      <VStack mb="2" align={"start"} gap={3}>
        <Box bg="gray.300" p={2} w="100%" rounded="sm" color="gray.500">
          <Text>How to search:</Text>
          <List.Root pl={4}>
            <List.Item>Separate keywords/phrases by comma (,)</List.Item>
            <List.Item>Do not leave any space after comma</List.Item>
            <List.Item>Place phrases inside double quotes</List.Item>
          </List.Root>
        </Box>

        <Flex gap={2} flexDir="row" flexWrap="wrap" alignItems="center" justifyContent="space-between" w="100%">
          <Field.Root w="auto">
            <Field.Label fontSize="md">Include in results</Field.Label>
          </Field.Root>
          <VStack flex="1 1 180px" minW="0">
            <Input
              size="lg"
              placeholder="Find these keywords/phrases while searching"
              border="1px solid"
              borderColor="gray.300"
              css={{ "--focus-color": "transparent" }}
              value={searchTextObj.includeInput}
              onChange={(e) =>
                setSearchText((prevState) => ({
                  ...prevState,
                  includeInput: e.target.value,
                }))
              }
            />
          </VStack>
        </Flex>
        <Flex gap={2} flexDir="row" flexWrap="wrap" alignItems="center" justifyContent="space-between" w="100%">
          <Field.Root w="auto">
            <Field.Label fontSize="md">Exclude from results</Field.Label>
          </Field.Root>
          <VStack flex="1 1 180px" minW="0">
            <Input
              size="lg"
              placeholder="Avoid these keywords/phrases while searching"
              border="1px solid"
              borderColor="gray.300"
              css={{ "--focus-color": "transparent" }}
              value={searchTextObj.excludeInput}
              onChange={(e) =>
                setSearchText((prevState) => ({
                  ...prevState,
                  excludeInput: e.target.value,
                }))
              }
            />
          </VStack>
        </Flex>
        <Flex
          gap={2}
          flexDir="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="space-between"
          w="100%"
        >
          <Field.Root w="auto">
            <Field.Label fontSize="md">Limit
            <Tooltip
              content="Number of matches to return - Leave empty to return all of them"
              contentProps={{ fontSize: "md", p: "2", lineHeight: "1.25em" }}
              positioning={{ placement: "right-center" }}
              openDelay={200}
              closeDelay={200}
            >
              <Icon size="md">
                <LuInfo />
              </Icon>
            </Tooltip></Field.Label>
          </Field.Root>
          <VStack flex="1 1 120px" minW="0" align="start">
            <NumberInput.Root
              size="lg"
              w="fit"
              min={0}
              value={searchTextObj.limit}
              onValueChange={(e) =>
                setSearchText((prevState) => ({
                  ...prevState,
                  limit: e.value,
                }))
              }
            >
              <NumberInput.Control />
              <NumberInput.Input
                placeholder="E.g. 45 "
                border="1px solid"
                borderColor="gray.300"
              />
            </NumberInput.Root>
          </VStack>
        </Flex>
      </VStack>
    </Stack>
  );
};

export default SearchTextFilter;
