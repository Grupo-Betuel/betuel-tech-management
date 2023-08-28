import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Form,
    FormGroup,
    Input,
    Label,
    Modal, ModalBody, ModalFooter,
    ModalHeader,
    Spinner
} from "reactstrap";
import {CompanyModel} from "../../model/companyModel";
import {addCompany, deleteCompany, getCompanies, updateCompanies} from "../../services/companies";
import "./CompanyManagement.scss"
import {toast} from "react-toastify";

export const CompanyManagement = () => {
    const [companies, setCompanies] = useState<CompanyModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<{ [N in string]: Partial<CompanyModel> | null }>({});
    const [createCompany, setCreateCompany] = useState<CompanyModel>({} as CompanyModel);
    const [companyToDelete, setCompanyToDelete] = useState<CompanyModel | null>(null);
    useEffect(() => {
        handleGetCompanies();
    }, [])

    const handleGetCompanies = async () => {
        setLoading(true);
        setCompanies(await getCompanies())
        setLoading(false);
    }

    const toggleEditing = (company: CompanyModel) => () => {
        const isEditingCompany = !!isEditing[company._id]
        console.log('edit company', company)
        setIsEditing({
            ...isEditing,
            [company._id]: isEditingCompany ? null : company
        })
    }

    const updateCompany = (companyId: string) => async () => {
        const company = isEditing[companyId];
        console.log("company to update", company)
        if (company && validCompany(company as CompanyModel)) {
            setLoading(true)
            await updateCompanies(JSON.stringify(company));
            await handleGetCompanies();
            toast("Compañia actualizada con exito")
            setLoading(false)
            setIsEditing({
                ...isEditing,
                [companyId]: null
            });
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
            setLoading(false);
        }
    }

    const onChangeCompany = (companyId: string, key?: keyof CompanyModel) => ({
                                                                                  target: {
                                                                                      name,
                                                                                      type,
                                                                                      value
                                                                                  }
                                                                              }: React.ChangeEvent<HTMLInputElement>) => {


        let newCompany = {
            ...isEditing[companyId],
        }
        console.log('jkljk', newCompany, companyId, isEditing)
        if (key) {
            newCompany = {
                ...newCompany,
                [key]: {
                    ...newCompany[key],
                    [name]: type === 'number' ? Number(value) : value
                }
            }
        } else {
            newCompany = {
                ...newCompany,
                [name]: type === 'number' ? Number(value) : value

            }
        }

        console.log('new company', newCompany)
        setIsEditing({
            ...isEditing,
            [companyId]: newCompany
        });
    }

    const onChangeCreateCompany = ({target: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        setCreateCompany({
            ...createCompany,
            [name]: value
        })

    }

    const resetCompanyToDelete = () => {
        setCompanyToDelete(null);
    }

    const handleDeleteCompany = async () => {
        setLoading(true);
        await deleteCompany(JSON.stringify(companyToDelete));
        await handleGetCompanies();
        toast("Compañia eliminada con exito")
        setLoading(false);
        resetCompanyToDelete();
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
                {companies.map(companyData => {
                        const company = {
                            ...companyData,
                            ...(isEditing[companyData._id] || {} as any)
                        }
                        const isEditingCompany = !!isEditing[company._id];
                        return (
                            <Card key={company._id}>
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

                                        <div className="d-flex flex-column gap-2">
                                            <h4>Instagram</h4>
                                            <div className="ms-3">
                                                <FormGroup>

                                                    <Label><b>Username</b></Label> <br/>
                                                    {!isEditingCompany ? <span>{company.instagram?.username}</span>
                                                        : <Input value={company.instagram?.username} name="username"
                                                                 onChange={onChangeCompany(company._id, 'instagram')}/>}
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label><b>Password</b></Label> <br/>
                                                    {!isEditingCompany ? <span>{company.instagram?.password}</span>
                                                        : <Input value={company.instagram?.password} name="password"
                                                                 onChange={onChangeCompany(company._id, 'instagram')}/>}
                                                </FormGroup>
                                            </div>
                                        </div>

                                    </Form>
                                </CardBody>
                                <CardFooter className="d-flex align-items-center justify-content-between">
                                    {isEditingCompany && <Button
                                        onClick={updateCompany(company._id)} color="success" outline>Guardar</Button>}
                                    <Button onClick={() => setCompanyToDelete(company)} color="danger"
                                            outline>Eliminar</Button>
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
            <Modal isOpen={!!companyToDelete} toggle={resetCompanyToDelete}>
                <ModalHeader toggle={resetCompanyToDelete}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas Seguro que deseas eliminar esta Company?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleDeleteCompany}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={resetCompanyToDelete}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}