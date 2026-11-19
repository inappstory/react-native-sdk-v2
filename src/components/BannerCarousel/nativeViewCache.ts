import { type HostComponent } from 'react-native';

type NativeComponentRegistry = Record<string, HostComponent<any>>;

const getRegistry = (): NativeComponentRegistry => {
  /* @ts-ignore */
  return (global.__IASNativeComponents ??= {});
};

export const cacheNativeView = (
  value: HostComponent<any>,
  name = 'BannerView'
) => {
  getRegistry()[name] = value;
};

export const getCachedNativeView = (
  name = 'BannerView'
): HostComponent<any> | undefined => {
  return getRegistry()[name];
};
