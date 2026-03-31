package com.inappstorysdk

import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.Fragment
import com.inappstorysdk.BackPressManager.BackPressManagerHandler
import com.inappstory.sdk.CancellationToken
import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.inappmessage.InAppMessageOpenSettings
import com.inappstory.sdk.inappmessage.InAppMessageScreenActions

class NativeOverlayFragment(
  private val ias: InAppStoryManager?,
  private val settings: InAppMessageOpenSettings,
  private val onReaderIsClosed: (() -> Unit)? = null,
  private val onReaderIsOpen: ((CancellationToken?) -> Unit)? = null
) : Fragment() {

  private val contentId = View.generateViewId()

  private val backPressManagerHost: BackPressManagerHost?
    get() = activity as? BackPressManagerHost

  override fun onDestroy() {
    super.onDestroy()
    backPressManagerHost?.backPressManager?.let { manager ->
      manager.isManagerEnabled = false
      manager.overlayHandler = null
    }
  }

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    return FrameLayout(requireContext()).apply {
      setBackgroundColor(Color.TRANSPARENT)
      layoutParams = FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        FrameLayout.LayoutParams.MATCH_PARENT
      )
      id = contentId
      setOnClickListener { parentFragmentManager.popBackStack() }
    }
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    backPressManagerHost?.backPressManager?.let { manager ->
      manager.isManagerEnabled = true
      manager.overlayHandler = object : BackPressManagerHandler() {
                    override fun handleBackPress(): Boolean {
                        iasManager.let {
                            return it.onBackPressed()
                        }
                    }
                }
    } ?: Log.w(
      "InappstorySdkModule",
      "Activity does not implement BackPressManagerHost — back press won't be intercepted"
    )

    val cancellationToken = ias?.showInAppMessage(
      settings,
      childFragmentManager,
      contentId,
      object : InAppMessageScreenActions {
        override fun readerIsOpened() {
          Log.d("InappstorySdkModule", "IAM reader opened")
        }

        override fun readerOpenError(p0: String?) {
          Log.d("InappstorySdkModule", "IAM reader open error: $p0")
          onReaderIsClosed?.invoke()
          parentFragmentManager.popBackStack()
        }

        override fun readerIsClosed() {
          Log.d("InappstorySdkModule", "IAM reader closed")
          onReaderIsClosed?.invoke()
          parentFragmentManager.popBackStack()
        }
      }
    )
    onReaderIsOpen?.invoke(cancellationToken)
  }
}
