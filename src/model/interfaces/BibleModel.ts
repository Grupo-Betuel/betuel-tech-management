import {BaseModel} from "./BaseModel";
export type BibleDayResourceTypes = 'image' | 'audio' | 'lecture' | 'audio-lecture' | 'video';
export type UploableDayResourceTypes = Extract<'image' | 'audio', BibleDayResourceTypes>;
export const BibleDayResourceTypesList: BibleDayResourceTypes[] = ['image', 'audio', 'lecture', 'audio-lecture', 'video'];
export interface BibleDayResourcesModel extends BaseModel {
    url: string;
    title: string;
    description: string;
    language?: string;
    type: BibleDayResourceTypes;
    updateDate: Date;
    createDate: Date;
    // Add other properties here based on the actual schema
}

export interface BibleDayModel extends BaseModel {
    position: number;
    title: string;
    description: string;
    resources: Array<BibleDayResourcesModel>; // Assuming the type of resources is an array of strings
    updateDate: Date;
    createDate: Date;
    // Add other properties here based on the actual schema
}

export interface BibleGroupModel extends BaseModel {
    title: string;
    description: string;
    startDate: Date;

    users: Array<BibleUserModel>; // Assuming the type of users is an array of strings
    whatsappGroupID: string;
    type?: string;
    updateDate?: Date;
    createDate?: Date;
    // Add other properties here based on the actual schema
}

export interface BibleUserModel extends BaseModel {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    lastCongrat: Date;
    status: 'active' | 'inactive' | 'three-days' | 'seven-days';
    bibleDay: BibleDayModel; // Assuming the type of bibleDay is a string
    updateDate: Date;
    createDate: Date;
    // Add other properties here based on the actual schema
}

export type BibleStudyInteractionModes = 'daily'
    | 'weekly'
    | 'weekDays'
    | 'weekend'


export const bibleStudyActionTypesList: BibleStudyActionTypes[] = [
    'resource',
    'congrats',
    'motivate',
    'open-groups',
    'close-groups',
    'poll',
    'summarize'
]

export const bibleStudyInteractionModeList: BibleStudyInteractionModes[] = [
    'daily',
    'weekly',
    'weekDays',
    'weekend'
]

export interface BibleStudyModel extends BaseModel {
    title: string,
    description: string,
    groups: BibleGroupModel[],
    days: BibleDayModel[],
    actions: BibleStudyActionsModel[],
    interactionMode: BibleStudyInteractionModes,
}

export type BibleStudyActionTypes = 'resource'
    | 'congrats'
    | 'motivate'
    | 'open-groups'
    | 'close-groups'
    | 'poll'
    | 'summarize';

export interface BibleStudyActionsModel extends BaseModel {
    hour: number;
    minute: number;
    day: number,
    date?: Date,
    type: BibleStudyActionTypes,
    resourceType: BibleDayResourceTypes,
}