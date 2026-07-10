import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDuration,
  formatMetricNumber,
  formatSessionTimestamp,
  formatUsd,
} from "../src/lib/session-metric-formatters";

test("formats session metrics compactly without losing duration precision", () => {
  assert.equal(formatMetricNumber(9_999), "9,999");
  assert.equal(formatMetricNumber(893_403), "893.4K");
  assert.equal(formatDuration(663_917, true), "11m 03.917s");
  assert.equal(formatDuration(663_917), "11m 04s");
});

test("formats recorded costs and timestamps deterministically", () => {
  assert.equal(formatUsd(1.403553), "$1.4036");
  assert.equal(formatUsd(0.000001), "$0.000001");
  assert.match(formatSessionTimestamp("2026-07-10T00:49:16.738Z"), /Jul 10, 2026, 00:49:16\.738 UTC/);
  assert.equal(formatSessionTimestamp(null), "Timestamp unavailable");
});
