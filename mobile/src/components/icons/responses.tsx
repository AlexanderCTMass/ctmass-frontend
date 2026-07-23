import { Path } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function ResponsesIcon({
  size = 24,
  color = Brand.primaryLight,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v4a2.5 2.5 0 0 1-2.5 2.5H8l-5 3.5v-10Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M19.5 9.5A2.5 2.5 0 0 1 21 11.8v8.2l-3.6-2.6h-4.3a2.5 2.5 0 0 1-2.2-1.3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
