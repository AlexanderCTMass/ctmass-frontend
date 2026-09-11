import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";
import { deleteImage } from "@/lib/storage-upload";

export type CertificateFile = {
  id: string;
  name: string;
  url: string;
  type: string;
  isPublic: boolean;
};

export type Certificate = {
  id: string;
  documentType: string;
  institution: string;
  specialty: string;
  year: string;
  files: CertificateFile[];
};

export type NewCertificateFile = {
  url: string;
  name: string;
  type: string;
  isPublic: boolean;
};

export type NewCertificate = {
  documentType: string;
  institution: string;
  specialty: string;
  year: string;
  files: NewCertificateFile[];
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
        name: str(file.name) || "Document",
        url: str(file.url),
        type: str(file.type),
        isPublic: file.isPublic !== false,
      };
    })
    .filter((file) => file.url.length > 0);
}

function mapCertificate(id: string, data: Record<string, unknown>): Certificate {
  return {
    id,
    documentType: str(data.documentType) || str(data.certificateType),
    institution:
      str(data.institution) || str(data.issuingOrganization) || str(data.title),
    specialty: str(data.specialty) || str(data.degree),
    year: str(data.year) || str(data.startYear),
    files: mapFiles(data),
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

export async function fetchPublicCertificates(
  uid: string,
): Promise<Certificate[]> {
  const all = await fetchCertificates(uid);
  return all
    .map((cert) => ({
      ...cert,
      files: cert.files.filter((file) => file.isPublic),
    }))
    .filter((cert) => cert.files.length > 0);
}

export async function addCertificate(
  uid: string,
  input: NewCertificate,
): Promise<string> {
  const db = getDb();
  const ref = doc(collection(db, "profiles", uid, "education"));
  const uploadedAt = new Date().toISOString().split("T")[0];
  const files = input.files.map((file, index) => ({
    id: `${ref.id}_${index}`,
    name: file.name,
    url: file.url,
    size: 0,
    type: file.type,
    isPublic: file.isPublic,
  }));
  const certificates = files.map((file) => ({
    ...file,
    tags: [],
    uploadedAt,
  }));

  await setDoc(ref, {
    id: ref.id,
    documentType: input.documentType,
    certificateType: input.documentType,
    institution: input.institution,
    issuingOrganization: input.institution,
    title: input.institution,
    specialty: input.specialty,
    degree: input.specialty,
    year: input.year,
    startYear: input.year,
    visibility: {
      showInstitution: true,
      showSpecialty: true,
      showDegree: true,
      showStartEndDates: true,
      showGPA: true,
      showDocumentNumber: true,
    },
    linkedTradeIds: [],
    certificates,
    files,
    source: "mobile",
    createdAt: serverTimestamp(),
  });

  return ref.id;
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
