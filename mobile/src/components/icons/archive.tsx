import { Path, Rect } from "react-native-svg";

import { useTheme } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function ArchiveIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 1.8,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.accent;
  return (
    <IconBase size={size}>
      <Rect
        x="3"
        y="4"
        width="18"
        height="4.5"
        rx="1.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M5 8.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5M10 12.5h4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
