package com.inappstorysdk

import android.os.Bundle
import android.os.Build
import androidx.activity.OnBackPressedCallback
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

open class InAppStoryActivity : ReactActivity() {

    val backPressManager = BackPressManager()

    private val backCallback = object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
            if (backPressManager.shouldInterceptBackPress()) return  
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

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            if (backPressManager.shouldInterceptBackPress()) return
        }
        super.onBackPressed()
    }
}
