import { Path } from "react-native-svg";

import { IconBase, type IconProps } from "@/components/icons/icon-base";
import { useTheme } from "@/constants/theme";

export function HeartIcon({
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
        d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.48L12 20.3Z"
        stroke={filled ? "none" : color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
    </IconBase>
  );
}
