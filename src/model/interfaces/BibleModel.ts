import {BaseModel} from "./BaseModel";

export type BibleDayResourceTypes =
    | 'image'
    | 'image-2'
    | 'image-3'
    | 'audio'
    | 'audio-2'
    | 'audio-3'
    | 'lecture'
    | 'lecture-2'
    | 'lecture-3'
    | 'audio-lecture'
    | 'audio-lecture-2'
    | 'audio-lecture-3'
    | 'video'
    | 'video-2'
    | 'video-3'

export type UploableDayResourceTypes = Extract<
    'image'
    | 'image-2'
    | 'image-3'
    | 'audio'
    | 'audio-2'
    | 'audio-3'
    , BibleDayResourceTypes>;
export const BibleDayResourceTypesList: BibleDayResourceTypes[] = [
    'image',
    'image-2',
    'image-3',
    'audio',
    'audio-2',
    'audio-3',
    'lecture',
    'lecture-2',
    'lecture-3',
    'audio-lecture',
    'audio-lecture-2',
    'audio-lecture-3',
    'video',
    'video-2',
    'video-3',
];

export const AvailableSourceTypes: UploableDayResourceTypes[] = ['audio', 'image', 'image-3', 'image-2', 'audio-2', 'audio-3'];


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
    dueDaysLimit: number;
    startDate: Date;
    users: Array<BibleUserModel>; // Assuming the type of users is an array of strings
    coordinators: Array<BibleUserModel>; // Assuming the type of users is an array of strings
    whatsappGroupID: string;
    polls: string[];
    type?: string;
    updateDate?: Date;
    createDate?: Date;
    // Add other properties here based on the actual schema
}

export interface BibleGroupParticipationModel extends BaseModel {
    day: BibleDayModel;
    study: string;
    group: string;
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
    participations: BibleGroupParticipationModel[];

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
    pinMessage?: boolean;
    day?: number,
    date?: Date,
    type: BibleStudyActionTypes,
    resourceType: BibleDayResourceTypes,
}