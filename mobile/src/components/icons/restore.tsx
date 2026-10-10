import { Path } from "react-native-svg";

import { useTheme } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function RestoreIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 1.8,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.accent;
  return (
    <IconBase size={size}>
      <Path
        d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 4v4.5h4.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
