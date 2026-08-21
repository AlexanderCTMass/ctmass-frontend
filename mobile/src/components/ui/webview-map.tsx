import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { US_MAP_MAX_BOUNDS, getMapboxToken } from "@/lib/mapbox";

function buildHtml(token: string, lng: number, lat: number): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link href="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js"></script>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;background:#0A1A12;}</style>
</head>
<body>
<div id="map"></div>
<script>
mapboxgl.accessToken=${JSON.stringify(token)};
var map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/dark-v11',center:[${lng},${lat}],zoom:13,maxBounds:${JSON.stringify(US_MAP_MAX_BOUNDS)},attributionControl:false});
var marker=new mapboxgl.Marker({draggable:true,color:'#16B364'}).setLngLat([${lng},${lat}]).addTo(map);
function post(){var p=marker.getLngLat();if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify({lng:p.lng,lat:p.lat}));}}
marker.on('dragend',post);
map.on('click',function(e){marker.setLngLat(e.lngLat);post();});
window.__recenter=function(lng,lat){marker.setLngLat([lng,lat]);map.flyTo({center:[lng,lat],zoom:13});};
</script>
</body>
</html>`;
}

type WebViewMapProps = {
  center: [number, number];
  recenterSignal: number;
  onMove: (lng: number, lat: number) => void;
};

export function WebViewMap({
  center,
  recenterSignal,
  onMove,
}: WebViewMapProps) {
  const ref = useRef<WebView>(null);
  const [html] = useState(() =>
    buildHtml(getMapboxToken(), center[0], center[1]),
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
        style={styles.web}
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
    backgroundColor: "#0A1A12",
  },
});
