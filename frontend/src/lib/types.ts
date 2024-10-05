import { ItemType } from "./enums";

export interface DirectoryItemType {
  key: string;
  name: string;
  uploadDate: string;
  size: number;
  type: ItemType;
}
