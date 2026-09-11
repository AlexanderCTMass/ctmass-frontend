import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Share } from "react-native";

export async function shareProfileLink(
  url: string,
  name: string,
): Promise<void> {
  await Share.share({
    message: `Check out ${name} on CTMASS — ${url}`,
    url,
  });
}

export async function shareQrImage(
  base64Png: string,
  name: string,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) return;
  const safe = name.replace(/[^a-z0-9]+/gi, "_").slice(0, 40) || "profile";
  const file = new File(Paths.cache, `ctmass_${safe}_${Date.now()}.png`);
  file.write(base64Png, { encoding: "base64" });
  await Sharing.shareAsync(file.uri, {
    mimeType: "image/png",
    dialogTitle: "Share QR code",
    UTI: "public.png",
  });
}
