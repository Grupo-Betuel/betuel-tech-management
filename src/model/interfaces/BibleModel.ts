import {BaseModel} from "./BaseModel";

export interface BibleDayResources extends BaseModel {
    url: string;
    title: string;
    description: string;
    language?: string;
    type: 'image' | 'audio' | 'lecture' | 'audio-lecture' | 'video';
    updateDate: Date;
    createDate: Date;
    // Add other properties here based on the actual schema
}

export interface BibleDays extends BaseModel {
    position: number;
    title: string;
    description: string;
    resources: Array<BibleDayResources>; // Assuming the type of resources is an array of strings
    updateDate: Date;
    createDate: Date;
    // Add other properties here based on the actual schema
}

export interface BibleGroups extends BaseModel {
    title: string;
    description: string;
    startDate: Date;
    users: Array<BibleUsers>; // Assuming the type of users is an array of strings
    whatsappGroupID: string;
    type?: string;
    updateDate?: Date;
    createDate?: Date;
    // Add other properties here based on the actual schema
}

export interface BibleUsers extends BaseModel {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    lastCongrat: Date;
    status: 'active' | 'inactive' | 'three-days' | 'seven-days';
    bibleDay: BibleDays; // Assuming the type of bibleDay is a string
    updateDate: Date;
    createDate: Date;
    // Add other properties here based on the actual schema
}
