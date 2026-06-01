import { Text, Card, Accordion, Heading, For, Group } from "@chakra-ui/react";

import { CheckboxCard } from "../ui/checkbox-card";
import { Switch } from "../ui/switch";
import { useState, useEffect } from "react";
import SectionsLayer from "./SectionsLayer";
import { LuAArrowDown } from "react-icons/lu";

const agoraImagesFolders = [
  "Agora Site",
  "Combined",
  "ΒΓ",
  "ΒΕ",
  "ΒΖ",
  "ΒΗ",
  "ΒΘ",
  "Γ",
  "Δ",
  "ΕΛ",
];

const SectionsLayerCard = ({ areLayersOpen, setImages, toggleTitles }) => {
  const [openItems, setOpenItems] = useState([]);
  const [sectionImages, setSectionImages] = useState([]);
  const [checked, setChecked] = useState(true);

  useEffect(() => {
    fetch("/sections.json")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setSectionImages)
      .catch((err) => console.error("Failed to load JSON:", err));
  }, []);

  useEffect(() => {
    setImages(sectionImages);
  }, [sectionImages]);

  return (
    <Card.Root
      style={{
        opacity: areLayersOpen ? 1 : 0,
        pointerEvents: areLayersOpen ? "auto" : "none",
        transition: "opacity 0.4s cubic-bezier(.4,0,.2,1)",
      }}
      w={{ sm: "30vw", md: "25vw", lg: "22.5vw" }}
      bg="white"
      rounded="xl"
      border="1px solid #C6C6C6"
      top="calc(3.5vh + 5px)"
      bottom="calc(12px + 12px)"
      position="absolute"
    >
      <Card.Header>
        <Text fontSize="3xl" fontWeight="bold">
          Map Layers
        </Text>
      </Card.Header>

      <Card.Body h="inherit" gap={3} overflow="auto">
        <Group
          w="100%"
          border="1px solid"
          borderColor={"gray.400"}
          p={2}
          rounded="lg"
          variant="raised"
        >
          <Switch
            indicator={<LuAArrowDown />}
            label="Toggle"
            size="lg"
            checked={checked}
            onCheckedChange={(e) => {
              setChecked(e.checked);
              toggleTitles(e.checked);
            }}
          />
          <Text>Titles {checked ? "Enabled" : "Disabled"}</Text>
        </Group>

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
          overflow="auto"
          scrollbarColor="black transparent"
          scrollbarGutter={"stable"}
          scrollbarWidth="thin"
        >
          <For each={agoraImagesFolders}>
            {(folder, index) => (
              <Accordion.Item value={folder} key={index} bg="white">
                <Accordion.ItemTrigger justifyContent="space-between">
                  <Heading fontWeight={"bold"} fontSize="md">
                    {folder}
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
                  <For
                    each={sectionImages.filter(
                      (section) => `${folder}/` == section.Path
                    )}
                  >
                    {(sec, idx) => (
                      <CheckboxCard
                        variant="surface"
                        key={sec.Name}
                        label={sec.Title}
                        description={sec.Date}
                        mb={5}
                        onChange={() => {
                          setSectionImages((prev) =>
                            prev.map((img) =>
                              img.Name === sec.Name
                                ? {
                                    ...img,
                                    Checked: !img.Checked,
                                  }
                                : img
                            )
                          );
                        }}
                      >
                        {sec.Title}
                      </CheckboxCard>
                    )}
                  </For>
                </Accordion.ItemContent>
              </Accordion.Item>
            )}
          </For>
        </Accordion.Root>
      </Card.Body>
    </Card.Root>
  );
};

export default SectionsLayerCard;
