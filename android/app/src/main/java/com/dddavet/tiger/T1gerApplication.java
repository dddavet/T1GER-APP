package com.dddavet.tiger;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import com.onesignal.OneSignal;
import com.onesignal.debug.LogLevel;
import com.onesignal.Continue;

public class T1gerApplication extends Application {

    private static final String TAG = "T1GER_App";
    
    // OneSignal App ID Fallback (can be overridden from BuildConfig / .env)
    public static final String ONESIGNAL_APP_ID = "YOUR_ONESIGNAL_APP_ID";

    // Required Android 8.0+ (API 26+) Notification Channels
    public static final String CHANNEL_STREAKS_ID = "t1ger_streaks";
    public static final String CHANNEL_LEAGUES_ID = "t1ger_social_league";
    public static final String CHANNEL_OPPORTUNITY_ID = "t1ger_opportunity";

    @Override
    public void onCreate() {
        super.onCreate();

        // 1. Initialize Android Notification Channels
        createNotificationChannels();

        // 2. Initialize OneSignal SDK 5.x (Only if valid App ID provided)
        if (ONESIGNAL_APP_ID != null && !ONESIGNAL_APP_ID.contains("YOUR_ONESIGNAL_APP_ID") && !ONESIGNAL_APP_ID.trim().isEmpty()) {
            try {
                OneSignal.getDebug().setLogLevel(LogLevel.VERBOSE);
                OneSignal.initWithContext(this, ONESIGNAL_APP_ID);
                Log.i(TAG, "OneSignal 5.x initialized successfully for T1GER.");
            } catch (Exception e) {
                Log.e(TAG, "OneSignal initialization skipped: " + e.getMessage());
            }
        } else {
            Log.i(TAG, "OneSignal disabled (no production ONESIGNAL_APP_ID configured).");
        }
    }

    /**
     * Initializes mandatory Android Notification Channels with high attention priority
     * for Duolingo-style streak retention and opportunity cost warnings.
     */
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager == null) return;

            Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();

            // a) Canal: Rachas y Misiones Diarias (IMPORTANCE_HIGH)
            NotificationChannel streaksChannel = new NotificationChannel(
                    CHANNEL_STREAKS_ID,
                    "Rachas y Misiones Diarias",
                    NotificationManager.IMPORTANCE_HIGH
            );
            streaksChannel.setDescription("Alertas urgentes para proteger tu racha y recordatorios de lecciones antes de medianoche.");
            streaksChannel.enableLights(true);
            streaksChannel.setLightColor(Color.parseColor("#FF7300")); // T1GER Orange
            streaksChannel.enableVibration(true);
            streaksChannel.setVibrationPattern(new long[]{0, 250, 150, 250});
            streaksChannel.setSound(defaultSoundUri, audioAttributes);
            manager.createNotificationChannel(streaksChannel);

            // b) Canal: Novedades y Competencia (IMPORTANCE_DEFAULT)
            NotificationChannel leaguesChannel = new NotificationChannel(
                    CHANNEL_LEAGUES_ID,
                    "Novedades y Competencia",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            leaguesChannel.setDescription("Actualizaciones de la Liga semanal, ascensos de división y nuevos módulos.");
            leaguesChannel.enableLights(true);
            leaguesChannel.setLightColor(Color.parseColor("#3FC78E")); // Emerald green
            manager.createNotificationChannel(leaguesChannel);

            // c) Canal: Costo de Oportunidad y Screen Time (IMPORTANCE_HIGH)
            NotificationChannel opportunityChannel = new NotificationChannel(
                    CHANNEL_OPPORTUNITY_ID,
                    "Costo de Oportunidad y Screen Time",
                    NotificationManager.IMPORTANCE_HIGH
            );
            opportunityChannel.setDescription("Análisis diario de tiempo en redes vs valor productivo.");
            opportunityChannel.enableLights(true);
            opportunityChannel.setLightColor(Color.parseColor("#FF9800"));
            manager.createNotificationChannel(opportunityChannel);

            Log.i(TAG, "All 3 Android Notification Channels created successfully.");
        }
    }
}
