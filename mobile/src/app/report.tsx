import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ImageIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { tapFeedback } from "@/lib/haptics";
import { choosePhoto } from "@/lib/media";
import { reportUser } from "@/lib/moderation";
import { uploadImage } from "@/lib/storage-upload";
import { useAuthStore } from "@/store/use-auth-store";

const REASONS = [
  "Spam or advertising",
  "Harassment or bullying",
  "Inappropriate content",
  "Scam or fraud",
  "Impersonation",
  "Other",
];

export default function ReportScreen() {
  const params = useLocalSearchParams<{ uid?: string; name?: string }>();
  const reportedId = typeof params.uid === "string" ? params.uid : "";
  const reportedName = typeof params.name === "string" ? params.name : "User";
  const uid = useAuthStore((state) => state.user?.uid) ?? "";

  const [reason, setReason] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAddPhoto = async () => {
    const uri = await choosePhoto();
    if (uri) setPhotoUri(uri);
  };

  const handleSubmit = async () => {
    if (!reason || !uid || !reportedId || submitting) return;
    tapFeedback();
    setSubmitting(true);
    try {
      let mediaUrl: string | null = null;
      if (photoUri) {
        try {
          mediaUrl = await uploadImage(
            photoUri,
            `reports/${uid}/${Date.now()}.jpg`,
          );
        } catch {
          mediaUrl = null;
        }
      }
      await reportUser({
        reporterId: uid,
        reportedId,
        reportedName,
        reason,
        comment: comment.trim(),
        mediaUrl,
      });
      Alert.alert(
        "Report submitted",
        "Thanks — our team will review it shortly.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch {
      setSubmitting(false);
      Alert.alert("Couldn't submit", "Please try again.");
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Report {reportedName}</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Reason</Text>
          <View style={styles.reasons}>
            {REASONS.map((item) => (
              <PressableScale
                key={item}
                accessibilityLabel={item}
                onPress={() => {
                  tapFeedback();
                  setReason(item);
                }}
              >
                <View
                  style={[styles.chip, reason === item && styles.chipSelected]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      reason === item && styles.chipTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </View>

          <Text style={styles.label}>Details</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Describe what happened…"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            multiline
          />

          <Text style={styles.label}>Attach a photo (optional)</Text>
          {photoUri ? (
            <View style={styles.photoWrap}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <PressableScale
                accessibilityLabel="Remove photo"
                onPress={() => setPhotoUri(null)}
              >
                <View style={styles.removeChip}>
                  <Text style={styles.removeText}>Remove</Text>
                </View>
              </PressableScale>
            </View>
          ) : (
            <PressableScale
              accessibilityLabel="Add a photo"
              onPress={() => void handleAddPhoto()}
            >
              <View style={styles.addPhoto}>
                <ImageIcon size={20} color={Colors.textSecondary} />
                <Text style={styles.addPhotoText}>Add a photo</Text>
              </View>
            </PressableScale>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={submitting ? "Submitting…" : "Submit report"}
            withArrow={false}
            loading={submitting}
            disabled={!reason || submitting}
            onPress={() => void handleSubmit()}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
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
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  spacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: Spacing.base,
  },
  reasons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: {
    borderColor: Brand.primary,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  input: {
    minHeight: 110,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 16,
    textAlignVertical: "top",
  },
  addPhoto: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    height: 52,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addPhotoText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  photoWrap: {
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  removeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeText: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
});
