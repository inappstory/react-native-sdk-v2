export type Story = {
  storyID: number;
  title: string;
  titleColor: string;
  backgroundColor: string;
  coverVideoPath?: string;
  coverImagePath?: string;
  opened: boolean;
  aspectRatio: number;
  slidesCount: number;
  statTitle: string;
};
