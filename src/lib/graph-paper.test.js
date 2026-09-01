import test from 'node:test';
import assert from 'node:assert/strict';

import { buildGridMetrics, buildSegments } from './graph-paper.js';

test('buildSegments respects merged columns as wide blocks', () => {
  const segments = buildSegments(30, [{ start: 1, width: 20 }]);

  assert.equal(segments[0].merged, true);
  assert.equal(segments[0].width, 20);
  assert.equal(segments.at(-1).merged, false);
  assert.equal(segments.length, 11);
});

test('buildGridMetrics creates a preview for the supplied page margins and grid', () => {
  const metrics = buildGridMetrics({
    pageWidth: 500,
    pageHeight: 500,
    marginTop: 40,
    marginRight: 40,
    marginBottom: 40,
    marginLeft: 40,
    gridSize: 20,
    mergedColumns: [{ start: 1, width: 3 }]
  });

  assert.equal(metrics.cellsAcross, 21);
  assert.equal(metrics.cellsDown, 21);
  assert.equal(metrics.verticalLines[0], 40);
  assert.ok(metrics.verticalLines.includes(40 + 20 * 3));
  assert.ok(metrics.verticalLines.length > 0);
});
