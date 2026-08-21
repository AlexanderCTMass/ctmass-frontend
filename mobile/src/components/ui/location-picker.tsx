import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapPinIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { WebViewMap } from "@/components/ui/webview-map";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { selectFeedback, tapFeedback } from "@/lib/haptics";
import {
  type GeoPlace,
  US_ONLY_LOCATION_MESSAGE,
  reverseGeocode,
  searchPlaces,
} from "@/lib/mapbox";

const DEFAULT_CENTER: [number, number] = [-95.7129, 37.0902];

type LocationPickerProps = {
  value: GeoPlace | null;
  onChange: (place: GeoPlace | null) => void;
};

function LocationEditor({
  initial,
  onCancel,
  onConfirm,
}: {
  initial: GeoPlace | null;
  onCancel: () => void;
  onConfirm: (place: GeoPlace) => void;
}) {
  const [place, setPlace] = useState<GeoPlace | null>(initial);
  const [text, setText] = useState(initial?.place_name ?? "");
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recenter, setRecenter] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const runSearch = (queryText: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (queryText.trim().length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    timer.current = setTimeout(() => {
      void searchPlaces(queryText).then((places) => {
        setResults(places);
        setSearching(false);
      });
    }, 320);
  };

  const handleSelect = (next: GeoPlace) => {
    selectFeedback();
    setError(null);
    setPlace(next);
    setText(next.place_name);
    setResults([]);
    setRecenter((count) => count + 1);
  };

  const handleMapMove = (lng: number, lat: number) => {
    void reverseGeocode(lng, lat).then((next) => {
      if (!next) {
        setError(US_ONLY_LOCATION_MESSAGE);
        setRecenter((count) => count + 1);
        return;
      }
      setError(null);
      setPlace(next);
      setText(next.place_name);
    });
  };

  const center = place?.center ?? DEFAULT_CENTER;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.modalSafe} edges={["top", "bottom"]}>
        <View style={styles.modalHeader}>
          <PressableScale accessibilityLabel="Cancel" onPress={onCancel}>
            <Text style={styles.cancel}>Cancel</Text>
          </PressableScale>
          <Text style={styles.modalTitle}>Set location</Text>
          <View style={styles.cancelSpacer} />
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.field}>
            <MapPinIcon size={18} color={Colors.textSecondary} />
            <TextInput
              value={text}
              onChangeText={(next) => {
                setText(next);
                setError(null);
                runSearch(next);
              }}
              placeholder="Search your service address"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
              autoFocus
              style={styles.input}
            />
            {searching ? (
              <ActivityIndicator color={Brand.primaryLight} />
            ) : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {results.length > 0 ? (
            <View style={styles.suggestions}>
              {results.map((item) => (
                <PressableScale
                  key={item.id}
                  accessibilityLabel={item.place_name}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.suggestionRow}>
                    <MapPinIcon size={15} color={Colors.textMuted} />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {item.place_name}
                    </Text>
                  </View>
                </PressableScale>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.mapWrap}>
          <WebViewMap
            center={center}
            recenterSignal={recenter}
            onMove={handleMapMove}
          />
          <View style={styles.mapHintWrap} pointerEvents="none">
            <Text style={styles.mapHint}>
              Drag the pin or tap the map to fine-tune.
            </Text>
          </View>
        </View>

        <View style={styles.modalFooter}>
          <PrimaryButton
            label="Use this location"
            disabled={!place}
            onPress={() => {
              if (place) {
                tapFeedback();
                onConfirm(place);
              }
            }}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PressableScale
        accessibilityLabel="Set service location"
        onPress={() => {
          tapFeedback();
          setOpen(true);
        }}
      >
        <View style={styles.field}>
          <MapPinIcon size={18} color={Colors.textSecondary} />
          <Text
            style={value ? styles.fieldText : styles.fieldPlaceholder}
            numberOfLines={1}
          >
            {value?.place_name ?? "Set your service address"}
          </Text>
        </View>
      </PressableScale>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        {open ? (
          <LocationEditor
            initial={value}
            onCancel={() => setOpen(false)}
            onConfirm={(place) => {
              onChange(place);
              setOpen(false);
            }}
          />
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    height: 54,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldText: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  fieldPlaceholder: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  cancel: {
    color: Brand.primaryLight,
    fontSize: 15,
    fontWeight: "600",
  },
  cancelSpacer: {
    width: 54,
  },
  modalTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  searchWrap: {
    paddingHorizontal: Spacing.base,
    zIndex: 2,
  },
  error: {
    marginTop: Spacing.sm,
    color: Brand.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  suggestions: {
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  suggestionText: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  mapWrap: {
    flex: 1,
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapHintWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    backgroundColor: "rgba(5,7,12,0.55)",
  },
  mapHint: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
  },
  modalFooter: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
});
