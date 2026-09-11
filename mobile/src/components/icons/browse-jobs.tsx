import { Circle, Path } from "react-native-svg";

import { useTheme } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function BrowseJobsIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 1.8,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.accent;
  return (
    <IconBase size={size}>
      <Path
        d="M4 6.5h9M4 11h6M4 15.5h5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle
        cx="16"
        cy="15"
        r="3.4"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M18.6 17.6L21 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </IconBase>
  );
}
