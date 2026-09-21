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
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { AwardIcon, CloseIcon, PlayIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { LocationPicker } from "@/components/ui/location-picker";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { TextField } from "@/components/ui/text-field";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import {
  analyticsEvents,
  errorMessage,
  locationProps,
} from "@/lib/analytics-events";
import { deleteCertificate } from "@/lib/certificates";
import { tapFeedback } from "@/lib/haptics";
import type { GeoPlace } from "@/lib/mapbox";
import { toHref } from "@/lib/navigation";
import { isValidUSPhone } from "@/lib/shop-form";
import { updateEditableProfile } from "@/lib/user-profile";
import { deleteVideo, type VideoStory } from "@/lib/videos";
import { useCertificates } from "@/queries/use-certificates";
import { useProfile } from "@/queries/use-profile";
import { useUserVideos, userVideosKey } from "@/queries/use-videos";
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
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);
  const role = useAuthStore((state) => state.user?.role ?? null);
  const isContractor = role === "WORKER";
  const queryClient = useQueryClient();
  const { data } = useProfile(uid);
  const { data: certificates = [], isLoading: certLoading } =
    useCertificates(uid);
  const isPro = data?.plan === "Pro";
  const { data: videos = [], isLoading: videosLoading } = useUserVideos(
    isPro ? uid : undefined,
    true,
  );

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
    analyticsEvents.profileSetupSubmitted({
      is_contractor: isContractor,
      name_filled: values.name.trim().length > 0,
      name_length: values.name.trim().length,
      email_filled: values.email.trim().length > 0,
      phone_filled: Boolean(values.phone?.trim()),
      business_name: isContractor ? (values.businessName?.trim() ?? "") : "",
      professional_role: isContractor
        ? (values.professionalRole?.trim() ?? "")
        : "",
      short_bio: isContractor ? (values.shortBio?.trim() ?? "") : "",
      ...locationProps(place),
    });
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
      analyticsEvents.profileSetupSaved();
      router.back();
    } catch (error) {
      analyticsEvents.profileSetupSaveFailed({
        error_message: errorMessage(error),
      });
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
    analyticsEvents.certificateDeleteTapped({ certificate_id: certificateId });
    Alert.alert("Delete certificate?", "This removes it from your profile.", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () =>
          analyticsEvents.certificateDeleteCancelled({
            certificate_id: certificateId,
          }),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void deleteCertificate(uid, certificateId, fileUrls)
            .then(() => {
              analyticsEvents.certificateDeleted({
                certificate_id: certificateId,
              });
              void queryClient.invalidateQueries({
                queryKey: ["certificates", uid],
              });
            })
            .catch(() => {
              analyticsEvents.certificateDeleteFailed({
                certificate_id: certificateId,
              });
              Alert.alert("Couldn't delete", "Please try again.");
            });
        },
      },
    ]);
  };

  const handleDeleteVideo = (video: VideoStory) => {
    if (!uid) return;
    tapFeedback();
    analyticsEvents.videoDeleteTapped({ video_id: video.id });
    Alert.alert("Delete video?", "This removes it from your profile.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void deleteVideo(video)
            .then(() => {
              analyticsEvents.videoDeleted({ video_id: video.id });
              void queryClient.invalidateQueries({
                queryKey: userVideosKey(uid),
              });
            })
            .catch(() => {
              analyticsEvents.videoDeleteFailed({ video_id: video.id });
              Alert.alert("Couldn't delete", "Please try again.");
            });
        },
      },
    ]);
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
              {isContractor
                ? " your public specialist profile."
                : " your requests."}
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
                  <LocationPicker
                    value={value ?? null}
                    onChange={onChange}
                    analyticsContext="profile_setup"
                  />
                </View>
              )}
            />

            <View style={styles.submit}>
              <PrimaryButton
                label={saving ? "Saving…" : "Save profile"}
                withArrow={false}
                loading={saving}
                disabled={saving}
                onPress={() =>
                  void handleSubmit(submit, (fieldErrors) =>
                    analyticsEvents.profileSetupValidationFailed({
                      fields: Object.keys(fieldErrors),
                    }),
                  )()
                }
              />
            </View>

            <View style={styles.certSection}>
              <View style={styles.certHeader}>
                <AwardIcon size={18} color={colors.accent} />
                <Text style={styles.certHeaderText}>
                  Certificates &amp; documents
                </Text>
              </View>

              {certLoading ? (
                <ActivityIndicator color={colors.accent} />
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
                          <AwardIcon size={20} color={colors.textMuted} />
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
                        <CloseIcon size={16} color={colors.textSecondary} />
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
                  analyticsEvents.certificateAddTapped({
                    certificates_count: certificates.length,
                  });
                  router.push(toHref("/certificate"));
                }}
                scaleTo={0.98}
              >
                <View style={styles.certAdd}>
                  <Text style={styles.certAddText}>+ Add certificate</Text>
                </View>
              </PressableScale>
            </View>

            {isPro ? (
              <View style={styles.certSection}>
                <View style={styles.certHeader}>
                  <PlayIcon size={18} color={colors.accent} />
                  <Text style={styles.certHeaderText}>Videos</Text>
                </View>

                {videosLoading ? (
                  <ActivityIndicator color={colors.accent} />
                ) : videos.length > 0 ? (
                  <View style={styles.certList}>
                    {videos.map((video) => (
                      <View key={video.id} style={styles.certItem}>
                        <View style={styles.videoThumbWrap}>
                          {video.preview ? (
                            <Image
                              source={{ uri: video.preview }}
                              style={styles.certThumb}
                              contentFit="cover"
                              transition={120}
                            />
                          ) : (
                            <View style={styles.certThumbFallback}>
                              <PlayIcon size={18} color={colors.textMuted} />
                            </View>
                          )}
                          <View style={styles.videoPlayBadge}>
                            <PlayIcon size={11} color="#FFFFFF" filled />
                          </View>
                        </View>
                        <View style={styles.certItemBody}>
                          <Text style={styles.certItemTitle} numberOfLines={1}>
                            {video.title || "Video"}
                          </Text>
                          <Text style={styles.certItemSub} numberOfLines={1}>
                            {video.content.length}{" "}
                            {video.content.length === 1 ? "item" : "items"} ·{" "}
                            {video.views} views
                            {video.hidden ? " · Hidden" : ""}
                          </Text>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Delete video"
                          hitSlop={8}
                          onPress={() => handleDeleteVideo(video)}
                          style={styles.certDelete}
                        >
                          <CloseIcon size={16} color={colors.textSecondary} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.certEmpty}>
                    Share photos and videos on your public profile.
                  </Text>
                )}

                <PressableScale
                  accessibilityLabel="Add video"
                  onPress={() => {
                    tapFeedback();
                    analyticsEvents.videoAddTapped({
                      videos_count: videos.length,
                    });
                    router.push(toHref("/video-story"));
                  }}
                  scaleTo={0.98}
                >
                  <View style={styles.certAdd}>
                    <Text style={styles.certAddText}>+ Add video</Text>
                  </View>
                </PressableScale>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
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
  submit: {
    marginTop: Spacing.sm,
  },
  locationField: {
    gap: 6,
  },
  locationLabel: {
    color: t.colors.textSecondary,
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
    color: t.colors.text,
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
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  certThumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: t.colors.background,
  },
  certThumbFallback: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.background,
  },
  certItemBody: {
    flex: 1,
    gap: 2,
  },
  certItemTitle: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  certItemSub: {
    color: t.colors.textSecondary,
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
    color: t.colors.textSecondary,
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
    color: t.colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  videoThumbWrap: {
    width: 48,
    height: 48,
    position: "relative",
  },
  videoPlayBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
}));
