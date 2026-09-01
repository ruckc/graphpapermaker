export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function buildSegments(cellsAcross, mergedColumns = []) {
  const safeAcross = Math.max(1, Number.isFinite(cellsAcross) ? Math.floor(cellsAcross) : 1);
  const ordered = [...mergedColumns]
    .map((entry) => {
      const rawStart = Number(entry?.start ?? 1);
      const rawWidth = Number(entry?.width ?? 1);
      const start = Number.isFinite(rawStart) ? Math.max(1, Math.trunc(rawStart)) : 1;
      const width = Number.isFinite(rawWidth) ? Math.max(1, Math.trunc(rawWidth)) : 1;
      return {
        start,
        width,
        merged: true
      };
    })
    .sort((left, right) => left.start - right.start)
    .filter((entry) => entry.start <= safeAcross);

  const segments = [];
  let cursor = 0;

  for (const entry of ordered) {
    const startIndex = Math.max(cursor, entry.start - 1);

    if (startIndex > cursor) {
      for (let index = cursor; index < startIndex; index += 1) {
        segments.push({ start: index, width: 1, merged: false });
      }
    }

    const mergedStart = Math.min(Math.max(entry.start - 1, 0), safeAcross - 1);
    const mergedWidth = Math.min(Math.max(entry.width, 1), safeAcross - mergedStart);

    segments.push({ start: mergedStart, width: mergedWidth, merged: true });
    cursor = mergedStart + mergedWidth;
  }

  for (let index = cursor; index < safeAcross; index += 1) {
    segments.push({ start: index, width: 1, merged: false });
  }

  return segments;
}

export function buildGridMetrics({
  pageWidth,
  pageHeight,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  gridSize,
  mergedColumns = []
}) {
  const pageWidthValue = Math.max(100, Number(pageWidth) || 100);
  const pageHeightValue = Math.max(100, Number(pageHeight) || 100);
  const safeGridSize = Math.max(1, Number(gridSize) || 1);

  const left = Math.max(0, Number(marginLeft) || 0);
  const right = Math.max(0, Number(marginRight) || 0);
  const top = Math.max(0, Number(marginTop) || 0);
  const bottom = Math.max(0, Number(marginBottom) || 0);

  const usableWidth = Math.max(0, pageWidthValue - left - right);
  const usableHeight = Math.max(0, pageHeightValue - top - bottom);
  const cellsAcross = Math.max(1, Math.floor(usableWidth / safeGridSize));
  const cellsDown = Math.max(1, Math.floor(usableHeight / safeGridSize));
  const segments = buildSegments(cellsAcross, mergedColumns);
  const mergedRanges = segments
    .filter((segment) => segment.merged)
    .map((segment) => ({
      start: segment.start,
      end: segment.start + segment.width
    }));

  const verticalLines = [];
  const horizontalLines = [];

  for (let x = 0; x <= cellsAcross; x += 1) {
    const px = left + x * safeGridSize;
    const insideMerged = mergedRanges.some((range) => x > range.start && x < range.end && x > 0);

    if (!insideMerged) {
      verticalLines.push(px);
    }
  }

  for (let y = 0; y <= cellsDown; y += 1) {
    horizontalLines.push(top + y * safeGridSize);
  }

  return {
    pageWidth: pageWidthValue,
    pageHeight: pageHeightValue,
    marginLeft: left,
    marginRight: right,
    marginTop: top,
    marginBottom: bottom,
    usableWidth,
    usableHeight,
    cellsAcross,
    cellsDown,
    gridSize: safeGridSize,
    segments,
    verticalLines,
    horizontalLines
  };
}
