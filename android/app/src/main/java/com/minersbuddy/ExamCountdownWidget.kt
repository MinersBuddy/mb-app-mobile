package com.minersbuddy

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.TimeUnit

class ExamCountdownWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { widgetId ->
            updateWidget(context, appWidgetManager, widgetId)
        }
    }

    companion object {
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            widgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_countdown)

            // Exam date — baad mein SharedPreferences se load karna
            val examDateStr = "2026-06-10"
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val examDate = sdf.parse(examDateStr) ?: Date()
            val now = Date()

            val diffMs = examDate.time - now.time
            val daysLeft = if (diffMs > 0) TimeUnit.MILLISECONDS.toDays(diffMs) else 0

            views.setTextViewText(R.id.widget_days, daysLeft.toString())
            views.setTextViewText(R.id.widget_date, "10 Jun 2026")
            views.setTextViewText(R.id.widget_title, "MINING MATE")

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}