import { Checkbox, HStack, Box, Icon, Center } from "@chakra-ui/react";
import { useRef, useState } from "react";
import {
  LuFilter,
  LuLibraryBig,
  LuMap,
} from "react-icons/lu";
import MainMenu from "../MainMenu";
import useIsMobile from "../../CustomHooks/useIsMobile";
import { EASY_BUTTONS_HEIGHT } from "../layout";

const FILTERS_CARD = "filters";
const COLLECTIONS_CARD = "collections";
const LAYERS_CARD = "layers";
const NONE = "";

const EasyButtons = ({ openUserCard }) => {
  const [filterClosed, setFilterClosed] = useState(true);
  const [collectionsClosed, setCollectionsClosed] = useState(true);
  const [layersClosed, setLayersClosed] = useState(true);
  const curOpenCardRef = useRef(NONE);

  const isMobile = useIsMobile();
  const customStyle = { height: isMobile ? "1.15em" : "1.5em" };

  return (
    <HStack w="100%" h={EASY_BUTTONS_HEIGHT} gap="5px" pointerEvents="auto" display="flex">
      
      <MainMenu />

      {/* Filters button */}
      <Box
        flexGrow={1}
        bg={filterClosed ? "white" : "gray.900"}
        color={filterClosed ? "black" : "white"}
        h="100%"
        p={{ base: "2px", md: 2 }}
        rounded="7.5px"
        border="1px solid"
        borderColor="gray.300"
        asChild
      >
        <Checkbox.Root
          id="filters"
          cursor="pointer"
          w="fit"
          minW={{ base: 0, md: "6.5em" }}
          flexDirection={{ base: "column", md: "row" }}
          justifyContent="center"
          gap={{ base: 0, md: 2 }}
          checked={filterClosed}
          onCheckedChange={(e) => {
            setFilterClosed(!!e.checked);
            setCollectionsClosed(true);
            setLayersClosed(true);

            const checkedCard = !!e.checked ? NONE : FILTERS_CARD;
            curOpenCardRef.current = checkedCard;
            openUserCard(checkedCard);
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control
            bg={filterClosed ? "white" : "gray.900"}
            border="none"
            w="fit"
            h="fit"
            p={0}
            cursor="pointer"
          >
            <LuFilter
              color={filterClosed ? "black" : "white"}
              strokeWidth="1.5px"
              style={customStyle}
            />
          </Checkbox.Control>
          <Checkbox.Label w="full" textAlign="center" fontSize={{ base: "2xs", md: "lg" }} px="1">
            Filters
          </Checkbox.Label>
        </Checkbox.Root>
      </Box>

      {/* Collections button */}
      <Box
        flexGrow={1}
        bg={collectionsClosed ? "white" : "gray.900"}
        color={collectionsClosed ? "black" : "white"}
        p={{ base: "2px", md: 2 }}
        h="100%"
        rounded="md"
        border="1px solid"
        borderColor="gray.300"
        asChild
      >
        <Checkbox.Root
          id="collection"
          w="fit"
          minW={{ base: 0, md: "6.5em" }}
          flexDirection={{ base: "column", md: "row" }}
          justifyContent="center"
          gap={{ base: 0, md: 2 }}
          checked={collectionsClosed}
          onCheckedChange={(e) => {
            setCollectionsClosed(!!e.checked);
            setFilterClosed(true);
            setLayersClosed(true);

            const checkedCard = !!e.checked ? NONE : COLLECTIONS_CARD;
            curOpenCardRef.current = checkedCard;
            openUserCard(checkedCard);
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control
            cursor="pointer"
            border="none"
            bg={collectionsClosed ? "white" : "gray.900"}
            w="fit"
            h="fit"
            p={0}
          >
            <LuLibraryBig
              color={collectionsClosed ? "black" : "white"}
              strokeWidth="1.5px"
              style={customStyle}
            />
          </Checkbox.Control>
          <Checkbox.Label
            cursor="pointer"
            w="full"
            textAlign="center"
            fontSize={{ base: "2xs", md: "lg" }}
            pe="1"
          >
            Collections
          </Checkbox.Label>
        </Checkbox.Root>
      </Box>

      {/* Layers button */}
      <Box
        flexGrow={1}
        bg={layersClosed ? "white" : "gray.900"}
        color={layersClosed ? "black" : "white"}
        p={{ base: "2px", md: 2 }}
        h="100%"
        rounded="md"
        border="1px solid"
        borderColor="gray.300"
        asChild
      >
        <Checkbox.Root
          id="layers"
          w="fit"
          minW={{ base: 0, md: "6.5em" }}
          flexDirection={{ base: "column", md: "row" }}
          justifyContent="center"
          gap={{ base: 0, md: 2 }}
          checked={layersClosed}
          onCheckedChange={(e) => {
            setLayersClosed(!!e.checked);
            setCollectionsClosed(true);
            setFilterClosed(true);

            const checkedCard = !!e.checked ? NONE : LAYERS_CARD;
            curOpenCardRef.current = checkedCard;
            openUserCard(checkedCard);
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control
            cursor="pointer"
            border="none"
            bg={layersClosed ? "white" : "gray.900"}
            w="fit"
            h="fit"
            p={0}
          >
            <LuMap
              color={layersClosed ? "black" : "white"}
              strokeWidth="1.5px"
              style={customStyle}
            />
          </Checkbox.Control>
          <Checkbox.Label
            cursor="pointer"
            w="full"
            textAlign="center"
            fontSize={{ base: "2xs", md: "lg" }}
            pe="1"
          >
            Layers
          </Checkbox.Label>
        </Checkbox.Root>
      </Box>
    </HStack>
  );
};

export default EasyButtons;
