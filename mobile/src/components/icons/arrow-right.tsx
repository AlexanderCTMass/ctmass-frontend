import { Path } from "react-native-svg";

import { Colors } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function ArrowRightIcon({
  size = 24,
  color = Colors.text,
  strokeWidth = 2,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M4 12h15M13 5.5l6.5 6.5L13 18.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
