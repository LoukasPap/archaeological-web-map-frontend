import {
  Field,
  Group,
  Input,
  NumberInput,
  Stack,
  Text,
} from "@chakra-ui/react";

const Section = ({ sectionObj, setSectionObj }) => {
  function concatSectionNumber(letter, number) {
    return `${letter} ${number || ""}`.trim();
  }

  return (
    <Stack gap={3} mb={5} mt={1} flexDir="row" flexWrap="wrap" alignItems="center" justifyContent="space-between">
      <Field.Root orientation="horizontal" w="auto">
        <Field.Label fontSize="md">
          <Text w="50px">Section</Text>
        </Field.Label>
      </Field.Root>
      <Group gap={1} flex="1 1 180px" minW="0">
        <Input
          size="lg"
          flex="1 1 0"
          minW="0"
          border="1px solid"
          borderColor="gray.300"
          placeholder="Letter(s)"
          value={sectionObj.SectionNumberLetter}
          onChange={(e) =>
            setSectionObj((s) => ({
              ...s,
              SectionNumberLetter: e.target.value,
              SectionNumber: concatSectionNumber(
                e.target.value,
                s.SectionNumberNumber
              ),
            }))
          }
        />

        <NumberInput.Root
          size="lg"
          flex="1 1 0"
          minW="0"
          min={0}
          value={sectionObj.SectionNumberNumber}
          onValueChange={(e) =>
            setSectionObj((s) => ({
              ...s,
              SectionNumberNumber: e.value,
              SectionNumber: concatSectionNumber(
                s.SectionNumberLetter,
                e.valueAsNumber
              ),
            }))
          }
        >
          <NumberInput.Control />
          <NumberInput.Input
            placeholder="Number"
            border="1px solid"
            borderColor="gray.300"
          />
        </NumberInput.Root>
      </Group>
    </Stack>
  );
};

export default Section;
