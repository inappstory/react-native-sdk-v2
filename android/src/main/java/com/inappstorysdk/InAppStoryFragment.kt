package com.inappstorysdk

import android.app.Activity
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import android.util.Log
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.uimanager.ThemedReactContext

import com.inappstory.sdk.stories.ui.list.StoriesList;

class InAppStoryFragment(activity: Activity) : Fragment() {
  var activity = activity;
  private lateinit var storiesList: StoriesList

  override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
    super.onCreateView(inflater, container, savedInstanceState)
    Log.d("InAppStoryManager", "onCreateView");
    storiesList = StoriesList(activity)
    return storiesList
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    this.storiesList.loadStories();
  }

  override fun onPause() {
    super.onPause()
    // do any logic that should happen in an `onPause` method
    // e.g.: customView.onPause();
  }

  override fun onResume() {
    super.onResume()
    // do any logic that should happen in an `onResume` method
    // e.g.: customView.onResume();
  }

  override fun onDestroy() {
    super.onDestroy()
    // do any logic that should happen in an `onDestroy` method
    // e.g.: customView.onDestroy();
  }
}