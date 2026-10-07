import {
  Box,
  CloseButton,
  Drawer,
  Portal,
  Avatar,
  Image,
  Text,
  IconButton,
  Icon,
  Link,
  Float,
  For,
  Separator,
} from "@chakra-ui/react";
import { LuExternalLink, LuLogIn, LuLogOut, LuMenu, LuSettings } from "react-icons/lu";
import { useState } from "react";
import useAuth from "../CustomHooks/useAuth";

const MainMenu = () => {
  const { user, isAuthenticated, logout, openAuthDialog } = useAuth();
  const [open, setOpen] = useState(false);

  const menuActions = isAuthenticated
    ? [
        {
          label: "Logout",
          color: "red",
          icon: <LuLogOut />,
          action: () => {
            setOpen(false);
            logout();
          },
        },
      ]
    : [
        {
          label: "Log in / Sign up",
          color: "blue",
          icon: <LuLogIn />,
          action: () => {
            setOpen(false);
            openAuthDialog("Log in or create an account to save your collections.");
          },
        },
      ];

  const MenuItem = ({ item }) => {
    return (
      <IconButton
        w="full"
        h="14"
        ps="20px"
        variant="ghost"
        justifyContent="start"
        colorPalette={item.color}
        onClick={item.action}
      >
        <Icon>{item.icon}</Icon>
        {item.label}
      </IconButton>
    );
  };

  return (
    <Drawer.Root
      size="sm"
      placement="start"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Drawer.Trigger asChild>
        <IconButton
          variant="surface"
          bg="white"
          rounded="xl"
          h={{ base: "100%", md: "10" }}
          minW="10"
          _hover={{ bg: "gray.200" }}
        >
          <Icon size="lg" color={"gray.900"}>
            <LuMenu />
          </Icon>
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header gap={4}>
              <Avatar.Root size="lg" colorPalette="gray" variant="outline">
                <Avatar.Fallback />
                <Avatar.Image src="./coin-img.png" size="md" />
              </Avatar.Root>
              <Drawer.Title fontSize="2xl" color="gray.800">
                {isAuthenticated ? user.username : "Guest"}
              </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <For
                each={menuActions}
                fallback={[{ label: "1", icon: <LuSettings /> }]}
              >
                {(item, index) => (
                  <>
                    <MenuItem item={item} />
                    <Separator size="sm" />
                  </>
                )}
              </For>
            </Drawer.Body>
            <Link unstyled href="https://www.ascsa.edu.gr/" target="_blank">
              <Drawer.Footer
                borderTop="1px solid"
                borderTopColor="gray.300"
                justifyContent="center"
                p="10px"
              >
                <Image
                  src="./bronze-ascsa-logo.png"
                  draggable={false}
                  boxSize="50px"
                  borderRadius="full"
                  fit="contain"
                  alt="ASCSA Logo"
                />
                <Box pos="relative">
                  <Float>
                    <LuExternalLink />
                  </Float>
                  <Text
                    color="#69A100"
                    fontSize="lg"
                    fontWeight="light"
                    lineHeight="1"
                  >
                    AMERICAN SCHOOL OF
                    <br />
                    CLASSICAL STUDIES AT ATHENS
                  </Text>
                  <Text color="gray.400" fontSize="xl" fontWeight="light">
                    Research Map Tool
                  </Text>
                </Box>
              </Drawer.Footer>
            </Link>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default MainMenu;
