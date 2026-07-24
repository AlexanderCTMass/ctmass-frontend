import Svg from "react-native-svg";

import { Colors } from "@/constants/theme";

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export const defaultIconColor = Colors.text;

export function IconBase({
  size = 24,
  children,
}: {
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  );
}
