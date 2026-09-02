package com.dddavet.tiger;

import org.junit.Test;
import static org.junit.Assert.*;
import java.util.Map;

public class ForegroundUsageWindowTest {
    @Test public void clipsSessionAcrossWindowStart() {
        ForegroundUsageWindow window = new ForegroundUsageWindow(100, 200);
        window.resume("social", 50);
        window.pause("social", 150);
        assertEquals(Long.valueOf(50), window.finish().get("social"));
    }

    @Test public void switchingAndDelayedPauseNeverDoubleCount() {
        ForegroundUsageWindow window = new ForegroundUsageWindow(100, 200);
        window.resume("social", 110);
        window.resume("social", 120);
        window.resume("other", 140);
        window.pause("social", 145);
        Map<String, Long> totals = window.finish();
        assertEquals(Long.valueOf(30), totals.get("social"));
        assertEquals(Long.valueOf(60), totals.get("other"));
    }

    @Test public void screenOffStopsUsageAndFinishIsIdempotent() {
        ForegroundUsageWindow window = new ForegroundUsageWindow(100, 200);
        window.resume("social", 110);
        window.close(130);
        assertEquals(Long.valueOf(20), window.finish().get("social"));
        assertEquals(Long.valueOf(20), window.finish().get("social"));
    }

    @Test public void historicalAndFutureEventsCannotInflateUsage() {
        ForegroundUsageWindow window = new ForegroundUsageWindow(100, 200);
        window.resume("social", 20);
        window.pause("social", 30);
        window.resume("social", 220);
        assertEquals(Long.valueOf(0), window.finish().get("social"));
    }
}
