export const getTimeFromDate = (date: Date) => {
    if(!date) return "";
    // Create a Date object
    const currDate = new Date(date);

    // Get the hour and minute components
    const hours = currDate.getHours();
    const minutes = currDate.getMinutes();

    // Format the time as "hour:minutes"
    const  timeString = hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0');

    console.log('currDate', timeString)
    return timeString
}