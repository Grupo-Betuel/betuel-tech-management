export const getTimeFromDate = (date: Date) => {
    if(!date) return "";
    // Create a Date object
    const currDate = new Date(date);

    // Get the hour and minute components
    const hours = currDate.getHours();
    const minutes = currDate.getMinutes();

    // Format the time as "hour:minutes"
    const  timeString = hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0');

    return timeString
}

export interface IDateMonth {
    id: string;
    text: string;
    date: Date;

}
export const months: IDateMonth[] = Array.from({ length: 12 }, (item, index) => {
    const date = new Date(0, index);
    const id = date.toLocaleString('es-ES', {month: 'numeric'})
    const text = date.toLocaleString('es-ES', {month: 'long'})

    return {
        id,
        text,
        date,
    };
});

export const years = [new Date().getFullYear(), ...Array.from({ length: new Date().getFullYear() - 2020 }, (item, index) => new Date().getFullYear() - index - 1)];

export function daysBetweenDates(startDate: string | Date, endDate: string | Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Normalize both dates to midnight
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate the time difference in milliseconds
    const timeDifference = end.getTime() - start.getTime();

    // Convert time difference from milliseconds to days
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    return Math.round(daysDifference);
}