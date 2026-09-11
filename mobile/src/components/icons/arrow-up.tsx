import { Path } from "react-native-svg";

import { useTheme } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function ArrowUpIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 2,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <IconBase size={size}>
      <Path
        d="M12 19V5M6 11l6-6 6 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
