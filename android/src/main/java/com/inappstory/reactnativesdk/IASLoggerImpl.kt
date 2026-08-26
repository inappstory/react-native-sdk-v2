package com.inappstory.reactnativesdk

import com.inappstory.sdk.InAppStoryManager

/**
 * Bridges the native SDK logger to JS: [showELog] maps to level "error",
 * [showDLog] to "debug". Records are forwarded through [onLog]. The native
 * `tag` is dropped — iOS has no cross-platform equivalent (see LogEntry).
 */
class IASLoggerImpl(
  private val onLog: (level: String, message: String?) -> Unit
) : InAppStoryManager.IASLogger {
  override fun showELog(tag: String?, message: String?) = onLog("error", message)

  override fun showDLog(tag: String?, message: String?) = onLog("debug", message)
}
