import { Path } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function ShopIcon({
  size = 24,
  color = Brand.coin,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M4 9.5h16V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V9.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M3 9.5 4.6 4.9a1.2 1.2 0 0 1 1.14-.9h12.52c.52 0 .98.33 1.14.82L21 9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M9.8 20.5v-5.2h4.4v5.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
