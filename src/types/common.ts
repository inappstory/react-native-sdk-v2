export type Option<T> = T | null | undefined;

export type Dict<T = any> = {
  [key: string]: T | undefined;
  [key: number]: T | undefined;
};

export type NativeEvent<N extends string, B> = { withName: N; body: B };
