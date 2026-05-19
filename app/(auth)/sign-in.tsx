import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter, type Href } from "expo-router";
import { useSignIn } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const isLoading = fetchStatus === "fetching";

  const handleSubmit = async () => {
    setLocalError("");

    try {
      const { error } = await signIn.password({
        emailAddress,
        password,
      });

      if (error) {
        console.error(JSON.stringify(error, null, 2));
        posthog.capture("user_sign_in_failed", { error_message: String(error) });
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log("Session task:", session.currentTask);
              return;
            }
            posthog.identify(emailAddress, { $set: { email: emailAddress } });
            posthog.capture("user_signed_in", { email: emailAddress });
            const url = decorateUrl("/");
            router.replace(url as Href);
          },
        });
      } else {
        console.log("Sign-in not complete:", signIn.status);
        setLocalError("Sign-in could not be completed. Please try again.");
        posthog.capture("user_sign_in_failed", { reason: "incomplete" });
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Something went wrong";
      setLocalError(message);
      posthog.capture("user_sign_in_failed", { error_message: message });
    }
  };

  // Get field-level errors from Clerk
  const emailError = errors?.fields?.identifier?.message;
  const passwordError = errors?.fields?.password?.message;

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="auth-scroll"
        >
          <View className="auth-content">
            {/* Brand */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurlly</Text>
                  <Text className="auth-wordmark-sub">
                    Subscription Tracker
                  </Text>
                </View>
              </View>
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to manage your subscriptions
              </Text>
            </View>

            {/* Form card */}
            <View className="auth-card">
              <View className="auth-form">
                {/* Email */}
                <View className="auth-field">
                  <Text className="auth-label">Email address</Text>
                  <TextInput
                    className={`auth-input ${emailError ? "auth-input-error" : ""}`}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                  />
                  {emailError && (
                    <Text className="auth-error">{emailError}</Text>
                  )}
                </View>

                {/* Password */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${passwordError ? "auth-input-error" : ""}`}
                    secureTextEntry
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    value={password}
                    onChangeText={setPassword}
                  />
                  {passwordError && (
                    <Text className="auth-error">{passwordError}</Text>
                  )}
                </View>

                {/* Local error */}
                {localError ? (
                  <Text className="auth-error">{localError}</Text>
                ) : null}

                {/* Submit */}
                <TouchableOpacity
                  className={`auth-button ${
                    !emailAddress || !password || isLoading
                      ? "auth-button-disabled"
                      : ""
                  }`}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={!emailAddress || !password || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer link */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">{"Don't have an account?"}</Text>
              <Link href="/(auth)/sign-up">
                <Text className="auth-link">Sign Up</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}