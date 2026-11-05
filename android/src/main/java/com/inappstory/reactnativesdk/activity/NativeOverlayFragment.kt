package com.inappstory.reactnativesdk.activity

import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.fragment.app.Fragment
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.inappstory.sdk.CancellationToken
import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.inappmessage.InAppMessageOpenSettings
import com.inappstory.sdk.inappmessage.InAppMessageScreenActions
import androidx.core.view.doOnLayout
import com.inappstory.reactnativesdk.appearance.AppearanceManagerImpl

class NativeOverlayFragment(
  private val ias: InAppStoryManager?,
  private val settings: InAppMessageOpenSettings,
  private val onReaderIsClosed: (() -> Unit)? = null,
  private val onReaderIsOpen: ((CancellationToken?) -> Unit)? = null
) : Fragment() {

  private val contentId = View.generateViewId()
  private var previousSoftInputMode: Int? = null
  private var loadingPlaceholder: View? = null

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    enableImeSupport(view)
    view.doOnLayout {
        val cancellationToken = ias?.showInAppMessage(
            settings,
            childFragmentManager,
            contentId,
            object : InAppMessageScreenActions {
                override fun readerIsOpened() {
                    Log.d("InappstorySdkModule", "IAM reader opened")
                    view?.post { loadingPlaceholder?.visibility = View.GONE }
                }
                override fun readerOpenError(p0: String?) {
                    Log.d("InappstorySdkModule", "IAM reader open error: $p0")
                    loadingPlaceholder?.visibility = View.GONE
                    onReaderIsClosed?.invoke()
                    parentFragmentManager.popBackStack()
                }
                override fun readerIsClosed() {
                    Log.d("InappstorySdkModule", "IAM reader closed")
                    loadingPlaceholder?.visibility = View.GONE
                    onReaderIsClosed?.invoke()
                    parentFragmentManager.popBackStack()
                }
            }
        )
        onReaderIsOpen?.invoke(cancellationToken)
    }
  }

  override fun onResume() {
    super.onResume()
    view?.let(::enableImeSupport)
  }

  override fun onPause() {
    restoreSoftInputMode()
    super.onPause()
  }

  override fun onDestroyView() {
    view?.let { ViewCompat.setOnApplyWindowInsetsListener(it, null) }
    restoreSoftInputMode()
    super.onDestroyView()
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
      isFocusable = true
      isFocusableInTouchMode = true
      clipToPadding = false
      AppearanceManagerImpl.iamLoadingPlaceholder?.let { placeholder ->
        val view = placeholder.createView(requireContext())
        loadingPlaceholder = view
        addView(
          view,
          FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
          )
        )
      }
      setOnClickListener { parentFragmentManager.popBackStack() }
    }
  }

  private fun enableImeSupport(view: View) {
    val window = requireActivity().window
    if (previousSoftInputMode == null) {
      previousSoftInputMode = window.attributes.softInputMode
    }
    val currentMode = window.attributes.softInputMode
    window.setSoftInputMode(
      (currentMode and WindowManager.LayoutParams.SOFT_INPUT_MASK_ADJUST.inv()) or
        WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
    )
    view.requestFocus()
    ViewCompat.setOnApplyWindowInsetsListener(view) { target, insets ->
      val baseBottom = 0
      target.setPadding(
        target.paddingLeft,
        target.paddingTop,
        target.paddingRight,
        maxOf(baseBottom, insets.getInsets(WindowInsetsCompat.Type.ime()).bottom)
      )
      insets
    }
    ViewCompat.requestApplyInsets(view)
  }

  private fun restoreSoftInputMode() {
    previousSoftInputMode?.let { mode ->
      activity?.window?.setSoftInputMode(mode)
      previousSoftInputMode = null
    }
  }
}
