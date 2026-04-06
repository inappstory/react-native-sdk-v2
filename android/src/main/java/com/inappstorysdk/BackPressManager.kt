package com.inappstorysdk

class BackPressManager {
  private var handler: (() -> Boolean)? = null

  fun register(handler: () -> Boolean) {
    this.handler = handler
  }

  fun unregister() {
    this.handler = null
  }

  fun handleBackPress(): Boolean {
    return handler?.invoke() == true
  }
}
