import { Linking } from 'react-native';
import { isFunction } from '../utils/isFunction';
import { CTASource } from '../types/CTA';
import type { CTAPayload } from '../types/CTA';

/**
 * Turns a native CTA event into a `{ src, srcRef, data }` callback payload and
 * routes it to the app's handler, falling back to opening the url itself.
 */
export class CTAHandler {
  private handler?: Function;

  set clickHandler(callback: Function) {
    if (isFunction(callback)) {
      this.handler = callback;
    }
  }

  handle(event: { url?: string; action?: string }): void {
    let src = CTASource.UNKNOWN;
    let payload: CTAPayload = null!;
    switch (event.action) {
      case 'button':
      case 'swipe':
        src = CTASource.STORY_READER;
        payload = { id: 0, url: event.url!, index: 0, elementId: '' };
        break;
      case 'deeplink':
        src = CTASource.STORY_LIST;
        payload = { id: 0, index: 0, isDeeplink: true, url: event.url };
        break;
      case 'game':
        src = CTASource.GAME_READER;
        payload = { url: event.url!, gameInstanceId: '0' };
        break;
    }
    if (src === CTASource.UNKNOWN) return;

    if (isFunction(this.handler)) {
      try {
        this.handler({ src, srcRef: 'default', data: payload });
      } catch (e) {
        console.error(e);
      }
    } else {
      this.defaultLinking(payload.url);
    }
  }

  protected async defaultLinking(url?: string) {
    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          Linking.openURL(url);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}
