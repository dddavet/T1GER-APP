package app.t1ger.screentime

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class DailyOpportunityWorker(
    private val appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    companion object {
        const val CHANNEL_ID = "t1ger_opportunity_alerts"
        const val NOTIFICATION_ID = 1001
    }

    override suspend fun doWork(): Result {
        val usageService = UsageStatsService(appContext)
        val report = usageService.getDailySocialUsage(hourlyWage = 15.0)

        // Only notify if user had at least 15 minutes of social media usage
        if (report.totalMinutes >= 15) {
            sendOpportunityNotification(report)
        }

        return Result.success()
    }

    private fun sendOpportunityNotification(report: SocialUsageReport) {
        val notificationManager =
            appContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create Channel on Android 8.0+ (API 26+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Alertas de Costo de Oportunidad T1GER",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notificaciones diarias sobre tiempo en redes y valor recuperable"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Open App Intent with deep-link
        val launchIntent = appContext.packageManager.getLaunchIntentForPackage(appContext.packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("view", "learn")
            putExtra("reclaimScreenTime", true)
        }

        val pendingIntent = PendingIntent.getActivity(
            appContext,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val topApp = report.apps.firstOrNull()?.appName ?: "redes sociales"
        val title = "🐅 Alerta de Tiempo T1GER: ${report.totalHours}h en redes hoy"
        val body = "Hoy acumulaste ${report.totalMinutes} min en $topApp (aprox. $${report.estimatedLossUSD} USD de tiempo no productivo). 1 lección de 4 min en T1GER te devuelve el control."

        val notification = NotificationCompat.Builder(appContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .addAction(
                android.R.drawable.ic_media_play,
                "Abrir T1GER (+10 vXP)",
                pendingIntent
            )
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }
}
