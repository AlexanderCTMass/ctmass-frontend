import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

import { Brand } from "@/constants/theme";

export function CoinIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="coinFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE082" />
          <Stop offset="0.5" stopColor={Brand.coin} />
          <Stop offset="1" stopColor={Brand.coinDark} />
        </LinearGradient>
      </Defs>
      <Circle cx="12" cy="12" r="9.4" fill="url(#coinFill)" />
      <Circle
        cx="12"
        cy="12"
        r="7.1"
        stroke="rgba(90,54,0,0.35)"
        strokeWidth="1.1"
      />
      <Path
        d="M14.6 9.4a3.6 3.6 0 1 0 0 5.2"
        stroke="#7A4A00"
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
