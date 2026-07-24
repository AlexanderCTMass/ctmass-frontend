import { Path } from "react-native-svg";

import { Colors } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function CheckIcon({
  size = 24,
  color = Colors.text,
  strokeWidth = 2.4,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M4.5 12.5L9.5 17.5L19.5 6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
