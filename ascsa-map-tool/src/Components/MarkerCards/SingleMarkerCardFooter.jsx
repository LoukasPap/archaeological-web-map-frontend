import {
  Button,
  Text,
  LinkBox,
  LinkOverlay,
  Clipboard,
  Card,
  Group,
  Icon,
  useClipboard,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  LuGlobe,
  LuMapPinCheckInside,
  LuMapPin,
  LuExternalLink,
} from "react-icons/lu";

export const MarkerButton = ({ id, label, icon, onClick = null }) => {
  return (
    <Button
      flexGrow={1}
      w="1"
      h="75px"
      key={id}
      variant="solid"
      _first={{roundedBottomLeft:"xl"}}
      _last={{roundedBottomRight:"xl"}}
      _hover={{ bg: "gray.800" }}
      color="white"
      flexDir="column"
      onClick={onClick}
      _target={"blank"}
    >
      {icon} 

      <Group gap={1}>
        <Text textStyle="lg">{label}</Text>
        {label=="Source" && <Icon size="sm"><LuExternalLink /></Icon>}
      </Group>
    </Button>
  );
};

// Mobile drawer variant: two standard buttons inside the drawer
const CompactFooter = ({ source, coords = "-" }) => {
  const clipboard = useClipboard({ value: String(coords) });

  return (
    <Card.Footer
      w="100%"
      flexDir="row"
      gap="3"
      p="3"
      borderTop="1px solid"
      borderColor="gray.300"
      bg="white"
    >
      <Button flexGrow={1} w="1" size="lg" variant="outline" onClick={clipboard.copy}>
        {clipboard.copied ? <LuMapPinCheckInside /> : <LuMapPin />}
        {clipboard.copied ? "Copied" : "Location"}
      </Button>

      <Button flexGrow={1} w="1" size="lg" asChild>
        <a href={source} target="_blank" rel="noreferrer">
          <LuGlobe />
          Source
          <LuExternalLink />
        </a>
      </Button>
    </Card.Footer>
  );
};

const SingleMarkerCardFooter = ({ source, coords = "-", compact = false }) => {
  if (compact) return <CompactFooter source={source} coords={coords} />;


  const customStyle = { width: "2.25em", height: "2.25em" };

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card.Footer
      w="100%"
      p="0"
      roundedBottom="xl"
      backgroundClip="content-box"
      justifyContent="center"
      flexDir="row"
      gap={0}
      bg="gray.900"
    >
      
      <MarkerButton
        id="coords-action"
        label="Location"
        icon={
          <Clipboard.Root value={coords} onStatusChange={handleCopy}>
            <Clipboard.Trigger asChild>
              {copied ? (
                <LuMapPinCheckInside style={customStyle} strokeWidth="1.5px" />
              ) : (
                <LuMapPin style={customStyle} strokeWidth="1.5px" />
              )}
            </Clipboard.Trigger>
          </Clipboard.Root>
        }
        onClick={handleCopy}
      />

      <MarkerButton
        id="source-action"
        label="Source"
        icon={
          <LinkBox>
            <LinkOverlay href={source} target="_blank">
              <LuGlobe style={customStyle} strokeWidth="1.5px" />
            </LinkOverlay>
          </LinkBox>
        }
      />
    </Card.Footer>
  );
};

export default SingleMarkerCardFooter;
