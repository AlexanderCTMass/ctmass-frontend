import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { MapPinIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { selectFeedback } from "@/lib/haptics";
import { type GeoPlace, searchPlaces, staticMapUrl } from "@/lib/mapbox";

type LocationPickerProps = {
  value: GeoPlace | null;
  onChange: (place: GeoPlace | null) => void;
};

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [text, setText] = useState(value?.place_name ?? "");
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
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

  const handleChangeText = (next: string) => {
    setText(next);
    if (value) onChange(null);
    runSearch(next);
  };

  const handleSelect = (place: GeoPlace) => {
    selectFeedback();
    onChange(place);
    setText(place.place_name);
    setResults([]);
    setFocused(false);
  };

  const showSuggestions = focused && (searching || results.length > 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <MapPinIcon size={18} color={Colors.textSecondary} />
        <TextInput
          value={text}
          onChangeText={handleChangeText}
          onFocus={() => setFocused(true)}
          placeholder="Search your service address"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="words"
          style={styles.input}
        />
        {searching ? <ActivityIndicator color={Brand.primaryLight} /> : null}
      </View>

      {showSuggestions ? (
        <View style={styles.suggestions}>
          {results.map((place) => (
            <PressableScale
              key={place.id}
              accessibilityLabel={place.place_name}
              onPress={() => handleSelect(place)}
            >
              <View style={styles.suggestionRow}>
                <MapPinIcon size={15} color={Colors.textMuted} />
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {place.place_name}
                </Text>
              </View>
            </PressableScale>
          ))}
          {searching && results.length === 0 ? (
            <Text style={styles.hint}>Searching…</Text>
          ) : null}
        </View>
      ) : null}

      {value ? (
        <View style={styles.mapCard}>
          <Image
            source={{ uri: staticMapUrl(value.center) }}
            style={styles.mapImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.mapCaption}>
            <MapPinIcon size={14} color={Brand.primaryLight} />
            <Text style={styles.mapCaptionText} numberOfLines={1}>
              {value.place_name}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
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
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  suggestions: {
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
  hint: {
    color: Colors.textMuted,
    fontSize: 13,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  mapCard: {
    borderRadius: Radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  mapImage: {
    width: "100%",
    height: 150,
  },
  mapCaption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  mapCaptionText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
