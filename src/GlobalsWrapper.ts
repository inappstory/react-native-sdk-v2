import { type HostComponent } from 'react-native';

export const cacheNativeView = (value: HostComponent<any>) => {
  /* @ts-ignore */
  global.NativeComponent = value;
};

export const getCachedNativeView = (): HostComponent<any> | undefined => {
  /* @ts-ignore */
  return global.NativeComponent;
};