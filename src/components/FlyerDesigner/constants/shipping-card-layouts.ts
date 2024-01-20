import {IMessengerCardLayout, IShippingCardLayout} from "../../ShippingCard/ShippingCard";
import {DraggableGridItem} from "../../DraggableGrid/DraggableGrid";

export const betuelDanceShippingCardLayout: IShippingCardLayout = {
    name: {
        x: '26.302083333333332%',
        y: '31.5%',
        width: 300,
        content: 'Williams Padilla',
    },
    phone: {
        x: '30.46875%',
        y: '39.10771829928355%',
        width: 300,
        content: '+1 (809) 405-5531',
    },
    address: {
        x: '30.46875%',
        y: '48.4935706911116%',
        width: 220,
        fontSize: '10px',
        content: 'Manzana 28 #63 C Las Caobas de Herrera',

    },
    details: {
        x: '32.03125%',
        y: '56.62797609736258%',
        width: 222,
        fontSize: '10px',
        content: '1 Pandero, 2 Cintas, 3 Fuego Santo',

    },

    shippingCost: {
        x: '22.135416666666664%',
        y: '63%',
        width: 300,
        content: 'RD$300',
    },
    subtotal: {
        x: '62%',
        y: '63%',
        width: 300,
        content: 'RD$300',
    },
    total: {
        x: '22.916666666666664%',
        y: '70.70675468510466%',
        width: 300,
        content: 'RD$800',

    },
    paymentStatus: {
        x: '74.5%',
        y: '71.01961643149892%',
        width: 300,
        content: 'NO',

    },
    image: "https://storage.googleapis.com/download/storage/v1/b/betuel-tech-photos/o/media-1700425078448.png?alt=media",
} as IShippingCardLayout;

export const betuelDanceMessengerCard: IMessengerCardLayout = {
    name: {
        x: '26.302083333333332%',
        y: '31.5%',
        width: 300,
        content: 'Williams Padilla',
    },
    lastName: {
        x: '26.302083333333332%',
        y: '31.5%',
        width: 300,
        content: 'Williams Padilla',
    },
    photo: {
        x: '26.302083333333332%',
        y: '31.5%',
        width: 300,
        content: 'Williams Padilla',
    },
    image: "https://storage.googleapis.com/betuel-tech-photos/media-1705760022235.png",
} as IMessengerCardLayout;


export const EmptyGridItem: (index: number) => DraggableGridItem = (index) => ({ id: `${Math.random()}-${Date.now()}-${index}`, content: "", x: index, y: index, w:1, h:1 });
