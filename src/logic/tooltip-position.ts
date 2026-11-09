export interface TooltipAnchor {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

export interface TooltipSize {
  readonly width: number;
  readonly height: number;
}

export interface TooltipPosition {
  readonly left: number;
  readonly top: number;
  readonly opensLeft: boolean;
  readonly opensUp: boolean;
}

/** Prefer a free side; use vertical space when a narrow viewport leaves neither side free. */
export function positionIngredientTooltip(
  anchor: TooltipAnchor,
  size: TooltipSize,
  viewport: TooltipSize,
): TooltipPosition {
  const gap = 8;
  const margin = 8;
  const fitsRight = anchor.right + gap + size.width <= viewport.width - margin;
  const fitsLeft = anchor.left - gap - size.width >= margin;
  const opensLeft = !fitsRight;
  const needsVerticalPlacement = !fitsRight && !fitsLeft;
  const spaceBelow = viewport.height - margin - anchor.bottom - gap;
  const spaceAbove = anchor.top - gap - margin;
  const opensUp = needsVerticalPlacement
    ? spaceBelow < size.height && (spaceAbove >= size.height || spaceAbove > spaceBelow)
    : anchor.top + size.height > viewport.height - margin;
  const preferredLeft = needsVerticalPlacement
    ? anchor.left
    : opensLeft
      ? anchor.left - gap - size.width
      : anchor.right + gap;
  const preferredTop = opensUp
    ? anchor.top - gap - size.height
    : needsVerticalPlacement
      ? anchor.bottom + gap
      : anchor.top;
  const clamp = (value: number, extent: number, available: number): number =>
    Math.min(Math.max(margin, value), Math.max(margin, available - extent - margin));

  return {
    left: clamp(preferredLeft, size.width, viewport.width),
    top: clamp(preferredTop, size.height, viewport.height),
    opensLeft,
    opensUp,
  };
}
