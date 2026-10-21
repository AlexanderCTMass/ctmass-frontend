import { Circle } from "react-native-svg";

import { useTheme } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function MoreIcon({ size = 24, color: colorProp }: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  return (
    <IconBase size={size}>
      <Circle cx="5.5" cy="12" r="1.9" fill={color} />
      <Circle cx="12" cy="12" r="1.9" fill={color} />
      <Circle cx="18.5" cy="12" r="1.9" fill={color} />
    </IconBase>
  );
}
