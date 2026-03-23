package com.inappstorysdk

import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.fragment.app.Fragment
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

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    val root = FrameLayout(requireContext()).apply {
      setBackgroundColor(Color.TRANSPARENT)
      layoutParams = FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        FrameLayout.LayoutParams.MATCH_PARENT
      )
      id = contentId
    }

    root.setOnClickListener { parentFragmentManager.popBackStack() }
    return root
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    requireActivity().onBackPressedDispatcher.addCallback(
      viewLifecycleOwner,
      object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
          InAppStoryManager.getInstance()?.let {
            if (it.onBackPressed())
              return
          }
          onReaderIsClosed?.invoke()
          parentFragmentManager.popBackStack()
        }
      }
    )
    val cancellationToken = this.ias?.showInAppMessage(
      settings,
      childFragmentManager,
      contentId,
      object : InAppMessageScreenActions {
        override fun readerIsOpened() {
          Log.d("InappstorySdkModule", "IAM reader opened")
          //fragmentActivity?.backPressManager?.isManagerEnabled = true
        }

        override fun readerOpenError(p0: String?) {
          Log.d("InappstorySdkModule", "IAM reader open error: $p0")
          onReaderIsClosed?.invoke()
          parentFragmentManager.popBackStack()
          //fragmentActivity?.backPressManager?.isManagerEnabled = false
        }

        override fun readerIsClosed() {
          Log.d("InappstorySdkModule", "IAM reader closed")
          onReaderIsClosed?.invoke()
          parentFragmentManager.popBackStack()
          //removeFragmentContainer(id)
          //fragmentActivity?.backPressManager?.isManagerEnabled = false
        }
      })
    onReaderIsOpen?.invoke(cancellationToken)
  }
}
