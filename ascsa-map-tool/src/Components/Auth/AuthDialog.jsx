import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Image,
  Input,
  Portal,
  Spinner,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";

import { registerUser, loginUser } from "../../Queries";
import useAuth from "../../CustomHooks/useAuth";
import { Alert } from "../ui/alert";
import { PasswordInput } from "../ui/password-input";

const usernameRules = {
  required: { value: true, message: "Field is required" },
  minLength: { value: 3, message: "Minimum 3 characters" },
  maxLength: { value: 20, message: "Maximum 20 characters" },
};

const passwordRules = {
  required: { value: true, message: "Field is required" },
  minLength: { value: 5, message: "Minimum 5 characters" },
  maxLength: { value: 30, message: "Maximum 30 characters" },
};

const LoginForm = ({ onAuthenticated }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [serverError, setServerError] = useState("");

  const loginMut = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.access_token) onAuthenticated(data.access_token);
    },
    onError: (err) => {
      const detail = err?.payload?.detail;
      setServerError(typeof detail === "string" ? detail : "Login failed");
    },
  });

  const onSubmit = (data) => {
    setServerError("");
    loginMut.mutate({ username: data.loginUsername, password: data.loginPassword });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="4">
        <Field.Root required invalid={!!errors.loginUsername}>
          <Field.Label fontSize="lg">
            Username
            <Field.RequiredIndicator color="black" />
          </Field.Label>
          <Input size="lg" {...register("loginUsername", usernameRules)} />
          <Field.ErrorText>{errors.loginUsername?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root required invalid={!!errors.loginPassword}>
          <Field.Label fontSize="lg">
            Password
            <Field.RequiredIndicator color="black" />
          </Field.Label>
          <PasswordInput {...register("loginPassword", passwordRules)} />
          <Field.ErrorText>{errors.loginPassword?.message}</Field.ErrorText>
        </Field.Root>

        <Button type="submit" disabled={loginMut.isPending}>
          {loginMut.isPending ? <Spinner /> : "Log in"}
        </Button>
        {serverError && <Text color="red">{serverError}</Text>}
      </Stack>
    </form>
  );
};

const RegisterForm = ({ onAuthenticated }) => {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm();
  const [serverError, setServerError] = useState("");

  // The API does not return a token on register, so log in right after
  const registerMut = useMutation({
    mutationFn: async (body) => {
      await registerUser(body);
      return loginUser(body);
    },
    onSuccess: (data) => {
      if (data.access_token) onAuthenticated(data.access_token);
    },
    onError: (err) => {
      const detail = err?.payload?.detail;
      if (detail && typeof detail === "object") {
        if (detail.username)
          setError("registerUsername", { type: "server", message: detail.username });
        if (detail.password)
          setError("registerPassword", { type: "server", message: detail.password });
      } else {
        setServerError(err?.payload?.message || "Registration failed");
      }
    },
  });

  const onSubmit = (data) => {
    setServerError("");
    registerMut.mutate({
      username: data.registerUsername,
      password: data.registerPassword,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="4">
        <Field.Root required invalid={!!errors.registerUsername}>
          <Field.Label fontSize="lg">
            Username
            <Field.RequiredIndicator color="black" />
          </Field.Label>
          <Input size="lg" {...register("registerUsername", usernameRules)} />
          <Field.ErrorText>{errors.registerUsername?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root required invalid={!!errors.registerPassword}>
          <Field.Label fontSize="lg">
            Password
            <Field.RequiredIndicator color="black" />
          </Field.Label>
          <PasswordInput {...register("registerPassword", passwordRules)} />
          <Field.ErrorText>{errors.registerPassword?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root required invalid={!!errors.confirmPassword}>
          <Field.Label fontSize="lg">
            Confirm Password
            <Field.RequiredIndicator color="black" />
          </Field.Label>
          <PasswordInput
            {...register("confirmPassword", {
              required: "Field is required",
              validate: (value) =>
                value === getValues("registerPassword") || "Passwords do not match",
            })}
          />
          <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
        </Field.Root>

        <Button type="submit" disabled={registerMut.isPending}>
          {registerMut.isPending ? <Spinner /> : "Create account"}
        </Button>
        {serverError && <Text color="red">{serverError}</Text>}
      </Stack>
    </form>
  );
};

/** Login / Register dialog shown over the map; opened with useAuth().openAuthDialog(message) */
const AuthDialog = () => {
  const qc = useQueryClient();
  const { authDialog, closeAuthDialog, login, sessionExpired } = useAuth();

  const handleAuthenticated = (token) => {
    login(token);
    qc.invalidateQueries({ queryKey: ["collectionData"] });
    closeAuthDialog();
  };

  const message = authDialog.message || (sessionExpired ? "Your session expired. Please log in again." : "");

  return (
    <Dialog.Root
      open={authDialog.open}
      onOpenChange={(e) => !e.open && closeAuthDialog()}
      placement="center"
      scrollBehavior="inside"
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner px="3">
          <Dialog.Content maxW="sm">
            <Dialog.Header gap="3">
              <Image
                src="./bronze-ascsa-logo.png"
                draggable={false}
                boxSize="40px"
                borderRadius="full"
                fit="contain"
                alt="ASCSA Logo"
              />
              <Dialog.Title fontSize="xl">Research Map Tool</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap="4">
                {message && <Alert w="full" variant="surface" status="info" title={message} />}

                <Tabs.Root defaultValue="login" fitted variant="line">
                  <Tabs.List>
                    <Tabs.Trigger value="login" fontSize="lg">
                      Log in
                    </Tabs.Trigger>
                    <Tabs.Trigger value="register" fontSize="lg">
                      Sign up
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="login" pt="4">
                    <LoginForm onAuthenticated={handleAuthenticated} />
                  </Tabs.Content>
                  <Tabs.Content value="register" pt="4">
                    <RegisterForm onAuthenticated={handleAuthenticated} />
                  </Tabs.Content>
                </Tabs.Root>

                <HStack justify="center">
                  <Text fontSize="sm" color="gray.500">
                    You can keep browsing as a guest. An account is only needed to save collections.
                  </Text>
                </HStack>
              </Stack>
            </Dialog.Body>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default AuthDialog;
