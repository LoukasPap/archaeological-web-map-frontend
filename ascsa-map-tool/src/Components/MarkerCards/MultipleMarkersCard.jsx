import {
  Field,
  Button,
  Card,
  For,
  Text,
  Pagination,
  Box,
  ButtonGroup,
  IconButton,
  HStack,
  Image,
  VStack,
  Input,
  Dialog,
  Portal,
  Stack,
  Group,
  Center,
} from "@chakra-ui/react";

import { useState, useRef } from "react";
import {
  LuSaveAll,
  LuChevronLeft,
  LuChevronRight,
  LuCircleX,
  LuSave,
  LuLock,
  LuArrowRight,
} from "react-icons/lu";

import { MarkerButton } from "./SingleMarkerCardFooter";
import BottomSheet from "./BottomSheet";
import useIsMobile from "../../CustomHooks/useIsMobile";
import useAuth from "../../CustomHooks/useAuth";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCollectionDB, fetchPointData, pointQueryKey } from "../../Queries";
import { getShapeProperties } from "../../Helpers/ShapeHelpers";

const eraToColorMapping = {
  Neolithic: "gray.700",
  "Bronze Age": "orange.700",
  Geometric: "yellow.400",
  Protoattic: "yellow.200",
  Archaic: "blue.900",
  Classical: "blue.700",
  "Late Classical": "blue.500",
  Hellenistic: "blue.300",
  Roman: "red.500",
  "Late Roman": "red.400",
  Byzantine: "orange.500",
  Frankish: "green.500",
  Ottoman: "yellow.600",
  Modern: "pink.500",
  Unknown: "gray.950",
};

const MultipleMarkersCard = ({
  collection = {},
  markers,
  saveCollection,
  isSavedInCollection,
  isVisible,
  onMarkerClick,
  onClose,
}) => {
  
  const isMobile = useIsMobile();
  const pageSize = 25;
  const [page, setPage] = useState(1);

  const startRange = (page - 1) * pageSize;
  const endRange = startRange + pageSize;

  const visibleMarkers =
    collection.markers != undefined
      ? collection.markers.slice(startRange, endRange)
      : markers;

  const lastSelected = useRef("-1");

  const qc = useQueryClient();
  const { user, isAuthenticated, openAuthDialog } = useAuth();

  const addCollectionMutation = useMutation({
    mutationFn: (data) => addCollectionDB(data),
    onError: (error) => {
      console.log(`Error storing collection: ${error?.status ?? error}`);
      if (error?.status === 401) {
        openAuthDialog("Your session expired. Please log in again to save this collection.");
      }
    },
  });

  async function save(c) {
    const savedCollectionDB = {
      ...collection,
      id: collection.id,
      username: user?.username,
      name: c.name,
      description: c.description,
      shape: getShapeProperties(collection.type, collection.shape),
      isSaved: true,
    };

    await addCollectionMutation.mutateAsync(savedCollectionDB);

    const savedCollection = {
      ...savedCollectionDB,
      shape: collection.shape
    };

    saveCollection(savedCollection);
  }

  const Marker = ({ info }) => {
    return (
      <Button
        alignContent="center"
        h="60px"
        minH="60px"
        w="100%"
        rounded="md"
        bg="gray.100"
        _hover={{ bg: "gray.200" }}
        overflow="hidden"
        p={0}
        variant="outline"
        border={lastSelected.current == info.Name ? "1px solid black" : "none"}
      >
        <HStack w="100%" gap={4} pl="5px" pr="5px" justifyContent="start">
          <Image
            src={
              info.Images != null &&
              (info.Images[2] || info.Images[1] || info.Images[0])
            }
            w="50px"
            maxW="50px"
            h="50px"
            rounded="sm"
          />
          <Group flexGrow={1} gap={3}>
            <Box
              bg={eraToColorMapping[info.Era]}
              border="1px solid"
              borderColor={eraToColorMapping[info.Era]}
              w="10px"
              h="30px"
              rounded="sm"
              transition="all 0.25s ease-out"
            />
            <VStack alignItems="self-start" maxW="180px" w="fit" gap={1}>
              <Text
                textAlign="start"
                fontWeight="regular"
                fontSize="lg"
                whiteSpace="normal"
              >
                {info.Title || info.Name}
              </Text>
              {info.Title && (
                <Text fontSize="md" color="gray">
                  {info.Name}
                </Text>
              )}
            </VStack>
          </Group>

          <IconButton
            mr={2}
            onClick={async () => {
              const res = await qc.fetchQuery({
                queryKey: pointQueryKey(info.Name),
                queryFn: () => fetchPointData(info.Name),
              });
              const point = res.point;
              onMarkerClick({ point });

              lastSelected.current = info.Name;
            }}
          >
            <LuArrowRight />
          </IconButton>
        </HStack>
      </Button>
    );
  };

  const Footer = ({ save }) => {
    const [nameValue, setNameValue] = useState("");
    const [descriptionValue, setDescriptionValue] = useState("");
    const [error, setError] = useState(false);
    const ref = useRef(null);

    function clearInput() {
      setNameValue("");
      setDescriptionValue("");
      setError(false);
    }

    return (
      <Card.Footer
        w="100%"
        justifyContent="center"
        p={0}
        flexDir="row"
        bg="black"
      >
        {!isSavedInCollection && !isAuthenticated ? (
          // Guests can group points, but saving needs an account
          <MarkerButton
            id="save-group"
            label="Log in to save"
            icon={
              <LuLock
                style={{ width: "2.25em", height: "2.25em" }}
                strokeWidth="1.5px"
              />
            }
            onClick={() =>
              openAuthDialog("Log in or create an account to save this collection.")
            }
          />
        ) : !isSavedInCollection ? (
          <>
            <Dialog.Root initialFocusEl={() => ref.current}>
              <Dialog.Trigger asChild>
                <MarkerButton
                  id="save-group"
                  label="Save"
                  icon={
                    <LuSave
                      style={{ width: "2.25em", height: "2.25em" }}
                      strokeWidth="1.5px"
                    />
                  }
                />
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.Header>
                      <Dialog.Title>Save Collection</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body pb="4">
                      <Stack gap="4">
                        <Field.Root required invalid={error}>
                          <Field.Label>
                            Name <Field.RequiredIndicator color="black" />
                          </Field.Label>
                          <Input
                            value={nameValue}
                            // _invalid={{border:"1px red solid"}}
                            onChange={(e) => setNameValue(e.target.value)}
                            required
                            placeholder="E.g. ProtoatticAmphoras2"
                            ref={ref}
                          />
                          <Field.ErrorText>
                            This field is required
                          </Field.ErrorText>
                        </Field.Root>

                        <Field.Root>
                          <Field.Label>Description</Field.Label>
                          <Input
                            value={descriptionValue}
                            onChange={(e) =>
                              setDescriptionValue(e.target.value)
                            }
                            placeholder="A short description of the collection"
                          />
                        </Field.Root>
                      </Stack>
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="outline" onClick={clearInput}>
                          Cancel
                        </Button>
                      </Dialog.ActionTrigger>
                      <Button
                        onClick={() => {
                          if (nameValue == "" || nameValue == null) {
                            setError(true);
                          } else {
                            save({
                              name: nameValue,
                              description: descriptionValue,
                              saved: true,
                            });
                          }
                        }}
                      >
                        Save
                      </Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          </>
        ) : (
          <Center fontSize="xl" color="white" h="75px">
            {collection.name}
          </Center>
        )}
      </Card.Footer>
    );
  };

  const headerSection = (
      <Card.Header>
        <Text>
          selection:{" "}
          <b>
            {collection.markers != undefined ? collection.markers.length : 0}
          </b>
        </Text>

        <Pagination.Root
          w="30px"
          count={markers.length}
          pageSize={pageSize}
          page={page}
          onPageChange={(e) => setPage(e.page)}
          siblingCount={1}
        >
          <ButtonGroup attached variant="subtle" size="xl">
            <Pagination.PrevTrigger asChild>
              <IconButton border="1px solid" color="gray.400">
                <LuChevronLeft />
              </IconButton>
            </Pagination.PrevTrigger>

            <Pagination.Items
              render={(page) => (
                <IconButton
                  border="1px solid"
                  color="gray.400"
                  _selected={{
                    bg: "gray.400",
                    border: "1px solid",
                    borderColor: "gray.400",
                    color: "white",
                  }}
                >
                  {page.value}
                </IconButton>
              )}
            />

            <Pagination.NextTrigger asChild>
              <IconButton border="1px solid" color="gray.400">
                <LuChevronRight />
              </IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      </Card.Header>
  );

  const bodySection = (
      <Card.Body
        pt="0"
        gap="2"
        overflow="auto"
        minH="0"
        scrollbarColor="black transparent"
        scrollbarWidth="thin"
      >
        <For each={visibleMarkers} fallback={["-"]}>
          {(item, index) => <Marker info={item} key={index} />}
        </For>
      </Card.Body>
  );

  // Mobile: bottom drawer (peek -> tap / drag up for the full list)
  if (isMobile) {
    return (
      <BottomSheet
        isVisible={isVisible}
        resetKey={collection.id}
        onClose={() => onClose?.()}
        header={headerSection}
      >
        {bodySection}
        <Footer save={save} />
      </BottomSheet>
    );
  }

  return (
    <Card.Root
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition: "opacity 0.5s",
      }}
      w={{ md: "max(20vw, 320px)", lg: "max(20vw, 340px)", xl: "20vw" }}
      position="fixed"
      top="12px"
      right="12px"
      maxH="calc(100% - 12px*2)" // we set 12px * 2 to take into the 12px distance from top and bottom
      rounded="xl"
      border="1px solid"
      borderColor="gray.300"
      gap={2}
      overflow="auto"
    >
      {headerSection}
      {bodySection}
      <Footer save={save} />
    </Card.Root>
  );
};

export default MultipleMarkersCard;
