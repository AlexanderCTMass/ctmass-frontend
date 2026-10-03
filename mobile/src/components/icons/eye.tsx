import { Circle, Path } from "react-native-svg";

import { IconBase, type IconProps } from "@/components/icons/icon-base";
import { useTheme } from "@/constants/theme";

export function EyeIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 1.8,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.accent;
  return (
    <IconBase size={size}>
      <Path
        d="M2 12s3.5-6.75 10-6.75S22 12 22 12s-3.5 6.75-10 6.75S2 12 2 12Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="2.75" stroke={color} strokeWidth={strokeWidth} />
    </IconBase>
  );
}
