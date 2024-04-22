import {IMedia} from "./mediaModel";

export interface IActivity {
    title: string;
    images: IMedia[];
    videos: IMedia[];
    date: Date;
    description: string;
}
