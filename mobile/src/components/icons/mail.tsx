import { Path, Rect } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function MailIcon({
  size = 24,
  color = Brand.primaryLight,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="m4 7 8 5.5L20 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
