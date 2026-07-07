export type StoryReaderListeners = {
  onOpen?: () => void;
  onClose?: () => void;
  onSelect?: (id: string) => void;
};
