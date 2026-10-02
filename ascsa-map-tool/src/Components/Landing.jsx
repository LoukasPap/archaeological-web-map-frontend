import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Box,
  Button,
  Center,
  Field,
  Heading,
  HStack,
  Image,
  Input,
  Separator,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";

import { useForm } from "react-hook-form";

import { registerUser, loginUser } from "../Queries";
import { useLocation, useNavigate } from "react-router-dom";

import { Alert } from "./ui/alert";
import { PasswordInput } from "./ui/password-input";

const Landing = () => {
  const { state } = useLocation();

  const loginForm = useForm();
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    setError: setLoginError,
    clearErrors: clearLoginErrors,
  } = loginForm;

  const registerForm = useForm();
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    getValues: getRegisterValues,
    setError: setRegisterError,
    clearErrors: clearRegisterErrors,
  } = registerForm;

  const [loginServerError, setLoginServerError] = useState("");
  const [registerServerError, setRegisterServerError] = useState("");

  const nav = useNavigate();
  const loginMut = useMutation({
    mutationFn: loginUser,
    onMutate: () => {
    },
    onSuccess: (data) => {
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        nav("/map");
      }
    },

    onError: (err) => {
      console.log(err);

      setLoginServerError("");
      // map field errors if provided
      const payload = err?.payload;

      setLoginServerError(payload.detail || "Login failed");
    },
  });

  const isLoadingLogin = loginMut.isPending;

  const onLogin = (data) => {
    clearLoginErrors();
    setLoginServerError("");
    loginMut.mutate({
      username: data.loginUsername,
      password: data.loginPassword,
    });
  };

  const onRegister = (data) => {
    clearRegisterErrors();
    setRegisterServerError("");
    registerMut.mutate({
      username: data.registerUsername,
      password: data.registerPassword,
    });
  };

  const registerMut = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      nav("/", {
        replace: true,
        state: {
          message:
            "Your account has been created successfully. You can now login.",
          status: "success",
        },
      });
    },
    onError: (err) => {
      setRegisterServerError("");
      const payload = err?.payload;
      if (payload?.detail && typeof payload.detail === "object") {
        const e = payload.detail;

        if (e.username)
          setRegisterError("registerUsername", {
            type: "server",
            message: e.username,
          });
        if (e.password)
          setRegisterError("registerPassword", {
            type: "server",
            message: e.password,
          });
      } else {
        setRegisterServerError(payload?.message || "Registration failed");
      }
    },
  });

  const isLoadingRegister = registerMut.isPending;

  const checkPasswordsMatch = (value) => {
    if (value != getRegisterValues("registerPassword")) {
      return "Passwords do not match";
    }
    return true;
  };

  return (
    <Center h="100%" overflow="auto">
      <Stack gap={{ base: 8, lg: 16 }} my="10" px="4" align={"center"}>
        {state && state.message && (
          <Alert
            w="fit"
            variant="surface"
            title={state.message}
            status={state.status}
          />
        )}
        <HStack gap={4}>
          <Image
            src="./bronze-ascsa-logo.png"
            draggable={false}
            boxSize="60px"
            borderRadius="full"
            fit="contain"
            alt="ASCSA Logo"
          />
          <Box>
            <Text
              color="#69A100"
              fontSize={{ base: "md", sm: "xl", md: "2xl" }}
              fontWeight={"light"}
              lineHeight="1"
            >
              AMERICAN SCHOOL OF
              <br />
              CLASSICAL STUDIES AT ATHENS
            </Text>
            <Text color="gray.400" fontSize={{ base: "lg", md: "xl" }}>
              Research Map Tool
            </Text>
          </Box>
        </HStack>
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={{ base: 8, lg: 0 }} justifyItems={"center"}>
          <Stack gap="4" w="250px">
            <Heading as="h1" size={"3xl"}>
              Enter in your account
            </Heading>
            <form onSubmit={handleLoginSubmit(onLogin)}>
              <Stack gap="4" align="flex-start" maxW="sm">
                <Field.Root required invalid={!!loginErrors.loginUsername}>
                  <Field.Label fontSize={"lg"}>
                    Username
                    <Field.RequiredIndicator color="black" />
                  </Field.Label>
                  <Input
                    size="lg"
                    {...loginRegister("loginUsername", {
                      required: { value: true, message: "Field is required" },
                      minLength: { value: 3, message: "Minimum 3 characters" },
                      maxLength: {
                        value: 20,
                        message: "Maximum 20 characters",
                      },
                    })}
                  />
                  <Field.ErrorText>
                    {loginErrors.loginUsername?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root required invalid={!!loginErrors.loginPassword}>
                  <Field.Label fontSize={"lg"}>
                    Password
                    <Field.RequiredIndicator color="black" />
                  </Field.Label>

                  <PasswordInput
                    {...loginRegister("loginPassword", {
                      required: { value: true, message: "Field is required" },
                      minLength: {
                        value: 5,
                        message: "Minimum 5 characters",
                      },
                      maxLength: {
                        value: 30,
                        message: "Maximum 30 characters",
                      },
                    })}
                  />
                  <Field.ErrorText>
                    {loginErrors.loginPassword?.message}
                  </Field.ErrorText>
                </Field.Root>
                <Button type="submit" disabled={isLoadingLogin}>
                  {isLoadingLogin ? <Spinner /> : "Login"}
                </Button>
                <Text color="red">{loginServerError}</Text>
              </Stack>
            </form>
          </Stack>

          <Stack
            direction={{ base: "row", lg: "column" }}
            justifyContent={"center"}
            alignItems={"center"}
            w={{ base: "250px", lg: "100px" }}
          >
            <Separator
              flex="1"
              h={{ lg: "1/3" }}
              orientation={{ base: "horizontal", lg: "vertical" }}
              size="md"
              colorPalette="gray"
            />

            <Text flexShrink="0">or</Text>
            <Separator
              flex="1"
              h={{ lg: "1/3" }}
              orientation={{ base: "horizontal", lg: "vertical" }}
              size="md"
              colorPalette="gray"
            />
          </Stack>

          <Stack gap="4" w="250px">
            <Heading as="h1" size={"3xl"}>
              Create an account
            </Heading>
            <form onSubmit={handleRegisterSubmit(onRegister)}>
              <Stack gap="4" align="flex-start" maxW="sm">
                <Field.Root
                  required
                  invalid={!!registerErrors.registerUsername}
                >
                  <Field.Label fontSize={"lg"}>
                    Username
                    <Field.RequiredIndicator color="black" />
                  </Field.Label>
                  <Input
                    size="lg"
                    {...registerRegister("registerUsername", {
                      required: { value: true, message: "Field is required" },
                      minLength: { value: 3, message: "Minimum 3 characters" },
                      maxLength: {
                        value: 20,
                        message: "Maximum 20 characters",
                      },
                    })}
                  />
                  <Field.ErrorText>
                    {registerErrors.registerUsername?.message}
                  </Field.ErrorText>
                </Field.Root>

                {/* Password Field */}
                <Field.Root
                  required
                  invalid={!!registerErrors.registerPassword}
                >
                  <Field.Label fontSize={"lg"}>
                    Password
                    <Field.RequiredIndicator color="black" />
                  </Field.Label>

                  <PasswordInput
                    {...registerRegister("registerPassword", {
                      required: { value: true, message: "Field is required" },
                      minLength: {
                        value: 5,
                        message: "Minimum 5 characters",
                      },
                      maxLength: {
                        value: 30,
                        message: "Maximum 30 characters",
                      },
                    })}
                  />

                  <Field.ErrorText>
                    {registerErrors.registerPassword?.message}
                  </Field.ErrorText>
                </Field.Root>

                {/* Password Confirmation Field */}
                <Field.Root required invalid={!!registerErrors.confirmPassword}>
                  <Field.Label fontSize={"lg"}>
                    Confirm Password
                    <Field.RequiredIndicator color="black" />
                  </Field.Label>

                  <PasswordInput
                    {...registerRegister("confirmPassword", {
                      required: true,
                      validate: checkPasswordsMatch,
                    })}
                  />
                  <Field.ErrorText>
                    {registerErrors.confirmPassword?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Button type="submit" disabled={isLoadingRegister}>
                  {isLoadingRegister ? <Spinner /> : "Register"}
                </Button>
              </Stack>
            </form>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Center>
  );
};

export default Landing;
