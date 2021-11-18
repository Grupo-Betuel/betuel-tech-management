export const getSales = async (date?: string) => {
    const response = await fetch(`${process.env.REACT_APP_API}sales/?date=${date}`);
    return await response.json() as any;
};

export const getRecordedSales = async () => {
    const response = await fetch(`${process.env.REACT_APP_API}dates/registered`);
    return await response.json() as any || [];
}
