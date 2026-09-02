package com.dddavet.tiger;

import java.util.HashMap;
import java.util.Map;

/** Single foreground-app estimate, clipped to the requested rolling window. */
final class ForegroundUsageWindow {
    private final long start;
    private final long end;
    private String foreground;
    private long since;
    private final Map<String, Long> totals = new HashMap<>();

    ForegroundUsageWindow(long start, long end) {
        this.start = start;
        this.end = Math.max(start, end);
    }

    void resume(String packageName, long time) {
        if (packageName == null || time > end) return;
        if (packageName.equals(foreground)) return;
        close(time);
        foreground = packageName;
        since = time;
    }

    void pause(String packageName, long time) {
        // A delayed pause from the previous app must not close the new one.
        if (foreground != null && foreground.equals(packageName)) close(time);
    }

    void close(long time) {
        if (foreground != null) {
            long duration = Math.max(0, Math.min(time, end) - Math.max(since, start));
            totals.put(foreground, totals.getOrDefault(foreground, 0L) + duration);
        }
        foreground = null;
    }

    Map<String, Long> finish() {
        close(end);
        return new HashMap<>(totals);
    }
}
