import {
  DataList,
  Button,
  Text,
  Card,
  SimpleGrid,
  Separator,
  HStack,
  Clipboard,
  Group,
  IconButton,
  CloseButton,
  For,
  Image,
  Heading,
  Box,
  Tag,
  Center,
  Tabs,
} from "@chakra-ui/react";
import {
  LuCopy,
  LuX,
  LuGlobe,
} from "react-icons/lu";

import { Tooltip } from "../ui/tooltip";

import { useEffect, useState } from "react";
import SingleMarkerCardFooter from "./SingleMarkerCardFooter";
import DimensionsTable from "./DimensionsTable";

const initialObject = {
  inventory: "name",
  title: "title",
  period: "period",
  era: "era",
  chronology: "chronology",
  section: "section",
  date: "date",
  material: "material",
  reverse: "reverse",
  obverse: "obverse",
  context: "context",
  description: "description",
  coords: [23.722605, 37.976641],
  dimensions: [],
  type: "type",
  category: "category",
  link: "https://ascsa.net",
  images: [],
  lot: "lot",
  deposit: "deposit",
};

const propList = ["title", "section", "period", "material"];

const CoinsExtraDetails = ({ obverse, reverse }) => {
  return (
    <Tabs.Root defaultValue="obverse" variant="plain" pl="0px" fitted>
      <Tabs.List bg="bg.muted" rounded="l3" p="1">
        <Tabs.Trigger
          value="obverse"
          _selected={{ bg: "gray.300" }}
          fontSize="lg"
        >
          Obverse
        </Tabs.Trigger>
        <Tabs.Trigger
          value="reverse"
          _selected={{ bg: "gray.300" }}
          fontSize="lg"
        >
          Reverse
        </Tabs.Trigger>
        <Tabs.Indicator rounded="l2" />
      </Tabs.List>
      <Tabs.Content value="obverse">{obverse}</Tabs.Content>
      <Tabs.Content value="reverse">{reverse}</Tabs.Content>
    </Tabs.Root>
  );
};

const SingleMarkerCard = ({ marker, toggleCard, isVisible }) => {
  const [pointDetails, setPointDetails] = useState(initialObject);

  useEffect(() => {
    if (marker) {
      setPointDetails({
        ...pointDetails,

        inventory: marker.Name,
        title: marker.Title || "N/A",
        period: marker.Period || "N/A", // goes with Chronology
        era: marker.Era || "N/A",
        chronology: marker.Chronology || "N/A",

        section: marker.SectionNumber || "N/A",
        date: marker.Date || "N/A",

        material: marker.Material.join(", ") || "N/A",
        reverse: marker.Reverse || "N/A",
        obverse: marker.Obverse || "N/A",
        context: marker.Context || "N/A",

        description: marker.Description || "N/A",
        coords: marker.geometry.coordinates,

        dimensions: marker.FormattedDimensions || [],
        type: marker.Type || "N/A",
        category: marker.Category || "N/A",

        link: `https://ascsa-net.gr/id/agora/${marker.Type}/${marker.Name}`, // https://ascsa-net.gr/id/agora/coin/n 205887
        images: marker.Images || [],

        lot: marker.Lot || "N/A",
        deposit: marker.Deposit || "N/A",
      });
    }
  }, [marker]);


  const calculateAspectRatio = (width, height) => {
    // Simplify the ratio
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);

    const simplifiedWidth = width / divisor;
    const simplifiedHeight = height / divisor;

    return {
      ratio: simplifiedWidth / simplifiedHeight,
      displayRatio: `${simplifiedWidth}:${simplifiedHeight}`,
    };
  };

  function CustomImage({ src }) {
    return (
      <Image
        border="1px solid black"
        h="100px"
        src={src}
        fit="fill"
        rounded="md"
        onLoad={(e) => {
          const { width, height } = e.target;
          const { ratio, displayRatio } = calculateAspectRatio(width, height);
          e.target.style.aspectRatio = ratio;
        }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }

  function isMonumentType(type) {
    if (type == "monument") return true;
    return false;
  }

  const Header = () => {
    return (
      <DataList.Root w="100%">
        <HStack gap={3} alignItems="top">
          <DataList.Item key="inventory" flexGrow={1}>
            <DataList.ItemLabel>Inventory</DataList.ItemLabel>
            <DataList.ItemValue>
              <Group>
                <Card.Title h="fit" overflow="visible">
                  <Text fontSize="2xl">
                    {(marker && isMonumentType(pointDetails.type)
                      ? "-"
                      : pointDetails.inventory) || "-"}
                  </Text>
                </Card.Title>

                <Clipboard.Root
                  value={
                    (marker && `Agora:Object:${pointDetails.inventory}`) || "-"
                  }
                >
                  <Clipboard.Trigger asChild>
                    <IconButton _hover={{ bg: "gray.300" }} variant="plain">
                      <Clipboard.Indicator>
                        <LuCopy size={30} />
                      </Clipboard.Indicator>
                    </IconButton>
                  </Clipboard.Trigger>
                </Clipboard.Root>
              </Group>
            </DataList.ItemValue>
          </DataList.Item>

          <DataList.Item key="deposit">
            <DataList.ItemLabel>Deposit</DataList.ItemLabel>
            <DataList.ItemValue>
              <Tag.Root colorPalette="blue" size="xl">
                <Tag.Label>{pointDetails.deposit}</Tag.Label>
              </Tag.Root>
            </DataList.ItemValue>
          </DataList.Item>

          <DataList.Item key="lot">
            <DataList.ItemLabel>Lot</DataList.ItemLabel>
            <DataList.ItemValue>
              <Tag.Root colorPalette="orange" size="xl">
                <Tag.Label>{pointDetails.lot}</Tag.Label>
              </Tag.Root>
            </DataList.ItemValue>
          </DataList.Item>
        </HStack>
      </DataList.Root>
    );
  };

  return (
    <Card.Root
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition: "opacity 0.5s",
      }}
      w="20vw"
      position="fixed"
      top="12px"
      right="12px"
      maxH="calc(100% - 12px*2)" // we set 12px * 2 to take into the 12px distance from top and bottom
      rounded="xl"
      border="1px solid"
      borderColor="gray.300"
      scrollbarColor="black transparent"
      scrollbarWidth="thin"
    >
      <Card.Header mt="2">
        <HStack
          alignItems="center"
          justifyContent="space-between"
          h="fit"
          gap="1"
        >
          <Header />

          <CloseButton
            _hover={{ bg: "gray.300" }}
            onClick={() => {
              toggleCard("");
            }}
          >
            <LuX style={{ width: "2em", height: "auto" }} />
          </CloseButton>
        </HStack>
        <Separator size="sm" mt={1} borderColor={"gray.300"} />
      </Card.Header>

      <Card.Body gap="4" maxH="100%" overflow="auto">
        <DataList.Root color="black" size="lg">
          <SimpleGrid columns={3} gap="4">
            {propList.map((prop) => (
              <DataList.Item
                key={prop}
                gridColumn={prop == "title" ? "span 3" : "span 1"}
              >
                <DataList.ItemLabel
                  fontSize="xl"
                  fontWeight="semibold"
                  color="black"
                >
                  {prop.charAt(0).toUpperCase() + prop.slice(1)}
                </DataList.ItemLabel>
                <DataList.ItemValue fontSize={"lg"}>
                  {prop === "title" && isMonumentType(pointDetails["type"])
                    ? pointDetails["inventory"]
                    : pointDetails[prop]}

                  {prop === "period" && ` (${pointDetails.era})`}
                </DataList.ItemValue>
              </DataList.Item>
            ))}

            {pointDetails.category == "Coin" && (
              <Box gridColumn="span 2">
                <CoinsExtraDetails
                  obverse={pointDetails.obverse}
                  reverse={pointDetails.reverse}
                />
              </Box>
            )}

            <Box gridColumn="span 3">
              <Heading mb="1">Dimensions</Heading>
              <DimensionsTable dimensions={pointDetails.dimensions} />
            </Box>
          </SimpleGrid>
        </DataList.Root>

        <Box>
          <Heading mb={2}>Images</Heading>
          <HStack
            gap="4"
            h="fit"
            maxH="125px"
            overflowX="auto"
            // pb="0.8em"
            css={{ "-webkit-padding-after": "-1em" }}
            scrollbarColor="black transparent"
            scrollbarWidth="thin"
            onWheel={(e) => {
              e.preventDefault();
              e.currentTarget.scrollBy({
                left: e.deltaY * 2.5,
                behavior: "smooth",
              });
            }}
          >
            <For
              each={pointDetails["images"].slice(0, 8)}
              fallback={<Text color="gray">No images</Text>}
            >
              {(item, index) => <CustomImage key={index} src={item} />}
            </For>

            {+pointDetails["images"].length > 8 ? ( // prefixing "+" transforms str to int
              <Button
                w="100px"
                h="100px"
                variant="plain"
                border="1px dashed black"
              >
                <Text>
                  <Center mb={2}>
                    <LuGlobe size="lg" />
                  </Center>
                  Visit source
                  <br />
                  for more images
                </Text>
              </Button>
            ) : null}
          </HStack>
        </Box>

        <Box>
          <Heading>Description</Heading>
          <Text
            textAlign="justify"
            maxH="20vh"
            overflowY="auto"
            scrollbarColor="black transparent"
            scrollbarWidth="thin"
            pr="1em"
          >
            {pointDetails["description"]}
          </Text>
        </Box>
      </Card.Body>

      <SingleMarkerCardFooter
        source={pointDetails.link}
        coords={pointDetails.coords}
      />
    </Card.Root>
  );
};

export default SingleMarkerCard;
