import { useEffect, useState, type CSSProperties } from "react";

type BubbleAmbientAnimationProps = {
  visible?: boolean;
};

const getCenterDotCount = (viewportWidth: number): number => {
  if (viewportWidth < 560) {
    return 10;
  }

  if (viewportWidth < 960) {
    return 12;
  }

  return 14;
};

const buildCenterDots = (
  dotCount: number,
  spreadRadius: number,
  viewportWidth: number,
  viewportHeight: number,
): Array<{
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}> => {
  const safeHalfWidth = Math.max(40, viewportWidth / 2 - 24);
  const safeHalfHeight = Math.max(40, viewportHeight / 2 - 24);

  return Array.from({ length: dotCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / dotCount;
    const waveOffset = (index % 4) * 0.12;
    const rawDistance = spreadRadius * (0.82 + waveOffset);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const limitByX =
      Math.abs(cos) < 0.0001
        ? Number.POSITIVE_INFINITY
        : safeHalfWidth / Math.abs(cos);
    const limitByY =
      Math.abs(sin) < 0.0001
        ? Number.POSITIVE_INFINITY
        : safeHalfHeight / Math.abs(sin);
    const maxDistance = Math.min(limitByX, limitByY);
    const distance = Math.min(rawDistance, maxDistance);

    return {
      size: 9 + (index % 3) * 3,
      x: Math.round(cos * distance),
      y: Math.round(sin * distance),
      delay: (index / dotCount) * 1.4,
      duration: 6.4 + (index % 5) * 0.28,
    };
  });
};

export default function BubbleAmbientAnimation({
  visible = true,
}: BubbleAmbientAnimationProps) {
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 720,
  );

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const centerDotCount = getCenterDotCount(viewportWidth);
  const baseViewportRadius = Math.min(viewportWidth, viewportHeight) * 0.42;
  const centerSpreadRadius = Math.min(380, Math.max(160, baseViewportRadius));
  const centerDots = buildCenterDots(
    centerDotCount,
    centerSpreadRadius,
    viewportWidth,
    viewportHeight,
  );

  return (
    <span
      className={`center-burst ${visible ? "center-burst--visible" : "center-burst--hidden"}`}
      aria-hidden="true"
    >
      {centerDots.map((dot, dotIdx) => (
        <span
          key={dotIdx}
          className="center-burst__dot"
          style={
            {
              "--burst-dot-size": `${dot.size}px`,
              "--burst-dot-x": `${dot.x}px`,
              "--burst-dot-y": `${dot.y}px`,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
