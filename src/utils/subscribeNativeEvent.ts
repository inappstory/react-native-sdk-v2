import {
  NativeEventEmitter,
  NativeModules,
  type EventSubscription,
} from 'react-native';

const emitters: Record<string, NativeEventEmitter> = {};

export function subscribeNativeEvent<T>(
  module: any,
  moduleName: string,
  event: string,
  handler: (e: T) => void
): EventSubscription {
  if (typeof module[event] === 'function') {
    return module[event](handler);
  }
  emitters[moduleName] ??= new NativeEventEmitter(NativeModules[moduleName]);
  return emitters[moduleName]!.addListener(event, handler as (e: any) => void);
}
