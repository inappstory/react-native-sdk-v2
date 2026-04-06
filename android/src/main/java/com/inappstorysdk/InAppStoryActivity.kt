package com.inappstorysdk

import android.os.Bundle
import android.os.Build
import androidx.activity.OnBackPressedCallback
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.inappstorysdk.BackPressManager
import android.util.Log

open class InAppStoryActivity : ReactActivity() {

    val backPressManager = BackPressManager() 
    
    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "ias_activity"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Log.w(
      "InappstorySdkModule",
      "Android 13+ detected, using OnBackPressedDispatcher for back press handling"
    )
            onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    Log.d("InappstorySdkModule", "onBackPressedDispatcher received, checking with BackPressManager")
                    val intercepted = backPressManager.shouldInterceptBackPress()
                    if (!intercepted) {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                        isEnabled = true
                    }
                }
            })
        }
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
       if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            Log.d("InappstorySdkModule", "onBackPressed received, checking with BackPressManager")
            val intercepted = backPressManager.shouldInterceptBackPress()
            if (intercepted) {
                return
            }
        }
        super.onBackPressed()
    }
}
