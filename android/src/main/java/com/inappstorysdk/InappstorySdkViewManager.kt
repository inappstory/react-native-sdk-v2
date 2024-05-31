package com.inappstorysdk

import com.facebook.react.uimanager.annotations.ReactProp
import android.util.Log

import android.app.Activity
import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactPropGroup
import android.view.MotionEvent;
import android.os.SystemClock;
class InappstorySdkViewManager(
    private val reactContext: ReactApplicationContext
) : ViewGroupManager<FrameLayout>() {
  private var propWidth: Int? = null
  private var propHeight: Int? = null
  //var storiesList: StoriesList? = null

  override fun getName() = REACT_CLASS

  /**
   * Return a FrameLayout which will later hold the Fragment
   */
  override fun createViewInstance(reactContext: ThemedReactContext) =
    FrameLayout(reactContext)

  /**
   * Map the "create" command to an integer
   */
  override fun getCommandsMap() = mapOf("create" to COMMAND_CREATE, "click" to COMMAND_CLICK)

  /**
   * Handle "create" command (called from JS) and call createFragment method
   */
  override fun receiveCommand(
      root: FrameLayout,
      commandId: String,
      args: ReadableArray?
  ) {
    super.receiveCommand(root, commandId, args)
    val reactNativeViewId = requireNotNull(args).getInt(0)
    Log.d("InAppStoryManager","receiveCommand");
    when (commandId.toInt()) {
      COMMAND_CREATE -> createFragment(root, reactNativeViewId)
      COMMAND_CLICK -> createClick(root, reactNativeViewId, args)
    }
  }

  fun createClick(root: FrameLayout, reactNativeViewId: Int, args: ReadableArray) {
    Log.d("InAppStoryManager","createClick");
    val storyIndex = requireNotNull(args).getInt(1)
    Log.d("InAppStoryManager","createClick storyIndex")
    val parentView = root.findViewById<ViewGroup>(reactNativeViewId)
    val (clickDown, clickUp)= this.simulateClickAtCoordinates(storyIndex * 30.0f + 30.0f, 30.0f)
    parentView.dispatchTouchEvent(clickDown)
    parentView.dispatchTouchEvent(clickUp)
  }
  
  fun clickAt(x: Float, y: Float) {
      Log.d("InappstorySdkModule", "clickAt")
      //var events = simulateClickAtCoordinates(x, y)
      //this.appearanceManager = AppearanceManager()
  }
  

    fun simulateClickAtCoordinates(x: Float, y: Float): Pair<MotionEvent, MotionEvent> {
        val downTime = SystemClock.uptimeMillis()
        val eventTime = SystemClock.uptimeMillis() + 100
        val properties = buildPointerProperties()
        val pointerCoords = buildPointerCoords(x, y)
        return buildPressEvent(downTime, eventTime, properties, pointerCoords) to buildReleaseEvent(downTime, eventTime, properties, pointerCoords)
    }

    private fun buildPointerProperties(): Array<MotionEvent.PointerProperties?> {
        val properties = arrayOfNulls<MotionEvent.PointerProperties>(1)
        properties[0] = MotionEvent.PointerProperties().apply {
            id = 0
            toolType = MotionEvent.TOOL_TYPE_FINGER
        }
        return properties
    }

    private fun buildPointerCoords(x: Float, y: Float): Array<MotionEvent.PointerCoords?> {
        val pointerCoords = arrayOfNulls<MotionEvent.PointerCoords>(1)
        pointerCoords[0] = MotionEvent.PointerCoords().apply {
            this.x = x
            this.y = y
            pressure = 1f
            size = 1f
        }
        return pointerCoords
    }

    private fun buildPressEvent(downTime: Long, eventTime: Long, properties: Array<MotionEvent.PointerProperties?>, pointerCoords: Array<MotionEvent.PointerCoords?>) =
            MotionEvent.obtain(downTime, eventTime,
                    MotionEvent.ACTION_DOWN, 1, properties,
                    pointerCoords, 0, 0, 1f, 1f, 0, 0, 0, 0)

    private fun buildReleaseEvent(downTime: Long, eventTime: Long, properties: Array<MotionEvent.PointerProperties?>, pointerCoords: Array<MotionEvent.PointerCoords?>) =
            MotionEvent.obtain(downTime, eventTime,
                    MotionEvent.ACTION_UP, 1, properties,
                    pointerCoords, 0, 0, 1f, 1f, 0, 0, 0, 0)


  @ReactPropGroup(names = ["width", "height"], customType = "Style")
  fun setStyle(view: FrameLayout, index: Int, value: Int) {
    if (index == 0) propWidth = value
    if (index == 1) propHeight = value
  }

  /**
   * Replace your React Native view with a custom fragment
   */
  fun createFragment(root: FrameLayout, reactNativeViewId: Int) {
    Log.d("InAppStoryManager","createFragment");
    val parentView = root.findViewById<ViewGroup>(reactNativeViewId)
    setupLayout(parentView)

    val myFragment = InAppStoryFragment(reactContext.currentActivity as Activity)
    val activity = reactContext.currentActivity as FragmentActivity
    activity.supportFragmentManager
        .beginTransaction()
        .replace(reactNativeViewId, myFragment, reactNativeViewId.toString())
        .commit()
  }

  fun setupLayout(view: View) {
    Log.d("InAppStoryManager","setupLayout");

    Choreographer.getInstance().postFrameCallback(object: Choreographer.FrameCallback {
      override fun doFrame(frameTimeNanos: Long) {
        manuallyLayoutChildren(view)
        view.viewTreeObserver.dispatchOnGlobalLayout()
        Choreographer.getInstance().postFrameCallback(this)
      }
    })
  }

  /**
   * Layout all children properly
   */
  private fun manuallyLayoutChildren(view: View) {
    // propWidth and propHeight coming from react-native props
    val width = requireNotNull(propWidth)
    val height = requireNotNull(propHeight)

    view.measure(
        View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
        View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY))

    view.layout(0, 0, width, height)
  }

  companion object {
    private const val REACT_CLASS = "InappstorySdkView"
    private const val COMMAND_CREATE = 1
    private const val COMMAND_CLICK = 2
  }
}
