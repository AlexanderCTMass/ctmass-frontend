import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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

import { CloseIcon, ImageIcon, PlayIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { TextField } from "@/components/ui/text-field";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { choosePhoto, chooseVideo } from "@/lib/media";
import { addVideo } from "@/lib/videos";
import { userVideosKey } from "@/queries/use-videos";
import { useAuthStore } from "@/store/use-auth-store";

const schema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type ContentDraft = { type: "image" | "video"; uri: string };

const MAX_CONTENT = 3;

export default function AddVideoStoryScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);
  const queryClient = useQueryClient();

  const [preview, setPreview] = useState<string | null>(null);
  const [content, setContent] = useState<ContentDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "" },
  });

  const handleSetPreview = async () => {
    tapFeedback();
    const uri = await choosePhoto();
    if (uri) setPreview(uri);
  };

  const addImageItem = async () => {
    const uri = await choosePhoto();
    if (!uri) return;
    setContent((prev) => {
      const next = [...prev, { type: "image" as const, uri }];
      analyticsEvents.videoItemAdded({
        media_type: "image",
        items_count: next.length,
      });
      return next;
    });
  };

  const addVideoItem = async () => {
    const picked = await chooseVideo();
    if (!picked) return;
    if (
      picked.durationMs !== null &&
      (picked.durationMs < 1000 || picked.durationMs > 90000)
    ) {
      Alert.alert("Video too long", "Videos must be between 1 and 90 seconds.");
      return;
    }
    setContent((prev) => {
      const next = [...prev, { type: "video" as const, uri: picked.uri }];
      analyticsEvents.videoItemAdded({
        media_type: "video",
        items_count: next.length,
      });
      return next;
    });
  };

  const handleAddContent = () => {
    if (content.length >= MAX_CONTENT) return;
    tapFeedback();
    Alert.alert("Add to your story", undefined, [
      { text: "Photo", onPress: () => void addImageItem() },
      { text: "Video", onPress: () => void addVideoItem() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const removeContent = (index: number) => {
    setContent((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (values: FormValues) => {
    if (!uid) return;
    if (!preview) {
      analyticsEvents.videoValidationFailed({ fields: ["preview"] });
      setTopError("Add a cover image for your video.");
      return;
    }
    if (content.length === 0) {
      analyticsEvents.videoValidationFailed({ fields: ["content"] });
      setTopError("Add at least one photo or video.");
      return;
    }
    setSaving(true);
    setTopError(null);
    try {
      await addVideo(uid, {
        title: values.title?.trim() ?? "",
        description: values.description?.trim() ?? "",
        previewUri: preview,
        content,
      });
      void queryClient.invalidateQueries({ queryKey: userVideosKey(uid) });
      analyticsEvents.videoSaved({
        items_count: content.length,
        has_video: content.some((item) => item.type === "video"),
      });
      router.back();
    } catch (error) {
      analyticsEvents.videoSaveFailed({ error_message: errorMessage(error) });
      setSaving(false);
      setTopError("Couldn't publish your video. Please try again.");
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Add video</Text>
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
              Share photos and videos on your public profile. Videos can be up to
              90 seconds. Anyone can watch, like and report them.
            </Text>

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Title (optional)"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                  placeholder="e.g. Kitchen remodel"
                  autoCapitalize="sentences"
                />
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Description (optional)"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  placeholder="Tell people about it"
                  multiline
                />
              )}
            />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Cover image</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose cover image"
                onPress={() => void handleSetPreview()}
                style={styles.cover}
              >
                {preview ? (
                  <Image
                    source={{ uri: preview }}
                    style={styles.coverImage}
                    contentFit="cover"
                    transition={120}
                  />
                ) : (
                  <View style={styles.coverEmpty}>
                    <ImageIcon size={24} color={colors.accent} />
                    <Text style={styles.coverEmptyText}>Add cover</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Content ({content.length}/{MAX_CONTENT})
              </Text>
              <View style={styles.grid}>
                {content.map((item, index) => (
                  <View key={`${item.uri}-${index}`} style={styles.tile}>
                    {item.type === "image" ? (
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.tileImage}
                        contentFit="cover"
                        transition={120}
                      />
                    ) : (
                      <View style={styles.tileVideo}>
                        <PlayIcon size={22} color="#FFFFFF" filled />
                        <Text style={styles.tileVideoText}>Video</Text>
                      </View>
                    )}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remove"
                      hitSlop={8}
                      onPress={() => removeContent(index)}
                      style={styles.tileRemove}
                    >
                      <CloseIcon size={13} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
                {content.length < MAX_CONTENT ? (
                  <PressableScale
                    accessibilityLabel="Add content"
                    onPress={handleAddContent}
                    scaleTo={0.97}
                  >
                    <View style={styles.tileAdd}>
                      <Text style={styles.tileAddPlus}>+</Text>
                    </View>
                  </PressableScale>
                ) : null}
              </View>
            </View>

            <View style={styles.submit}>
              <PrimaryButton
                label={saving ? "Publishing…" : "Publish"}
                withArrow={false}
                loading={saving}
                disabled={saving}
                onPress={() =>
                  void handleSubmit(submit, (fieldErrors) =>
                    analyticsEvents.videoValidationFailed({
                      fields: Object.keys(fieldErrors),
                    }),
                  )()
                }
              />
            </View>
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
  field: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  cover: {
    width: 132,
    height: 176,
    borderRadius: Radius.md,
    overflow: "hidden",
    backgroundColor: t.colors.surface,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(22,179,100,0.35)",
    borderRadius: Radius.md,
    backgroundColor: "rgba(22,179,100,0.08)",
  },
  coverEmptyText: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tile: {
    width: 92,
    height: 92,
    borderRadius: Radius.md,
    overflow: "hidden",
    backgroundColor: t.colors.surface,
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  tileVideo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#111827",
  },
  tileVideoText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  tileRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  tileAdd: {
    width: 92,
    height: 92,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  tileAddPlus: {
    color: t.colors.textSecondary,
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 34,
  },
  submit: {
    marginTop: Spacing.sm,
  },
}));
