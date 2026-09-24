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
      setTopError("Add a cover image for your story.");
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
      setTopError("Couldn't publish your story. Please try again.");
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>New video story</Text>
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

            <View style={styles.hero}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose cover image"
                onPress={() => void handleSetPreview()}
                style={[styles.cover, !preview && styles.coverDashed]}
              >
                {preview ? (
                  <>
                    <Image
                      source={{ uri: preview }}
                      style={styles.coverImage}
                      contentFit="cover"
                      transition={150}
                    />
                    <View style={styles.coverOverlay} pointerEvents="none">
                      <View style={styles.changeChip}>
                        <Text style={styles.changeChipText}>Change cover</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <View style={styles.coverEmpty}>
                    <View style={styles.coverIconCircle}>
                      <ImageIcon size={26} color={colors.accent} />
                    </View>
                    <Text style={styles.coverEmptyTitle}>Add a cover</Text>
                    <Text style={styles.coverEmptyHint}>
                      The thumbnail people tap to play
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Story clips</Text>
              <Text style={styles.sectionHint}>
                Add up to 3 photos or videos (up to 90s). Anyone can watch, like
                and report them.
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rail}
              >
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
                      <Text style={styles.tileAddText}>Photo or video</Text>
                    </View>
                  </PressableScale>
                ) : null}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <Text style={styles.sectionHint}>
                Optional — a title and note help people find your story.
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label="Title"
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
                    label="Description"
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.description?.message}
                    placeholder="Tell people about it"
                    multiline
                  />
                )}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              label={saving ? "Publishing…" : "Publish story"}
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
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
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
  hero: {
    alignItems: "center",
    paddingTop: Spacing.sm,
  },
  cover: {
    width: 196,
    height: 320,
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: t.colors.surface,
  },
  coverDashed: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(22,179,100,0.45)",
    backgroundColor: "rgba(22,179,100,0.07)",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  changeChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  changeChipText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  coverEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: Spacing.base,
  },
  coverIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.14)",
  },
  coverEmptyTitle: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  coverEmptyHint: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 17,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sectionHint: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  rail: {
    gap: Spacing.sm,
    paddingVertical: 4,
    paddingRight: Spacing.base,
  },
  tile: {
    width: 108,
    height: 152,
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
    gap: 6,
    backgroundColor: "#111827",
  },
  tileVideoText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  tileRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  tileAdd: {
    width: 108,
    height: 152,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(22,179,100,0.45)",
    backgroundColor: "rgba(22,179,100,0.07)",
  },
  tileAddPlus: {
    color: t.colors.accent,
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 32,
  },
  tileAddText: {
    color: t.colors.accent,
    fontSize: 11.5,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
}));
