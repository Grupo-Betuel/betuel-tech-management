import React, {useEffect, useState} from "react";
import {Button, Card, CardBody, CardFooter, Form, FormGroup, Input, Label, Spinner} from "reactstrap";
import {CompanyModel} from "../../model/companyModel";
import {addCompany, getCompanies, updateCompanies} from "../../services/companies";
import "./CompanyManagement.scss"
import {toast} from "react-toastify";

export const CompanyManagement = () => {
    const [companies, setCompanies] = useState<CompanyModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<{ [N in string]: Partial<CompanyModel> | null }>({});
    const [createCompany, setCreateCompany] = useState<CompanyModel>({} as CompanyModel);

    useEffect(() => {
        handleGetCompanies();
    }, [])

    const handleGetCompanies = async () => {
        setLoading(true);
        setCompanies(await getCompanies())
        setLoading(false);
    }

    const toggleEditing = (company: CompanyModel) => () => {
        const isEditingCompany = !!isEditing[company.companyId];

        setIsEditing({
            ...isEditing,
            [company.companyId]: isEditingCompany ? null : company
        })
    }

    const updateCompany = (companyId: string) => async () => {
        const company = isEditing[companyId];
        if (company && validCompany(company as CompanyModel)) {
            setLoading(true)
            await updateCompanies(JSON.stringify(isEditing[companyId]));
            await handleGetCompanies();
            toast("Compañia actualizada con exito")
            setLoading(false)
        }
    }


    const validCompany = (company: CompanyModel) => {
        const {name, companyId, logo, phone} = company
        const res = (!!name && !!companyId && !!logo && !!phone)
        if (!res) {
            toast("Todos los campos son requeridos")
        }
        return res
    }
    const handleAddNewCompany = async () => {

        if (validCompany(createCompany)) {
            setLoading(true);
            await addCompany(JSON.stringify(createCompany));
            await handleGetCompanies();
            toast("Compañia creada con exito")
            setLoading(true);
        }
    }

    const onChangeCompany = (companyId: string) => ({
                                                        target: {
                                                            name,
                                                            type,
                                                            value
                                                        }
                                                    }: React.ChangeEvent<HTMLInputElement>) => {
        const newCompany = {
            ...isEditing[companyId],
            [name]: type === 'number' ? Number(value) : value
        }
        setIsEditing({
            ...isEditing,
            [companyId]: newCompany
        })
    }

    const onChangeCreateCompany = ({target: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        setCreateCompany({
            ...createCompany,
            [name]: value
        })

    }

    return (
        <div className="company-management">
            {!loading ? null : (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}
            <div className="companies-grid">
                {companies.map(company => {
                        const isEditingCompany = !!isEditing[company.companyId];
                        return (
                            <Card>
                                <CardBody>
                                    <Form>
                                        <FormGroup>
                                            <Label><b>Nombre</b></Label> <br/>
                                            {!isEditingCompany ? <span>{company.name}</span>
                                                : <Input value={company.name} name="name"
                                                         onChange={onChangeCompany(company._id)}/>}
                                        </FormGroup>
                                        <FormGroup>
                                            <Label><b>Logo</b></Label> <br/>
                                            {!isEditingCompany ? <img width={100} height={100} src={company.logo}/>
                                                : <Input value={company.logo} name="logo"
                                                         onChange={onChangeCompany(company._id)}/>}
                                        </FormGroup>
                                        <FormGroup>
                                            <Label><b>Company Id</b></Label> <br/>
                                            {!isEditingCompany ? <span>{company.companyId}</span>
                                                : <Input value={company.companyId} name="companyId"
                                                         onChange={onChangeCompany(company._id)}/>}
                                        </FormGroup>
                                        <FormGroup>
                                            <Label><b>Telefono</b></Label> <br/>
                                            {!isEditingCompany ? <span>{company.phone}</span>
                                                : <Input value={company.phone} name="phone"
                                                         onChange={onChangeCompany(company._id)}/>}
                                        </FormGroup>
                                    </Form>
                                </CardBody>
                                <CardFooter className="d-flex align-items-center justify-content-between">
                                    {isEditingCompany && <Button
                                        onClick={updateCompany(company.companyId)} color="success" outline>Guardar</Button>}
                                    <Button color={isEditingCompany ? "danger" : "info"}
                                            onClick={toggleEditing(company)}>{isEditingCompany ? 'Cancelar' : 'Editar'}</Button>
                                </CardFooter>
                            </Card>
                        )
                    }
                )}
                <Card>
                    <CardBody>
                        <Form>
                            <FormGroup>
                                <Label><b>Nombre</b></Label> <br/>
                                <Input value={createCompany.name} name="name"
                                       onChange={onChangeCreateCompany}/>
                            </FormGroup>
                            <FormGroup>
                                <Label><b>Logo</b></Label> <br/>
                                <Input value={createCompany.logo} name="logo"
                                       onChange={onChangeCreateCompany}/>
                            </FormGroup>
                            <FormGroup>
                                <Label><b>Company ID</b></Label> <br/>
                                <Input value={createCompany.companyId} name="companyId"
                                       onChange={onChangeCreateCompany}/>
                            </FormGroup>
                            <FormGroup>
                                <Label><b>Telefono</b></Label> <br/>
                                <Input value={createCompany.phone} name="phone"
                                       onChange={onChangeCreateCompany}/>
                            </FormGroup>
                        </Form>
                    </CardBody>
                    <CardFooter>
                        <Button color="success" onClick={handleAddNewCompany}>Crear</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}