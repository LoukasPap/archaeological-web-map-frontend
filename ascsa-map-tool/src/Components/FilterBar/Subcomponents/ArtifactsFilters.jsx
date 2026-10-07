import {
  For,
  Heading,
  SimpleGrid,
  Accordion,
  Group,
  Icon,
} from "@chakra-ui/react";
import QuickSelectionButtons, {
  QuickClearButton,
} from "../QuickSelectionButtons";
import InventoryFilterButton from "./InventoryFilterButton";
import { useState, useEffect, useRef } from "react";
import Section from "./SectionFilters";
import Monument from "./MonumentsFilters";
import { Tooltip } from "../../ui/tooltip";
import { LuInfo } from "react-icons/lu";
import PeriodFilterButton from "./PeriodFilterButton";
import SearchTextFilter from "./SearchTextFilter";

import usePrevious from "../../../CustomHooks/usePrevious"

const initialInventoryList = [
  { title: "A",  value: "A",  fullTitle: "Architecture", color: "#000", checked: false },
  { title: "B",  value: "B",  fullTitle: "Bronze", color: "#000", checked: false },
  { title: "BI", value: "BI", fullTitle: "Bone & Ivory", color: "#000", checked: false },
  { title: "G",  value: "G",  fullTitle: "Glass", color: "#000", checked: false },
  { title: "I",  value: "I",  fullTitle: "Inscriptions", color: "#000", checked: false },
  { title: "IL", value: "IL", fullTitle: " Iron & Lead", color: "#000", checked: false },
  { title: "J",  value: "J",  fullTitle: "Jewelry & Gems", color: "#000", checked: false },
  { title: "L",  value: "L",  fullTitle: "Lamps", color: "#000", checked: false },
  { title: "MC", value: "MC", fullTitle: " Miscellaneous Clay", color: "#000", checked: false },
  { title: "N",  value: "N",  fullTitle: "Coin", color: "#000", checked: false },
  { title: "P",  value: "P",  fullTitle: "Pottery", color: "#000", checked: false },
  { title: "S",  value: "S",  fullTitle: "Sculpture", color: "#000", checked: false },
  { title: "SS", value: "SS", fullTitle: "Stamps & Seals", color: "#000", checked: false },
  { title: "ST", value: "ST", fullTitle: "Stone", color: "#000", checked: false },
  { title: "T",  value: "T",  fullTitle: "Terracotta", color: "#000", checked: false },
  { title: "W",  value: "W",  fullTitle: "Wood", color: "#000", checked: false },
];

const initialSectionState = {
  SectionNumberLetter: "",
  SectionNumberNumber: "",
  SectionNumber: "",
};

const initialPeriodsList = [
  { title: "Neolithic",      value: "ne", filterKey: "Neolithic",      date: "7000-3200 BCE", color: "gray.700",   checked: false },
  { title: "Bronze Age",     value: "ba", filterKey: "Bronze Age",     date: "2500-1050 BCE", color: "orange.700",   checked: false },
  { title: "Geometric",      value: "ge", filterKey: "Geometric",      date: "1050-700 BCE",  color: "yellow.400",    checked: false },
  { title: "Protoattic",     value: "pr", filterKey: "Protoattic",     date: "710-600 BCE",   color: "yellow.200", checked: false },
  { title: "Archaic",        value: "ar", filterKey: "Archaic",        date: "600-480 BCE",   color: "blue.900",  checked: false },
  { title: "Classical",      value: "cl", filterKey: "Classical",      date: "480-320 BCE",   color: "blue.700", checked: false },
  { title: "Late Classical", value: "lc", filterKey: "Late Classical", date: "400-320 BCE",   color: "blue.500",   checked: false },
  { title: "Hellenistic",    value: "he", filterKey: "Hellenistic",    date: "320-31 BCE",    color: "blue.300",   checked: false },
  { title: "Roman",          value: "ro", filterKey: "Roman",          date: "31 BCE-267 CE", color: "red.500",   checked: false },
  { title: "Late Roman ",    value: "lr", filterKey: "Late Roman",     date: "267-700 CE",    color: "red.400",   checked: false },
  { title: "Byzantine",      value: "by", filterKey: "Byzantine",      date: "300-1453",      color: "orange.500",   checked: false },
  { title: "Frankish",       value: "fr", filterKey: "Frankish",       date: "1204-1458",     color: "green.500",   checked: false },
  { title: "Ottoman",        value: "ot", filterKey: "Ottoman",        date: "1453-1821",     color: "yellow.600",   checked: false },
  { title: "Modern",         value: "mo", filterKey: "Modern",         date: "1821-2025",     color: "pink.500",   checked: false },
  { title: "Unknown",        value: "un", filterKey: "Unknown",        date: "-",             color: "gray.950",   checked: false },
];

const initialSearchText = {
  includeInput: "",
  excludeInput: "",
  limit: "",
};


const initialMonumentsState = {ShowMonuments: "Yes", Condition: [],}

const ArtifactsFilters = ({ setArtifactsFilters, cleanFilters }) => {

  const [searchTextFilter, setSearchTextFilter] = useState(initialSearchText);

  const [inventoryLetterList, setInventoryLetterList] = useState(initialInventoryList);
  const [periodList, setPeriodList] = useState(initialPeriodsList);
  const [section, setSection] = useState(initialSectionState);
  const [monument, setMonument] = useState(initialMonumentsState);

  const [openItems, setOpenItems] = useState([
    "text-search-filter",
    "period-filter",
    "inventory-filter",
    "section-filter",
    "monument-filter",
  ]);

  useEffect(() => {
    handleClearAll("period-filter");
    handleClearAll("inventory-filter");
    handleClearAll("section-filter");
    setSection(initialSectionState);
    setMonument(initialMonumentsState);
  }, [cleanFilters]);



  const handleSelectAll = (filter) => {
    if (filter === "period-filter") {
      setPeriodList(
        periodList.map((period) => ({
          ...period,
          checked: true,
        }))
      );
    } else {
      setInventoryLetterList(
        inventoryLetterList.map((material) => ({
          ...material,
          checked: true,
        }))
      );
    }

    controlAccordionState(filter);
  };

  const handleClearAll = (filter) => {
    if (filter === "period-filter") {
      setPeriodList(
        periodList.map((period) => ({
          ...period,
          checked: false,
        }))
      );
    } else if (filter == "inventory-filter") {
      setInventoryLetterList(
        inventoryLetterList.map((material) => ({
          ...material,
          checked: false,
        }))
      );
    } else {
      setSearchTextFilter(initialSearchText);
    }

    controlAccordionState(filter);
  };

  const selectPeriod = (value) => {
    setPeriodList(
      periodList.map((period) =>
        period.value === value
          ? { ...period, checked: !period.checked }
          : period
      )
    );
  };

  const selectInventoryLetter = (value) => {
    setInventoryLetterList(
      inventoryLetterList.map((material) =>
        material.value == value
          ? { ...material, checked: !material.checked }
          : material
      )
    );
  };

  const clearSectionInput = () => {
    setSection(initialSectionState);
    controlAccordionState("section-filter");
  };

  const controlAccordionState = (accordionItem) => {
    if (!openItems.includes(accordionItem)) {
      setOpenItems((ot) => [...ot, accordionItem]);
    }
  };

  useEffect(() => {
    setArtifactsFilters({
      textSearch: searchTextFilter,
      periods: periodList.filter((p) => p.checked).map((p) => p.filterKey),
      inventory: inventoryLetterList
        .filter((m) => m.checked)
        .map((m) => m.value),
      section: section,
      monument: monument,
    });
  }, [searchTextFilter, periodList, inventoryLetterList, section, monument]);

  return (
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
      overflow="visible"
      flexShrink={0}
    >
      <Accordion.Item value="text-search-filter" bg="white">
        <Accordion.ItemTrigger justifyContent="space-between">
          <Heading fontWeight={"normal"} fontSize="md">
            TEXT SEARCH
          </Heading>
          <Group>
            <QuickClearButton onClick={() => handleClearAll("text-search-filter")} />
            <Accordion.ItemIndicator color={"gray.400"} />
          </Group>
        </Accordion.ItemTrigger>

        <Accordion.ItemContent>
          <SearchTextFilter searchTextObj={searchTextFilter} setSearchText={setSearchTextFilter} />
        </Accordion.ItemContent>
      </Accordion.Item>

      <Accordion.Item value="period-filter" bg="white">
        <Accordion.ItemTrigger justifyContent="space-between">
          <Heading fontWeight={"normal"} fontSize="md">
            PERIODS
          </Heading>
          <Group>
            <QuickSelectionButtons
              handleSelectAll={() => handleSelectAll("period-filter")}
              handleClearAll={() => handleClearAll("period-filter")}
            />
            <Accordion.ItemIndicator color={"gray.400"} />
          </Group>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <SimpleGrid
            gap="2"
            columns={2}
            h="fit"
            mb="5"
          >
            <For each={periodList}>
              {(period) => (
                <PeriodFilterButton
                  key={period.value}
                  title={period.title}
                  date={period.date}
                  color={period.color}
                  checked={period.checked}
                  onClick={() => selectPeriod(period.value)}
                />
              )}
            </For>
          </SimpleGrid>
        </Accordion.ItemContent>
      </Accordion.Item>

      <Accordion.Item value="inventory-filter" bg="white">
        <Accordion.ItemTrigger justifyContent="space-between">
          <Heading fontWeight={"normal"} fontSize="md">
            INVENTORY LETTERS
          </Heading>
          <Group>
            <QuickSelectionButtons
              handleSelectAll={() => handleSelectAll("inventory-filter")}
              handleClearAll={() => handleClearAll("inventory-filter")}
            />
            <Accordion.ItemIndicator color={"gray.400"} />
          </Group>
        </Accordion.ItemTrigger>

        <Accordion.ItemContent>
          <SimpleGrid
            mb="5"
            gap="2"
            minChildWidth="52px"
            h="fit"
          >
            <For each={inventoryLetterList}>
              {(m) => (
                <InventoryFilterButton
                  inventoryObject={m}
                  onClick={() => selectInventoryLetter(m.value)}
                />
              )}
            </For>
          </SimpleGrid>
        </Accordion.ItemContent>
      </Accordion.Item>

      <Accordion.Item value="section-filter" bg="white">
        <Accordion.ItemTrigger justifyContent="space-between">
          <Heading fontWeight={"normal"} fontSize="md">
            SECTION
          </Heading>
          <Group>
            <QuickClearButton onClick={clearSectionInput} />
            <Accordion.ItemIndicator color={"gray.400"} />
          </Group>
        </Accordion.ItemTrigger>

        <Accordion.ItemContent>
          <Section sectionObj={section} setSectionObj={setSection} />
        </Accordion.ItemContent>
      </Accordion.Item>

      <Accordion.Item value="monument-filter" bg="white">
        <Accordion.ItemTrigger justifyContent="space-between">
          <Group>
            <Heading fontWeight={"normal"} fontSize="md">
              MONUMENTS
            </Heading>
            <Tooltip
              content="Monuments are not affected by Period and Inventory filters"
              contentProps={{ fontSize: "md", p: "2" }}
              positioning={{ placement: "right-center" }}
              openDelay={200}
              closeDelay={200}
            >
              <Icon size="md">
                <LuInfo />
              </Icon>
            </Tooltip>
          </Group>
          <Accordion.ItemIndicator color={"gray.400"} />
        </Accordion.ItemTrigger>

        <Accordion.ItemContent>
          <Monument setMonumentObj={setMonument} clear={cleanFilters}/>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export default ArtifactsFilters;
