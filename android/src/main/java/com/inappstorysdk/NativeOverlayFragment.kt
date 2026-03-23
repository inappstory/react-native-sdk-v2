package com.inappstorysdk

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.TextView
import androidx.fragment.app.Fragment

class NativeOverlayFragment : Fragment() {

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    val root = FrameLayout(requireContext()).apply {
      setBackgroundColor(0xCC000000.toInt())
      layoutParams = FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        FrameLayout.LayoutParams.MATCH_PARENT
      )
    }

    val card = FrameLayout(requireContext()).apply {
      setBackgroundColor(0xFFFFFFFF.toInt())
      layoutParams = FrameLayout.LayoutParams(800, 600).also {
        it.gravity = android.view.Gravity.CENTER
      }
      setPadding(40, 40, 40, 40)
    }

    val text = TextView(requireContext()).apply {
      this.text = "Fragment!"
      textSize = 20f
      layoutParams = FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.WRAP_CONTENT,
        FrameLayout.LayoutParams.WRAP_CONTENT
      ).also { it.gravity = android.view.Gravity.CENTER_HORIZONTAL }
    }

    val closeBtn = Button(requireContext()).apply {
      this.text = "Close!"
      layoutParams = FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.WRAP_CONTENT,
        FrameLayout.LayoutParams.WRAP_CONTENT
      ).also { it.gravity = android.view.Gravity.BOTTOM or android.view.Gravity.CENTER_HORIZONTAL }
      setOnClickListener { parentFragmentManager.popBackStack() }
    }

    card.addView(text)
    card.addView(closeBtn)
    root.addView(card)

    root.setOnClickListener { parentFragmentManager.popBackStack() }

    return root
  }
}
