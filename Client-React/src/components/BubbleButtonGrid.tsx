import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

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
  forceMainSize?: number;
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

export const getBubbleMainSize = (
  viewportWidth: number,
  count: number,
): number => {
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
    const base = 118;
    const densePenalty = Math.max(0, safeCount - 3) * 4;
    return Math.max(88, base - densePenalty);
  }

  // Extra small phones (< 560px)
  const base = 100;
  const densePenalty = Math.max(0, safeCount - 3) * 3;
  return Math.max(72, base - densePenalty);
};

export default function BubbleButtonGrid({
  entries,
  pattern = [3, 4],
  trailingAction,
  forceMainSize,
}: BubbleButtonGridProps) {
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const previousRects = useRef<Map<string, DOMRect>>(new Map());
  const previousKeysRef = useRef<Set<string>>(new Set());
  const exitingItemsRef = useRef<Set<string>>(new Set());

  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  const [exitingItems, setExitingItems] = useState<Set<string>>(new Set());

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

  const effectivePattern: readonly [number, number] =
    viewportWidth < 768 ? [2, 3] : pattern;

  const bubbleColumns = Math.max(...effectivePattern) * 2;
  const minPattern = Math.min(...effectivePattern);
  const maxPattern = Math.max(...effectivePattern);
  const bubbleMainSize =
    forceMainSize ?? getBubbleMainSize(viewportWidth, renderedItems.length);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const currentKeys = new Set(renderedItems.map((item) => item.key));
    const removed = Array.from(previousKeysRef.current).filter(
      (key) => !currentKeys.has(key),
    );

    if (removed.length > 0) {
      setExitingItems(new Set(removed));
      exitingItemsRef.current = new Set(removed);
      removed.forEach((key) => {
        const element = itemRefs.current.get(key);
        if (element) {
          element.dataset.state = "exit";
          setTimeout(() => {
            element.remove();
            itemRefs.current.delete(key);
            previousRects.current.delete(key);
          }, 420);
        }
      });
    }

    previousKeysRef.current = currentKeys;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nextRects = new Map<string, DOMRect>();

    renderedItems.forEach((item) => {
      const element = itemRefs.current.get(item.key);
      if (!element) {
        return;
      }

      if (exitingItemsRef.current.has(item.key)) {
        return;
      }

      nextRects.set(item.key, element.getBoundingClientRect());
    });

    renderedItems.forEach((item) => {
      const element = itemRefs.current.get(item.key);
      const previousRect = previousRects.current.get(item.key);
      const nextRect = nextRects.get(item.key);

      if (
        !element ||
        !nextRect ||
        prefersReducedMotion ||
        exitingItemsRef.current.has(item.key)
      ) {
        return;
      }

      const isNew = !previousRect;

      if (isNew) {
        element.dataset.state = "enter";
        element.style.animation =
          "bubble-item-enter 0.52s cubic-bezier(0.13, 0.92, 0.6, 1)";
        return;
      }

      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        return;
      }

      element.animate(
        [
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: "translate(0px, 0px)" },
        ],
        {
          duration: 680,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
    });

    previousRects.current = nextRects;
  }, [renderedItems, viewportWidth, bubbleMainSize]);

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
          getRowConfigForIndex(idx, renderedItems.length, effectivePattern);
        const gridStart = getGridStartForItem(
          colIndex,
          colsInThisRow,
          itemsInThisRow,
          minPattern,
        );
        const isOffsetRow = colsInThisRow === maxPattern;
        const isExiting = exitingItems.has(item.key);

        return (
          <li
            key={item.key}
            className={`category-item mineral-class-item ${isOffsetRow ? "mineral-class-item--offset" : ""}${isExiting ? " mineral-class-item--exit" : ""}`}
            ref={(node) => {
              if (node) {
                itemRefs.current.set(item.key, node);
              } else {
                itemRefs.current.delete(item.key);
                previousRects.current.delete(item.key);
              }
            }}
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
