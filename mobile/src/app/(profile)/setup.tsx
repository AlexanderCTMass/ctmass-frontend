import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { TextField } from "@/components/ui/text-field";
import { Colors, Spacing } from "@/constants/theme";
import { isValidUSPhone } from "@/lib/shop-form";
import { updateEditableProfile } from "@/lib/user-profile";
import { useProfile } from "@/queries/use-profile";
import { useAuthStore } from "@/store/use-auth-store";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  businessName: z.string().optional(),
  professionalRole: z.string().optional(),
  shortBio: z.string().optional(),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => !value?.trim() || isValidUSPhone(value),
      "Enter a valid US phone number (+1 and 10 digits)",
    ),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function SetupProfileScreen() {
  const uid = useAuthStore((state) => state.user?.uid);
  const role = useAuthStore((state) => state.user?.role ?? null);
  const isContractor = role === "WORKER";
  const queryClient = useQueryClient();
  const { data } = useProfile(uid);

  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      businessName: "",
      professionalRole: "",
      shortBio: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name,
      businessName: data.businessName,
      professionalRole: data.professionalRole,
      shortBio: data.shortBio,
      email: data.email,
      phone: data.phone,
      address: data.address,
    });
  }, [data, reset]);

  const submit = async (values: FormValues) => {
    if (!uid) return;
    setSaving(true);
    setTopError(null);
    const patch = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() ?? "",
      address: values.address?.trim() ?? "",
      ...(isContractor
        ? {
            businessName: values.businessName?.trim() ?? "",
            professionalRole: values.professionalRole?.trim() ?? "",
            shortBio: values.shortBio?.trim() ?? "",
          }
        : {}),
    };
    try {
      await updateEditableProfile(uid, patch);
      void queryClient.invalidateQueries({ queryKey: ["profile", uid] });
      router.back();
    } catch {
      setSaving(false);
      setTopError("Couldn't save your profile. Please try again.");
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Setup your profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {topError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{topError}</Text>
              </View>
            ) : null}

            <Text style={styles.intro}>
              This information is used across CTMASS — your chats, orders, and
              {isContractor ? " your public specialist profile." : " your requests."}
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Full name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  placeholder="Your name"
                  autoCapitalize="words"
                />
              )}
            />

            {isContractor ? (
              <>
                <Controller
                  control={control}
                  name="businessName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="Business / Company name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.businessName?.message}
                      placeholder="e.g. Bay State Renovations"
                      autoCapitalize="words"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="professionalRole"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="Professional title"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.professionalRole?.message}
                      placeholder="e.g. Licensed Electrician"
                      autoCapitalize="words"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="shortBio"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="About / Bio"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.shortBio?.message}
                      placeholder="Tell homeowners about your experience and specialties."
                      multiline
                      autoCapitalize="sentences"
                    />
                  )}
                />
              </>
            ) : null}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  placeholder="you@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Phone"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  placeholder="+1 (555) 123-4567"
                  keyboardType="phone-pad"
                  hint="US number: +1 followed by 10 digits"
                />
              )}
            />
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.address?.message}
                  placeholder="Street, city, state, ZIP"
                  multiline
                  autoCapitalize="words"
                />
              )}
            />

            <View style={styles.submit}>
              <PrimaryButton
                label={saving ? "Saving…" : "Save profile"}
                withArrow={false}
                loading={saving}
                disabled={saving}
                onPress={() => void handleSubmit(submit)()}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.base,
  },
  intro: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    borderRadius: 16,
    padding: Spacing.md,
    backgroundColor: "rgba(240,68,56,0.12)",
    borderWidth: 1,
    borderColor: "rgba(240,68,56,0.4)",
  },
  errorBannerText: {
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "600",
  },
  submit: {
    marginTop: Spacing.sm,
  },
});
