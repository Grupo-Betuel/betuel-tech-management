export type LaborDayTypes = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ILaborDay {
    day: LaborDayTypes;
    timeFrom: string;
    timeTo: string;
    available?: boolean;
    name: string
}

export type ILaborDayData = {
    [N in LaborDayTypes]: ILaborDay;
}
