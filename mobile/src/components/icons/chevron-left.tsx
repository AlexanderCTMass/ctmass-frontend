import { Path } from "react-native-svg";

import { useTheme } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function ChevronLeftIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 2,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
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
