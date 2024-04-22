import {Button, FormGroup, Input, InputGroup, Label, Spinner, Table} from "reactstrap";
import React from "react";
import {
    AmenityData,
    CategoryData,
    CurrencyData,
    IHotel,
    IHotelListItem, IQuoteDetails,
    IRate,
    ZoneData
} from "../../models/interfaces/rateModels";
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
}

export type BudgetTypes = 'max_budget' | 'min_budget';
export type RateFilterKeys = (keyof (IRate & IHotel) | BudgetTypes);

export type RateFilters = {
    [key in RateFilterKeys]?: {
        type: 'rate' | 'hotel',
        data: IHotelListItem[] | any,
    }
}

export interface ExtraQuoteDetails {
    budgetPerPerson?: boolean;
}

const BetuelTravelDashboard = () => {
    const [hotels, setHotels] = React.useState<IHotel[]>([])
    const [filteredHotels, setFilteredHotels] = React.useState<IHotel[]>([])
    const [categories, setCategories] = React.useState<CategoryData[]>([])
    const [currencies, setCurrencies] = React.useState<CurrencyData[]>([])
    const [amenities, setAmenities] = React.useState<AmenityData[]>([])
    const [zones, setZones] = React.useState<ZoneData[]>([])
    const [hotelList, setHotelList] = React.useState<IHotelListItem[]>([])
    const [rateFilters, setRateFilters] = React.useState<RateFilters>({});
    const [generalQuoteDetails, setGeneralQuoteDetails] = React.useState<IQuoteDetails & ExtraQuoteDetails>({dollarToPeso: 56.5} as IQuoteDetails);
    const [quotes, setQuotes] = React.useState<IQuoteDetails[]>([]);
    const [nights, setNights] = React.useState<number>(0);
    const [loading, setLoading] = React.useState(false);

    const getSeedData = async () => {
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
        const response = await getHotelsWithRates();
        setHotels(response)
        setFilteredHotels(response)
    }

    const getAllData = async () => {
        setLoading(true);
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

    const calculateQuotePrices = (rate: IRate, nights: number, inPesos: boolean = true): Partial<IQuoteDetails> => {
        inPesos = rate.currency_data.acronym === 'DOP' ? false : inPesos;

        const specifiedHabQuantity = ((generalQuoteDetails.doubleQuantity || 0) * 2 +
            (generalQuoteDetails.singleQuantity || 0) + (generalQuoteDetails.tripleQuantity || 0) * 3);
        const adultCalc = generalQuoteDetails.adults - specifiedHabQuantity
        const adults = adultCalc > 0 ? adultCalc : 0;
        const children = generalQuoteDetails.children || 0;
        let doubleQuantity = generalQuoteDetails.doubleQuantity || Math.floor(adults / 2);
        let tripleQuantity = generalQuoteDetails.tripleQuantity || 0;

        if (adults % 2) {
            doubleQuantity -= 1;
            tripleQuantity = 1;
        }

        const singleQuantity = generalQuoteDetails.singleQuantity || 0;
        let doublePrice = (rate.double * (doubleQuantity * 2)) * nights;

        const singlePrice = (rate.simple * singleQuantity) * nights;
        const triplePrice = (rate.triple * (tripleQuantity * 3)) * nights;

        const childrenPrice = (rate.children * children) * nights;

        let total = (triplePrice + doublePrice + singlePrice + childrenPrice);
        total = inPesos ? total * generalQuoteDetails.dollarToPeso : total;
        const adultPrice = ((doublePrice || 0) + (triplePrice || 0) + (singlePrice || 0));

        return {
            total,
            doubleQuantity,
            singleQuantity,
            tripleQuantity,
            doublePrice: inPesos ? doublePrice * generalQuoteDetails.dollarToPeso : doublePrice,
            singlePrice: inPesos ? singlePrice * generalQuoteDetails.dollarToPeso : singlePrice,
            childrenPrice: inPesos ? childrenPrice * generalQuoteDetails.dollarToPeso : childrenPrice,
            adultPrice: inPesos ? adultPrice * generalQuoteDetails.dollarToPeso : adultPrice,
            triplePrice: inPesos ? triplePrice * generalQuoteDetails.dollarToPeso : triplePrice,
            totalText: `${inPesos ? 'DOP' : rate.currency_data.acronym}$${total.toLocaleString()}`,
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
                            const {
                                total,
                                totalText,
                                childrenPrice
                            } = calculateQuotePrices(rate, nights) as IQuoteDetails;
                            const perPersonPrice = (total - childrenPrice) / generalQuoteDetails.adults;
                            const totalQuantity = generalQuoteDetails.budgetPerPerson ? perPersonPrice : total;
                            let success = true;

                            if (rateFilters.max_budget?.data && rateFilters.min_budget?.data && totalQuantity) {
                                success = rateFilters.min_budget.data <= totalQuantity && rateFilters.max_budget.data >= totalQuantity;
                            } else if (rateFilters.min_budget?.data && totalQuantity) {
                                success = rateFilters.min_budget.data <= totalQuantity;
                            } else if (rateFilters.max_budget?.data && totalQuantity) {
                                success = rateFilters.max_budget.data >= totalQuantity;
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
        const newFilters = {
            ...rateFilters,
            [name]: {
                type: 'rate',
                data: Number(value),
            }
        };
        setRateFilters({...newFilters});
    }

    React.useEffect(() => {
        const habBasedAdults = (generalQuoteDetails.tripleQuantity || 0) * 3 + (generalQuoteDetails.doubleQuantity || 0) * 2 + (generalQuoteDetails.singleQuantity || 0);
        setGeneralQuoteDetails({
            ...generalQuoteDetails,
            adults: habBasedAdults || generalQuoteDetails.adults,
        });
    }, [generalQuoteDetails.tripleQuantity, generalQuoteDetails.doubleQuantity, generalQuoteDetails.singleQuantity]);

    const onChangeGeneralQuoteDetails = ({target: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        const currentValue = Number(value);

        setGeneralQuoteDetails({
            ...generalQuoteDetails,
            [name]: currentValue,
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

    const handleQuote = (rate: IRate, hotelName: string, inPesos: boolean = true, rateId?: number) => () => {
        const {
            totalText, total, doublePrice, triplePrice, singlePrice, childrenPrice,
            doubleQuantity,
            singleQuantity,
            tripleQuantity,
            adultPrice,
        } = calculateQuotePrices(rate, nights, inPesos) as IQuoteDetails;
        const currencyAcronym = inPesos ? 'DOP' : rate.currency_data.acronym;
        const childrenPriceText = `${currencyAcronym}$${childrenPrice.toLocaleString()}`;
        const adultPriceText = `${currencyAcronym}$${adultPrice.toLocaleString()}`;
        // const totalPesosText = rate.currency_data.acronym !== 'DOP' ? `DOP${(total * generalQuoteDetails.dollarToPeso).toLocaleString()}` : '';
        const doubleText = doubleQuantity ? `${doubleQuantity} Hab. doble - ${currencyAcronym}$${doublePrice.toLocaleString()}. \n` : '';
        const singleText = singleQuantity ? `${singleQuantity} Hab. simple - ${currencyAcronym}$${singlePrice.toLocaleString()}. \n` : '';
        const tripleText = tripleQuantity ? `${tripleQuantity} Hab. triple - ${currencyAcronym}$${triplePrice.toLocaleString()}.` : '';
        const habText = singleText + doubleText + tripleText;
        // const totalPesosInfo = totalPesosText ? `\n_Total en pesos: ${totalPesosText}_` : '';

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
            rate,
            // totalPesosText,
            currency: currencyAcronym,
            rateId: rate.id,
            hotel: hotelName,
            textToCopy: `
*${hotelName.trim()}*
_Total: ${totalText}_
Adultos: ${generalQuoteDetails.adults} - ${adultPriceText}${childrenPrice ? '\nNiños: ' + generalQuoteDetails.children + ' - ' + childrenPriceText : ''}
${habText}`,
        };

        if (rateId) {
            setQuotes(quotes.map(quote => quote.rateId === rateId ? newQuote : quote));
        } else {
            setQuotes([...quotes, newQuote as IQuoteDetails]);

        }
        toast('Cotización agregada!', {type: 'default', autoClose: 1000});
    }

    const rateIsCalculated = (rateId: number) => quotes.find(quote => quote.rateId === rateId);
    const onChangeBudgetPerPerson = ({target: {checked}}: React.ChangeEvent<HTMLInputElement>) => setGeneralQuoteDetails({
        ...generalQuoteDetails,
        budgetPerPerson: checked,
    });


    return (
        <div className="rates-wrapper">
            {!loading ? null : (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}
            {quotes.length ?
                <a href="javascript:;" className="card-link float-end" onClick={copyAllQuotes}>Copiar Todas</a> : null}
            <div className="quotes-container">
                {quotes.map(quote =>
                    <div className="card cursor-no-pointer">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5>{quote.hotel}</h5>
                                <span className="cursor-pointer d-flex align-items-center text-info"
                                      onClick={handleQuote(quote.rate, quote.hotel, !(quote.currency === 'DOP'), quote.rateId)}>
                                    {quote.currency}
                                    <i className="bi bi-currency-dollar"/>
                                </span>
                            </div>
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
                <div className="column-2">
                    <Label htmlFor="ending_date">
                        Check In - Check Out
                    </Label>
                    <InputGroup>
                        <Input
                            id="ending_date"
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
                </div>
                <div>
                    <Label>Adultos / Niños</Label>
                    <InputGroup>
                        <Input placeholder="Adultos" name="adults" type="number" value={generalQuoteDetails.adults}
                               onChange={onChangeGeneralQuoteDetails}/>
                        <Input placeholder="Niños" name="children" type="number" value={generalQuoteDetails.children}
                               onChange={onChangeGeneralQuoteDetails}/>
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
                    <Label htmlFor="min_budget" className="d-flex align-items-center justify-content-between">
                        Presupuesto
                        <div className="d-flex align-items-center">
                            <span className="budget-toggle-text">Grupo</span>
                            <FormGroup switch>
                                <Input
                                    type="switch" role="switch"
                                    checked={generalQuoteDetails.budgetPerPerson}
                                    onChange={onChangeBudgetPerPerson}/>
                            </FormGroup>
                            <span className="budget-toggle-text">Persona</span>
                        </div>
                    </Label>
                    <InputGroup>
                        <Input name="min_budget" id="min_budget" type="number" onChange={onChangeBudget}
                               placeholder="De"/>
                        <Input name="max_budget" type="number" onChange={onChangeBudget} placeholder="Hasta"/>
                    </InputGroup>
                </div>
                <div>
                    <Label>Especificar hab.</Label>
                    <InputGroup>
                        <Input placeholder="Simple" name="singleQuantity" type="number"
                               onChange={onChangeGeneralQuoteDetails}/>
                        <Input placeholder="Doble" name="doubleQuantity" type="number"
                               onChange={onChangeGeneralQuoteDetails}/>

                        <Input placeholder="Triple" name="tripleQuantity" type="number"
                               onChange={onChangeGeneralQuoteDetails}/>
                    </InputGroup>
                </div>
                <div>
                    <Label>Categorias</Label>
                    <Multiselect
                        placeholder="Buscar Categorias"
                        className="mb-3"
                        onSelect={handleFilter('rate', 'category')}
                        onRemove={handleFilter('rate', 'category')}
                        options={categories}
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

                {/*<div>*/}
                {/*    <Label>*/}
                {/*        <div>Disponibilidad Inmediata</div>*/}
                {/*        <Input type="checkbox" name="showOnlyAvailable"/>*/}
                {/*    </Label>*/}
                {/*</div>*/}


                <div>
                    <Label>Precio Dolar</Label>
                    <Input placeholder="Simple" name="dollarToPeso" type="number"
                           value={generalQuoteDetails.dollarToPeso} onChange={onChangeGeneralQuoteDetails}/>
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
                                                            onClick={handleQuote(rate, hotel.name)}>{rate.total_amount}</Button>
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
