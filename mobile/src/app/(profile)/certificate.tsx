import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { CloseIcon, ImageIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { TextField } from "@/components/ui/text-field";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { addCertificate } from "@/lib/certificates";
import { tapFeedback } from "@/lib/haptics";
import { choosePhoto } from "@/lib/media";
import { uploadImage } from "@/lib/storage-upload";
import { useAuthStore } from "@/store/use-auth-store";

const schema = z.object({
  documentType: z.string().trim().min(1, "Document type is required"),
  institution: z
    .string()
    .trim()
    .min(1, "Issuing organization is required"),
  specialty: z.string().optional(),
  year: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AddCertificateScreen() {
  const uid = useAuthStore((state) => state.user?.uid);
  const queryClient = useQueryClient();

  const [photos, setPhotos] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      documentType: "",
      institution: "",
      specialty: "",
      year: "",
    },
  });

  const handleAddPhoto = async () => {
    tapFeedback();
    const uri = await choosePhoto();
    if (uri) setPhotos((prev) => [...prev, uri]);
  };

  const handleRemovePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((item) => item !== uri));
  };

  const submit = async (values: FormValues) => {
    if (!uid) return;
    if (photos.length === 0) {
      setTopError("Add at least one photo of your certificate.");
      return;
    }
    setSaving(true);
    setTopError(null);
    try {
      const uploaded = await Promise.all(
        photos.map((uri, index) =>
          uploadImage(
            uri,
            `certificates/${uid}/${Date.now()}_${index}.jpg`,
          ),
        ),
      );
      await addCertificate(uid, {
        documentType: values.documentType.trim(),
        institution: values.institution.trim(),
        specialty: values.specialty?.trim() ?? "",
        year: values.year?.trim() ?? "",
        files: uploaded.map((url, index) => ({
          url,
          name: `${values.institution.trim() || "Document"} ${index + 1}`,
          type: "image/jpeg",
          isPublic,
        })),
      });
      void queryClient.invalidateQueries({ queryKey: ["certificates", uid] });
      router.back();
    } catch {
      setSaving(false);
      setTopError("Couldn't save the certificate. Please try again.");
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Add certificate</Text>
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
              Add a license, certification or diploma. Public documents appear on
              your public profile.
            </Text>

            <Controller
              control={control}
              name="documentType"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Document type"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.documentType?.message}
                  placeholder="e.g. License, Certificate, Diploma"
                  autoCapitalize="words"
                />
              )}
            />
            <Controller
              control={control}
              name="institution"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Issuing organization"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.institution?.message}
                  placeholder="e.g. State of Massachusetts"
                  autoCapitalize="words"
                />
              )}
            />
            <Controller
              control={control}
              name="specialty"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Specialty / field (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.specialty?.message}
                  placeholder="e.g. Master Electrician"
                  autoCapitalize="words"
                />
              )}
            />
            <Controller
              control={control}
              name="year"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Year (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.year?.message}
                  placeholder="e.g. 2023"
                  keyboardType="phone-pad"
                />
              )}
            />

            <View style={styles.photosField}>
              <Text style={styles.photosLabel}>Photos</Text>
              <View style={styles.photosGrid}>
                {photos.map((uri) => (
                  <View key={uri} style={styles.photoWrap}>
                    <Image
                      source={{ uri }}
                      style={styles.photo}
                      contentFit="cover"
                      transition={120}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remove photo"
                      hitSlop={8}
                      onPress={() => handleRemovePhoto(uri)}
                      style={styles.photoRemove}
                    >
                      <CloseIcon size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
                <PressableScale
                  accessibilityLabel="Add photo"
                  onPress={() => void handleAddPhoto()}
                  scaleTo={0.97}
                >
                  <View style={styles.addPhoto}>
                    <ImageIcon size={22} color={Brand.primaryLight} />
                    <Text style={styles.addPhotoText}>Add photo</Text>
                  </View>
                </PressableScale>
              </View>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleBody}>
                <Text style={styles.toggleTitle}>Show on public profile</Text>
                <Text style={styles.toggleSub}>
                  Others can see this document on your profile.
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: Colors.border, true: Brand.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.submit}>
              <PrimaryButton
                label={saving ? "Saving…" : "Save certificate"}
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
  photosField: {
    gap: Spacing.sm,
  },
  photosLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  photoWrap: {
    width: 96,
    height: 96,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  photoRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  addPhoto: {
    width: 96,
    height: 96,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(22,179,100,0.08)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
    borderStyle: "dashed",
  },
  addPhotoText: {
    color: Brand.primaryLight,
    fontSize: 12,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBody: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  toggleSub: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 17,
  },
  submit: {
    marginTop: Spacing.sm,
  },
});
