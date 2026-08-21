import { Path } from "react-native-svg";

import { Colors } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function ChevronLeftIcon({
  size = 24,
  color = Colors.text,
  strokeWidth = 2,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M14.5 5.5L8 12l6.5 6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
