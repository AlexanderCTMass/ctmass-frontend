import { Path } from "react-native-svg";

import { IconBase, type IconProps } from "@/components/icons/icon-base";
import { useTheme } from "@/constants/theme";

export function FlagIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 1.8,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.accent;
  return (
    <IconBase size={size}>
      <Path
        d="M5 21V4.2M5 4.6c1.5-1 3.5-1 5 0s3.5 1 5 0 3.5-1 5 0v8.6c-1.5-1-3.5-1-5 0s-3.5 1-5 0-3.5-1-5 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
