import React from "react";
import "./Accounting.scss";
import {ExpenseModel} from "../../model/expenseModel";
import {
    Button, FormGroup, Input, Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Spinner,
    Table,
    UncontrolledTooltip
} from "reactstrap";
import {ExpenseForm} from "../../components/ExpenseForm/ExpenseForm";
import {addExpense, getExpenses, updateExpense} from "../../services/expensesService";
import {DownloadTableExcel} from 'react-export-table-to-excel';
import {useConfirmAction} from "../../components/hooks/confirmActionHook";
import {CommonActionTypes} from "../../model/common";
import {deleteExpense} from "../../services/expensesService";
import {IDateMonth, months, years} from "../../utils/date.utils";
import {generateCustomID} from "../../utils/text.utils";


export const Accounting = () => {
    const [expenses, setExpenses] = React.useState<ExpenseModel[]>([]);
    const [expensesModalOpen, setExpensesModalOpen] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState(false);
    const tableRef = React.useRef(null);
    const [expenseToUpdate, setExpenseToUpdate] = React.useState<ExpenseModel>();
    const [dateFilter, setDateFilter] = React.useState<{ month: string, year: string }>({
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString(),
    });

    React.useEffect(() => {
        loadData();
    }, []);


    const filteredExpenses = React.useMemo(() => expenses.filter(expense => {
        const date = new Date(expense.date);
        return date.getMonth() + 1 === parseInt(dateFilter.month) && date.getFullYear() === parseInt(dateFilter.year);
    }), [expenses, dateFilter]);

    const handleConfirmedActions = async (type?: CommonActionTypes, data?: ExpenseModel) => {
        if (type === 'delete') {
            setLoading(true);
            data && data._id && await deleteExpense(data?._id)
            loadData();
            setLoading(false);
        }
    }

    const handleDeniedActions = (type?: CommonActionTypes, data?: ExpenseModel) => {

    }
    const {
        handleSetActionToConfirm,
        ConfirmModal
    } = useConfirmAction<CommonActionTypes, ExpenseModel>(handleConfirmedActions, handleDeniedActions);


    const loadData = async () => {
        setLoading(true);
        setExpenses(await getExpenses())
        setLoading(false);
    }
    const handleExpenseSubmit = async (expense: ExpenseModel) => {
        setExpensesModalOpen(false);
        setLoading(true);
        const expenseData = {
            ...expense,
            // total: expense.tips + expense.itbis + expense.amount,
        }

        if (expense._id) {
            await updateExpense(expenseData)
            setExpenseToUpdate(undefined);
        } else {
            await addExpense({...expenseData, _id: undefined})
        }

        await loadData()
        setLoading(false);
    }

    const toggleExpensesModal = () => {
        if (expensesModalOpen) {
            setExpenseToUpdate(undefined);
        }
        setExpensesModalOpen(!expensesModalOpen);
    }

    const handleUpdateExpense = (expense: ExpenseModel) => () => {
        setExpenseToUpdate(expense);
        toggleExpensesModal();
    }

    const onChangeDateFilter = ({target: {value, name}}: React.ChangeEvent<HTMLInputElement>) => {
        setDateFilter({
            ...dateFilter,
            [name]: value
        })
    }

    const exportFilename = React.useMemo(() => `gastos-grupo-betuel-SRL-${dateFilter.month.toString().padStart(2, '0')}-${dateFilter.year}-${generateCustomID()}`, [dateFilter]);

    return (
        <div className="accounting">
            <ConfirmModal/>
            {
                !loading ? null :
                    <>
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    </>
            }
            <Modal
                keyboard={false}
                backdrop="static"
                isOpen={expensesModalOpen}
                toggle={toggleExpensesModal}>
                <ModalHeader toggle={toggleExpensesModal}>
                    Gasto
                </ModalHeader>
                <ModalBody>
                    <ExpenseForm expenseData={expenseToUpdate} onSubmit={handleExpenseSubmit}/>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleExpensesModal} outline color="danger">Cerrar</Button>
                </ModalFooter>
            </Modal>
            <h1>Gastos</h1>
            <div className="accounting__actions">
                <Button color="primary" onClick={toggleExpensesModal}>Agregar Gasto</Button>
                <div className="d-flex align-items-center gap-3">
                    <FormGroup className="d-flex align-items-center gap-2">
                        <Label for="type">Mes:</Label>
                        <Input placeholder="Mes" id="type" name="month"
                               onChange={onChangeDateFilter}
                               value={dateFilter.month}
                               type="select">
                            <option value="">Select</option>
                            {
                                months.map((month: IDateMonth) =>
                                    <option value={month.id} key={`${month.text}-${month.id}`}>
                                        {month.text.toLocaleUpperCase()}
                                    </option>)
                            }
                        </Input>
                    </FormGroup>
                    <FormGroup className="d-flex align-items-center gap-2">
                        <Label for="type">Año:</Label>
                        <Input placeholder="Año" id="type" name="year"
                               onChange={onChangeDateFilter}
                               value={dateFilter.year}
                               type="select">
                            <option value="">Select</option>
                            {
                                years.map((year: number) =>
                                    <option value={year} key={year}>
                                        {year}
                                    </option>)
                            }
                        </Input>
                    </FormGroup>
                </div>
                <DownloadTableExcel
                    filename={exportFilename}
                    sheet="gastos"
                    currentTableRef={tableRef.current}
                >
                    <Button color="info" outline> Exportar Excel <i
                        className="bi bi-file-earmark-spreadsheet"/></Button>
                </DownloadTableExcel>
            </div>
            <Table innerRef={tableRef} className="accounting__expenses-table">
                <tbody>
                <tr className="table-primary">
                    <th>
                        RNC
                    </th>
                    <th>
                        Nombre
                    </th>
                    <th>
                        Comprobante
                    </th>
                    <th>
                        Descripcion
                    </th>
                    <th>
                        Fecha
                    </th>
                    <th>
                        Tipo de Pago
                    </th>
                    <th>
                        Monto
                    </th>
                    <th>
                        ITBIS
                    </th>
                    <th>
                        Propina 10%
                    </th>
                    <th>
                        Total
                    </th>
                    <th>
                        Factura
                    </th>
                    <th>

                    </th>
                </tr>
                {filteredExpenses.map(item => {
                        const date = item.date && new Date(item.date)
                        return (
                            <tr key={item._id}>
                                <td>
                                    {item.commerce.rnc}
                                </td>
                                <td>
                                    {item.commerce.name}
                                </td>
                                <td>
                                    {item.taxReceipt}
                                </td>
                                <td>
                                    <div className="text-truncate" style={{width: "150px"}}>
                                        {item.description}
                                    </div>
                                </td>
                                <td>
                                    {date ? `${date.toLocaleDateString('ES-es')}` : 'n/a'}
                                </td>
                                <td>
                                    {item.paymentType}
                                </td>
                                <td>
                                    RD${item.amount.toLocaleString()}
                                </td>
                                <td>
                                    RD${item.itbis.toLocaleString()}
                                </td>
                                <td>
                                    RD${item.tips.toLocaleString()}
                                </td>
                                <td>
                                    RD${item.total.toLocaleString()}
                                </td>
                                <td>
                                    <div className="text-truncate" style={{width: "150px"}}>
                                        <a target="_blank" href={item.invoice}>{item.invoice}</a>
                                    </div>
                                </td>
                                <div className="accounting__expenses-table--actions">
                                    <div>
                                        <Button onClick={() => handleSetActionToConfirm('delete', item)} color="danger"
                                                id={`delete-btn-${item._id}`} outline>
                                            <i className="bi bi-trash"/>
                                        </Button>
                                        <UncontrolledTooltip placement="top" target={`delete-btn-${item._id}`}>
                                            Eliminar
                                        </UncontrolledTooltip>
                                    </div>
                                    <div>
                                        <Button onClick={handleUpdateExpense(item)} color="info"
                                                id={`update-btn-${item._id}`} outline>
                                            <i className="bi bi-pencil-square"/>
                                        </Button>
                                        <UncontrolledTooltip placement="top" target={`update-btn-${item._id}`}>
                                            Editar
                                        </UncontrolledTooltip>
                                    </div>
                                    {item.invoice &&
                                        <div>
                                            <a href={item.invoice} target="_blank">
                                                <Button color="primary" id={`see-invoice-btn-${item._id}`} outline>
                                                    <i className="bi bi-receipt"/>
                                                </Button>
                                            </a>
                                            <UncontrolledTooltip placement="top" target={`see-invoice-btn-${item._id}`}>
                                                Ver Factura
                                            </UncontrolledTooltip>
                                        </div>}
                                </div>
                            </tr>
                        )
                    }
                )}
                </tbody>
            </Table>
        </div>
    )
}