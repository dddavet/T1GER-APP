package app.t1ger.screentime

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.provider.Settings
import java.util.Calendar

data class AppUsageInfo(
    val packageName: String,
    val appName: String,
    val totalTimeInForegroundMs: Long,
    val minutes: Long,
    val iconEmoji: String
)

data class SocialUsageReport(
    val totalMinutes: Long,
    val totalHours: Double,
    val estimatedLossUSD: Double,
    val apps: List<AppUsageInfo>
)

class UsageStatsService(private val context: Context) {

    private val socialApps = mapOf(
        "com.zhiliaoapp.musically" to Pair("TikTok", "🎵"),
        "com.ss.android.ugc.trill" to Pair("TikTok", "🎵"),
        "com.instagram.android" to Pair("Instagram", "📸"),
        "com.google.android.youtube" to Pair("YouTube", "▶️"),
        "com.twitter.android" to Pair("X (Twitter)", "𝕏"),
        "com.facebook.katana" to Pair("Facebook", "📘"),
        "com.reddit.frontpage" to Pair("Reddit", "🤖"),
        "com.snapchat.android" to Pair("Snapchat", "👻")
    )

    fun hasUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager ?: return false
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    fun openUsageAccessSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    fun getDailySocialUsage(hourlyWage: Double = 15.0): SocialUsageReport {
        if (!hasUsageStatsPermission()) {
            return SocialUsageReport(0, 0.0, 0.0, emptyList())
        }

        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return SocialUsageReport(0, 0.0, 0.0, emptyList())

        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        val startOfDay = calendar.timeInMillis
        val endOfDay = System.currentTimeMillis()

        val stats: List<UsageStats> = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startOfDay,
            endOfDay
        ) ?: emptyList()

        val appUsageList = mutableListOf<AppUsageInfo>()
        var totalMs = 0L

        for (stat in stats) {
            val pkg = stat.packageName
            if (socialApps.containsKey(pkg) && stat.totalTimeInForeground > 0) {
                val appMeta = socialApps[pkg] ?: Pair(pkg, "📱")
                val minutes = stat.totalTimeInForeground / (1000 * 60)
                if (minutes > 0) {
                    appUsageList.add(
                        AppUsageInfo(
                            packageName = pkg,
                            appName = appMeta.first,
                            totalTimeInForegroundMs = stat.totalTimeInForeground,
                            minutes = minutes,
                            iconEmoji = appMeta.second
                        )
                    )
                    totalMs += stat.totalTimeInForeground
                }
            }
        }

        val totalMinutes = totalMs / (1000 * 60)
        val totalHours = totalMinutes / 60.0
        val estimatedLossUSD = totalHours * hourlyWage

        return SocialUsageReport(
            totalMinutes = totalMinutes,
            totalHours = Math.round(totalHours * 10.0) / 10.0,
            estimatedLossUSD = Math.round(estimatedLossUSD * 100.0) / 100.0,
            apps = appUsageList.sortedByDescending { it.minutes }
        )
    }
}
