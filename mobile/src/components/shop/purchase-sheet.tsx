import { zodResolver } from "@hookform/resolvers/zod";
import { doc, getDoc } from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { CheckIcon, CoinIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { getDb } from "@/lib/firebase";
import type { Role } from "@/lib/roles";
import {
  formatCoins,
  generateTicketNumber,
  purchaseShopFeature,
  type ShopFeature,
  type ShopPackage,
} from "@/lib/shop";
import { getCategoryConfig, getSizeOptions, isValidUSPhone } from "@/lib/shop-form";

type PurchaseSheetProps = {
  feature: ShopFeature | null;
  userId: string | undefined;
  userRole: Role | null;
  balance: number;
  onClose: () => void;
  onPurchased: () => void;
};

export function PurchaseSheet(props: PurchaseSheetProps) {
  const { feature } = props;
  return (
    <Modal
      visible={feature !== null}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={props.onClose}
    >
      <View style={styles.root}>
        {feature ? (
          <PurchaseSheetInner key={feature.featureKey} {...props} feature={feature} />
        ) : null}
      </View>
    </Modal>
  );
}

type InnerProps = Omit<PurchaseSheetProps, "feature"> & { feature: ShopFeature };

function asStr(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function formatAddress(data: Record<string, unknown>): string {
  const address = data.address;
  if (typeof address === "string" && address.trim()) return address.trim();
  const loc = data.location;
  if (loc && typeof loc === "object") {
    const placeName = (loc as Record<string, unknown>).place_name;
    if (typeof placeName === "string" && placeName.trim()) return placeName.trim();
  }
  if (address && typeof address === "object") {
    const a = address as Record<string, unknown>;
    return [a.street, a.city, a.state, a.zip]
      .filter((part): part is string => typeof part === "string" && part.length > 0)
      .join(", ");
  }
  return "";
}

function PurchaseSheetInner({
  feature,
  userId,
  userRole,
  balance,
  onClose,
  onPurchased,
}: InnerProps) {
  const config = useMemo(() => getCategoryConfig(feature.category), [feature.category]);
  const sizeOptions = useMemo(() => getSizeOptions(feature), [feature]);
  const hasSizes = sizeOptions.length > 0;
  const packages = feature.pricing.packages ?? [];
  const hasPackages = packages.length > 0;

  const defaultPackageId = hasPackages
    ? packages.find((pkg) => pkg.isRecommended)?.id ?? packages[0].id
    : "";
  const defaultSize = hasSizes ? sizeOptions[0] : "";

  const schema = useMemo(
    () =>
      z
        .object({
          email: z
            .string()
            .trim()
            .min(1, "Email is required")
            .email("Enter a valid email address"),
          phone: z
            .string()
            .trim()
            .min(1, "Phone is required")
            .refine(isValidUSPhone, "Enter a valid US phone number (+1 and 10 digits)"),
          address: z.string().optional(),
          message: z.string().optional(),
          packageId: z.string().optional(),
          items: z.array(
            z.object({ size: z.string(), quantity: z.number().int().min(1) }),
          ),
        })
        .superRefine((value, ctx) => {
          if (config.showAddress && !value.address?.trim()) {
            ctx.addIssue({
              path: ["address"],
              code: z.ZodIssueCode.custom,
              message: "Address is required",
            });
          }
          if (config.messageRequired && !value.message?.trim()) {
            ctx.addIssue({
              path: ["message"],
              code: z.ZodIssueCode.custom,
              message: "Message is required",
            });
          }
        }),
    [config.showAddress, config.messageRequired],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      phone: "",
      address: "",
      message: "",
      packageId: defaultPackageId,
      items: [{ size: defaultSize, quantity: 1 }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: "items" });

  const [step, setStep] = useState<"form" | "submitting" | "done">("form");
  const [ticket, setTicket] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    void (async () => {
      try {
        const snap = await getDoc(doc(getDb(), "profiles", userId));
        if (cancelled) return;
        const data = (snap.exists() ? snap.data() : {}) as Record<string, unknown>;
        reset({
          email: asStr(data.email),
          phone: asStr(data.phone),
          address: formatAddress(data),
          message: "",
          packageId: defaultPackageId,
          items: [{ size: defaultSize, quantity: 1 }],
        });
      } catch {
        // keep empty defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, reset, defaultPackageId, defaultSize]);

  const watchedItems = useWatch({ control, name: "items" });
  const watchedPackageId = useWatch({ control, name: "packageId" });

  const rows = watchedItems ?? fields;
  const selectedPackage: ShopPackage | null = hasPackages
    ? packages.find((pkg) => pkg.id === watchedPackageId) ?? null
    : null;
  const unitPrice = selectedPackage ? selectedPackage.price : feature.pricing.basePrice;
  const totalQuantity = config.showItems
    ? rows.reduce((sum, item) => sum + Math.max(1, Number(item?.quantity) || 0), 0)
    : 1;
  const price = unitPrice * totalQuantity;
  const isFree = price === 0;
  const balanceAfter = balance - price;
  const canAfford = isFree || balance >= price;

  const setSize = (index: number, size: string) => {
    const row = rows[index] ?? { size: defaultSize, quantity: 1 };
    update(index, { size, quantity: Math.max(1, Number(row.quantity) || 1) });
  };

  const setQuantity = (index: number, delta: number) => {
    const row = rows[index] ?? { size: defaultSize, quantity: 1 };
    update(index, {
      size: row.size,
      quantity: Math.max(1, (Number(row.quantity) || 1) + delta),
    });
  };

  const submit = async (values: FormValues) => {
    const pkg = hasPackages
      ? packages.find((item) => item.id === values.packageId) ?? null
      : null;
    const unit = pkg ? pkg.price : feature.pricing.basePrice;
    const qty = config.showItems
      ? values.items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 0), 0)
      : 1;
    const total = unit * qty;

    if (!userId) {
      setTopError("You must be signed in to place an order.");
      return;
    }
    if (total > 0 && balance < total) {
      setTopError("Not enough coins to complete this purchase.");
      return;
    }

    setStep("submitting");
    setTopError(null);
    const ticketNumber = generateTicketNumber();

    const formData: Record<string, unknown> = {
      message: values.message?.trim() ?? "",
      phone: values.phone.trim(),
      email: values.email.trim(),
      ...(config.showAddress ? { address: values.address?.trim() ?? "" } : {}),
      ...(config.showItems ? { items: values.items } : {}),
      ticketNumber,
      submittedAt: new Date().toISOString(),
    };

    try {
      await purchaseShopFeature(userId, userRole, feature, pkg, {
        formData,
        ticketNumber,
        totalPrice: total,
        totalQuantity: qty,
      });
      setTicket(ticketNumber);
      setStep("done");
      onPurchased();
    } catch (error) {
      setStep("form");
      setTopError(
        error instanceof Error ? error.message : "Something went wrong, please try again.",
      );
    }
  };

  const submitting = step === "submitting";

  if (step === "done") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <CheckIcon size={40} color={Brand.primaryLight} />
          </View>
          <Text style={styles.doneTitle}>Order placed!</Text>
          <Text style={styles.doneText}>
            Your order <Text style={styles.doneStrong}>{feature.displayName}</Text> has been
            placed.
          </Text>
          {ticket ? (
            <Text style={styles.doneTicket}>Ticket #{ticket}</Text>
          ) : null}
          <Text style={styles.doneText}>Our team is on it and will follow up shortly.</Text>
          <View style={styles.doneButton}>
            <PrimaryButton label="Close" withArrow={false} onPress={onClose} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {config.title}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {feature.displayName} · {feature.category}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Close"
          onPress={onClose}
          disabled={submitting}
          style={styles.close}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
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

          <Text style={styles.intro}>{config.intro}</Text>

          {hasPackages ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select package</Text>
              <View style={styles.packageList}>
                {packages.map((pkg) => {
                  const selected = pkg.id === watchedPackageId;
                  return (
                    <Pressable
                      key={pkg.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => setValue("packageId", pkg.id)}
                      style={[styles.packageRow, selected && styles.packageRowActive]}
                    >
                      <View style={[styles.radio, selected && styles.radioActive]}>
                        {selected ? <View style={styles.radioDot} /> : null}
                      </View>
                      <View style={styles.packageInfo}>
                        <Text style={styles.packageName}>{pkg.displayName}</Text>
                        <Text style={styles.packagePrice}>
                          {formatCoins(pkg.price)} coins
                        </Text>
                      </View>
                      {pkg.isRecommended ? (
                        <View style={styles.recommended}>
                          <Text style={styles.recommendedText}>Recommended</Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {config.showItems ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{hasSizes ? "Items" : "Quantity"}</Text>
              {fields.map((field, index) => {
                const row = rows[index] ?? { size: defaultSize, quantity: 1 };
                return (
                  <View key={field.id} style={styles.itemBlock}>
                    {hasSizes ? (
                      <View style={styles.sizeWrap}>
                        {sizeOptions.map((size) => {
                          const active = row.size === size;
                          return (
                            <Pressable
                              key={size}
                              onPress={() => setSize(index, size)}
                              style={[styles.sizePill, active && styles.sizePillActive]}
                            >
                              <Text
                                style={[
                                  styles.sizePillText,
                                  active && styles.sizePillTextActive,
                                ]}
                              >
                                {size}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}
                    <View style={styles.itemControls}>
                      <View style={styles.stepper}>
                        <Pressable
                          accessibilityLabel="Decrease quantity"
                          onPress={() => setQuantity(index, -1)}
                          style={styles.stepBtn}
                        >
                          <Text style={styles.stepText}>−</Text>
                        </Pressable>
                        <Text style={styles.stepValue}>{row.quantity}</Text>
                        <Pressable
                          accessibilityLabel="Increase quantity"
                          onPress={() => setQuantity(index, 1)}
                          style={styles.stepBtn}
                        >
                          <Text style={styles.stepText}>+</Text>
                        </Pressable>
                      </View>
                      {hasSizes && fields.length > 1 ? (
                        <Pressable
                          accessibilityLabel="Remove item"
                          onPress={() => remove(index)}
                          style={styles.removeBtn}
                        >
                          <Text style={styles.removeText}>Remove</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })}
              {hasSizes ? (
                <Pressable
                  onPress={() => append({ size: defaultSize, quantity: 1 })}
                  style={styles.addItem}
                >
                  <Text style={styles.addItemText}>+ Add another size</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Controller
            control={control}
            name="message"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={config.messageLabel}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.message?.message}
                placeholder={config.messagePlaceholder}
                multiline
              />
            )}
          />

          <Text style={[styles.sectionTitle, styles.contactTitle]}>Contact details</Text>
          <Text style={styles.contactHint}>
            Pre-filled from your profile — update it for this order if needed.
          </Text>

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
              />
            )}
          />
          {config.showAddress ? (
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
                />
              )}
            />
          ) : null}

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              {isFree ? (
                <Text style={styles.summaryFree}>Free</Text>
              ) : (
                <View style={styles.summaryPrice}>
                  <CoinIcon size={16} />
                  <Text style={styles.summaryPriceText}>{formatCoins(price)} coins</Text>
                </View>
              )}
            </View>
            {!isFree ? (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Your balance</Text>
                  <Text style={styles.summaryValue}>{formatCoins(balance)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Balance after</Text>
                  <Text
                    style={[
                      styles.summaryValueStrong,
                      !canAfford && styles.summaryValueDanger,
                    ]}
                  >
                    {formatCoins(balanceAfter)}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {!canAfford ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>
                Not enough coins to complete this purchase.
              </Text>
            </View>
          ) : null}

          <View style={styles.submit}>
            <PrimaryButton
              label={submitting ? "Submitting…" : config.submitLabel}
              withArrow={false}
              loading={submitting}
              disabled={!canAfford || submitting}
              onPress={() => void handleSubmit(submit)()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {submitting ? (
        <View style={styles.blocker} pointerEvents="auto">
          <ActivityIndicator color={Brand.primaryLight} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

type TextFieldProps = {
  label: string;
  value: string | undefined;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
};

function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
}: TextFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value ?? ""}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error ? styles.inputError : null,
        ]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  closeText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.base,
  },
  intro: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  packageList: {
    gap: Spacing.sm,
  },
  packageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  packageRowActive: {
    borderColor: Brand.primary,
    backgroundColor: "rgba(22,179,100,0.08)",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: Brand.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Brand.primary,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  packagePrice: {
    color: Brand.coin,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  recommended: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(22,179,100,0.16)",
  },
  recommendedText: {
    color: Brand.primaryLight,
    fontSize: 10.5,
    fontWeight: "700",
  },
  itemBlock: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sizeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  sizePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sizePillActive: {
    borderColor: Brand.primary,
    backgroundColor: "rgba(22,179,100,0.14)",
  },
  sizePillText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  sizePillTextActive: {
    color: Colors.text,
  },
  itemControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  stepBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  stepValue: {
    minWidth: 32,
    textAlign: "center",
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  removeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  removeText: {
    color: Brand.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  addItem: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.xs,
  },
  addItemText: {
    color: Brand.primaryLight,
    fontSize: 14,
    fontWeight: "700",
  },
  contactTitle: {
    marginTop: Spacing.sm,
  },
  contactHint: {
    color: Colors.textMuted,
    fontSize: 12.5,
    marginTop: -Spacing.sm,
  },
  fieldWrap: {
    gap: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: Brand.danger,
  },
  errorText: {
    color: Brand.danger,
    fontSize: 12.5,
  },
  errorBanner: {
    borderRadius: Radius.md,
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
  summary: {
    gap: Spacing.sm,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 14,
  },
  summaryValueStrong: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  summaryValueDanger: {
    color: Brand.danger,
  },
  summaryFree: {
    color: Brand.primaryLight,
    fontSize: 15,
    fontWeight: "800",
  },
  summaryPrice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  summaryPriceText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  submit: {
    marginTop: Spacing.sm,
  },
  blocker: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,7,12,0.35)",
  },
  doneWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  doneCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.14)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
    marginBottom: Spacing.sm,
  },
  doneTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  doneText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  doneStrong: {
    color: Colors.text,
    fontWeight: "700",
  },
  doneTicket: {
    color: Brand.coin,
    fontSize: 15,
    fontWeight: "700",
  },
  doneButton: {
    alignSelf: "stretch",
    marginTop: Spacing.base,
  },
});
