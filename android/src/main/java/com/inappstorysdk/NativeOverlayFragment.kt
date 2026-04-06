package com.inappstorysdk

import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.Fragment
import com.inappstorysdk.InAppStoryActivity
import com.inappstory.sdk.CancellationToken
import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.inappmessage.InAppMessageOpenSettings
import com.inappstory.sdk.inappmessage.InAppMessageScreenActions

class NativeOverlayFragment(
  private val ias: InAppStoryManager?,
  private val settings: InAppMessageOpenSettings,
  //private val backPressManager: BackPressManager,
  private val onReaderIsClosed: (() -> Unit)? = null,
  private val onReaderIsOpen: ((CancellationToken?) -> Unit)? = null
) : Fragment() {

  private val contentId = View.generateViewId()

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    // backPressManager.register {
    //   val result = ias?.onBackPressed()
    //   Log.d("InappstorySdkModule", "Back press handled: $result")
    //   return result
    // }

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

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {

    if (getActivity() is InAppStoryActivity) {
        Log.d("InappstorySdkModule", "Registering back press handler in NativeOverlayFragment")
          val fragmentActivity = (getActivity() as InAppStoryActivity)

          fragmentActivity?.backPressManager?.isManagerEnabled = false

          fragmentActivity?.backPressManager?.overlayHandler =
            object : BackPressManagerHandler() {
              override fun handleBackPress(): Boolean {
                Log.d("InappstorySdkModule", "Back press handled by NativeOverlayFragment")
                return ias?.onBackPressed() ?: false
              }
            }
    }

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

  override fun onDestroyView() {
     if (getActivity() is InAppStoryActivity) {
            val fragmentActivity = (getActivity() as InAppStoryActivity)

            fragmentActivity?.backPressManager?.isManagerEnabled = false
            fragmentActivity?.backPressManager?.overlayHandler = null 
     }
    super.onDestroyView()
  }
}
