package com.inappstorysdk

import android.util.Log
import com.inappstory.sdk.InAppStoryManager

class IASLoggerImpl : InAppStoryManager.IASLogger {
    override fun showELog(tag: String?,message: String?) {
        Log.d("IAS_SDK_LOG", "${tag ?: "DEF_TAG"} ${message ?: ""}")

    }

    override fun showDLog(tag: String?,message: String?) {
        Log.d("IAS_SDK_LOG", "${tag ?: "DEF_TAG"} ${message ?: ""}")
    }
}
