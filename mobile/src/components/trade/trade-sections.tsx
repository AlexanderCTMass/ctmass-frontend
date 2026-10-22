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
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import {
  type OwnerPublic,
  websiteHost,
  yearsInBusiness,
} from "@/lib/business-profile";
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

const NOT_PROVIDED = "Not provided";

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
  const current = isCredentialCurrent(credential);
  const status = !credential
    ? NOT_PROVIDED
    : current
      ? "Provided by contractor"
      : "Expired";
  return (
    <View style={styles.credential}>
      <View style={[styles.credIcon, !current && styles.credIconMuted]}>
        <ShieldCheckIcon size={18} color={current ? colors.accent : colors.textMuted} />
      </View>
      <View style={styles.credBody}>
        <Text style={styles.credTitle}>{title}</Text>
        <Text style={[styles.credStatus, !current && styles.rowMuted]}>{status}</Text>
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
            onPress={() => void Linking.openURL(credential.documentUrl).catch(() => undefined)}
          >
            <Text style={styles.link}>View document</Text>
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
  const license = details.license;
  const insurance = details.insurance;
  return (
    <Panel>
      <CredentialBlock
        title="License"
        credential={license}
        showDocument={isOwner}
        details={[
          [license?.state, license?.type].filter(Boolean).join(" · "),
          license?.number ? `No. ${license.number}` : "",
          license?.expiresAt ? `Valid through ${shortDate(license.expiresAt)}` : "",
        ]}
      />
      <View style={styles.divider} />
      <CredentialBlock
        title="Insurance"
        credential={insurance}
        showDocument={isOwner}
        details={[
          insurance?.type ?? "",
          insurance?.expiresAt ? `Valid through ${shortDate(insurance.expiresAt)}` : "",
        ]}
      />
      <Text style={styles.note}>
        Documents are provided by the contractor. CTMASS does not verify licenses
        or insurance — confirm with your state licensing board before hiring.
      </Text>
    </Panel>
  );
}

export function PricingPanel({ details }: { details: TradeDetails }) {
  const styles = useStyles();
  const rates = details.rates;
  const listed = hasListedRate(rates);
  return (
    <Panel>
      <Text style={[styles.price, !listed && styles.priceMuted]}>
        {priceLine(rates)}
      </Text>
      {rates && rates.model !== "not_provided" ? (
        <InfoRow label="Pricing" value={pricingModelLabel(rates.model)} />
      ) : null}
      {rates?.minimumCharge !== null && rates?.minimumCharge !== undefined ? (
        <InfoRow label="Minimum charge" value={money(rates.minimumCharge)} />
      ) : null}
      {rates?.serviceCallFee !== null && rates?.serviceCallFee !== undefined ? (
        <InfoRow
          label="Service call"
          value={`${money(rates.serviceCallFee)}${rates.serviceCallCredited ? " · credited toward the repair" : ""}`}
        />
      ) : null}
      {rates?.afterHours ? (
        <InfoRow label="After hours" value={rates.afterHours} />
      ) : null}
      {rates?.travelFee ? <InfoRow label="Travel" value={rates.travelFee} /> : null}
      {rates?.materials ? (
        <InfoRow label="Materials" value={rates.materials} />
      ) : null}
      {rates?.note ? <InfoRow label="Note" value={rates.note} /> : null}
      {details.workPolicy.estimate ? (
        <InfoRow
          label="Estimates"
          value={[estimateLabel(details.workPolicy.estimate), details.workPolicy.estimateNote]
            .filter(Boolean)
            .join(" · ")}
        />
      ) : null}
      {rates?.updatedAt ? (
        <Text style={styles.note}>Last updated {shortDate(rates.updatedAt)}</Text>
      ) : null}
      <Text style={styles.note}>{PRICE_DISCLAIMER}</Text>
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
  const businessYears = owner ? yearsInBusiness(owner.business) : null;
  const years = details.experienceYears;
  return (
    <Panel>
      {years !== null ? (
        <View style={styles.tierRow}>
          <TierBadge years={years} />
          <Text style={styles.tierText}>
            {years} {years === 1 ? "year" : "years"} in {tradeLabel}
          </Text>
        </View>
      ) : (
        <InfoRow label={`Years in ${tradeLabel}`} value={NOT_PROVIDED} muted />
      )}
      <InfoRow
        label="Years in business"
        value={businessYears !== null ? String(businessYears) : NOT_PROVIDED}
        muted={businessYears === null}
      />
      <InfoRow
        label="Completed jobs on CTMASS"
        value={completedJobs > 0 ? String(completedJobs) : "None yet"}
        muted={completedJobs === 0}
      />
      {since ? <InfoRow label="On CTMASS since" value={since} /> : null}
      <Text style={styles.note}>Experience is provided by the contractor.</Text>
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
  const availability = details.availability;
  const schedule = availabilityLine(availability);
  const response = RESPONSE_TIMES.find((item) => item.value === details.responseTime);
  const preferred = owner?.contact.preferred ?? "message";
  return (
    <Panel>
      <InfoRow
        label="Schedule"
        value={schedule || NOT_PROVIDED}
        muted={!schedule}
      />
      {availability && availability.emergency !== "none" ? (
        <InfoRow
          label="Emergency"
          value={[emergencyLabel(availability.emergency), availability.emergencyNote]
            .filter(Boolean)
            .join(" · ")}
        />
      ) : null}
      <InfoRow
        label="Typical response"
        value={response ? `${response.label} · ${RESPONSE_SOURCE_NOTE}` : "Response time not yet established"}
        muted={!response}
      />
      <InfoRow
        label="Preferred contact"
        value={
          preferred === "phone"
            ? "Phone call"
            : preferred === "email"
              ? "Email"
              : "CTMASS message"
        }
      />
      {details.radiusMiles ? (
        <InfoRow label="Service radius" value={`${details.radiusMiles} miles`} />
      ) : null}
      {details.areas.length > 0 ? (
        <InfoRow label="Areas served" value={details.areas.join(", ")} />
      ) : null}
    </Panel>
  );
}

export function hasWorkProcess(details: TradeDetails): boolean {
  const policy = details.workPolicy;
  return Boolean(
    policy.permits || policy.warranty || policy.workBy || policy.projectTypes.length,
  );
}

export function WorkProcessPanel({ details }: { details: TradeDetails }) {
  const policy = details.workPolicy;
  return (
    <Panel>
      {policy.projectTypes.length > 0 ? (
        <InfoRow
          label="Project types"
          value={policy.projectTypes.map(projectTypeLabel).join(", ")}
        />
      ) : null}
      {policy.workBy ? (
        <InfoRow label="Work performed by" value={workByLabel(policy.workBy)} />
      ) : null}
      {policy.permits ? <InfoRow label="Permits" value={permitsLabel(policy.permits)} /> : null}
      {policy.warranty ? (
        <InfoRow
          label="Workmanship warranty"
          value={[warrantyLabel(policy.warranty), policy.warrantyTerms]
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
      businessStructureLabel(business.structure) ||
      business.crewSize ||
      business.languages.length ||
      business.paymentMethods.length ||
      business.website ||
      owner.businessName,
  );
}

export function BusinessPanel({ owner }: { owner: OwnerPublic }) {
  const styles = useStyles();
  const business = owner.business;
  const structure = businessStructureLabel(business.structure);
  return (
    <Panel>
      {owner.businessName ? <InfoRow label="Company" value={owner.businessName} /> : null}
      {business.role ? <InfoRow label="Role" value={businessRoleLabel(business.role)} /> : null}
      {structure ? <InfoRow label="Business structure" value={structure} /> : null}
      {business.crewSize ? (
        <InfoRow
          label="Crew size"
          value={`${crewSizeLabel(business.crewSize)}${business.usesSubcontractors ? " · uses subcontractors" : ""}`}
        />
      ) : null}
      {business.languages.length > 0 ? (
        <InfoRow label="Languages" value={business.languages.join(", ")} />
      ) : null}
      {business.paymentMethods.length > 0 ? (
        <InfoRow
          label="Payment methods"
          value={business.paymentMethods.map(paymentMethodLabel).join(", ")}
        />
      ) : null}
      {business.website ? (
        <InfoRow
          label="Website"
          value={
            <Pressable
              accessibilityRole="link"
              hitSlop={6}
              onPress={() => void Linking.openURL(business.website).catch(() => undefined)}
            >
              <Text style={styles.link}>{websiteHost(business.website)}</Text>
            </Pressable>
          }
        />
      ) : null}
      {owner.email ? (
        <InfoRow
          label="Email"
          value={
            <Pressable
              accessibilityRole="link"
              hitSlop={6}
              onPress={() => void Linking.openURL(`mailto:${owner.email}`).catch(() => undefined)}
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
