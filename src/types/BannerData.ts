import type { NativeEvent } from './common';

export type BannerData = {
  id?: number | string;
  bannerPlace?: string;
  payload?: string | null;
  extraFields?: Record<string, string> | null;
};

export type BannerWidgetEvent = NativeEvent<
  'bannerWidgetEvent',
  {
    bannerData: BannerData;
    name?: string;
    data?: Record<string, string> | null;
  }
>;
