import { useCallback, useEffect, useRef, useState } from "react";

type SpeechPermission = {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
};

type SpeechResultEvent = {
  results?: { transcript?: string }[];
  isFinal?: boolean;
};

type SpeechVolumeEvent = { value: number };

type SpeechSubscription = { remove: () => void };

interface SpeechModule {
  getPermissionsAsync: () => Promise<SpeechPermission>;
  requestPermissionsAsync: () => Promise<SpeechPermission>;
  start: (options: Record<string, unknown>) => void;
  stop: () => void;
  abort: () => void;
  addListener(
    event: "result",
    listener: (event: SpeechResultEvent) => void,
  ): SpeechSubscription;
  addListener(
    event: "volumechange",
    listener: (event: SpeechVolumeEvent) => void,
  ): SpeechSubscription;
  addListener(
    event: "end" | "start" | "error",
    listener: () => void,
  ): SpeechSubscription;
}

const VOLUME_MIN = -2;
const VOLUME_MAX = 10;
const SAMPLE_BUFFER = 32;

function normalizeVolume(value: number): number {
  const clamped = Math.min(Math.max(value, VOLUME_MIN), VOLUME_MAX);
  return (clamped - VOLUME_MIN) / (VOLUME_MAX - VOLUME_MIN);
}

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

let resolved: SpeechModule | null | undefined;

function getSpeechModule(): SpeechModule | null {
  if (resolved !== undefined) return resolved;
  try {
    const imported = require("expo-speech-recognition") as {
      ExpoSpeechRecognitionModule?: SpeechModule;
    };
    resolved = imported.ExpoSpeechRecognitionModule ?? null;
  } catch {
    resolved = null;
  }
  return resolved;
}

export function isDictationAvailable(): boolean {
  return getSpeechModule() !== null;
}

type UseDictationOptions = {
  lang?: string;
  onTranscript: (text: string) => void;
};

export function useDictation({
  lang = "en-US",
  onTranscript,
}: UseDictationOptions) {
  const [recording, setRecording] = useState(false);
  const [samples, setSamples] = useState<number[]>([]);
  const [available] = useState(() => getSpeechModule() !== null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const speech = getSpeechModule();
    if (!speech) return;

    const stopRecording = () => {
      setRecording(false);
      setSamples([]);
    };

    let subscriptions: SpeechSubscription[] = [];
    try {
      subscriptions = [
        speech.addListener("result", (event) => {
          const transcript = event.results?.[0]?.transcript;
          if (transcript) onTranscriptRef.current(capitalizeFirst(transcript));
        }),
        speech.addListener("volumechange", (event) => {
          setSamples((prev) =>
            [...prev, normalizeVolume(event.value)].slice(-SAMPLE_BUFFER),
          );
        }),
        speech.addListener("end", stopRecording),
        speech.addListener("error", stopRecording),
      ];
    } catch {
      subscriptions = [];
    }

    return () => {
      for (const subscription of subscriptions) {
        try {
          subscription.remove();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    const speech = getSpeechModule();
    if (!speech) return false;

    try {
      let permission = await speech.getPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) {
        permission = await speech.requestPermissionsAsync();
      }
      if (!permission.granted) return false;

      setSamples([]);
      setRecording(true);
      speech.start({
        lang,
        interimResults: true,
        continuous: true,
        volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
      });
      return true;
    } catch {
      setRecording(false);
      return false;
    }
  }, [lang]);

  const stop = useCallback(() => {
    const speech = getSpeechModule();
    try {
      speech?.stop();
    } catch {
      // ignore
    }
    setRecording(false);
    setSamples([]);
  }, []);

  return { available, recording, samples, start, stop };
}
