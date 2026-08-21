import { Path } from "react-native-svg";

import { Colors } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function SendIcon({
  size = 24,
  color = Colors.text,
  strokeWidth = 1.9,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M20 4L3.5 11.2c-.9.4-.8 1.7.1 2l6.4 2 2 6.4c.3.9 1.6 1 2 .1L20 4Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M20 4l-10 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
