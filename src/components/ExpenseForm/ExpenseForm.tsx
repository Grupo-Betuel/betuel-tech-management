import {Button, Form, FormGroup, Input, Label, Spinner, UncontrolledTooltip} from "reactstrap";
import React from "react";
import {ExpenseModel, ExpenseTypes} from "../../models/expenseModel";
import {Multiselect} from "multiselect-react-dropdown";
import {orderPaymentTypeList} from "../../models/ordersModels";
import {CommerceModel} from "../../models/commerceModels";
import {addCommerce, getCommerces, updateCommerce} from "../../services/commercesService";
import {toast} from "react-toastify";
import {IMedia, IMediaTagTypes} from "../GCloudMediaHandler/GCloudMediaHandler";
import {ICategory} from "../../models/CategoryModel";
import {deletePhoto} from "../../services/gcloud";
import {updateCompanies} from "../../services/companies";
import {updateCategories} from "../../services/categoryService";
import {onChangeMediaToUpload} from "../../utils/gcloud.utils";
import {CompanyModel} from "../../models/companyModel";
import {generateCustomID} from "../../utils/text.utils";
import exp from "constants";

export const expenseTypeList: ExpenseTypes[] = ['promotion', 'merchant', 'office', 'other', 'fuel'];

export interface IExpenseFormProps {
    onSubmit: (expense: ExpenseModel) => void;
    expenseData?: ExpenseModel;
}

export const ExpenseForm = ({onSubmit, expenseData}: IExpenseFormProps) => {
    const [expense, setExpense] = React.useState<ExpenseModel>(new ExpenseModel());
    const [loadingData, setLoadingData] = React.useState<boolean>(false);
    const [commerceData, setCommerceData] = React.useState(new CommerceModel());
    const [commerces, setCommerces] = React.useState<CommerceModel[]>([]);
    const [creatingNewCommerce, setCreatingNewCommerce] = React.useState<boolean>(false);
    const [editCommerceMode, setEditCommerceMode] = React.useState<boolean>(false);
    const [invoiceFileTarget, setInvoiceTarget] = React.useState<any>();

    React.useEffect(() => {
        loadData();
    }, []);

    React.useEffect(() => {
        const commerce = commerces.find(item => item.name === commerceData.name) || expense.commerce;
        setExpense({
            ...expense,
            commerce,
        });

    }, [commerces]);

    React.useEffect(() => {
        if (expenseData) {
            setExpense({...expenseData, date: new Date(expenseData.date as any)});
        }
    }, [expenseData]);

    const toggleCreatingCommerce = () => setCreatingNewCommerce(!creatingNewCommerce);

    const loadData = async () => {
        setLoadingData(true);
        setCommerces(await getCommerces())
        setLoadingData(false);
    }

    const onChangeCommerceData = ({target: {value, name}}: any) => {
        setCommerceData({
            ...commerceData,
            [name]: value,
        });
    }

    const onChangeExpense = ({target: {value, name, type}}: any) => {
        value = type === 'number' ? Number(value) : value;
        setExpense({
            ...expense,
            [name]: value,
        });
    }

    const handleOnSubmit = async (ev: any) => {
        if (editCommerceMode) return;
        ev.preventDefault();
        const expenseObj = {...expense}


        if (invoiceFileTarget?.files?.length) {
            setLoadingData(true);
            const uploadCallBack = async (media: IMedia) => {
                onSubmit && onSubmit({
                    ...expenseObj,
                    invoice: media.content,
                });
                // deleting last filr
                if (expense._id && expense.invoice) {
                    await deletePhoto(expense.invoice.split('/').pop() as string)
                }

                setLoadingData(false);
            }

            await onChangeMediaToUpload('invoice',
                uploadCallBack,
                `${expense.commerce.name}-invoice-${generateCustomID()}`
            )({target: invoiceFileTarget} as React.ChangeEvent<HTMLInputElement>);
        } else {
            onSubmit && onSubmit(expenseObj);
        }
    }

    const onSelectCommerce = (list: CommerceModel[], item: CommerceModel) => {
        setExpense({
            ...expense,
            commerce: item
        })
        setCommerceData(item);
    }

    const onRemoveCommerce = () => setExpense({...expense, commerce: {} as CommerceModel});

    const createNewCommerce = async () => {

        if (newCommerceIsValid()) {
            setLoadingData(true);
            await addCommerce({...commerceData, _id: undefined});
            await loadData();
            setLoadingData(false);
        } else {
            toast('Faltan campos para crear comercio', {type: 'error'})
        }
    }


    const newCommerceIsValid = () => {
        return commerceData.name;
    }

    const formatedDate = React.useMemo(() => {
        let date = new Date();
        if (expense.date.toString().length > 12) {
            date = new Date(expense.date);

        } else {
            const splitDate = expense.date.toString()?.split('-');
            date = new Date(`${splitDate[1]}-${splitDate[2]}-${splitDate[0]}`);
        }

        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        // return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const value = `${date.getFullYear()}-${month}-${day}`
        return value
    }, [expense.date]);


    const toggleEditCommerceMode = () => setEditCommerceMode(!editCommerceMode);

    const handleUpdateCommerce = async () => {
        if (newCommerceIsValid()) {
            setLoadingData(true);
            await updateCommerce(commerceData);
            await loadData();
            setEditCommerceMode(false);
            setLoadingData(false);
        } else {
            toast('Faltan campos para crear comercio', {type: 'error'})
        }
    }

    const expenseIsValid = React.useMemo(() => {
        return !!(expense.commerce?._id && expense.type && expense.date && expense.amount && expense.total && expense.paymentType);
    }, [expense]);

    const handleInvoiceMedia = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setInvoiceTarget(event.target);
    }

    const CommerceInputs = (<>
            <FormGroup>
                <Label for="commerce">Comercio:</Label>
                <div className={"d-flex align-items-center gap-3"}>
                    {!editCommerceMode ? <div className="d-flex align-items-center gap-2">
                            <Multiselect
                                style={{width: '100%'}}
                                placeholder="Comercio"
                                className="w-100 me-3"
                                selectionLimit={1}
                                loading={loadingData}
                                selectedValues={expense.commerce._id ? [expense.commerce] : undefined}
                                onSearch={(value) => onChangeCommerceData({target: {value, name: 'name'}})}
                                onSelect={onSelectCommerce}
                                onRemove={onRemoveCommerce}
                                options={commerces}
                                keepSearchTerm={true}
                                displayValue="name"
                            />
                            <span>{commerceData.name}</span>
                        </div>
                        :
                        <Input
                            onChange={onChangeCommerceData}
                            name="name"
                            id="name"
                            value={commerceData?.name}/>}
                    {expense.commerce?._id && !editCommerceMode &&
                        <div>
                            <Button onClick={toggleEditCommerceMode} color="info" id={`update-commerce-btn`} outline>
                                <i className="bi bi-pencil-square"/>
                            </Button>
                            <UncontrolledTooltip placement="top" target={`update-commerce-btn`}>
                                Editar Comercio
                            </UncontrolledTooltip>
                        </div>
                    }
                </div>
            </FormGroup>
            <FormGroup>
                <Label for="rnc">RNC del Comercio:</Label>
                <div className="d-flex align-items-center gap-3">
                    <Input
                        disabled={!!expense.commerce?._id && !editCommerceMode}
                        onChange={onChangeCommerceData}
                        name="rnc"
                        id="rnc"
                        value={editCommerceMode ? commerceData.rnc : expense.commerce?.rnc || commerceData?.rnc}/>
                </div>
                {!expense.commerce?._id && commerceData?.name &&
                    <Button color="info" className="w-100 my-2"
                            onClick={createNewCommerce}
                    >
                        Crear Nuevo Comercio
                    </Button>}
            </FormGroup>
        </>
    )


    return (
        <Form onSubmit={handleOnSubmit} className="position-relative">
            {
                !loadingData ? null :
                    <>
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    </>
            }
            {CommerceInputs}

            {editCommerceMode &&
                <FormGroup className="d-flex justify-content-stretch align-items-center gap-4">
                    <Button color="danger" className="flex-grow-1" onClick={toggleEditCommerceMode}
                            outline>Cancelar</Button>
                    <Button color="primary" className="flex-grow-1" onClick={handleUpdateCommerce}>Actualizar</Button>
                </FormGroup>
            }

            {!editCommerceMode && <>
                <FormGroup>
                    <Label for="type">Tipo de Gasto:</Label>
                    <Input placeholder="Tipo de Pago" id="type" name="type" onChange={onChangeExpense}
                           value={expense.type}
                           type="select">
                        <option value="">Select</option>
                        {expenseTypeList.map((type: string) =>
                            <option value={type} key={type}>{type.toUpperCase()}</option>)
                        }
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="date">Fecha:</Label>
                    <Input onChange={onChangeExpense} type="date" name="date" id="date"
                           value={formatedDate}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="amount">Monto:</Label>
                    <div className="d-flex align-items-center">
                        <Input onChange={onChangeExpense} name="amount" type="number" id="amount"
                               value={expense.amount}/>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label for="itbis">ITBIS:</Label>
                    <div className="d-flex align-items-center">
                        <Input onChange={onChangeExpense} name="itbis" type="number" id="itbis"
                               value={expense.itbis}/>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label for="tips">Propina 10%:</Label>
                    <div className="d-flex align-items-center">
                        <Input onChange={onChangeExpense} name="tips" type="number" id="tips"
                               value={expense.tips}/>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label for="total">Total:</Label>
                    <div className="d-flex align-items-center">
                        <Input onChange={onChangeExpense} name="total" type="number" id="total"
                               value={expense.total}/>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label>Tipo de Pago:</Label>
                    <Input placeholder="Tipo de Pago" onChange={onChangeExpense} name="paymentType"
                           value={expense.paymentType}
                           type="select">
                        <option value="">Select</option>
                        {orderPaymentTypeList.map((type: string) =>
                            <option value={type} key={type}>{type.toUpperCase()}</option>)
                        }
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="taxReceipt">Comprobante:</Label>
                    <div className="d-flex align-items-center">
                        <Input onChange={onChangeExpense} name="taxReceipt" id="taxReceipt"
                               value={expense.taxReceipt}/>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label for="description">Descripcion:</Label>
                    <div className="d-flex align-items-center">
                        <Input onChange={onChangeExpense} name="description" id="description"
                               value={expense.description}/>
                    </div>
                </FormGroup>
                <FormGroup>
                    {expense.invoice && <span>{expense.invoice.split('/').pop()}</span>}
                    <Label><b>Subir Factura</b> <br/>
                        <Input className=""
                               type="file"
                               name="wallpaper"
                               accept="image/png,image/jpg,image/jpeg,application/pdf"
                               onChange={handleInvoiceMedia}/>
                    </Label>
                </FormGroup>
                <FormGroup className="d-flex justify-content-stretch align-items-center">
                    <Button disabled={!expenseIsValid} type="submit" color="primary"
                            className="flex-grow-1">Enviar</Button>
                </FormGroup>
            </>}
        </Form>
    )
}