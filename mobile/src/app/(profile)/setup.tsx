import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { AwardIcon, CloseIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { LocationPicker } from "@/components/ui/location-picker";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { TextField } from "@/components/ui/text-field";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { deleteCertificate } from "@/lib/certificates";
import { tapFeedback } from "@/lib/haptics";
import type { GeoPlace } from "@/lib/mapbox";
import { toHref } from "@/lib/navigation";
import { isValidUSPhone } from "@/lib/shop-form";
import { updateEditableProfile } from "@/lib/user-profile";
import { useCertificates } from "@/queries/use-certificates";
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
  location: z.custom<GeoPlace | null>().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function SetupProfileScreen() {
  const uid = useAuthStore((state) => state.user?.uid);
  const role = useAuthStore((state) => state.user?.role ?? null);
  const isContractor = role === "WORKER";
  const queryClient = useQueryClient();
  const { data } = useProfile(uid);
  const { data: certificates = [], isLoading: certLoading } =
    useCertificates(uid);

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
      location: null,
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
      location: data.location,
    });
  }, [data, reset]);

  const submit = async (values: FormValues) => {
    if (!uid) return;
    setSaving(true);
    setTopError(null);
    const place = values.location ?? null;
    const patch = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() ?? "",
      ...(place ? { address: place.place_name, location: place } : {}),
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

  const handleDeleteCertificate = (
    certificateId: string,
    fileUrls: string[],
  ) => {
    if (!uid) return;
    tapFeedback();
    Alert.alert(
      "Delete certificate?",
      "This removes it from your profile.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteCertificate(uid, certificateId, fileUrls)
              .then(() => {
                void queryClient.invalidateQueries({
                  queryKey: ["certificates", uid],
                });
              })
              .catch(() => {
                Alert.alert("Couldn't delete", "Please try again.");
              });
          },
        },
      ],
    );
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
              name="location"
              render={({ field: { onChange, value } }) => (
                <View style={styles.locationField}>
                  <Text style={styles.locationLabel}>Address</Text>
                  <LocationPicker value={value ?? null} onChange={onChange} />
                </View>
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

            <View style={styles.certSection}>
              <View style={styles.certHeader}>
                <AwardIcon size={18} color={Brand.primaryLight} />
                <Text style={styles.certHeaderText}>
                  Certificates &amp; documents
                </Text>
              </View>

              {certLoading ? (
                <ActivityIndicator color={Brand.primaryLight} />
              ) : certificates.length > 0 ? (
                <View style={styles.certList}>
                  {certificates.map((cert) => (
                    <View key={cert.id} style={styles.certItem}>
                      {cert.files[0]?.url ? (
                        <Image
                          source={{ uri: cert.files[0].url }}
                          style={styles.certThumb}
                          contentFit="cover"
                          transition={120}
                        />
                      ) : (
                        <View style={styles.certThumbFallback}>
                          <AwardIcon size={20} color={Colors.textMuted} />
                        </View>
                      )}
                      <View style={styles.certItemBody}>
                        <Text style={styles.certItemTitle} numberOfLines={1}>
                          {cert.institution || cert.documentType || "Document"}
                        </Text>
                        {cert.documentType ? (
                          <Text style={styles.certItemSub} numberOfLines={1}>
                            {cert.documentType}
                            {cert.year ? ` · ${cert.year}` : ""}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Delete certificate"
                        hitSlop={8}
                        onPress={() =>
                          handleDeleteCertificate(
                            cert.id,
                            cert.files.map((file) => file.url),
                          )
                        }
                        style={styles.certDelete}
                      >
                        <CloseIcon size={16} color={Colors.textSecondary} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.certEmpty}>
                  Add a license, certification or diploma.
                </Text>
              )}

              <PressableScale
                accessibilityLabel="Add certificate"
                onPress={() => {
                  tapFeedback();
                  router.push(toHref("/certificate"));
                }}
                scaleTo={0.98}
              >
                <View style={styles.certAdd}>
                  <Text style={styles.certAddText}>+ Add certificate</Text>
                </View>
              </PressableScale>
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
  locationField: {
    gap: 6,
  },
  locationLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  certSection: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  certHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  certHeaderText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  certList: {
    gap: Spacing.sm,
  },
  certItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  certThumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
  },
  certThumbFallback: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  certItemBody: {
    flex: 1,
    gap: 2,
  },
  certItemTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  certItemSub: {
    color: Colors.textSecondary,
    fontSize: 12.5,
  },
  certDelete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  certEmpty: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
  },
  certAdd: {
    height: 48,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.1)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
  },
  certAddText: {
    color: Brand.primaryLight,
    fontSize: 15,
    fontWeight: "700",
  },
});
