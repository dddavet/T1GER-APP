package app.t1ger.screentime

import android.webkit.JavascriptInterface
import org.json.JSONArray
import org.json.JSONObject

class ScreenTimeJavascriptInterface(private val service: UsageStatsService) {

    @JavascriptInterface
    fun hasUsagePermission(): Boolean {
        return service.hasUsageStatsPermission()
    }

    @JavascriptInterface
    fun requestUsagePermission() {
        service.openUsageAccessSettings()
    }

    @JavascriptInterface
    fun getDailySocialUsage(): String {
        val report = service.getDailySocialUsage(10.0)
        val json = JSONObject().apply {
            put("totalMinutes", report.totalMinutes)
            put("totalHours", report.totalHours)
            put("estimatedLossUSD", report.estimatedLossUSD)

            val appsArray = JSONArray()
            for (app in report.apps) {
                val appObj = JSONObject().apply {
                    put("packageName", app.packageName)
                    put("appName", app.appName)
                    put("minutes", app.minutes)
                    put("iconEmoji", app.iconEmoji)
                }
                appsArray.put(appObj)
            }
            put("apps", appsArray)
        }
        return json.toString()
    }
}
