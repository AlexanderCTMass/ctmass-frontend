import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { useTheme } from "@/constants/theme";
import { US_MAP_MAX_BOUNDS, getMapboxToken } from "@/lib/mapbox";

const DARK_MAP_BACKGROUND = "#0A1A12";
const LIGHT_MAP_BACKGROUND = "#EAF5EE";

function buildHtml(
  token: string,
  lng: number,
  lat: number,
  isDark: boolean,
  overview: MapBounds | null,
): string {
  const view = overview
    ? `bounds:${JSON.stringify(overview)},fitBoundsOptions:{padding:24}`
    : `center:[${lng},${lat}],zoom:13`;
  const background = isDark ? DARK_MAP_BACKGROUND : LIGHT_MAP_BACKGROUND;
  const style = isDark
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/streets-v12";
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link href="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js"></script>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;background:${background};}</style>
</head>
<body>
<div id="map"></div>
<script>
mapboxgl.accessToken=${JSON.stringify(token)};
var map=new mapboxgl.Map({container:'map',style:'${style}',${view},maxBounds:${JSON.stringify(US_MAP_MAX_BOUNDS)},attributionControl:false});
var marker=new mapboxgl.Marker({draggable:true,color:'#16B364'}).setLngLat([${lng},${lat}]).addTo(map);
function post(){var p=marker.getLngLat();if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify({lng:p.lng,lat:p.lat}));}}
marker.on('dragend',post);
map.on('click',function(e){marker.setLngLat(e.lngLat);post();});
window.__recenter=function(lng,lat){marker.setLngLat([lng,lat]);map.flyTo({center:[lng,lat],zoom:13});};
</script>
</body>
</html>`;
}

export type MapBounds = [[number, number], [number, number]];

type WebViewMapProps = {
  center: [number, number];
  overviewBounds?: MapBounds | null;
  recenterSignal: number;
  onMove: (lng: number, lat: number) => void;
};

export function WebViewMap({
  center,
  overviewBounds = null,
  recenterSignal,
  onMove,
}: WebViewMapProps) {
  const { isDark } = useTheme();
  const ref = useRef<WebView>(null);
  const [initialCenter] = useState(center);
  const [initialOverview] = useState(overviewBounds);
  const html = useMemo(
    () =>
      buildHtml(
        getMapboxToken(),
        initialCenter[0],
        initialCenter[1],
        isDark,
        initialOverview,
      ),
    [initialCenter, initialOverview, isDark],
  );

  useEffect(() => {
    if (recenterSignal <= 0) return;
    ref.current?.injectJavaScript(
      `window.__recenter && window.__recenter(${center[0]}, ${center[1]}); true;`,
    );
  }, [recenterSignal, center]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        lng?: unknown;
        lat?: unknown;
      };
      if (typeof data.lng === "number" && typeof data.lat === "number") {
        onMove(data.lng, data.lat);
      }
    } catch {
      // ignore malformed messages
    }
  };

  return (
    <View style={styles.wrap}>
      <WebView
        ref={ref}
        source={{ html, baseUrl: "https://ctmass.app/" }}
        originWhitelist={["*"]}
        style={[
          styles.web,
          {
            backgroundColor: isDark
              ? DARK_MAP_BACKGROUND
              : LIGHT_MAP_BACKGROUND,
          },
        ]}
        scrollEnabled={false}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: "hidden",
  },
  web: {
    flex: 1,
  },
});
