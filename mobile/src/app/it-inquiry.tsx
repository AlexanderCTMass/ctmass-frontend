import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { CheckIcon, CodeBadgeIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { TextField } from "@/components/ui/text-field";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { sendServiceInquiry } from "@/lib/it-inquiry";
import { DEFAULT_SHOP_ITEMS, SHOP_CATEGORIES } from "@/lib/shop";
import { useAuthStore } from "@/store/use-auth-store";

const IT_SERVICES = DEFAULT_SHOP_ITEMS.filter(
  (feature) => feature.category === SHOP_CATEGORIES.IT_SERVICES,
).map((feature) => feature.displayName);

const SUPPORT_EMAIL = "support@ctmass.com";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

async function openMailFallback(
  email: string,
  services: string[],
  message: string,
) {
  const subject = encodeURIComponent("CTMASS — IT services inquiry");
  const bodyText = [
    services.length ? `Services: ${services.join(", ")}` : "",
    message ? `\nMessage:\n${message}` : "",
    `\nReply to: ${email}`,
  ]
    .filter(Boolean)
    .join("\n");
  const body = encodeURIComponent(bodyText);
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}&su=${subject}&body=${body}`;
  try {
    if (await Linking.canOpenURL(mailto)) {
      await Linking.openURL(mailto);
      return;
    }
    await Linking.openURL(gmail);
  } catch {
    Alert.alert("Contact us", `Please email us at ${SUPPORT_EMAIL}`);
  }
}

export default function ItInquiryScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const storeEmail = useAuthStore((state) => state.user?.email ?? "");

  const [selected, setSelected] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: storeEmail, message: "" },
  });

  useEffect(() => {
    analyticsEvents.itInquiryOpened({ source: "it_solutions" });
  }, []);

  const toggleService = (service: string) => {
    tapFeedback();
    setSelected((prev) => {
      const has = prev.includes(service);
      analyticsEvents.itInquiryServiceToggled({ service, selected: !has });
      return has ? prev.filter((item) => item !== service) : [...prev, service];
    });
  };

  const submit = async (values: FormValues) => {
    const email = values.email.trim();
    const message = values.message?.trim() ?? "";
    if (selected.length === 0 && !message) {
      analyticsEvents.itInquiryValidationFailed({ fields: ["services"] });
      setTopError("Choose a service or write a message.");
      return;
    }
    analyticsEvents.itInquirySubmitted({
      services_count: selected.length,
      message_length: message.length,
    });
    setSending(true);
    setTopError(null);
    try {
      await sendServiceInquiry({ email, services: selected, message });
      analyticsEvents.itInquirySent({ services_count: selected.length });
      Alert.alert(
        "Message sent",
        "Thanks! Our team will get back to you by email soon.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (error) {
      analyticsEvents.itInquiryFailed({ error_message: errorMessage(error) });
      setSending(false);
      Alert.alert(
        "Couldn't send",
        "We couldn't send your message right now. You can email us directly instead.",
        [
          {
            text: "Email us directly",
            onPress: () => void openMailFallback(email, selected, message),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Message our team</Text>
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
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <CodeBadgeIcon size={24} color={colors.accent} />
              </View>
              <Text style={styles.heroTitle}>Order IT services directly</Text>
              <Text style={styles.heroText}>
                Pick what you&apos;re interested in and add a note. We&apos;ll
                reply to your email — no coins required.
              </Text>
            </View>

            {topError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{topError}</Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services</Text>
              <View style={styles.chips}>
                {IT_SERVICES.map((service) => {
                  const active = selected.includes(service);
                  return (
                    <Pressable
                      key={service}
                      accessibilityRole="button"
                      accessibilityLabel={service}
                      onPress={() => toggleService(service)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      {active ? (
                        <CheckIcon size={14} color={colors.accent} />
                      ) : null}
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}
                      >
                        {service}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your details</Text>
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
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              <Controller
                control={control}
                name="message"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label="Message"
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.message?.message}
                    placeholder="Tell us about your project or question"
                    autoCapitalize="sentences"
                    multiline
                  />
                )}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              label={sending ? "Sending…" : "Send message"}
              withArrow={false}
              loading={sending}
              disabled={sending}
              onPress={() =>
                void handleSubmit(submit, (fieldErrors) =>
                  analyticsEvents.itInquiryValidationFailed({
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
  hero: {
    gap: Spacing.sm,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  heroTitle: {
    color: t.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: Spacing.xs,
  },
  heroText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
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
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  chipActive: {
    borderColor: t.colors.accent,
    backgroundColor: "rgba(22,179,100,0.14)",
  },
  chipText: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: t.colors.text,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
}));
