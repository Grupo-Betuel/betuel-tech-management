import {Table} from "reactstrap";
import React from "react";
import {
    AmenityData,
    CategoryData,
    CurrencyData,
    IHotel,
    IHotelListItem,
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

export interface IColum<T> {
    header: string;
    key?: keyof T;
    onRender?: (item: T) => any;
}

const columns: IColum<IRate>[] = [
    {
        header: 'Desde',
        key: 'start_date',
    },
    {
        header: 'Hasta',
        key: 'ending_date',

    },
    {
        header: 'Dias',
        onRender: (item) => item.week_days.length === 7 ? 'Todos los dias' : item.week_days.map(day => day.week_day).join(', '),
    },
    {
        header: 'Fecha de venta',
        key: 'max_request_date',

    },
    {
        header: 'Minimo de noches',
        key: 'min_required_nights',

    },
    {
        header: 'Categoria',
        onRender: (item) => item.category_data.name,

    },
    {
        header: 'Divisa',
        onRender: (item) => item.currency_data.name,
    },
    {
        header: 'Disponibilidad Inmediata',
        key: 'available_rooms',

    },
    {
        header: 'Sencilla',
        key: 'simple',

    },
    {
        header: 'Doble',
        key: 'double',

    },
    {
        header: 'Triple',
        key: 'triple',

    },
    {
        header: 'Cuadruple',
        key: 'quadruple',

    },
    {
        header: 'Niños',
        key: 'children',

    },
    {
        header: 'Adolescentes',
        key: 'teenagers',

    },
    {
        header: '1er Niño Gratis',
        key: 'first_child_free',
    },
    {
        header: '2do Niño Gratis',
        key: 'second_child_free',

    },
    {
        header: 'Notas',
        key: 'notes',
    }];


export interface IBetuelTravelDashboardProps {
    setLoading: (val: boolean) => any,
}

export type RateFilters = {
    [key in keyof (IRate & IHotel)]?: {
        type: 'rate' | 'hotel',
        data: IHotelListItem[],
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
    }, [rateFilters]);

    const runFilters = () => {
        // eslint-disable-next-line no-undef
        let newHotels = structuredClone(hotels);

        Object.keys(rateFilters).forEach(key => {
            const {type, data} = rateFilters[key as keyof RateFilters] || {} as any;

            if (type === 'rate') {
                newHotels = newHotels.map(hotel => {
                    const rateKey = key as keyof IRate;
                    const newRates = hotel.rates.filter(rate => data.find((item: IHotelListItem) => item.id === rate[rateKey]));
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


    return (
        <div className="rates-wrapper">
            <div className="rates-filters">
                <Multiselect
                    placeholder="Hoteles"
                    className="mb-3"
                    onSelect={handleFilter('hotel', 'id')}
                    onRemove={handleFilter('hotel', 'id')}
                    options={hotelList}
                    displayValue="name"
                />
                <Multiselect
                    placeholder="Categorias"
                    className="mb-3"
                    // onSelect={handleUserSelection(false)}
                    onSelect={handleFilter('rate', 'category')}
                    onRemove={handleFilter('rate', 'category')}
                    // onRemove={handleUserSelection(true)}
                    options={categories}
                    displayValue="name"
                />
                <Multiselect
                    placeholder="Zonas"
                    className="mb-3"
                    onSelect={handleFilter('hotel', 'zone')}
                    onRemove={handleFilter('hotel', 'zone')}
                    // onSelect={handleUserSelection(false)}
                    // onRemove={handleUserSelection(true)}
                    options={zones}
                    displayValue="name"
                />
                <Multiselect
                    placeholder="Monedas"
                    className="mb-3"
                    onSelect={handleFilter('rate', 'currency')}
                    onRemove={handleFilter('rate', 'currency')}
                    options={currencies}
                    displayValue="name"
                />
                <Multiselect
                    placeholder="Facilidades"
                    className="mb-3"
                    onSelect={handleFilter('hotel', 'amenities')}
                    onRemove={handleFilter('hotel', 'amenities')}
                    options={amenities}
                    displayValue="name"
                />
                <div>
                    <h4>Hoteles: {filteredHotels.length}</h4>
                    <h4>Tarifas: {filteredHotels.reduce((a, curr) => a + curr.rates.length, 0)}</h4>
                </div>
            </div>
            {filteredHotels.map(hotel =>
                <div><h1>{hotel.name}</h1>
                    <Table responsive>
                        <thead>
                        <tr>

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
            )}
        </div>)
}

export default BetuelTravelDashboard;
