import { Circle, Path } from "react-native-svg";

import { useTheme } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function TextMessageIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 1.8,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.accent;
  return (
    <IconBase size={size}>
      <Path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-6 4V6.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Circle cx="8.5" cy="10.5" r="1.1" fill={color} />
      <Circle cx="12" cy="10.5" r="1.1" fill={color} />
      <Circle cx="15.5" cy="10.5" r="1.1" fill={color} />
    </IconBase>
  );
}
