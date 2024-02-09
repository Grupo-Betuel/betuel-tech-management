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