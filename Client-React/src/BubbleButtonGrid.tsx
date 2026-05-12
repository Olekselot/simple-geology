import { useEffect, useState, type CSSProperties } from "react";

export type BubbleGridEntry = {
  key: string;
  label: string;
  onClick: () => void;
  badge?: string;
  meta?: string;
  variant?: "default" | "back";
};

type BubbleButtonGridProps = {
  entries: BubbleGridEntry[];
  pattern?: readonly [number, number];
  trailingAction?: {
    label: string;
    onClick: () => void;
    variant?: "back";
  };
};

const getRowConfigForIndex = (
  itemIndex: number,
  totalCount: number,
  pattern: readonly [number, number],
): {
  rowIndex: number;
  colIndex: number;
  colsInThisRow: number;
  itemsInThisRow: number;
} => {
  let currentIndex = 0;
  let rowIndex = 0;

  while (currentIndex + pattern[rowIndex % pattern.length] <= itemIndex) {
    currentIndex += pattern[rowIndex % pattern.length];
    rowIndex++;
  }

  const colsInThisRow = pattern[rowIndex % pattern.length];
  const colIndex = itemIndex - currentIndex;
  const itemsInThisRow = Math.min(
    colsInThisRow,
    Math.max(0, totalCount - currentIndex),
  );

  return { rowIndex, colIndex, colsInThisRow, itemsInThisRow };
};

const getGridStartForItem = (
  colIndex: number,
  colsInThisRow: number,
  itemsInThisRow: number,
  minPattern: number,
): number => {
  const baseStart = colsInThisRow === minPattern ? 2 : 1;
  const centerShift = Math.max(0, colsInThisRow - itemsInThisRow);
  return baseStart + centerShift + colIndex * 2;
};

const getBubbleMainSize = (viewportWidth: number, count: number): number => {
  const safeCount = Math.max(1, count);

  // Desktop: wide screens (>= 1400px)
  if (viewportWidth >= 1400) {
    const desktopBase = 160;
    const densePenalty = Math.max(0, safeCount - 6) * 5;
    return Math.max(120, desktopBase - densePenalty);
  }

  // Large tablets/small desktops (1200-1399px)
  if (viewportWidth >= 1200) {
    const base = 142;
    const densePenalty = Math.max(0, safeCount - 6) * 4;
    return Math.max(102, base - densePenalty);
  }

  // Tablets (768-1199px)
  if (viewportWidth >= 768) {
    const base = 116;
    const densePenalty = Math.max(0, safeCount - 5) * 3;
    return Math.max(88, base - densePenalty);
  }

  // Small phones (< 768px)
  if (viewportWidth >= 560) {
    const base = 90;
    const densePenalty = Math.max(0, safeCount - 4) * 2;
    return Math.max(70, base - densePenalty);
  }

  // Extra small phones (< 560px)
  const base = 72;
  const densePenalty = Math.max(0, safeCount - 3) * 1;
  return Math.max(56, base - densePenalty);
};

export default function BubbleButtonGrid({
  entries,
  pattern = [3, 4],
  trailingAction,
}: BubbleButtonGridProps) {
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const renderedItems = trailingAction
    ? [
        ...entries,
        {
          key: "__trailing-action__",
          label: trailingAction.label,
          onClick: trailingAction.onClick,
          variant: trailingAction.variant ?? "back",
        },
      ]
    : entries;

  const bubbleColumns = Math.max(...pattern) * 2;
  const minPattern = Math.min(...pattern);
  const maxPattern = Math.max(...pattern);
  const bubbleMainSize = getBubbleMainSize(viewportWidth, renderedItems.length);

  return (
    <ul
      className="category-list mineral-class-list"
      style={
        {
          "--bubble-main-size": `${bubbleMainSize}px`,
          "--bubble-columns": bubbleColumns,
        } as CSSProperties
      }
    >
      {renderedItems.map((item, idx) => {
        const { rowIndex, colIndex, colsInThisRow, itemsInThisRow } =
          getRowConfigForIndex(idx, renderedItems.length, pattern);
        const gridStart = getGridStartForItem(
          colIndex,
          colsInThisRow,
          itemsInThisRow,
          minPattern,
        );
        const isOffsetRow = colsInThisRow === maxPattern;

        return (
          <li
            key={item.key}
            className={`category-item mineral-class-item ${isOffsetRow ? "mineral-class-item--offset" : ""}`}
            style={
              {
                "--bubble-grid-row": rowIndex + 1,
                "--bubble-grid-start": gridStart,
                "--bubble-row-offset": isOffsetRow ? 1 : 0,
              } as CSSProperties
            }
          >
            <button
              className={`btn-bubble ${item.variant === "back" ? "btn-bubble--back" : ""}`}
              onClick={item.onClick}
            >
              <span className="btn-bubble__content">
                {item.badge && (
                  <span className="btn-bubble__badge">{item.badge}</span>
                )}
                <span className="btn-bubble__label">{item.label}</span>
                {item.meta && (
                  <span className="btn-bubble__meta">{item.meta}</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
