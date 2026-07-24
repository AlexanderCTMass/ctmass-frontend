import { Path } from "react-native-svg";

import { Brand } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function ReviewIcon({
  size = 24,
  color = Brand.primaryLight,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <IconBase size={size}>
      <Path
        d="M12 3.6l2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 17.13l-5.3 2.78 1.01-5.9-4.29-4.18 5.93-.86L12 3.6Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
