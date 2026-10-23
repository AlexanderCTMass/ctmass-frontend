import { Circle, Path, Rect } from "react-native-svg";

import { IconBase, type IconProps } from "@/components/icons/icon-base";
import type { ExperienceTierId } from "@/constants/trade-options";
import type { TradeGroupId } from "@/constants/trade-taxonomy";
import { useTheme } from "@/constants/theme";

type Shape =
  | { kind: "path"; d: string }
  | { kind: "rect"; x: number; y: number; w: number; h: number; r: number }
  | { kind: "circle"; cx: number; cy: number; r: number };

const p = (d: string): Shape => ({ kind: "path", d });

const GROUP_SHAPES: Record<TradeGroupId, Shape[]> = {
  electrical: [
    p("M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"),
  ],
  plumbing: [
    p("M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"),
  ],
  hvac: [
    p("M2 12h20"),
    p("M12 2v20"),
    p("m20 16-4-4 4-4"),
    p("m4 8 4 4-4 4"),
    p("m16 4-4 4-4-4"),
    p("m8 20 4-4 4 4"),
  ],
  masonry: [
    { kind: "rect", x: 3, y: 3, w: 18, h: 18, r: 2 },
    p("M12 9v6"),
    p("M16 15v6"),
    p("M16 3v6"),
    p("M3 15h18"),
    p("M3 9h18"),
    p("M8 15v6"),
    p("M8 3v6"),
  ],
  carpentry: [
    p("m15 12-8.37 8.37a1 1 0 1 1-3-3L12 9"),
    p("m18 15 4-4"),
    p("m21.5 11.5-1.91-1.91A2 2 0 0 1 19 8.17V7l-2.26-2.26a6 6 0 0 0-4.2-1.76L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.17a2 2 0 0 1 1.41.59L18.5 14.5"),
  ],
  exterior: [
    p("M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"),
    p("M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"),
  ],
  interior: [
    { kind: "rect", x: 2, y: 2, w: 16, h: 6, r: 2 },
    p("M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"),
    { kind: "rect", x: 8, y: 16, w: 4, h: 6, r: 1 },
  ],
  remodeling: [
    p("M10 4 8 6"),
    p("M17 19v2"),
    p("M2 12h20"),
    p("M7 19v2"),
    p("M9 5 7.62 3.62A2.12 2.12 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"),
  ],
  outdoor: [
    p("m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"),
    p("M12 22v-3"),
  ],
  restoration: [
    p("M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"),
  ],
  inspection: [
    { kind: "circle", cx: 11, cy: 11, r: 8 },
    p("m21 21-4.3-4.3"),
  ],
  maintenance: [
    p("M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"),
  ],
  other: [
    { kind: "rect", x: 3, y: 3, w: 7, h: 7, r: 1 },
    { kind: "rect", x: 14, y: 3, w: 7, h: 7, r: 1 },
    { kind: "rect", x: 14, y: 14, w: 7, h: 7, r: 1 },
    { kind: "rect", x: 3, y: 14, w: 7, h: 7, r: 1 },
  ],
};

const TIER_SHAPES: Record<ExperienceTierId, Shape[]> = {
  starter: [
    p("M7 20h10"),
    p("M10 20c5.5-2.5.8-6.4 3-10"),
    p("M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"),
    p("M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"),
  ],
  skilled: GROUP_SHAPES.carpentry,
  pro: [
    p("M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.91l5.16-.75a2.12 2.12 0 0 0 1.6-1.16z"),
  ],
  expert: [
    { kind: "circle", cx: 12, cy: 8, r: 6 },
    p("M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"),
  ],
  veteran: [p("M6 3h12l4 6-10 13L2 9Z"), p("M11 3 8 9l4 13 4-13-3-6"), p("M2 9h20")],
};

const MISC_SHAPES = {
  dollar: [p("M12 2v20"), p("M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6")],
  scale: [
    p("m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"),
    p("m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"),
    p("M7 21h10"),
    p("M12 3v18"),
    p("M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"),
  ],
  globe: [
    { kind: "circle", cx: 12, cy: 12, r: 10 },
    p("M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"),
    p("M2 12h20"),
  ],
  siren: [
    p("M7 18v-6a5 5 0 1 1 10 0v6"),
    p("M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"),
    p("M21 12h1"),
    p("M18.5 4.5 18 5"),
    p("M2 12h1"),
    p("M12 2v1"),
    p("m4.93 4.93.71.71"),
  ],
  building: [
    { kind: "rect", x: 4, y: 2, w: 16, h: 20, r: 2 },
    p("M9 22v-4h6v4"),
    p("M8 6h.01"),
    p("M16 6h.01"),
    p("M12 6h.01"),
    p("M12 10h.01"),
    p("M12 14h.01"),
    p("M16 10h.01"),
    p("M16 14h.01"),
    p("M8 10h.01"),
    p("M8 14h.01"),
  ],
  search: GROUP_SHAPES.inspection,
} satisfies Record<string, Shape[]>;

function Shapes({
  shapes,
  color,
  strokeWidth,
}: {
  shapes: Shape[];
  color: string;
  strokeWidth: number;
}) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <>
      {shapes.map((shape, index) => {
        if (shape.kind === "rect") {
          return (
            <Rect
              key={index}
              x={shape.x}
              y={shape.y}
              width={shape.w}
              height={shape.h}
              rx={shape.r}
              {...common}
            />
          );
        }
        if (shape.kind === "circle") {
          return (
            <Circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} {...common} />
          );
        }
        return <Path key={index} d={shape.d} {...common} />;
      })}
    </>
  );
}

function ShapeIcon({
  shapes,
  size = 24,
  color: colorProp,
  strokeWidth = 1.8,
}: IconProps & { shapes: Shape[] }) {
  const { colors } = useTheme();
  return (
    <IconBase size={size}>
      <Shapes
        shapes={shapes}
        color={colorProp ?? colors.accent}
        strokeWidth={strokeWidth}
      />
    </IconBase>
  );
}

export function TradeGroupIcon({
  groupId,
  ...props
}: IconProps & { groupId: TradeGroupId }) {
  return <ShapeIcon shapes={GROUP_SHAPES[groupId] ?? GROUP_SHAPES.other} {...props} />;
}

export function TierIcon({
  tierId,
  ...props
}: IconProps & { tierId: ExperienceTierId }) {
  return <ShapeIcon shapes={TIER_SHAPES[tierId]} {...props} />;
}

export const DollarIcon = (props: IconProps) => (
  <ShapeIcon shapes={MISC_SHAPES.dollar} {...props} />
);
export const ScaleIcon = (props: IconProps) => (
  <ShapeIcon shapes={MISC_SHAPES.scale} {...props} />
);
export const GlobeIcon = (props: IconProps) => (
  <ShapeIcon shapes={MISC_SHAPES.globe} {...props} />
);
export const SirenIcon = (props: IconProps) => (
  <ShapeIcon shapes={MISC_SHAPES.siren} {...props} />
);
export const BuildingIcon = (props: IconProps) => (
  <ShapeIcon shapes={MISC_SHAPES.building} {...props} />
);
export const SearchIcon = (props: IconProps) => (
  <ShapeIcon shapes={MISC_SHAPES.search} {...props} />
);
