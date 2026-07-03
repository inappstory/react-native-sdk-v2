package com.inappstorysdk

import android.os.Bundle
import android.os.Build
import androidx.activity.OnBackPressedCallback
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.inappstory.sdk.InAppStoryManager

open class InAppStoryActivity : ReactActivity() {

    val backPressManager = BackPressManager()

    private val backCallback = object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
            if (tryHandleOverlayBack()) return
            isEnabled = false
            this@InAppStoryActivity.onBackPressed()
            isEnabled = true
        }
    }

    override fun getMainComponentName(): String = "ias_activity"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            onBackPressedDispatcher.addCallback(this, backCallback)
        }
    }

    override fun invokeDefaultOnBackPressed() {
        backCallback.isEnabled = false
        super.invokeDefaultOnBackPressed()
        backCallback.isEnabled = true
    }

    private fun tryHandleOverlayBack(): Boolean {
        if (supportFragmentManager.findFragmentByTag("overlay_fragment") == null) return false
        if (InAppStoryManager.getInstance()?.onBackPressed() != true) {
            supportFragmentManager.popBackStack()
        }
        return true
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        if (tryHandleOverlayBack()) return
        if (backPressManager.shouldInterceptBackPress()) return
        super.onBackPressed()
    }
}
