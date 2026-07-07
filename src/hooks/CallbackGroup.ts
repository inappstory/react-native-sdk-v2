export type Callback<T = any> = (...args: T[]) => void;

export class CallbackGroup<T = any> {
  private callbacks: Callback<T>[] = [];

  add(callback: Callback<T>): () => void {
    this.callbacks.push(callback);
    return () => this.remove(callback);
  }

  remove(callback: Callback<T>): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  notify(...args: T[]): void {
    this.callbacks.forEach((cb) => cb(...args));
  }

  clear(): void {
    this.callbacks = [];
  }
}
