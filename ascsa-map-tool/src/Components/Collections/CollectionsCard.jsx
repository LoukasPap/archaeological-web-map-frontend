import {
  Text,
  Card,
  Accordion,
  Heading,
  Box,
  Button,
  VStack,
  HStack,
  For,
  Icon,
  IconButton,
  Group,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuEye, LuEyeClosed, LuLogIn, LuTrash2 } from "react-icons/lu";

import { Tooltip } from "../ui/tooltip";
import useAuth from "../../CustomHooks/useAuth";
import { BiShapeCircle, BiShapeSquare, BiShapePolygon } from "react-icons/bi";

import { CARD_WIDTH, CARD_TOP } from "../layout";

const CollectionsCard = ({
  areCollectionsOpen = false,
  savedCollections = [{ name: "a" }, { name: "b" }],
  viewCollection,
  deleteCollection,
  hideCollection,
  visibleCollections = []
}) => {
  const [openItems, setOpenItems] = useState([]);
  const { isAuthenticated, openAuthDialog } = useAuth();

  const Collection = ({ c }) => {
    const iconSize = 20;
    function findShapeType(shapeType) {
      switch (shapeType) {
        case "Rectangle":
          return <BiShapeSquare size={iconSize} />;
        case "Circle":
          return <BiShapeCircle size={iconSize} />;
        case "Polygon":
          return <BiShapePolygon size={iconSize} />;
        default:
          return <></>;
      }
    }

    const highlightColor = "black";

    return (
      <Flex
        key={c.id}
        as="li"
        _last={{ mb: "12vh" }}
        w="100%"
        padding={2}
        paddingInline={3}
        bg={c.isSaved ? "gray.200" : "white"}
        transition={"all 0.2s"}
        border={c.isSaved ? "1px solid" : "1px dashed"}
        borderWidth="2px"
        borderColor="gray.300"
        rounded="sm"
        h="fit"
        mb={2}
        mt={1}
        alignContent={"start"}
        justifyContent={"start"}
        _hover={{ borderColor: highlightColor }}
        onMouseEnter={() => {
          let stroke = c.shape.layer || c.shape;
          stroke._path.style.stroke = highlightColor;
        }}
        onMouseLeave={() => {
          let stroke = c.shape.layer || c.shape;
          stroke._path.style.stroke = "";
        }}
      >
        <VStack w="100%" mb={2} alignItems={"start"} gap={0}>
          <HStack w="100%" justifyContent={"space-between"}>
            <Text fontSize={"sm"} color="gray.500">
              {c.date}
            </Text>

            <Text fontSize={"sm"} color="gray.500">
              {c.markers.length} items
            </Text>
          </HStack>

          <Box m="0.75em 0em" w="full">
            <HStack alignItems="center" justifyContent="space-between" mb="1">
              <Heading fontSize="lg">{c.name}</Heading>
              <Tooltip
                content={c.type}
                contentProps={{ fontSize: "lg", p: 2 }}
                openDelay={200}
                closeDelay={200}
              >
                <Icon>{findShapeType(c.type)}</Icon>
              </Tooltip>
            </HStack>

            {c.description != "" ? (
              <Text
                maxH="7rem"
                fontWeight="light"
                maxLines={2}
                overflow={"auto"}
                pr={2}
                _scrollbar={{ display: "thin", color: "black" }}
              >
                {c.description}
              </Text>
            ) : (
              <Text
                color="gray"
                fontStyle="italic"
                maxH="7rem"
                pr={2}
              >
                No description provided.
              </Text>
            )}
          </Box>

          <Group w="100%">
            <Button
              flexGrow={1}
              variant="outline"
              colorPalette="red"
              onClick={() => {
                deleteCollection(c);
              }}
            >
              Delete
              <LuTrash2 />
            </Button>

            {visibleCollections.includes(c.id) ? (
              <Button
                flexGrow={1}
                w="fit"
                variant="solid"
                onClick={() => {
                  hideCollection(c);
                }}
              >
                Hide <LuEyeClosed />
              </Button>
            ) : (
              <Button
                flexGrow={1}
                variant="solid"
                w="fit"
                onClick={() => {
                  viewCollection(c);
                }}
              >
                View <LuEye />
              </Button>
            )}
          </Group>
        </VStack>
      </Flex>
    );
  };

  return (
    <Card.Root
      style={{
        opacity: areCollectionsOpen ? 1 : 0,
        pointerEvents: areCollectionsOpen ? "auto" : "none",
        transition: "opacity 0.4s cubic-bezier(.4,0,.2,1)",
      }}
      w={CARD_WIDTH}
      bg="white"
      rounded="xl"
      border="1px solid #C6C6C6"
      top={CARD_TOP}
      bottom="calc(12px + 12px)"
      position="absolute"
    >
      <Card.Header>
        <Text fontSize="3xl" fontWeight="bold">
          Collections
        </Text>
      </Card.Header>

      <Card.Body h="inherit" overflow="auto">
        {!isAuthenticated && (
          <Box
            mb="3"
            p="3"
            rounded="lg"
            border="1px solid"
            borderColor="gray.300"
            bg="gray.50"
          >
            <Text fontSize="sm" color="gray.600" mb="2">
              You are browsing as a guest. Log in to keep your collections
              across sessions.
            </Text>
            <Button
              size="sm"
              w="full"
              onClick={() =>
                openAuthDialog("Log in or create an account to save your collections.")
              }
            >
              <LuLogIn /> Log in / Sign up
            </Button>
          </Box>
        )}

        <Accordion.Root
          multiple
          collapsible
          w="100%"
          variant={"enclosed"}
          size="lg"
          borderColor={"gray.400"}
          rounded="lg"
          onValueChange={(e) => {
            setOpenItems(e.value);
          }}
          value={openItems}
        >


          <Accordion.Item value="collections" h="100%" bg="white">
            <Accordion.ItemTrigger justifyContent="space-between">
              <Heading fontWeight={"normal"} fontSize="md">
                SAVED COLLECTIONS
              </Heading>
              <Accordion.ItemIndicator color={"gray.400"} />
            </Accordion.ItemTrigger>

            <Accordion.ItemContent
              flexGrow={1}
              bottom={0}
              maxH={"100%"}
              overflow={"auto"}
              scrollbarColor="black transparent"
              scrollbarWidth="thin"
            >
              <For each={savedCollections}>
                {(c) => <Collection key={c.id} c={c} />}
              </For>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </Card.Body>
    </Card.Root>
  );
};

export default CollectionsCard;
