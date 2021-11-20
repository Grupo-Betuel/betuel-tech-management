export interface IProductData {
  _id: number;
  name: string;
  price: number;
  cost: number;
  commission: number;
  image: string;
}

const products: IProductData[] = [
  {
    _id: 1,
    name: 'Airpods Serie 2',
    price: 2500,
    cost: 950,
    image: '/assets/images/products/airpods serie 2.png',
    commission: 100,
  },
  {
    _id: 2,
    name: 'Airpods Pro',
    price: 3000,
    cost: 1500,
    image: `${process.env.PUBLIC_URL}assets/images/products/airpodsPro.png`,
    commission: 200,
  },
  {
    _id: 3,
    name: 'AppleWatch Serie 6',
    price: 3400,
    cost: 1680,
    image: '/assets/images/products/W26.png',
    commission: 200,
  },
  {
    _id: 4,
    name: 'AKG',
    price: 150,
    cost: 40,
    image: '/assets/images/products/AKG.png',
    commission: 100,
  },
  {
    _id: 5,
    name: 'LY002',
    price: 600,
    cost: 290,
    image: '/assets/images/products/LY002.png',
    commission: 100,
  },
  {
    _id: 6,
    name: 'BX340BT',
    price: 750,
    cost: 470,
    image: '/assets/images/products/BX340BT.png',
    commission: 100,
  },
  {
    _id: 7,
    name: 'K856',
    price: 1150,
    cost: 650,
    image: '/assets/images/products/K856.png',
    commission: 100,
  },
  {
    _id: 8,
    name: 'QD21',
    price: 600,
    cost: 290,
    image: '/assets/images/products/QD21.png',
    commission: 100,
  },
  {
    _id: 9,
    name: 'TG113',
    price: 500,
    cost: 260,
    image: '/assets/images/products/TG113.png',
    commission: 100,
  },
  {
    _id: 10,
    name: 'TG117',
    price: 750,
    cost: 470,
    image: '/assets/images/products/TG117.png',
    commission: 100,
  },
  {
    _id: 11,
    name: 'TG149',
    price: 750,
    cost: 470,
    image: '/assets/images/products/TG149.png',
    commission: 100,
  },
  {
    _id: 12,
    name: 'AppleWatch Serie 5',
    price: 3400,
    cost: 1100,
    image: '/assets/images/products/T500.png',
    commission: 200,
  },
  {
    _id: 13,
    name: 'T5 Plus',
    price: 3400,
    cost: 1380,
    image: '/assets/images/products/T500.png',
    commission: 200,
  },
];

export default products
