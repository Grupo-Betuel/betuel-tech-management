import {
    Accordion, AccordionBody, AccordionHeader, AccordionItem,
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader, Spinner,
} from "reactstrap";
import React, {useEffect} from "react";
import {IProductData, IProductParam, ProductParamTypes} from "../../model/products";
import "./ProductModalForm.scss";
import {addProduct, deleteProductParam, updateProducts} from "../../services/products";
import {ECommerceTypes, getWhatsappMessageURL} from "../../services/promotions";
import CorotosFavicon from "../../assets/images/corotos-favicon.png";
import FleaFavicon from "../../assets/images/flea-favicon.png";
import {PromotionOption} from "../../screens/Dashboard/Dashboard";
import {CompanyTypes} from "../../model/common";
import FlyerDesigner from "../FlyerDesigner/FlyerDesigner";
import {IFlyer} from "../../model/interfaces/FlyerDesigner.interfaces";
import {toast} from "react-toastify";
import {Multiselect} from "multiselect-react-dropdown";
import {ICategory} from "../../model/CategoryModel";
import {addCategory, getCategories, updateCategory} from "../../services/categoryService";

export const productParamsTypes: ProductParamTypes[] = ['color', 'size']

export interface ICalculatedPrice {
    price: number;
    wholeSale: string;
}

export interface IProductFormProps {
    toggle: () => any;
    loadProducts: () => any;
    handlePromoteProduct: (ecommerceType: ECommerceTypes) => () => any;
    isOpen?: boolean;
    portfolioMode?: boolean;
    promotionLoading: { [N in ECommerceTypes]?: boolean };
    editProduct?: Partial<IProductData>;
    company: string;
}

const companyTemplatesIds: { [N in CompanyTypes | string]?: string } = {
    betueldance: "644c1304ab4fab0008b0f99f",
    betueltech: "644c1027f1b1860008ad0cca",
    betueltravel: "644c1304ab4fab0008b0f99f",
}

const ProductModalForm: React.FC<IProductFormProps> = (
    {
        isOpen,
        toggle,
        loadProducts,
        editProduct,
        handlePromoteProduct,
        promotionLoading,
        portfolioMode,
        company,
    }) => {
    const [product, setProduct] = React.useState<Partial<IProductData>>(editProduct || {});
    const [categories, setCategories] = React.useState<ICategory[]>([]);
    const [isValidForm, setIsValidForm] = React.useState(false);
    const [isSubmiting, setIsSubmiting] = React.useState(false);
    const [productParams, setProductParams] = React.useState<IProductParam[]>([]);
    const [productParamToDelete, setProductParamToDelete] = React.useState<string | number>('');
    const [categoryTitle, setCategoryTitle] = React.useState<string>();
    const [loadingCategories, setLoadingCategories] = React.useState<boolean>();


    const [flyerOptions, setFlyerOptions] = React.useState<IFlyer>();
    const [companyDefaultTemplateId, setCompanyDefaultTemplateId] = React.useState<string>();

    React.useEffect(() => {
        // setIsSubmiting()
        const get = async () => {
            setLoadingCategories(true);
            setCategories(await getCategories(company));
            setLoadingCategories(false);
        }
        get();
    }, [company]);
    React.useEffect(() => {
        setCompanyDefaultTemplateId(companyTemplatesIds[company]);
    }, [company]);

    useEffect(() => {
        setProduct(editProduct || {})
        setProductParams(editProduct?.productParams || []);
        const flyerOptionItem: IFlyer = editProduct && editProduct.flyerOptions ? JSON.parse(editProduct.flyerOptions) : flyerOptions;

        if (flyerOptionItem && editProduct) {
            flyerOptionItem.value = {
                ...editProduct,
                price: `RD$${editProduct.price?.toLocaleString()}`,
            };
            setFlyerOptions(flyerOptionItem);
        }
    }, [editProduct])

    React.useEffect(() => {
        const stock = productParams.reduce((a, b) => a + Number(b.quantity || 0), 0);
        setProduct({...product, stock});
    }, [productParams]);

    const onChangeNewCategory = (value: string) => {
        console.log('value', value)
        setCategoryTitle(value)
    };
    const handleCategory = (isUpdate?: boolean) => async () => {

        if (categoryTitle) {
            setLoadingCategories(true);
            console.log('newCategory', categoryTitle)
            if (isUpdate) {
                const categoryData = {...product.category, title: categoryTitle, company} as ICategory
                const updatedCategoryData = await (await updateCategory(JSON.stringify(categoryData))).json();
                setCategories(categories.map((category) => category._id === updatedCategoryData._id ? categoryData : category));
                setProduct({...product, category: categoryData});
            } else {
                const newCategoryData = await (await addCategory(JSON.stringify({
                    title: categoryTitle,
                    company
                }))).json();
                setCategories([...categories, newCategoryData]);
                setProduct({...product, category: newCategoryData});
                setCategoryTitle('');
            }

            setLoadingCategories(false);
        } else {
            toast('Debe escribir un nombre para la categoria');
        }
    }

    const onSelectCategory = (isRemove: boolean) => (list: ICategory[], item: ICategory) => {
        setProduct({...product, category: !isRemove ? item : undefined});
    }

    const resetProductParam = () => setProductParamToDelete('')

    const deleteProductParamById = async () => {
        setIsSubmiting(true);

        if (typeof productParamToDelete === 'number') {
            setProductParams(productParams.filter((param, i) => i !== productParamToDelete));
        } else {
            productParamToDelete && await deleteProductParam(productParamToDelete);
            setProductParams(productParams.filter((param) => param._id !== productParamToDelete));
        }

        setProductParamToDelete('');
        setIsSubmiting(false)
        toast('Parametro Eliminado!');
    }

    const onChangeProduct = async (ev: React.ChangeEvent<any>) => {
        const {name, value, type} = ev.target;
        const finalValue = type === "number" ? Number(value) : value;
        let priceData = {};
        // setting price values when cost is added
        if (name === 'cost') {
            priceData = calculatePrice(Number(value));
        }
        const newProduct = {
            ...product,
            ...priceData,
            [name]: finalValue
        };
        await setProduct(newProduct);
        validForm()
    };

    const extractNumbersFromText = (text: string): number => {
        return Number(text.replace(/[^0-9]/g, ''));
    }
    const onSubmit = async (flyer: IFlyer, image: string) => {
        setIsSubmiting(true);
        const price = extractNumbersFromText((flyer.value.price || product.price).toString());
        let productName = (flyer.value.name || product?.name || '').replaceAll(/<\/?[^>]+(>|$)/gi, "");
        console.log('productName ->', productName);
        const body = JSON.stringify({
            ...product,
            ...flyer.value,
            name: productName,
            price,
            company,
            image,
            productParams,
            flyerOptions: JSON.stringify(flyer),
            _id: editProduct?._id,
        });

        if (editProduct) {
            const imageToDelete = editProduct.image?.split('/').pop();
            await updateProducts(body, imageToDelete);
        } else {
            await addProduct(body);
        }

        loadProducts();
        setIsSubmiting(false);
        // toggleModal();
    }

    const calculatePrice = (cost: number): ICalculatedPrice => {
        let value = cost || product.cost || 0;
        let price = value;
        let wholeSale: any = {
            three: value,
            six: value,
            ten: value
        };

        if (value <= 450) {
            price = value + (value * 0.90);
            wholeSale.three = value + (value * 0.40);
            wholeSale.six = value + (value * 0.30);
            wholeSale.ten = value + (value * 0.20);
        }

        if (value >= 450) {
            price = value + (value * 0.80);
            wholeSale.three = value + (value * 0.30);
            wholeSale.six = value + (value * 0.20);
            wholeSale.ten = value + (value * 0.15);
        }
        if (value >= 1000) {
            price = value + (value * 0.70);

        }
        if (value >= 2000) {
            price = value + (value * 0.60);

        }

        if (value >= 2500) {
            price = value + (value * 0.40);
            wholeSale.three = value + (value * 0.18);
            wholeSale.six = value + (value * 0.10);
            wholeSale.ten = value + (value * 0.5);
        }

        if (value >= 3600) {
            price = value + (value * 0.35);

        }

        /// filling wholesales values with two decimals values
        Object.keys(wholeSale).forEach((key: string) =>
            wholeSale[key] = processPrice(Math.ceil(wholeSale[key])));
        return {
            price: processPrice(Math.ceil(price)),
            wholeSale: JSON.stringify(wholeSale),
        }
    }

    const internationalNumberFormat = new Intl.NumberFormat('en-US')

    const processPrice = (price: number) => {

        const completeprice = internationalNumberFormat.format(price);
        const dividedPrice = completeprice.split(',');
        let pricePiece: any = dividedPrice[1] || dividedPrice[0];
        // when the number has an cero in front
        let cero = '';
        if (pricePiece.charAt(0) === '0') {
            cero = '0';
        }
        const lastTwo = Number(pricePiece.substring(pricePiece.length - 2));
        if (lastTwo > 50) {
            pricePiece = Number((Number(pricePiece.charAt(0)) + 1) + '00') - 5;
        } else {
            pricePiece = Number(pricePiece.charAt(0) + '48');
        }

        if (dividedPrice[1]) {
            dividedPrice[1] = cero + pricePiece;
        } else {
            dividedPrice[0] = cero + pricePiece;
        }

        return Number(dividedPrice.join(''));
    }


    const validForm = () => {
        setIsValidForm(['cost'].map((key: any) => {
            return !!(product as any)[key]
        }).reduce((a, b) => a && b, true));
    };

    const toggleModal = () => {
        toggle();
    }

    const sendWhatsappMessage = () => {
        window.open(getWhatsappMessageURL(`Estoy interesado en este producto "${product.name}". ¿Aún está disponible?  \n \n ${product.image}`), '_blank');
    }


    const addProductParam = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        setProductParams([...productParams, {type: value as any, label: value.toUpperCase()}]);
    };
    const addRelatedProductParam = (index: number) => ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newProductParams = [...productParams].map((param, i) => {
            if (i === index) {
                return {
                    ...param,
                    relatedParams: [...(param.relatedParams || []), {
                        type: value as any,
                        label: value.toUpperCase(),
                        isChildren: true
                    }]
                }
            }
            return param;
        });

        setProductParams(newProductParams);
    }


    const onChangeProductParamValue = (index: number) => ({
                                                              target: {
                                                                  value,
                                                                  name
                                                              }
                                                          }: React.ChangeEvent<HTMLInputElement>) => {
        const newParams = [...productParams];
        newParams[index] = {
            ...newParams[index],
            [name]: value
        }
        setProductParams(newParams);

    }


    const onChangeRelatedProductParamValue = (parentIndex: number, relatedIndex: number) =>
        ({
             target: {
                 value,
                 name
             }
         }: React.ChangeEvent<HTMLInputElement>) => {
            const param = [...productParams][parentIndex];
            if (!param.relatedParams?.length) return;

            param.relatedParams[relatedIndex] = {
                ...param.relatedParams[relatedIndex],
                [name]: value
            }
            const quantity = param.relatedParams.reduce((a, b) => a + Number(b.quantity || 0), 0);
            param.quantity = quantity;
            const newParams = [...productParams];
            newParams[parentIndex] = param;

            setProductParams(newParams);
        }

    const deleteRelatedParam = (id: number | string, parentIndex: number) => () => {
        if (typeof id === 'string') {
            setProductParamToDelete(id)
        } else {
            const newParams = [...productParams];
            if (!newParams[parentIndex] || !newParams[parentIndex].relatedParams?.length) return;
            newParams[parentIndex].relatedParams = (newParams[parentIndex] as any).relatedParams.filter((param: any, i: number) => i !== id);
            setProductParams(newParams);
        }

    }
    const onChangeFlyer = (flyer: IFlyer) => {
        console.log('flyer', flyer);
        setProduct({...product, ...flyer.value});
        // structuredClone()
    }


    const [paramsOpen, setParamsOpen] = React.useState<string[]>([]);

    const toggleParamsOpen = (id: any) => {
        if (paramsOpen.includes(id)) {
            setParamsOpen(paramsOpen.filter((paramId) => paramId !== id));
        } else {
            setParamsOpen([...paramsOpen, id]);
        }
    }

    const AppAccordion = Accordion as any;
    return (

        <Modal backdrop="static" isOpen={isOpen} toggle={toggleModal}>
            {
                !isSubmiting ? null :
                    <>
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    </>
            }
            <ModalHeader
                toggle={toggleModal}>{editProduct ? `${!portfolioMode ? 'Editar ' : ''}${editProduct.name}` : 'Crear Producto'}</ModalHeader>
            <Form>
                <FlyerDesigner flyerOptions={flyerOptions}
                               templateId={companyDefaultTemplateId}
                               onSaveFlyer={onSubmit}
                               onChangeFlyer={onChangeFlyer}
                               saveFlyerButtonProps={{
                                   disabled: !product.category,
                               }}
                               mediaName={`${product.name}-${company}`}
                />
                <ModalBody>

                    {
                        editProduct && !portfolioMode ?
                            <div className="d-flex align-items-center justify-content-center my-3">
                                <PromotionOption loading={promotionLoading.facebook}>
                                    <Spinner className="loading-spinner" animation="grow" variant="secondary"
                                             size="sm"/>
                                    <i data-toggle="tooltip"
                                       title={`Publicar ${product.name} en Facebook Marketplace`}
                                       className="bi bi-facebook text-info cursor-pointer promotion-icon facebook-icon"
                                       onClick={!promotionLoading.facebook ? handlePromoteProduct('facebook') : undefined}
                                    />
                                </PromotionOption>
                                <PromotionOption loading={promotionLoading.flea}>
                                    <Spinner className="loading-spinner" animation="grow" variant="secondary"
                                             size="sm"/>
                                    <img
                                        src={FleaFavicon}
                                        data-toggle="tooltip"
                                        title={`Publicar ${product.name} en La Pulga Virtual`}
                                        className="text-info cursor-pointer promotion-icon img-promotion-icon"
                                        onClick={!promotionLoading.flea ? handlePromoteProduct('flea') : undefined}
                                    />
                                </PromotionOption>
                                <PromotionOption loading={promotionLoading.corotos}>
                                    <Spinner className="loading-spinner" animation="grow" variant="secondary"
                                             size="sm"/>
                                    <img
                                        src={CorotosFavicon}
                                        data-toggle="tooltip"
                                        title={`Publicar ${product.name} en Corotos`}
                                        className="text-info cursor-pointer promotion-icon img-promotion-icon"
                                        onClick={!promotionLoading.corotos ? handlePromoteProduct('corotos') : undefined}
                                    />
                                </PromotionOption>
                            </div> : null}

                    <div className="d-flex justify-content-between">
                        {
                            editProduct ?
                                <Button color="success" className="mb-3 d-flex align-items-center" outline
                                        onClick={sendWhatsappMessage}>
                                        <span className="me-2">
                                            Pedir por Whatsapp
                                        </span>
                                    <i className="bi bi-whatsapp"/>
                                </Button> : null}
                    </div>
                    {portfolioMode && <pre className="mt-3">{product.description}</pre>}
                    {!portfolioMode && <>
                        <FormGroup>
                            <Label for="cost">Costo:</Label>
                            <div className="d-flex align-items-center">
                                <Input onChange={onChangeProduct} type="number" name="cost" id="cost"
                                       value={product.cost}/>
                                {/*<span className="text-nowrap ms-3">Precio: {product.price}</span>*/}
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label for="price">Precio:</Label>
                            <Input onChange={onChangeProduct} type="number" name="price" id="price"
                                   value={product.price}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="price">Categoria:</Label>
                            <div className="d-flex align-items-center category-wrapper">
                                <Multiselect
                                    style={{width: '100%'}}
                                    placeholder="Categoria"
                                    className="w-100 me-3"
                                    selectionLimit={1}
                                    loading={loadingCategories}
                                    selectedValues={product.category ? [product.category] : undefined}
                                    onSearch={onChangeNewCategory}
                                    onSelect={onSelectCategory(false)}
                                    onRemove={onSelectCategory(true)}
                                    options={categories || []}
                                    keepSearchTerm={true}
                                    displayValue="title"
                                />
                                <Button color="info" className="w-100 mb-2"
                                        disabled={!categoryTitle}
                                        onClick={handleCategory(!!product.category)}>
                                    {!product.category ? 'Crear Nueva' : 'Actualizar'}
                                </Button>
                            </div>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="stockId">Cantidad:</Label>
                            <Input disabled={!!productParams.length} onChange={onChangeProduct} type="number"
                                   name="stock"
                                   id="stockId"
                                   value={product.stock}/>
                        </FormGroup>
                        <FormGroup>
                            <Label>Descripción:</Label>
                            <textarea rows={5}
                                      name="description"
                                      id="description"
                                      className="form-control"
                                      value={product.description}
                                      onChange={onChangeProduct}/>
                        </FormGroup>
                        <FormGroup className="expanded-action">
                            <Label>Agregar Parametro de tipo:</Label>
                            <Input placeholder="Tipo" onChange={addProductParam} value={''}
                                   type="select">
                                <option value="">Select</option>
                                {productParamsTypes.map((type: string) =>
                                    <option value={type}>{type.toUpperCase()}</option>)
                                }
                            </Input>
                        </FormGroup>
                        {!!productParams && productParams.map((param: IProductParam, index: number) => {
                                const paramId = (param._id || index).toString();
                                const relatedParam = `related-${paramId}`;
                                return <>
                                    <AppAccordion
                                        flush
                                        open={paramsOpen}
                                        toggle={toggleParamsOpen}>
                                        <AccordionItem>
                                            <AccordionHeader targetId={paramId}>
                                                <Label><b>{param.type.toUpperCase()}</b></Label>
                                            </AccordionHeader>
                                            <AccordionBody accordionId={paramId}>
                                                <div className="product-param-wrapper" key={`product-param-${index}`}>
                                                    <FormGroup>
                                                        <Label>
                                                            Nombre:
                                                        </Label>
                                                        <Input value={param.label} name="label" placeholder="Opcional"
                                                               onChange={onChangeProductParamValue(index)}/>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label>
                                                            Valor:
                                                        </Label>
                                                        <Input value={param.value} name="value"
                                                               type={param.type === 'color' ? 'color' : 'text'}
                                                               onChange={onChangeProductParamValue(index)}/>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label>
                                                            Cantidad:
                                                        </Label>
                                                        <Input disabled={!!param.relatedParams?.length}
                                                               value={param.quantity}
                                                               type="number"
                                                               name="quantity"
                                                               onChange={onChangeProductParamValue(index)}/>
                                                    </FormGroup>
                                                    <FormGroup className="related-param-select">
                                                        <div>
                                                            <Label>Parametro Relacionado:</Label>
                                                            <Input placeholder="Tipo"
                                                                   onChange={addRelatedProductParam(index)}
                                                                   value={''}
                                                                   type="select">
                                                                <option value="">Select</option>
                                                                {productParamsTypes.map((type: string) =>
                                                                    <option value={type}>{type.toUpperCase()}</option>)
                                                                }
                                                            </Input>
                                                        </div>
                                                        <i className="bi bi-trash delete-product-icon text-danger cursor-pointer"
                                                           onClick={() => (setProductParamToDelete(param._id || index))}></i>
                                                    </FormGroup>


                                                    {!!param.relatedParams?.length &&
                                                        <AppAccordion
                                                            flush
                                                            open={paramsOpen}
                                                            toggle={toggleParamsOpen}
                                                            className="related-product-params"
                                                        >
                                                            <AccordionItem>
                                                                <AccordionHeader targetId={relatedParam}>
                                                                    <Label><b>Variedades del {param.type?.toUpperCase()}: {param.label?.toUpperCase()}</b></Label>
                                                                </AccordionHeader>
                                                                <AccordionBody accordionId={relatedParam}>
                                                                    {
                                                                        param.relatedParams.map((relatedParam: IProductParam, relatedIndex: number) => {
                                                                            const relatedParamId = (relatedParam._id || `variant-${relatedIndex}`).toString();
                                                                            return <div
                                                                                className="related-product-params"
                                                                                key={relatedParamId}>

                                                                                <FormGroup
                                                                                    className="expanded-action">
                                                                                    <Label>
                                                                                        Nombre:
                                                                                    </Label>
                                                                                    <Input
                                                                                        value={relatedParam.label}
                                                                                        name="label"
                                                                                        placeholder="Opcional"
                                                                                        onChange={onChangeRelatedProductParamValue(index, relatedIndex)}/>
                                                                                </FormGroup>
                                                                                <FormGroup
                                                                                    className="expanded-action"
                                                                                    key={index}>
                                                                                    <Label>
                                                                                        Valor:
                                                                                    </Label>
                                                                                    <Input
                                                                                        value={relatedParam.value}
                                                                                        name="value"
                                                                                        type={relatedParam.type === 'color' ? 'color' : 'text'}
                                                                                        onChange={onChangeRelatedProductParamValue(index, relatedIndex)}/>
                                                                                </FormGroup>
                                                                                <FormGroup
                                                                                    className="expanded-action"
                                                                                    key={index}>
                                                                                    <Label>
                                                                                        Quantity:
                                                                                    </Label>
                                                                                    <Input
                                                                                        value={relatedParam.quantity}
                                                                                        name="quantity"
                                                                                        type={'number'}
                                                                                        onChange={onChangeRelatedProductParamValue(index, relatedIndex)}/>
                                                                                </FormGroup>
                                                                                <i className="bi bi-trash delete-product-icon text-danger cursor-pointer"
                                                                                   onClick={deleteRelatedParam(relatedParam._id || relatedIndex, index)}></i>
                                                                            </div>
                                                                        })}

                                                                </AccordionBody>
                                                            </AccordionItem>
                                                        </AppAccordion>
                                                    }
                                                </div>
                                            </AccordionBody>
                                        </AccordionItem>
                                    </AppAccordion>
                                </>
                            }
                        )}
                    </>}
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={toggleModal} outline>Salir</Button>{' '}
                </ModalFooter>
            </Form>
            <Modal isOpen={productParamToDelete !== ''} toggle={resetProductParam}>
                <ModalHeader toggle={resetProductParam}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas Seguro que deseas eliminar este parametro?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={deleteProductParamById}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={resetProductParam}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </Modal>
    );
}

export default ProductModalForm;
