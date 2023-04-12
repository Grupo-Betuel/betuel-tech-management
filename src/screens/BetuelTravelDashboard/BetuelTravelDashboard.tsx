import {Button, Input, InputGroup, Label, Table} from "reactstrap";
import React from "react";
import {
    AmenityData,
    CategoryData,
    CurrencyData,
    IHotel,
    IHotelListItem, IQuoteDetails,
    IRate,
    ZoneData
} from "../../model/interfaces/rateModels";
import {
    getRoomsCategories,
    getHotelsWithRates,
    getAmenities,
    getZones,
    getCurrencies,
    getHotelList
} from "../../services/booking";
import "./BetuelTravelDashboard.scss";
import {Multiselect} from "multiselect-react-dropdown";
import {copyText} from "../../utils/text.utils";
import {toast} from "react-toastify";

export interface IColum<T> {
    header: string;
    key?: keyof T;
    onRender?: (item: T) => any;
}

const columns: IColum<IRate>[] = [
    {
        header: 'Desde',
        key: 'start_date',
        onRender: (item) => new Date(item.start_date).toLocaleDateString(),
    },
    {
        header: 'Hasta',
        key: 'ending_date',
        onRender: (item) => new Date(item.ending_date).toLocaleDateString(),
    },
    {
        header: 'Dias',
        onRender: (item) => item.week_days.length === 7 ? 'Todos los dias' : item.week_days.map(day => day.week_day).join(', '),
    },
    {
        header: 'Maxima Fecha de venta',
        key: 'max_request_date',
        onRender: (item) => new Date(item.max_request_date).toLocaleDateString(),
    },
    {
        header: 'Minimo de noches',
        key: 'min_required_nights',

    },
    {
        header: 'Categoria',
        onRender: (item) => item.category_data.name,

    },
    // {
    //     header: 'Divisa',
    //     onRender: (item) => item.currency_data.name,
    // },
    // {
    //     header: 'Disponibilidad Inmediata',
    //     key: 'available_rooms',
    //
    // },
    {
        header: 'Sencilla',
        key: 'simple',
        onRender: (item) => item.simple ? `${item.currency_data.acronym}$${item.simple.toLocaleString()}` : 'No aplica',

    },
    {
        header: 'Doble',
        onRender: (item) => item.double ? `${item.currency_data.acronym}$${item.double.toLocaleString()}` : 'No aplica',

    },
    {
        header: 'Triple',
        onRender: (item) => item.triple ? `${item.currency_data.acronym}$${item.triple.toLocaleString()}` : 'No aplica',
    },
    {
        header: 'Cuadruple',
        key: 'quadruple',
        onRender: (item) => item.quadruple ? `${item.currency_data.acronym}$${item.quadruple.toLocaleString()}` : 'No aplica',
    },
    {
        header: 'Niños',
        key: 'children',
        onRender: (item) => item.children ? `${item.currency_data.acronym}$${item.children.toLocaleString()}` : 'No aplica',
    },
    {
        header: 'Adolescentes',
        key: 'teenagers',
        onRender: (item) => item.teenagers ? `${item.currency_data.acronym}$${item.teenagers.toLocaleString()}` : 'No aplica',
    },
    {
        header: '1er Niño Gratis',
        onRender: (item) => item.first_child_free ? 'Si' : 'No',
    },
    {
        header: '2do Niño Gratis',
        onRender: (item) => item.second_child_free ? 'Si' : 'No',

    },
    {
        header: 'Notas',
        key: 'notes',
    }];


export interface IBetuelTravelDashboardProps {
    setLoading: (val: boolean) => any,
}

export type BudgetTypes = 'max_budget' | 'min_budget';
export type RateFilterKeys = (keyof (IRate & IHotel) | BudgetTypes);

export type RateFilters = {
    [key in RateFilterKeys]?: {
        type: 'rate' | 'hotel',
        data: IHotelListItem[] | any,
    }
}

const BetuelTravelDashboard = ({setLoading}: IBetuelTravelDashboardProps) => {
    const [hotels, setHotels] = React.useState<IHotel[]>([])
    const [filteredHotels, setFilteredHotels] = React.useState<IHotel[]>([])
    const [categories, setCategories] = React.useState<CategoryData[]>([])
    const [currencies, setCurrencies] = React.useState<CurrencyData[]>([])
    const [amenities, setAmenities] = React.useState<AmenityData[]>([])
    const [zones, setZones] = React.useState<ZoneData[]>([])
    const [hotelList, setHotelList] = React.useState<IHotelListItem[]>([])
    const [rateFilters, setRateFilters] = React.useState<RateFilters>({});
    const [generalQuoteDetails, setGeneralQuoteDetails] = React.useState<IQuoteDetails>({dollarToPeso: 56.5} as IQuoteDetails);
    const [quotes, setQuotes] = React.useState<IQuoteDetails[]>([]);
    const [nights, setNights] = React.useState<number>(0);

    const getSeedData = async () => {
        setLoading(true);

        const cats = await getRoomsCategories();
        const newAmenities = await getAmenities();
        const newZones = await getZones();
        const newCurr = await getCurrencies();
        const hotelItems = await getHotelList();
        setCategories(cats)
        setAmenities(newAmenities)
        setZones(newZones)
        setCurrencies(newCurr)
        setHotelList(hotelItems)
    }

    const getHotelsRates = async () => {
        setLoading(true);
        const response = await getHotelsWithRates();
        setHotels(response)
        setFilteredHotels(response)
    }

    const getAllData = async () => {
        // setLoading(true);
        await getHotelsRates();
        await getSeedData();
        setLoading(false);

    }

    React.useEffect(() => {
        runFilters();
    }, [rateFilters, generalQuoteDetails]);

    const getNightsBetween = (startDate: Date, endDate: Date) => {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / (oneDay)));
    }

    const calculateQuotePrices = (rate: IRate, nights: number): Partial<IQuoteDetails> => {
        const specifiedHabQuantity = ((generalQuoteDetails.doubleQuantity || 0) * 2 +
            (generalQuoteDetails.singleQuantity || 0) + (generalQuoteDetails.tripleQuantity || 0) * 3);
        const adultCalc = generalQuoteDetails.adults - specifiedHabQuantity
        const adults = adultCalc > 0 ? adultCalc : 0;
        const children = generalQuoteDetails.children || 0;
        const doubleQuantity = generalQuoteDetails.doubleQuantity || Math.floor(adults / 2);
        console.log("double", doubleQuantity);
        const singleQuantity = generalQuoteDetails.singleQuantity || adults % 2;
        console.log("singleQuantity", singleQuantity);
        const tripleQuantity = generalQuoteDetails.tripleQuantity || 0;
        let doublePrice = rate.double * (doubleQuantity * 2);
        console.log("doublePrice", doublePrice);

        const singlePrice = rate.simple * singleQuantity;
        console.log("singlePrice", singlePrice);
        const triplePrice = rate.triple * (tripleQuantity * 3);

        const childrenPrice = rate.children * children;

        const total = (triplePrice + doublePrice + singlePrice + childrenPrice) * nights;
        console.log("total", total, "how many nights?", nights);
        const adultPrice = ((doublePrice || 0) + (triplePrice || 0) + (singlePrice || 0)) * nights;

        return {
            doublePrice,
            singlePrice,
            childrenPrice,
            total,
            doubleQuantity,
            singleQuantity,
            tripleQuantity,
            adultPrice,
            triplePrice,
            totalText: `${rate.currency_data.acronym}$${total.toLocaleString()}`,
        }
    }

    const runFilters = () => {
        // eslint-disable-next-line no-undef
        let newHotels = structuredClone(hotels);

        Object.keys(rateFilters).forEach(key => {
            const {type, data} = rateFilters[key as keyof RateFilters] || {} as any;

            if (type === 'rate') {
                newHotels = newHotels.map(hotel => {
                    const rateKey = key as keyof IRate;
                    let newRates = hotel.rates;

                    if (rateKey === 'ending_date') {
                        newRates = hotel.rates.filter(rate => {
                            const endingDate = new Date(rate.ending_date);
                            const date = new Date(data);
                            return date <= endingDate && date >= new Date(rate.start_date)
                        });
                    } else if (rateKey === 'start_date') {
                        newRates = hotel.rates.filter(rate => {
                            const startDate = new Date(rate.start_date);
                            const date = new Date(data);
                            return date >= startDate && date <= new Date(rate.ending_date);
                        });

                    } else if (key === 'min_budget' || key === 'max_budget') {


                    } else {
                        newRates = hotel.rates.filter(rate => data.find((item: IHotelListItem) => item.id === rate[rateKey]));
                    }

                    if (!!rateFilters.start_date?.data && rateFilters.ending_date?.data && generalQuoteDetails.adults) {
                        const from = new Date(rateFilters.start_date.data as any);
                        const to = new Date(rateFilters.ending_date.data as any);
                        const nights = getNightsBetween(from, to);

                        setNights(nights);

                        newRates = newRates.map(rate => {
                            const {total, totalText} = calculateQuotePrices(rate, nights);
                            let success = true;

                            if (rateFilters.min_budget?.data && total) {
                                success = rateFilters.min_budget.data <= total;
                            }

                            if (rateFilters.max_budget?.data && total) {
                                success = rateFilters.max_budget.data >= total;
                            }

                            rate.total_amount = totalText;

                            return (success && rate) as any;

                        }).filter(i => !!i);
                    }

                    hotel.rates = newRates;
                    return (newRates.length && hotel) as any;
                }).filter(h => !!h);
            } else {
                newHotels = newHotels.filter(hotel => {
                    const hotelKey = key as keyof IHotel;
                    if (key === 'amenities') {
                        return data.find((item: IHotelListItem) => hotel.amenities.find(a => item.id === a.amenity))
                    } else {
                        return data.find((item: IHotelListItem) => item.id === hotel[hotelKey])
                    }
                });
            }
        })
        setFilteredHotels(newHotels);

    }

    const handleFilter = (type: 'rate' | 'hotel', key: keyof (IHotel & IRate)) => (selectedData: IHotelListItem[]) => {
        const newFilters = {
            ...rateFilters,
            [key]: {
                type,
                data: selectedData,
            }
        };

        if (!selectedData.length) delete newFilters[key];
        setRateFilters(() => newFilters);
    }

    React.useEffect(() => {
        getAllData()
    }, []);

    // eslint-disable-next-line no-unused-vars
    const onChangeDate = ({target: {value, name}}: React.ChangeEvent<HTMLInputElement>, data2?: any) => {
        const date = new Date(value);
        const newFilters = {
            ...rateFilters,
            [name]: {
                type: 'rate',
                data: date,
            }
        };
        if (!value) delete (newFilters as any)[name];
        setRateFilters({...newFilters});
    }

    const onChangeChild = ({target: {checked, name}}: React.ChangeEvent<HTMLInputElement>) => {
        const newFilters = {
            ...rateFilters,
            [name]: {
                type: 'rate',
                data: [{id: checked}]
            }
        };
        setRateFilters({...newFilters});
    }

    const onChangeBudget = ({target: {value, name}}: React.ChangeEvent<HTMLInputElement>) => {
        console.log(value, name);
        const newFilters = {
            ...rateFilters,
            [name]: {
                type: 'rate',
                data: value
            }
        };
        setRateFilters({...newFilters});
    }

    const onChangeQuoteDetails = ({target: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        setGeneralQuoteDetails({
            ...generalQuoteDetails,
            [name]: Number(value),
        });
    }

    const handleCopyText = (text: string) => () => {
        copyText(text)
        toast('Copiado!', {type: 'success', autoClose: 1000})
    }

    const copyAllQuotes = () => {
        const text = quotes.map(item => item.textToCopy).join('');
        copyText(text);
        toast('Todo fue copiado!', {type: 'success', autoClose: 2000})
    }


    const removeQuote = (rateId: number) => () => {
        setQuotes(quotes.filter(item => item.rateId !== rateId));
        toast('Cotizacion removida!', {type: 'success', autoClose: 1000})

    }

    const addQuote = (rate: IRate, hotelName: string) => () => {
        const {
            totalText, total, doublePrice, triplePrice, singlePrice, childrenPrice,
            doubleQuantity,
            singleQuantity,
            tripleQuantity,
            adultPrice,
        } = calculateQuotePrices(rate, nights) as IQuoteDetails;

        const childrenPriceText = `${rate.currency_data.acronym}$${childrenPrice.toLocaleString()}`;
        const adultPriceText = `${rate.currency_data.acronym}$${adultPrice.toLocaleString()}`;
        const totalPesosText = rate.currency_data.acronym !== 'DOP' ? `DOP${(total * generalQuoteDetails.dollarToPeso).toLocaleString()}` : '';
        const doubleText = doubleQuantity ? `${doubleQuantity} Hab. doble - ${rate.currency_data.acronym}$${doublePrice.toLocaleString()}. \n` : '';
        const singleText = singleQuantity ? `${singleQuantity} Hab. simple - ${rate.currency_data.acronym}$${singlePrice.toLocaleString()}. \n` : '';
        const tripleText = tripleQuantity ? `${tripleQuantity} Hab. triple - ${rate.currency_data.acronym}$${triplePrice.toLocaleString()}.` : '';
        const habText = singleText + doubleText + tripleText;
        const totalPesosInfo = totalPesosText ? `\n_Total en pesos: ${totalPesosText}_` : '';

        const newQuote: IQuoteDetails = {
            ...generalQuoteDetails,
            totalText,
            total,
            doublePrice,
            triplePrice,
            singlePrice,
            childrenPrice,
            doubleQuantity,
            singleQuantity,
            tripleQuantity,
            adultPrice,
            doubleText,
            singleText,
            tripleText,
            childrenPriceText,
            adultPriceText,
            totalPesosText,
            rateId: rate.id,
            hotel: hotelName,
            textToCopy: `
*${hotelName.trim()}*
_Total: ${totalText}_${totalPesosInfo}
Adultos: ${generalQuoteDetails.adults} - ${adultPriceText}${childrenPrice ? '\nNiños: ' + generalQuoteDetails.children + ' - ' + childrenPriceText : ''}
${habText}`,
        };

        setQuotes([...quotes, newQuote as IQuoteDetails]);
        toast('Cotización agregada!', {type: 'default', autoClose: 1000});
    }

    const rateIsCalculated = (rateId: number) => quotes.find(quote => quote.rateId === rateId);

    return (
        <div className="rates-wrapper">
            {quotes.length ?
                <a href="javascript:;" className="card-link float-end" onClick={copyAllQuotes}>Copiar Todas</a> : null}
            <div className="quotes-container">
                {quotes.map(quote =>
                    <div className="card">
                        <div className="card-body">
                            <h5>{quote.hotel}</h5>
                            <h6 className="card-subtitle mb-2 text-muted">Total: {quote.totalText}</h6>
                            {quote.totalPesosText && <h6 className="card-subtitle mb-2 text-muted">Total en
                                pesos: {quote.totalPesosText}</h6>}
                            <p className="card-text">
                                Noches: {nights} <br/>
                                Adultos: {generalQuoteDetails.adults} - {quote.adultPriceText} <br/>
                                {generalQuoteDetails.children ? 'Niños: ' + generalQuoteDetails.children + ' - ' + quote.childrenPriceText : ''}
                                {generalQuoteDetails.children && <br/>}
                                <div>{quote.doubleText && quote.doubleText}</div>
                                <div>{quote.singleText && quote.singleText}</div>
                                <div>{quote.tripleText && quote.tripleText}</div>
                            </p>
                            <a href="javascript:;" className="card-link" onClick={handleCopyText(quote.textToCopy)}>Copiar
                            </a>
                            <a href="javascript:;" className="card-link text-danger"
                               onClick={removeQuote(quote.rateId)}>Eliminar
                            </a>
                        </div>
                    </div>
                )}
            </div>
            <div className="rates-filters">
                <div className="rates-filters-details">
                    <h3>Filtros</h3>
                    <div>
                        <span><b>{filteredHotels.length}</b> hoteles.</span>
                        <span><b>{filteredHotels.reduce((a, curr) => a + curr.rates.length, 0)}</b> tarifas.</span>
                    </div>
                </div>
                <div>
                    <Label>Hoteles</Label>
                    <Multiselect
                        placeholder="Buscar Hoteles"
                        className="mb-3"
                        onSelect={handleFilter('hotel', 'id')}
                        onRemove={handleFilter('hotel', 'id')}
                        options={hotelList}
                        displayValue="name"
                    />
                </div>
                <Label className="column-2">Check In - Check Out
                    <InputGroup>
                        <Input
                            id="exampleDate"
                            name="ending_date"
                            placeholder="date placeholder"
                            type="date"
                            onChange={onChangeDate}
                        />
                        <Input
                            id="exampleDate"
                            name="start_date"
                            placeholder="date placeholder"
                            type="date"
                            onChange={onChangeDate}
                        />
                    </InputGroup>
                </Label>
                <div>
                    <Label>Adultos / Niños</Label>
                    <InputGroup>
                        <Input placeholder="Adultos" name="adults" type="number" onChange={onChangeQuoteDetails}/>
                        <Input placeholder="Niños" name="children" type="number" onChange={onChangeQuoteDetails}/>
                    </InputGroup>
                </div>
                <div>
                    <label htmlFor="">Niño Gratis</label>
                    <InputGroup>
                        <Label>
                            <Input
                                id="exampleDate"
                                name="first_child_free"
                                placeholder="date placeholder"
                                type="checkbox"
                                onChange={onChangeChild}
                            /> 1er Niño
                        </Label>
                        &nbsp; &nbsp;
                        <Label>
                            <Input
                                id="exampleDate"
                                name="second_child_free"
                                placeholder="date placeholder"
                                type="checkbox"
                                onChange={onChangeChild}
                            /> 2do Niño
                        </Label>
                    </InputGroup>
                </div>
                <div>
                    <Label>Categorias</Label>
                    <Multiselect
                        placeholder="Buscar Categorias"
                        className="mb-3"
                        // onSelect={handleUserSelection(false)}
                        onSelect={handleFilter('rate', 'category')}
                        onRemove={handleFilter('rate', 'category')}
                        // onRemove={handleUserSelection(true)}
                        options={categories}
                        displayValue="name"
                    />
                </div>
                <div>
                    <Label>Zonas</Label>
                    <Multiselect
                        placeholder="Buscar Zonas"
                        className="mb-3"
                        onSelect={handleFilter('hotel', 'zone')}
                        onRemove={handleFilter('hotel', 'zone')}
                        options={zones}
                        displayValue="name"
                    />
                </div>
                <div>
                    <Label>Monedas</Label>
                    <Multiselect
                        placeholder="Buscar Monedas"
                        className="mb-3"
                        onSelect={handleFilter('rate', 'currency')}
                        onRemove={handleFilter('rate', 'currency')}
                        options={currencies}
                        displayValue="name"
                    />
                </div>
                <div>
                    <Label>Facilidades</Label>
                    <Multiselect
                        placeholder="Buscar Facilidades"
                        className="mb-3"
                        onSelect={handleFilter('hotel', 'amenities')}
                        onRemove={handleFilter('hotel', 'amenities')}
                        options={amenities}
                        displayValue="name"
                    />
                </div>
                <div className="mb-3">
                    <Label>Presupuesto
                        <InputGroup>
                            <Input name="min_budget" onChange={onChangeBudget} placeholder="De"/>
                            <Input name="max_budget" onChange={onChangeBudget} placeholder="Hasta"/>
                        </InputGroup>
                    </Label>
                </div>
                {/*<div>*/}
                {/*    <Label>*/}
                {/*        <div>Disponibilidad Inmediata</div>*/}
                {/*        <Input type="checkbox" name="showOnlyAvailable"/>*/}
                {/*    </Label>*/}
                {/*</div>*/}


                <div>
                    <Label>Especificar hab.</Label>
                    <InputGroup>
                        <Input placeholder="Doble" name="doubleQuantity" type="number" onChange={onChangeQuoteDetails}/>
                        <Input placeholder="Simple" name="singleQuantity" type="number"
                               onChange={onChangeQuoteDetails}/>
                        <Input placeholder="Triple" name="tripleQuantity" type="number"
                               onChange={onChangeQuoteDetails}/>
                    </InputGroup>
                </div>
                <div>
                    <Label>Precio Dolar</Label>
                    <Input placeholder="Simple" name="dollarToPeso" type="number"
                           value={generalQuoteDetails.dollarToPeso} onChange={onChangeQuoteDetails}/>
                </div>
            </div>
            {
                filteredHotels.map(hotel =>
                    <div>

                        <div className="rates-hotels-title">
                            {hotel.name}
                        </div>
                        <Table className="rates-hotels-table" responsive>
                            <thead>
                            <tr>
                                {(rateFilters.max_budget || rateFilters.min_budget || (rateFilters.start_date && rateFilters.ending_date)) &&
                                    <th>Total</th>}
                                {columns.map(col =>
                                    <th>{col.header}</th>
                                )}
                                <th colSpan={6}>Facilidades</th>
                            </tr>

                            </thead>
                            <tbody>
                            {
                                hotel.rates.map(rate =>
                                    <tr>
                                        {rate.total_amount &&
                                            <td>
                                                {!rateIsCalculated(rate.id) ?
                                                    <Button color="primary"
                                                            onClick={addQuote(rate, hotel.name)}>{rate.total_amount}</Button>
                                                    :
                                                    <Button color="info"
                                                            onClick={removeQuote(rate.id)}>Quitar</Button>}
                                            </td>
                                        }
                                        {columns.map(col =>
                                            <td>
                                                {col.onRender ? col.onRender(rate) : col.key && rate[col.key]}
                                            </td>
                                        )}
                                        <td colSpan={5}>
                                        <span
                                            style={{whiteSpace: "nowrap"}}>{hotel.amenities.map(item => item.amenity_data.name).join(', ')}</span>
                                        </td>
                                    </tr>
                                )
                            }

                            </tbody>
                        </Table>
                    </div>
                )
            }
        </div>
    )
}

export default BetuelTravelDashboard;
