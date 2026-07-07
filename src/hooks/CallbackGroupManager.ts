import { CallbackGroup, type Callback } from './CallbackGroup';

export class CallbackGroupManager<GroupNames extends string = string, T = any> {
  private groups: Record<GroupNames, CallbackGroup<T>> = {} as Record<
    GroupNames,
    CallbackGroup<T>
  >;

  constructor(groupNames: GroupNames[] = []) {
    groupNames.forEach((name) => {
      this.groups[name] = new CallbackGroup<T>();
    });
  }

  addGroup(name: GroupNames): void {
    if (!this.groups[name]) {
      this.groups[name] = new CallbackGroup<T>();
    }
  }

  addListener(groupName: GroupNames, callback: Callback<T>): () => void {
    if (!this.groups[groupName]) {
      this.groups[groupName] = new CallbackGroup<T>();
    }
    return this.groups[groupName].add(callback);
  }

  removeListener(groupName: GroupNames, callback: Callback<T>): void {
    if (this.groups[groupName]) {
      this.groups[groupName].remove(callback);
    }
  }

  notify(groupName: GroupNames, ...args: T[]): void {
    if (this.groups[groupName]) {
      this.groups[groupName].notify(...args);
    }
  }

  clearGroup(groupName: GroupNames): void {
    if (this.groups[groupName]) {
      this.groups[groupName].clear();
    }
  }

  clearAll(): void {
    Object.values<CallbackGroup<T>>(this.groups).forEach((group) =>
      group.clear()
    );
  }
}
