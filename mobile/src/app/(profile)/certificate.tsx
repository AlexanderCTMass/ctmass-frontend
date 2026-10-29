import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { CloseIcon, ImageIcon, LockIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { Toggle } from "@/components/ui/toggle";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { TextField } from "@/components/ui/text-field";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { useSubmitErrorHaptic } from "@/hooks/use-submit-error-haptic";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import {
  type Certificate,
  type CertificateFileInput,
  addCertificate,
  updateCertificate,
} from "@/lib/certificates";
import { tapFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { choosePhoto } from "@/lib/media";
import { uploadImage } from "@/lib/storage-upload";
import { useCertificates } from "@/queries/use-certificates";
import { useAuthStore } from "@/store/use-auth-store";

const schema = z.object({
  documentType: z.string().trim().min(1, "certificate.errors.type"),
  institution: z.string().trim().min(1, "certificate.errors.institution"),
  specialty: z.string(),
  documentNumber: z.string(),
  year: z.string(),
  isPublic: z.boolean(),
  showInstitution: z.boolean(),
  showSpecialty: z.boolean(),
  showYear: z.boolean(),
  showNumber: z.boolean(),
  showPhotos: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

type VisibilityField =
  | "showInstitution"
  | "showSpecialty"
  | "showYear"
  | "showNumber"
  | "showPhotos";

const VISIBILITY_FIELDS: VisibilityField[] = [
  "showInstitution",
  "showSpecialty",
  "showYear",
  "showNumber",
  "showPhotos",
];

type Photo = { uri: string; file: CertificateFileInput | null };

function toValues(cert: Certificate | null): FormValues {
  return {
    documentType: cert?.documentType ?? "",
    institution: cert?.institution ?? "",
    specialty: cert?.specialty ?? "",
    documentNumber: cert?.documentNumber ?? "",
    year: cert?.year ?? "",
    isPublic: cert?.isPublic ?? true,
    showInstitution: cert?.isPublic ? cert.visibility.institution : true,
    showSpecialty: cert?.isPublic ? cert.visibility.specialty : true,
    showYear: cert?.isPublic ? cert.visibility.year : true,
    showNumber: cert?.isPublic ? cert.visibility.number : false,
    showPhotos:
      cert?.isPublic && cert.files.length > 0
        ? cert.files.some((file) => file.isPublic)
        : true,
  };
}

function toPhotos(cert: Certificate | null): Photo[] {
  return (cert?.files ?? []).map((file) => ({
    uri: file.url,
    file: { id: file.id, url: file.url, name: file.name, type: file.type },
  }));
}

function ToggleCard({
  title,
  hint,
  value,
  onChange,
  nested,
}: {
  title: string;
  hint?: string;
  value: boolean;
  onChange: (next: boolean) => void;
  nested?: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={[styles.toggleRow, nested && styles.toggleNested]}>
      <View style={styles.toggleBody}>
        <Text style={styles.toggleTitle}>{title}</Text>
        {hint ? <Text style={styles.toggleSub}>{hint}</Text> : null}
      </View>
      <Toggle accessibilityLabel={title} value={value} onValueChange={onChange} />
    </View>
  );
}

function CertificateForm({ certificate }: { certificate: Certificate | null }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const uid = useAuthStore((state) => state.user?.uid);
  const queryClient = useQueryClient();
  const editing = certificate !== null;
  const mode = editing ? "edit" : "create";

  const [photos, setPhotos] = useState<Photo[]>(() => toPhotos(certificate));
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toValues(certificate),
  });
  useSubmitErrorHaptic(submitCount, errors);
  const isPublic = useWatch({ control, name: "isPublic" });

  const handleAddPhoto = async () => {
    tapFeedback();
    const uri = await choosePhoto();
    if (!uri) return;
    analyticsEvents.certificatePhotoAdded({ photos_count: photos.length + 1 });
    setPhotos((prev) => [...prev, { uri, file: null }]);
  };

  const handleRemovePhoto = (uri: string) => {
    analyticsEvents.certificatePhotoRemoved({
      photos_count: Math.max(0, photos.length - 1),
    });
    setPhotos((prev) => prev.filter((item) => item.uri !== uri));
  };

  const submit = async (values: FormValues) => {
    if (!uid) return;
    if (photos.length === 0) {
      analyticsEvents.certificateValidationFailed({ fields: ["photos"] });
      setTopError(t("certificate.needPhoto"));
      return;
    }
    const hidden = values.isPublic
      ? VISIBILITY_FIELDS.filter((field) => !values[field])
      : ["certificate"];
    analyticsEvents.certificateSubmitted({
      mode,
      document_type: values.documentType.trim(),
      institution: values.institution.trim(),
      specialty: values.specialty.trim(),
      year: values.year.trim(),
      has_document_number: values.documentNumber.trim().length > 0,
      photos_count: photos.length,
      is_public: values.isPublic,
      photos_public: values.isPublic && values.showPhotos,
      hidden_fields: hidden,
    });
    setSaving(true);
    setTopError(null);
    try {
      const institution = values.institution.trim();
      const files = await Promise.all(
        photos.map(async (photo, index) => {
          if (photo.file) return photo.file;
          const url = await uploadImage(
            photo.uri,
            `certificates/${uid}/${Date.now()}_${index}.jpg`,
          );
          return {
            url,
            name: `${institution || "Document"} ${index + 1}`,
            type: "image/jpeg",
          };
        }),
      );
      const input = {
        documentType: values.documentType.trim(),
        institution,
        specialty: values.specialty.trim(),
        year: values.year.trim(),
        documentNumber: values.documentNumber.trim(),
        isPublic: values.isPublic,
        showPhotos: values.showPhotos,
        visibility: {
          institution: values.showInstitution,
          specialty: values.showSpecialty,
          year: values.showYear,
          number: values.showNumber,
        },
        files,
      };
      if (certificate) {
        await updateCertificate(uid, certificate, input);
      } else {
        await addCertificate(uid, input);
      }
      void queryClient.invalidateQueries({ queryKey: ["certificates", uid] });
      void queryClient.invalidateQueries({
        queryKey: ["public-certificates", uid],
      });
      void queryClient.invalidateQueries({ queryKey: ["specialist-pool"] });
      void queryClient.invalidateQueries({ queryKey: ["trade"] });
      analyticsEvents.certificateSaved({
        mode,
        photos_count: photos.length,
        is_public: values.isPublic,
      });
      router.back();
    } catch (error) {
      analyticsEvents.certificateSaveFailed({
        error_message: errorMessage(error),
      });
      setSaving(false);
      setTopError(t("certificate.saveFailed"));
    }
  };

  const visibilityToggle = (
    name: VisibilityField | "isPublic",
    title: string,
    hint?: string,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <ToggleCard
          title={title}
          hint={hint}
          value={value}
          nested={name !== "isPublic"}
          onChange={(next) => {
            analyticsEvents.certificateVisibilityToggled({
              field: name,
              is_public: next,
            });
            onChange(next);
          }}
        />
      )}
    />
  );

  return (
    <>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>
          {editing ? t("certificate.editTitle") : t("certificate.title")}
        </Text>
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

          <Text style={styles.intro}>{t("certificate.intro")}</Text>

          <Controller
            control={control}
            name="documentType"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t("certificate.type")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.documentType?.message}
                placeholder={t("certificate.typePlaceholder")}
                autoCapitalize="words"
              />
            )}
          />
          <Controller
            control={control}
            name="institution"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t("certificate.institution")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.institution?.message}
                placeholder={t("certificate.institutionPlaceholder")}
                autoCapitalize="words"
              />
            )}
          />
          <Controller
            control={control}
            name="specialty"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t("certificate.specialty")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t("certificate.specialtyPlaceholder")}
                autoCapitalize="words"
              />
            )}
          />
          <Controller
            control={control}
            name="documentNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t("certificate.number")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t("tradeForm.example", { value: "A-12345" })}
                autoCapitalize="none"
              />
            )}
          />
          <Controller
            control={control}
            name="year"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t("certificate.year")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t("tradeForm.example", { value: "2023" })}
                keyboardType="phone-pad"
              />
            )}
          />

          <View style={styles.photosField}>
            <Text style={styles.photosLabel}>{t("tradePage.photos")}</Text>
            <View style={styles.photosGrid}>
              {photos.map((photo) => (
                <View key={photo.uri} style={styles.photoWrap}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photo}
                    contentFit="cover"
                    transition={120}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("profile.tab.removePhoto")}
                    hitSlop={8}
                    onPress={() => handleRemovePhoto(photo.uri)}
                    style={styles.photoRemove}
                  >
                    <CloseIcon size={14} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
              <PressableScale
                accessibilityLabel={t("certificate.addPhoto")}
                onPress={() => void handleAddPhoto()}
                scaleTo={0.97}
              >
                <View style={styles.addPhoto}>
                  <ImageIcon size={22} color={colors.accent} />
                  <Text style={styles.addPhotoText}>
                    {t("certificate.addPhoto")}
                  </Text>
                </View>
              </PressableScale>
            </View>
          </View>

          <View style={styles.privacy}>
            <View style={styles.privacyHeader}>
              <LockIcon size={16} color={colors.accent} />
              <Text style={styles.privacyTitle}>
                {t("certificate.privacyTitle")}
              </Text>
            </View>
            <Text style={styles.privacyNote}>
              {t("certificate.privacyNote")}
            </Text>
            {visibilityToggle(
              "isPublic",
              t("certificate.public"),
              isPublic
                ? t("certificate.publicHint")
                : t("certificate.privateHint"),
            )}
            {isPublic ? (
              <>
                {visibilityToggle(
                  "showInstitution",
                  t("certificate.showInstitution"),
                )}
                {visibilityToggle(
                  "showSpecialty",
                  t("certificate.showSpecialty"),
                )}
                {visibilityToggle("showYear", t("certificate.showYear"))}
                {visibilityToggle("showNumber", t("certificate.showNumber"))}
                {visibilityToggle(
                  "showPhotos",
                  t("certificate.showPhotos"),
                  t("certificate.showPhotosHint"),
                )}
              </>
            ) : null}
          </View>

          <View style={styles.submit}>
            <PrimaryButton
              label={
                saving
                  ? t("setup.saving")
                  : editing
                    ? t("portfolio.saveChanges")
                    : t("certificate.save")
              }
              withArrow={false}
              loading={saving}
              disabled={saving}
              onPress={() =>
                void handleSubmit(submit, (fieldErrors) =>
                  analyticsEvents.certificateValidationFailed({
                    fields: Object.keys(fieldErrors),
                  }),
                )()
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

export default function CertificateScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : undefined;
  const uid = useAuthStore((state) => state.user?.uid);
  const { data: certificates, isLoading } = useCertificates(
    id ? uid : undefined,
  );
  const certificate = id
    ? (certificates?.find((item) => item.id === id) ?? null)
    : null;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {id && isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : id && !certificate ? (
          <>
            <View style={styles.header}>
              <BackButton onPress={() => router.back()} />
              <View style={styles.headerSpacer} />
            </View>
            <View style={styles.center}>
              <Text style={styles.missing}>{t("certificate.missing")}</Text>
            </View>
          </>
        ) : (
          <CertificateForm key={certificate?.id ?? "new"} certificate={certificate} />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  missing: {
    color: t.colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
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
    color: t.colors.text,
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
    color: t.colors.textSecondary,
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
    color: t.colors.dangerText,
    fontSize: 13,
    fontWeight: "600",
  },
  photosField: {
    gap: Spacing.sm,
  },
  photosLabel: {
    color: t.colors.textSecondary,
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
    backgroundColor: t.colors.surface,
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
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  privacy: {
    gap: Spacing.sm,
  },
  privacyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  privacyTitle: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  privacyNote: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  toggleNested: {
    paddingVertical: Spacing.md,
    marginLeft: Spacing.md,
  },
  toggleBody: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  toggleSub: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 17,
  },
  submit: {
    marginTop: Spacing.sm,
  },
}));
