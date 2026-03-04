export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export const TAG_COLORS = [
  '#f50',
  '#2db7f5',
  '#87d068',
  '#108ee9',
  '#722ed1',
  '#eb2f96',
  '#faad14',
  '#13c2c2',
  '#52c41a',
  '#fa541c',
] as const;

export type TagColor = (typeof TAG_COLORS)[number];
