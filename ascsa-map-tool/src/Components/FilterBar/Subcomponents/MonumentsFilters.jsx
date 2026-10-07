import {
  SegmentGroup,
  Stack,
  Field,
  Text,
  Portal,
  Select,
  createListCollection,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
const conditons = createListCollection({
  items: [
    { label: "Excellent", value: "Excellent" },
    { label: "Good", value: "Good" },
    { label: "Fair", value: "Fair" },
    { label: "Fully", value: "Fully" },
    { label: "Poor", value: "Poor" },
    { label: "Reburied", value: "Reburied" },
    // We skip Known and Mixed conditions because the monuments in these conditions
    // do not have coordinates to be drawn on map (i.e. WGS84Centroid)
  ],
});

const viewOptionsMapping = {
  Show: "Yes",
  Hide: "No",
  "Show only": "Only",
};

const viewOptionsMappingReverse = {
  Yes: "Show",
  No: "Hide",
  Only: "Show only",
};

const initialState = {
  ShowMonuments: "Yes",
  Condition: [],
};

const Monument = ({ setMonumentObj, clear }) => {
  const [monuments, setMonuments] = useState(initialState);

  useEffect(() => {
    setMonumentObj(monuments);
  }, [monuments]);

  useEffect(() => {
    setMonuments(initialState);
  }, [clear]);

  return (
    <Stack mb="5" w="100%">
      <Field.Root
        flexDirection="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        gap={3}
      >
        <Field.Label fontSize="md">
          <Text w="fit">View options</Text>
        </Field.Label>

        <SegmentGroup.Root
          value={viewOptionsMappingReverse[monuments.ShowMonuments]}
          onValueChange={(e) => {
            setMonuments((m) => ({
              ...m,
              ShowMonuments: viewOptionsMapping[e.value],
            }));
          }}
          size={{ smToMd: "lg", lg: "xl" }}
          flex="1 1 180px"
          minW="0"
          border="1px solid"
          borderColor="gray.300"
        >
          <SegmentGroup.Indicator bg="gray.300" />
          <SegmentGroup.Items
            h="35px"
            w="100%"
            lineHeight="12px"
            items={["Show", "Hide", "Show only"]}
          />
        </SegmentGroup.Root>
      </Field.Root>

      <Field.Root
        flexDirection="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        gap={3}
      >
        <Field.Label fontSize="md" flexGrow={0}>
          <Text w="fit">Condition</Text>
        </Field.Label>{" "}
        <Select.Root
          flex="1 1 180px"
          minW="0"
          value={monuments.Condition}
          onValueChange={(e) => {
            setMonuments((m) => ({
              ...m,
              Condition: e.value,
            }));
          }}
          multiple
          collection={conditons}
          size={{ smToMd: "xl", lg: "lg" }}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger border="1px solid" borderColor="gray.300">
              <Select.ValueText placeholder="Select condition" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {conditons.items.map((condition) => (
                  <Select.Item item={condition} key={condition.value}>
                    {condition.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </Field.Root>
    </Stack>
  );
};

export default Monument;
