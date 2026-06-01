import { Text, Button, Card, Spinner, Box, Icon } from "@chakra-ui/react";
import { useRef, useState } from "react";
import ArtifactsFilters from "./Subcomponents/ArtifactsFilters";
import { Tooltip } from "../ui/tooltip";
import { LuInfo } from "react-icons/lu";

const FilterCard = ({ areFiltersOpen = false, setFilters, filterLoading }) => {
  const [cleanFilters, setCleanFilters] = useState(false);
  const filtersState = useRef({});

  function updateFilterState(props) {
    filtersState.current = { ...filtersState.current, ...props };
  }

  const applyFilters = () => {
    setFilters(filtersState.current);
  };

  let timer = null;
  const HOLD_MS = 600; // threshold

  function onLongClick(e) {
    setCleanFilters((state) => !state);
  }

  function startHold(e) {
    if (e.button && e.button !== 0) return; // ignore right-click
    e.preventDefault();
    timer = setTimeout(() => onLongClick(e), HOLD_MS);
  }

  function cancelHold() {
    clearTimeout(timer);
    timer = null;
  }

  return (
    <Card.Root
      style={{
        opacity: areFiltersOpen ? 1 : 0,
        pointerEvents: areFiltersOpen ? "auto" : "none",
        transition: "opacity 0.5s",
      }}
      w={{ sm: "30vw", md: "25vw", lg: "22.5vw" }}
      bg="white"
      // p="30px 22px"
      rounded="xl"
      border="1px solid #C6C6C6"
      top="calc(3.5vh + 5px)"
      bottom="calc(12px + 12px)"
      position="absolute"
    >
      <Card.Header>
        <Text fontSize="3xl" fontWeight="bold">
          Filters
        </Text>
      </Card.Header>

      <Card.Body overflow="auto">
        <ArtifactsFilters setArtifactsFilters={updateFilterState} cleanFilters={cleanFilters}/>
      </Card.Body>

      <Card.Footer flexDir="row" justifyContent="flex-end">
        <Button size="md" flexGrow={1} fontSize="lg" mt={2} variant="surface" onPointerDown={startHold} onPointerUp={cancelHold}>
          <Tooltip
            showArrow
            content="Long press to clear"
            contentProps={{ fontSize: "md", p: "2" }}
            positioning={{ placement: "top-center" }}
            
            openDelay={600}
            closeDelay={200}
          >
            <Icon size="md">
              <LuInfo />
            </Icon>
          </Tooltip>
          Clear
        </Button>
        <Button size="md" flexGrow={1} fontSize="lg" mt={2} onClick={applyFilters} disabled={filterLoading}>
          {filterLoading ? <><Spinner size="sm"/>Loading data</> : "Apply"}
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};

export default FilterCard;
