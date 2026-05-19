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
import { useSignUp } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [localError, setLocalError] = useState("");

  const isLoading = fetchStatus === "fetching";

  // Step 1 – Create sign-up and send verification email
  const handleSignUp = async () => {
    setLocalError("");

    try {
      const { error } = await signUp.password({
        emailAddress,
        password,
      });

      if (error) {
        console.error(JSON.stringify(error, null, 2));
        posthog.capture("user_sign_up_failed", { error_message: String(error) });
        return;
      }

      // Send email verification code
      await signUp.verifications.sendEmailCode();
      posthog.capture("user_signed_up", { email: emailAddress });
      setPendingVerification(true);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Something went wrong";
      setLocalError(message);
      posthog.capture("user_sign_up_failed", { error_message: message });
    }
  };

  // Step 2 – Verify email code
  const handleVerify = async () => {
    setLocalError("");

    try {
      await signUp.verifications.verifyEmailCode({ code });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log("Session task:", session.currentTask);
              return;
            }
            posthog.identify(emailAddress, {
              $set: { email: emailAddress },
              $set_once: { first_sign_up_date: new Date().toISOString() },
            });
            posthog.capture("email_verification_completed", { email: emailAddress });
            const url = decorateUrl("/");
            router.replace(url as Href);
          },
        });
      } else {
        console.log("Sign-up not complete:", signUp.status);
        setLocalError("Verification could not be completed.");
        posthog.capture("user_sign_up_failed", { reason: "verification_incomplete" });
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid verification code";
      setLocalError(message);
      posthog.capture("user_sign_up_failed", { error_message: message });
    }
  };

  // Get field-level errors from Clerk
  const emailError = errors?.fields?.emailAddress?.message;
  const passwordError = errors?.fields?.password?.message;
  const codeError = errors?.fields?.code?.message;

  // ── Verification screen ──
  if (pendingVerification) {
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
                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We sent a code to {emailAddress}
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={`auth-input ${codeError ? "auth-input-error" : ""}`}
                      keyboardType="number-pad"
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      value={code}
                      onChangeText={setCode}
                    />
                    {codeError && (
                      <Text className="auth-error">{codeError}</Text>
                    )}
                  </View>

                  {localError ? (
                    <Text className="auth-error">{localError}</Text>
                  ) : null}

                  <TouchableOpacity
                    className={`auth-button ${
                      !code || isLoading ? "auth-button-disabled" : ""
                    }`}
                    onPress={handleVerify}
                    activeOpacity={0.8}
                    disabled={!code || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Verify Email</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    activeOpacity={0.8}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Sign-up screen ──
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
              <Text className="auth-title">Create an account</Text>
              <Text className="auth-subtitle">
                Track and manage all your subscriptions in one place
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
                    placeholder="Create a password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    value={password}
                    onChangeText={setPassword}
                  />
                  {passwordError && (
                    <Text className="auth-error">{passwordError}</Text>
                  )}
                  <Text className="auth-helper">
                    Must be at least 8 characters
                  </Text>
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
                  onPress={handleSignUp}
                  activeOpacity={0.8}
                  disabled={!emailAddress || !password || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer link */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in">
                <Text className="auth-link">Sign In</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}