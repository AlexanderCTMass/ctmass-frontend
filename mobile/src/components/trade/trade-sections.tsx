import type { ReactNode } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { ShieldCheckIcon } from "@/components/icons";
import { TierBadge } from "@/components/trade/tier-badge";
import {
  PRICE_DISCLAIMER,
  RESPONSE_SOURCE_NOTE,
  RESPONSE_TIMES,
  businessRoleLabel,
  businessStructureLabel,
  crewSizeLabel,
  emergencyLabel,
  estimateLabel,
  paymentMethodLabel,
  permitsLabel,
  pricingModelLabel,
  projectTypeLabel,
  warrantyLabel,
  workByLabel,
} from "@/constants/trade-options";
import { contactMethodLabel } from "@/constants/project-request";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import {
  type OwnerPublic,
  reachableMethods,
  websiteHost,
  yearsInBusiness,
} from "@/lib/business-profile";
import { useT } from "@/lib/i18n";
import {
  type TradeCredential,
  type TradeDetails,
  isCredentialCurrent,
} from "@/lib/trade-details";
import {
  availabilityLine,
  hasListedRate,
  priceLine,
  shortDate,
} from "@/lib/trade-display";

export function InfoRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: ReactNode;
  muted?: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {typeof value === "string" ? (
        <Text style={[styles.rowValue, muted && styles.rowMuted]}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}

export function Panel({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <View style={styles.panel}>{children}</View>;
}

function money(value: number | null): string {
  return value === null ? "" : `$${value.toLocaleString("en-US")}`;
}

function CredentialBlock({
  title,
  credential,
  details,
  showDocument,
}: {
  title: string;
  credential: TradeCredential | null;
  details: string[];
  showDocument: boolean;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const current = isCredentialCurrent(credential);
  const status = !credential
    ? t("compare.values.notProvided")
    : current
      ? t("trade.sections.providedByContractor")
      : t("compare.values.expired");
  return (
    <View style={styles.credential}>
      <View style={[styles.credIcon, !current && styles.credIconMuted]}>
        <ShieldCheckIcon
          size={18}
          color={current ? colors.accent : colors.textMuted}
        />
      </View>
      <View style={styles.credBody}>
        <Text style={styles.credTitle}>{title}</Text>
        <Text style={[styles.credStatus, !current && styles.rowMuted]}>
          {status}
        </Text>
        {credential
          ? details.filter(Boolean).map((line) => (
              <Text key={line} style={styles.credDetail}>
                {line}
              </Text>
            ))
          : null}
        {showDocument && credential?.documentUrl ? (
          <Pressable
            accessibilityRole="link"
            hitSlop={6}
            onPress={() =>
              void Linking.openURL(credential.documentUrl).catch(
                () => undefined,
              )
            }
          >
            <Text style={styles.link}>{t("trade.sections.viewDocument")}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function CredentialsPanel({
  details,
  isOwner = false,
}: {
  details: TradeDetails;
  isOwner?: boolean;
}) {
  const styles = useStyles();
  const { t, tx } = useT();
  const license = details.license;
  const insurance = details.insurance;
  return (
    <Panel>
      <CredentialBlock
        title={t("compare.rows.license")}
        credential={license}
        showDocument={isOwner}
        details={[
          [license?.state, license?.type].filter(Boolean).join(" · "),
          license?.number
            ? t("trade.sections.licenseNumber", { number: license.number })
            : "",
          license?.expiresAt
            ? t("trade.sections.validThrough", {
                date: shortDate(license.expiresAt),
              })
            : "",
        ]}
      />
      <View style={styles.divider} />
      <CredentialBlock
        title={t("compare.rows.insurance")}
        credential={insurance}
        showDocument={isOwner}
        details={[
          tx(insurance?.type ?? ""),
          insurance?.expiresAt
            ? t("trade.sections.validThrough", {
                date: shortDate(insurance.expiresAt),
              })
            : "",
        ]}
      />
      <Text style={styles.note}>{t("trade.sections.credentialsNote")}</Text>
    </Panel>
  );
}

export function PricingPanel({ details }: { details: TradeDetails }) {
  const styles = useStyles();
  const { t, tx } = useT();
  const rates = details.rates;
  const listed = hasListedRate(rates);
  return (
    <Panel>
      <Text style={[styles.price, !listed && styles.priceMuted]}>
        {priceLine(rates, t)}
      </Text>
      {rates && rates.model !== "not_provided" ? (
        <InfoRow
          label={t("trade.sections.pricing")}
          value={pricingModelLabel(rates.model, t)}
        />
      ) : null}
      {rates?.minimumCharge !== null && rates?.minimumCharge !== undefined ? (
        <InfoRow
          label={t("trade.sections.minimumCharge")}
          value={money(rates.minimumCharge)}
        />
      ) : null}
      {rates?.serviceCallFee !== null && rates?.serviceCallFee !== undefined ? (
        <InfoRow
          label={t("trade.sections.serviceCall")}
          value={
            rates.serviceCallCredited
              ? t("trade.sections.serviceCallCredited", {
                  fee: money(rates.serviceCallFee),
                })
              : money(rates.serviceCallFee)
          }
        />
      ) : null}
      {rates?.afterHours ? (
        <InfoRow
          label={t("trade.sections.afterHours")}
          value={rates.afterHours}
        />
      ) : null}
      {rates?.travelFee ? (
        <InfoRow label={t("trade.sections.travel")} value={rates.travelFee} />
      ) : null}
      {rates?.materials ? (
        <InfoRow
          label={t("trade.sections.materials")}
          value={rates.materials}
        />
      ) : null}
      {rates?.note ? (
        <InfoRow label={t("trade.sections.note")} value={rates.note} />
      ) : null}
      {details.workPolicy.estimate ? (
        <InfoRow
          label={t("trade.sections.estimates")}
          value={[
            estimateLabel(details.workPolicy.estimate, t),
            details.workPolicy.estimateNote,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
      ) : null}
      {rates?.updatedAt ? (
        <Text style={styles.note}>
          {t("trade.sections.lastUpdated", {
            date: shortDate(rates.updatedAt),
          })}
        </Text>
      ) : null}
      <Text style={styles.note}>{tx(PRICE_DISCLAIMER)}</Text>
    </Panel>
  );
}

export function ExperiencePanel({
  details,
  tradeLabel,
  owner,
  completedJobs,
  since,
}: {
  details: TradeDetails;
  tradeLabel: string;
  owner: OwnerPublic | null;
  completedJobs: number;
  since: string;
}) {
  const styles = useStyles();
  const { t } = useT();
  const businessYears = owner ? yearsInBusiness(owner.business) : null;
  const years = details.experienceYears;
  return (
    <Panel>
      {years !== null ? (
        <View style={styles.tierRow}>
          <TierBadge years={years} />
          <Text style={styles.tierText}>
            {t("trade.sections.yearsIn", { count: years, trade: tradeLabel })}
          </Text>
        </View>
      ) : (
        <InfoRow
          label={t("trade.sections.yearsInLabel", { trade: tradeLabel })}
          value={t("compare.values.notProvided")}
          muted
        />
      )}
      <InfoRow
        label={t("compare.rows.yearsInBusiness")}
        value={
          businessYears !== null
            ? String(businessYears)
            : t("compare.values.notProvided")
        }
        muted={businessYears === null}
      />
      <InfoRow
        label={t("trade.sections.completedJobs")}
        value={
          completedJobs > 0
            ? String(completedJobs)
            : t("compare.values.noneYet")
        }
        muted={completedJobs === 0}
      />
      {since ? (
        <InfoRow label={t("trade.sections.onSince")} value={since} />
      ) : null}
      <Text style={styles.note}>{t("trade.sections.experienceNote")}</Text>
    </Panel>
  );
}

export function AvailabilityPanel({
  details,
  owner,
}: {
  details: TradeDetails;
  owner: OwnerPublic | null;
}) {
  const { t, tx } = useT();
  const availability = details.availability;
  const schedule = availabilityLine(availability, t);
  const response = RESPONSE_TIMES.find(
    (item) => item.value === details.responseTime,
  );
  const methods = owner ? reachableMethods(owner) : [];
  return (
    <Panel>
      <InfoRow
        label={t("trade.sections.schedule")}
        value={schedule || t("compare.values.notProvided")}
        muted={!schedule}
      />
      {availability && availability.emergency !== "none" ? (
        <InfoRow
          label={t("compare.rows.emergency")}
          value={[
            emergencyLabel(availability.emergency, t),
            availability.emergencyNote,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
      ) : null}
      <InfoRow
        label={t("trade.sections.typicalResponse")}
        value={
          response
            ? `${tx(response.label)} · ${tx(RESPONSE_SOURCE_NOTE)}`
            : t("trade.sections.responseNotEstablished")
        }
        muted={!response}
      />
      <InfoRow
        label={t("trade.sections.preferredContact")}
        value={(methods.length > 0 ? methods : (["app"] as const))
          .map((method) => contactMethodLabel(method, t))
          .join(", ")}
      />
      {details.radiusMiles ? (
        <InfoRow
          label={t("trade.sections.serviceRadius")}
          value={t("trade.sections.miles", { count: details.radiusMiles })}
        />
      ) : null}
      {details.areas.length > 0 ? (
        <InfoRow
          label={t("trade.sections.areasServed")}
          value={details.areas.join(", ")}
        />
      ) : null}
    </Panel>
  );
}

export function hasWorkProcess(details: TradeDetails): boolean {
  const policy = details.workPolicy;
  return Boolean(
    policy.permits ||
      policy.warranty ||
      policy.workBy ||
      policy.projectTypes.length,
  );
}

export function WorkProcessPanel({ details }: { details: TradeDetails }) {
  const { t } = useT();
  const policy = details.workPolicy;
  return (
    <Panel>
      {policy.projectTypes.length > 0 ? (
        <InfoRow
          label={t("trade.sections.projectTypes")}
          value={policy.projectTypes
            .map((type) => projectTypeLabel(type, t))
            .join(", ")}
        />
      ) : null}
      {policy.workBy ? (
        <InfoRow
          label={t("trade.sections.workBy")}
          value={workByLabel(policy.workBy, t)}
        />
      ) : null}
      {policy.permits ? (
        <InfoRow
          label={t("trade.sections.permits")}
          value={permitsLabel(policy.permits, t)}
        />
      ) : null}
      {policy.warranty ? (
        <InfoRow
          label={t("trade.sections.warranty")}
          value={[warrantyLabel(policy.warranty, t), policy.warrantyTerms]
            .filter(Boolean)
            .join(" · ")}
        />
      ) : null}
    </Panel>
  );
}

export function hasBusinessDetails(owner: OwnerPublic | null): boolean {
  if (!owner) return false;
  const business = owner.business;
  return Boolean(
    business.role ||
      (business.structure && business.structure !== "undisclosed") ||
      business.crewSize ||
      business.languages.length ||
      business.paymentMethods.length ||
      business.website ||
      owner.businessName,
  );
}

export function BusinessPanel({ owner }: { owner: OwnerPublic }) {
  const styles = useStyles();
  const { t, tx } = useT();
  const business = owner.business;
  const structure = businessStructureLabel(business.structure, t);
  return (
    <Panel>
      {owner.businessName ? (
        <InfoRow
          label={t("trade.sections.company")}
          value={owner.businessName}
        />
      ) : null}
      {business.role ? (
        <InfoRow
          label={t("trade.sections.role")}
          value={businessRoleLabel(business.role, t)}
        />
      ) : null}
      {structure ? (
        <InfoRow label={t("trade.sections.structure")} value={structure} />
      ) : null}
      {business.crewSize ? (
        <InfoRow
          label={t("trade.sections.crewSize")}
          value={
            business.usesSubcontractors
              ? t("trade.sections.crewUsesSubs", {
                  crew: crewSizeLabel(business.crewSize, t),
                })
              : crewSizeLabel(business.crewSize, t)
          }
        />
      ) : null}
      {business.languages.length > 0 ? (
        <InfoRow
          label={t("compare.rows.languages")}
          value={business.languages.map(tx).join(", ")}
        />
      ) : null}
      {business.paymentMethods.length > 0 ? (
        <InfoRow
          label={t("trade.sections.paymentMethods")}
          value={business.paymentMethods
            .map((method) => paymentMethodLabel(method, t))
            .join(", ")}
        />
      ) : null}
      {business.website ? (
        <InfoRow
          label={t("trade.sections.website")}
          value={
            <Pressable
              accessibilityRole="link"
              hitSlop={6}
              onPress={() =>
                void Linking.openURL(business.website).catch(() => undefined)
              }
            >
              <Text style={styles.link}>{websiteHost(business.website)}</Text>
            </Pressable>
          }
        />
      ) : null}
      {owner.email ? (
        <InfoRow
          label={t("compare.values.email")}
          value={
            <Pressable
              accessibilityRole="link"
              hitSlop={6}
              onPress={() =>
                void Linking.openURL(`mailto:${owner.email}`).catch(
                  () => undefined,
                )
              }
            >
              <Text style={styles.link}>{owner.email}</Text>
            </Pressable>
          }
        />
      ) : null}
    </Panel>
  );
}

const useStyles = makeStyles((t) => ({
  panel: {
    padding: Spacing.base,
    gap: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  row: {
    gap: 2,
  },
  rowLabel: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  rowValue: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
  },
  rowMuted: {
    color: t.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: t.colors.border,
  },
  note: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
  },
  link: {
    color: t.colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  price: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  priceMuted: {
    color: t.colors.textSecondary,
    fontSize: 16,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tierText: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  credential: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  credIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  credIconMuted: {
    backgroundColor: t.colors.surfaceStrong,
  },
  credBody: {
    flex: 1,
    gap: 2,
  },
  credTitle: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  credStatus: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  credDetail: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
  },
}));
