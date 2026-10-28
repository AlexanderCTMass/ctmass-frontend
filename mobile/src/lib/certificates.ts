import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";
import { deleteImage } from "@/lib/storage-upload";
import i18n from "@/lib/i18n";

export type CertificateFile = {
  id: string;
  name: string;
  url: string;
  type: string;
  isPublic: boolean;
  uploadedAt: string;
};

export type CertificateVisibility = {
  institution: boolean;
  specialty: boolean;
  year: boolean;
  number: boolean;
};

export type Certificate = {
  id: string;
  documentType: string;
  institution: string;
  specialty: string;
  year: string;
  documentNumber: string;
  isPublic: boolean;
  visibility: CertificateVisibility;
  files: CertificateFile[];
  linkedTradeIds: string[];
};

export type CertificateFileInput = {
  url: string;
  name: string;
  type: string;
  id?: string;
};

export type CertificateInput = {
  documentType: string;
  institution: string;
  specialty: string;
  year: string;
  documentNumber: string;
  isPublic: boolean;
  showPhotos: boolean;
  visibility: CertificateVisibility;
  files: CertificateFileInput[];
};

export const FULL_VISIBILITY: CertificateVisibility = {
  institution: true,
  specialty: true,
  year: true,
  number: true,
};

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function mapFiles(data: Record<string, unknown>): CertificateFile[] {
  const raw = Array.isArray(data.certificates)
    ? data.certificates
    : Array.isArray(data.files)
      ? data.files
      : [];
  return raw
    .map((item, index) => {
      const file = asRecord(item);
      return {
        id: str(file.id) || String(index),
        name: str(file.name) || i18n.t("tradePage.document"),
        url: str(file.url),
        type: str(file.type),
        isPublic: file.isPublic !== false,
        uploadedAt: str(file.uploadedAt),
      };
    })
    .filter((file) => file.url.length > 0);
}

function readVisibility(value: unknown): CertificateVisibility {
  const raw = asRecord(value);
  return {
    institution: raw.showInstitution !== false,
    specialty: raw.showSpecialty !== false && raw.showDegree !== false,
    year: raw.showStartEndDates !== false,
    number: raw.showDocumentNumber !== false,
  };
}

function mapCertificate(
  id: string,
  data: Record<string, unknown>,
): Certificate {
  return {
    id,
    documentType: str(data.documentType) || str(data.certificateType),
    institution:
      str(data.institution) || str(data.issuingOrganization) || str(data.title),
    specialty: str(data.specialty) || str(data.degree),
    year: str(data.year) || str(data.startYear),
    documentNumber: str(data.documentNumber),
    isPublic: data.isPublic !== false,
    visibility: readVisibility(data.visibility),
    files: mapFiles(data),
    linkedTradeIds: Array.isArray(data.linkedTradeIds)
      ? data.linkedTradeIds.filter((id): id is string => typeof id === "string")
      : [],
  };
}

export async function fetchCertificates(uid: string): Promise<Certificate[]> {
  if (!uid) return [];
  const db = getDb();
  const snapshot = await getDocs(collection(db, "profiles", uid, "education"));
  return snapshot.docs.map((docSnap) =>
    mapCertificate(docSnap.id, asRecord(docSnap.data())),
  );
}

export async function hasAnyCertificate(uid: string): Promise<boolean> {
  if (!uid) return false;
  const snapshot = await getDocs(
    query(collection(getDb(), "profiles", uid, "education"), limit(1)),
  );
  return !snapshot.empty;
}

export function publicView(cert: Certificate): Certificate | null {
  if (!cert.isPublic) return null;
  const view: Certificate = {
    ...cert,
    institution: cert.visibility.institution ? cert.institution : "",
    specialty: cert.visibility.specialty ? cert.specialty : "",
    year: cert.visibility.year ? cert.year : "",
    documentNumber: cert.visibility.number ? cert.documentNumber : "",
    files: cert.files.filter((file) => file.isPublic),
  };
  const hasContent =
    view.files.length > 0 ||
    Boolean(view.documentType || view.institution || view.specialty);
  return hasContent ? view : null;
}

export async function fetchPublicCertificates(
  uid: string,
): Promise<Certificate[]> {
  const all = await fetchCertificates(uid);
  return all
    .map(publicView)
    .filter((cert): cert is Certificate => cert !== null);
}

function certificateFields(
  certificateId: string,
  input: CertificateInput,
  existing: CertificateFile[] = [],
) {
  const uploadedAt = new Date().toISOString().split("T")[0];
  const filesPublic = input.isPublic && input.showPhotos;
  const visibility = input.isPublic
    ? input.visibility
    : { institution: false, specialty: false, year: false, number: false };
  const stamp = Date.now().toString(36);
  const files = input.files.map((file, index) => ({
    id: file.id ?? `${certificateId}_${stamp}_${index}`,
    name: file.name,
    url: file.url,
    size: 0,
    type: file.type,
    isPublic: filesPublic,
  }));
  const known = new Map(existing.map((file) => [file.id, file.uploadedAt]));
  const certificates = files.map((file) => ({
    ...file,
    tags: [],
    uploadedAt: known.get(file.id) || uploadedAt,
  }));
  return {
    documentType: input.documentType,
    certificateType: input.documentType,
    institution: input.institution,
    issuingOrganization: input.institution,
    title: input.institution,
    specialty: input.specialty,
    degree: input.specialty,
    year: input.year,
    startYear: input.year,
    documentNumber: input.documentNumber,
    isPublic: input.isPublic,
    visibility: {
      showInstitution: visibility.institution,
      showSpecialty: visibility.specialty,
      showDegree: visibility.specialty,
      showStartEndDates: visibility.year,
      showGPA: input.isPublic,
      showDocumentNumber: visibility.number,
    },
    certificates,
    files,
  };
}

export async function addCertificate(
  uid: string,
  input: CertificateInput,
): Promise<string> {
  const db = getDb();
  const ref = doc(collection(db, "profiles", uid, "education"));
  await setDoc(ref, {
    id: ref.id,
    ...certificateFields(ref.id, input),
    linkedTradeIds: [],
    source: "mobile",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCertificate(
  uid: string,
  previous: Certificate,
  input: CertificateInput,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "profiles", uid, "education", previous.id), {
    ...certificateFields(previous.id, input, previous.files),
    updatedAt: serverTimestamp(),
  });
  const kept = new Set(input.files.map((file) => file.url));
  await Promise.all(
    previous.files
      .filter((file) => !kept.has(file.url))
      .map((file) => deleteImage(file.url).catch(() => undefined)),
  );
}

export async function deleteCertificate(
  uid: string,
  certificateId: string,
  fileUrls: string[] = [],
): Promise<void> {
  await Promise.all(
    fileUrls.map((url) => deleteImage(url).catch(() => undefined)),
  );
  const db = getDb();
  await deleteDoc(doc(db, "profiles", uid, "education", certificateId));
}

export function certificateTitle(
  cert: Certificate,
  translate: (value: string) => string,
): string {
  return cert.institution || translate(cert.documentType);
}

export function certificateSubtitle(
  cert: Certificate,
  translate: (value: string) => string,
  numberLabel: (number: string) => string,
): string {
  return [
    cert.institution ? translate(cert.documentType) : "",
    cert.specialty,
    cert.year,
    cert.documentNumber ? numberLabel(cert.documentNumber) : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
