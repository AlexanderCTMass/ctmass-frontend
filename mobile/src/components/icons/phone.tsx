import { Path } from "react-native-svg";

import { useTheme } from "@/constants/theme";
import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function PhoneIcon({
  size = 24,
  color: colorProp,
  strokeWidth = 1.8,
}: IconProps) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.accent;
  return (
    <IconBase size={size}>
      <Path
        d="M5.2 3.5h3l1.6 4.2-2.1 1.4a11.5 11.5 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.2 5.7a2 2 0 0 1 2-2.2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
