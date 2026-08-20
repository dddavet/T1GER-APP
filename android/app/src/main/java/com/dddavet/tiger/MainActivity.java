package com.dddavet.tiger;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Process;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new AndroidScreenTimeInterface(this), "AndroidScreenTime");
        }
    }

    public static class AndroidScreenTimeInterface {
        private final Context context;

        public AndroidScreenTimeInterface(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public boolean hasUsagePermission() {
            try {
                AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
                if (appOps == null) return false;
                int mode = appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    context.getPackageName()
                );
                return mode == AppOpsManager.MODE_ALLOWED;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public void requestUsagePermission() {
            try {
                Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            } catch (Exception e) {
                // fallback
            }
        }

        @JavascriptInterface
        public String getDailySocialUsage(double hourlyWage) {
            JSONObject result = new JSONObject();
            JSONArray appsArray = new JSONArray();
            long totalMinutes = 0;

            try {
                UsageStatsManager usm = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
                if (usm == null) {
                    result.put("totalMinutes", 0);
                    result.put("apps", appsArray);
                    return result.toString();
                }

                Calendar calendar = Calendar.getInstance();
                calendar.set(Calendar.HOUR_OF_DAY, 0);
                calendar.set(Calendar.MINUTE, 0);
                calendar.set(Calendar.SECOND, 0);
                calendar.set(Calendar.MILLISECOND, 0);
                long startTime = calendar.getTimeInMillis();
                long endTime = System.currentTimeMillis();

                List<UsageStats> statsList = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime);

                // Social package mapping
                Map<String, String[]> targetApps = new HashMap<>();
                targetApps.put("com.zhiliaoapp.musically", new String[]{"TikTok", "🎵"});
                targetApps.put("com.ss.android.ugc.trill", new String[]{"TikTok", "🎵"});
                targetApps.put("com.instagram.android", new String[]{"Instagram", "📸"});
                targetApps.put("com.google.android.youtube", new String[]{"YouTube", "▶️"});
                targetApps.put("com.twitter.android", new String[]{"X (Twitter)", "𝕏"});
                targetApps.put("com.facebook.katana", new String[]{"Facebook", "📘"});
                targetApps.put("com.snapchat.android", new String[]{"Snapchat", "👻"});
                targetApps.put("com.reddit.frontpage", new String[]{"Reddit", "🤖"});

                Map<String, Long> aggregatedUsage = new HashMap<>();

                if (statsList != null) {
                    for (UsageStats usageStats : statsList) {
                        String pkg = usageStats.getPackageName();
                        if (targetApps.containsKey(pkg)) {
                            String appName = targetApps.get(pkg)[0];
                            long timeInForeground = usageStats.getTotalTimeInForeground();
                            long current = aggregatedUsage.getOrDefault(appName, 0L);
                            aggregatedUsage.put(appName, current + timeInForeground);
                        }
                    }
                }

                for (Map.Entry<String, Long> entry : aggregatedUsage.entrySet()) {
                    long minutes = entry.getValue() / (1000 * 60);
                    if (minutes > 0) {
                        totalMinutes += minutes;
                        JSONObject appObj = new JSONObject();
                        appObj.put("appName", entry.getKey());
                        appObj.put("minutes", minutes);
                        appObj.put("iconEmoji", entry.getKey().equals("TikTok") ? "🎵" : entry.getKey().equals("Instagram") ? "📸" : entry.getKey().equals("YouTube") ? "▶️" : "📱");
                        appsArray.put(appObj);
                    }
                }

                result.put("totalMinutes", totalMinutes);
                result.put("apps", appsArray);
            } catch (Exception e) {
                try {
                    result.put("totalMinutes", 0);
                    result.put("apps", appsArray);
                } catch (Exception ignored) {}
            }

            return result.toString();
        }
    }
}
