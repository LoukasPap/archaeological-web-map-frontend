import { LuChevronDown, LuTrash2, LuSquarePen, LuCheck } from "react-icons/lu";
import { BiTrash, BiEdit } from "react-icons/bi";

import {
  IconButton,
  Select,
  HStack,
  Portal,
  ButtonGroup,
  createListCollection,
  useSelectContext,
  Text,
} from "@chakra-ui/react";

import { useEffect, useRef, useState } from "react";
import { handleEvent } from "../../Helpers/Handlers";

const customStyle = { width: "2.25em", height: "2.5em" };
const popoverCustomStyle = { width: "1.3em", height: "2.25em" };
const nonDrawActions = ["Edit", "Remove"];
const ndActions = createListCollection({
  items: [
    {
      label: "Edit",
      value: "Edit",
      icon: <BiEdit style={customStyle}/>,
    },
    {
      label: "Remove",
      value: "Remove",
      icon: <BiTrash style={customStyle}/>,
    },
  ],
});

const NonDrawMenu = ({ activeTool, setActiveTool, mapRef }) => {
  const initialNDAction =
    ndActions.items.find(
      (a) => a.value === activeTool && nonDrawActions.includes(activeTool)
    ) || ndActions.items[0];
  const lastNDActionRef = useRef(initialNDAction);
  const [selected, setSelected] = useState([initialNDAction]);

  useEffect(() => {
    if (nonDrawActions.includes(activeTool)) {
      const found = ndActions.items.find((a) => a.value === activeTool);
      if (found) {
        setSelected([found]);
        lastNDActionRef.current = found;
      }
    } else {
      // Only update if the ref has changed
      if (selected[0].value !== lastNDActionRef.current.value) {
        setSelected([lastNDActionRef.current]);
      }
    }
  }, [activeTool]);

  const handleSelectChange = (e) => {
    setActiveTool(e.items[0].value);
    handleEvent(mapRef, e.items[0].value);
    lastNDActionRef.current = e.items[0];
    setSelected([e.items[0]]);
  };

  const SelectTrigger = () => {
    const select = useSelectContext();
    const items = select.selectedItems;
    return (
      <IconButton
        variant="solid"
        rounded="0"
        bg={nonDrawActions.includes(activeTool) ? "gray.950" : "white"}
        color={nonDrawActions.includes(activeTool) ? "white" : "gray.900"}
        _hover={
          nonDrawActions.includes(activeTool)
            ? { bg: "#161616" }
            : { bg: "gray.200" }
        }
        id="edit-action"
        h="max-content"
        p="2.5"
        w="fit"
        onClick={() => {
          const val = selected[0].value;

          if (nonDrawActions.includes(val)) {
            handleEvent(mapRef, val);
            setActiveTool(val);
            // setSelected([ndActions.items.find((a) => a.value === val)]);
          }
        }}
        border={0}
      >
        {selected[0].icon}
      </IconButton>
    );
  };

  return (
    <Select.Root
      positioning={{ placement: "top-end" }}
      collection={ndActions}
      value={selected}
      onValueChange={handleSelectChange}
    >
      <Select.Control>
        <ButtonGroup
          rounded="sm"
          border="1px solid #d4d4d8"
          overflow={"clip"}
          backgroundClip={{ base: "padding-box", _hover: "padding-box" }}
          attached
        >
          <SelectTrigger />

          <Select.Trigger
            color={nonDrawActions.includes(activeTool) ? "white" : "gray.950"}
            variant="plain"
            bg={nonDrawActions.includes(activeTool) ? "gray.950" : "white"}
            _hover={{
              bg: nonDrawActions.includes(activeTool) ? "gray.900" : "gray.200",
            }}
            border={0}
            borderStart={"1px solid"}
            borderStartColor="gray.300"
            rounded={0}
            w="2.25em"
            h="46.5px"
            p="2.5"
            display={"flex"}
            justifyContent={"center"}
          >
            <IconButton unstyled>
              <LuChevronDown style={popoverCustomStyle} strokeWidth={"1.5px"} />
            </IconButton>
          </Select.Trigger>
        </ButtonGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content w="fit">
            {ndActions.items.map((action) => (
              <Select.Item item={action} key={action.value}>
                <HStack>
                  {action.icon}
                  <Text textStyle={"lg"}>{action.label}</Text>
                </HStack>
                {action.value == activeTool ? (
                  <LuCheck />
                ) : (
                  <LuCheck style={{ visibility: "hidden" }} />
                )}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

export default NonDrawMenu;
