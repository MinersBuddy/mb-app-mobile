package com.minersbuddy

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetBridge(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "WidgetBridge"

    @ReactMethod
    fun updateExamDate(examDate: String, examName: String) {
        val context = reactApplicationContext
        val prefs: SharedPreferences =
            context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)
        prefs.edit()
            .putString("exam_date", examDate)
            .putString("exam_name", examName)
            .apply()

        // Widget ko force update karo
        val manager = AppWidgetManager.getInstance(context)
        val ids = manager.getAppWidgetIds(
            ComponentName(context, ExamCountdownWidget::class.java)
        )
        ids.forEach { ExamCountdownWidget.updateWidget(context, manager, it) }
    }
}