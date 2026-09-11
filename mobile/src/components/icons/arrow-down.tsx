import { Path } from "react-native-svg";

import { useTheme } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function ArrowDownIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 2,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <IconBase size={size}>
      <Path
        d="M12 5v14M6 13l6 6 6-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
