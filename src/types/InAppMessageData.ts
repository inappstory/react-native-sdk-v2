import type { NativeEvent } from './common';

export type InAppMessageData = {
  id?: number;
  title?: string | null;
  event?: string | null;
  extraFields?: Record<string, string> | null;
};

export type InAppMessageEvent =
  | NativeEvent<'showInAppMessage' | 'closeInAppMessage', InAppMessageData>
  | NativeEvent<
      'inAppMessageWidgetEvent',
      {
        inAppMessageData: InAppMessageData;
        name?: string;
        data?: Record<string, string> | null;
      }
    >;
