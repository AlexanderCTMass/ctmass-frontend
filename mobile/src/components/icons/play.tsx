import { Path } from "react-native-svg";

import { IconBase, type IconProps } from "@/components/icons/icon-base";
import { useTheme } from "@/constants/theme";

export function PlayIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 1.8,
  filled = false,
}: IconProps & { filled?: boolean }) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.accent;
  return (
    <IconBase size={size}>
      <Path
        d="M8 5.4v13.2l11-6.6-11-6.6Z"
        stroke={filled ? "none" : color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
    </IconBase>
  );
}
