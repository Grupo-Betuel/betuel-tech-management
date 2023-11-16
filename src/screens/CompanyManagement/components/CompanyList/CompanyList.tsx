import {
    Badge,
    Button,
    Card,
    CardBody,
    CardFooter,
    Form,
    FormGroup,
    Input,
    Label, Modal,
    ModalBody, ModalFooter,
    ModalHeader
} from "reactstrap";
import React, {KeyboardEvent, useState} from "react";
import {CompanyModel} from "../../../../model/companyModel";
import {toast} from "react-toastify";
import {IMedia, IMediaTagTypes} from "../../../../components/GCloudMediaHandler/GCloudMediaHandler";

export interface ICompanyListProps {
    companies: CompanyModel[],
    updateCompanyMedia: (companyToUpdate: CompanyModel, tag: IMediaTagTypes, event: any, onLoadedMedia?: (media: IMedia) => Promise<void>) => Promise<void>,
    updateCompany: (company: CompanyModel) => Promise<void>,
    addCompany: (company: CompanyModel) => Promise<void>,
    deleteCompany: (company: CompanyModel) => Promise<void>,
}

export const CompanyList = (
    {
        companies, updateCompanyMedia,
        updateCompany, addCompany,
        deleteCompany
    }: ICompanyListProps) => {
    const [isEditing, setIsEditing] = useState<{ [N in string]: Partial<CompanyModel> | null }>({});
    const [companyToCreate, setCompanyToCreate] = useState<CompanyModel>({} as CompanyModel);
    const [newTag, setNewTag] = useState<string>('');
    const [companyToDelete, setCompanyToDelete] = useState<CompanyModel | null>(null);

    const onChangeNewTag = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        setNewTag(value)
    }

    const onChangeCompany = (
        companyId: string,
        key?: keyof CompanyModel
    ) =>
        ({
             target: {
                 name,
                 type,
                 value
             }
         }: React.ChangeEvent<HTMLInputElement>) => {


            let newCompany = {
                ...isEditing[companyId],
            }
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

            setIsEditing({
                ...isEditing,
                [companyId]: newCompany
            });
        }

    const onChangeCreateCompany = ({target: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        setCompanyToCreate({
            ...companyToCreate,
            [name]: value
        })

    }

    const toggleEditing = (company: CompanyModel) => () => {
        const isEditingCompany = !!isEditing[company._id]
        setIsEditing({
            ...isEditing,
            [company._id]: isEditingCompany ? null : company
        })
    }

    const validCompany = (company: CompanyModel) => {
        const {name, companyId, logo, phone} = company
        const res = (!!name && !!companyId && !!logo && !!phone)
        if (!res) {
            toast("Todos los campos son requeridos")
        }
        return res
    }

    const addTag = (companyId: string) => (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            const company = isEditing[companyId];
            console.log('key', event.key, company, companyId);

            if (company) {
                const tags = company.tags as string[];
                console.log('tags', tags);

                const newTags = [...tags, newTag];
                onChangeCompany(companyId)({
                    target: {
                        name: 'tags',
                        value: newTags
                    }
                } as any)
                setNewTag('');
            }
        }

    }

    const removeTag = (companyId: string, tag: string) => () => {
        const company = isEditing[companyId];
        if (company) {
            const tags = company.tags as string[];
            const newTags = tags.filter(t => t !== tag);
            onChangeCompany(companyId)({
                target: {
                    name: 'tags',
                    value: newTags
                }
            } as any)
        }
    }

    const handleUpdateMedia = (companyId: string, tag: IMediaTagTypes) => async (event: React.ChangeEvent<HTMLInputElement>) => {
        const companyIdString = companies.find(company => company.companyId === companyId)?._id;

        const file = event.target.files && event.target.files[0];
        const companyToUpdate: CompanyModel = isEditing[companyIdString] as CompanyModel;

        if (file && companyToUpdate) {
            await updateCompanyMedia(
                companyToUpdate, tag, event, async (media: IMedia) => {
                    setIsEditing({
                        ...isEditing,
                        [companyIdString]: null
                    });
                    onChangeCompany(companyIdString)({
                        target: {
                            name: tag,
                            type: 'string',
                            value: media.content
                        }
                    } as any)
                });

        }

    }

    const handleUpdateCompany = (companyId: string) => async () => {
        const company = isEditing[companyId] as CompanyModel;
        if (validCompany(company as CompanyModel)) {
            await updateCompany(company)
            setIsEditing({
                ...isEditing,
                [companyId]: null
            });
        }

    }

    const resetCompanyToDelete = () => {
        setCompanyToDelete(null);
    }

    const handleAddNewCompany = async () => {
        if(validCompany(companyToCreate)) {
          await addCompany(companyToCreate)

        }
    }
    const handleDeleteCompany = async () => {
        await addCompany(companyToDelete as CompanyModel)
        resetCompanyToDelete();
    }

    return (
        <div className="companies-grid">
            {companies.map(companyData => {
                    const company = {
                        ...companyData,
                        ...(isEditing[companyData._id] || {} as any)
                    }
                    const isEditingCompany = !!isEditing[company._id];
                    return (
                        <Card key={company._id}>
                            <img
                                alt="Sample"
                                src={company.wallpaper}
                            />
                            <CardBody>
                                <Form onSubmit={e => e.preventDefault()}>
                                    <FormGroup>
                                        <Label><b>Nombre</b></Label> <br/>
                                        {!isEditingCompany ? <span>{company.name}</span>
                                            : <Input value={company.name} name="name"
                                                     onChange={onChangeCompany(company._id)}/>}
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><b>Tipo</b></Label> <br/>
                                        {!isEditingCompany ? <span>{company.type}</span>
                                            : <Input value={company.type}
                                                     name="type"
                                                     type="select"
                                                     onChange={onChangeCompany(company._id)}
                                            >
                                                <option value="">Seleccionar</option>
                                                <option value="store">Tienda</option>
                                                <option value="agency">Agencia</option>
                                            </Input>
                                        }
                                    </FormGroup>

                                    <FormGroup>
                                        <Label><b>Logo</b></Label> <br/>
                                        {!isEditingCompany ? <img width={100} height={100} src={company.logo}/>
                                            : <Input className=""
                                                     type="file"
                                                     name="logo"
                                                     accept="image/png,image/jpg,image/gif,image/jpeg"
                                                     onChange={handleUpdateMedia(company.companyId, 'logo')}/>}
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
                                    <FormGroup>
                                        <Label><b>Promotion Title</b></Label> <br/>
                                        {!isEditingCompany ? <span>{company.title}</span>
                                            : <Input value={company.title} name="title"
                                                     onChange={onChangeCompany(company._id)}/>}
                                    </FormGroup>

                                    <FormGroup>
                                        <Label><b>Descripcion</b></Label> <br/>
                                        {!isEditingCompany ? <span>{company.description}</span>
                                            : <Input type="textarea" value={company.description} name="description"
                                                     onChange={onChangeCompany(company._id)}/>}
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><b>Wallpaper</b> <br/>
                                            {!isEditingCompany ? <span>{company.wallpaper}</span>
                                                : <Input className=""
                                                         type="file"
                                                         name="wallpaper"
                                                         accept="image/png,image/jpg,image/gif,image/jpeg"
                                                         onChange={handleUpdateMedia(company.companyId, 'wallpaper')}/>}
                                        </Label>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><b>Etiquetas</b></Label> <br/>
                                        <div className="d-flex w-100 flex-column gap-3">
                                            {isEditingCompany && <Input
                                                type="text"
                                                className="w-100"
                                                value={newTag}
                                                placeholder="Agregar nueva etiqueta"
                                                onChange={onChangeNewTag}
                                                onKeyDown={addTag(company._id)}
                                            />}

                                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                                {company.tags.map((tag: string, i: number) =>
                                                    <Badge key={`${tag}-${i}`} pill
                                                           className="d-flex align-items-center gap-2 p-2 cursor-no-pointer"
                                                           color="primary">
                                                        {tag}
                                                        {isEditingCompany &&
                                                            <i className="cursor-pointer bi bi-x-circle-fill tex-white cursor-pointer font-weight-bold"
                                                               onClick={removeTag(company._id, tag)}/>}
                                                    </Badge>)}
                                            </div>
                                        </div>

                                    </FormGroup>
                                    <FormGroup>
                                        <Label><b>Video</b> <br/>
                                            <video width="300px" height="auto" controls>
                                                <source src={company.video} type="video/mp4"/>
                                            </video>
                                            {!isEditingCompany ? <span>{company.video}</span>
                                                : <Input className=""
                                                         type="file"
                                                         name="video"
                                                         accept="video/mp4,video/x-m4v,video/*"
                                                         onChange={handleUpdateMedia(company.companyId, 'video')}/>}
                                        </Label>
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
                                            <FormGroup>
                                                <Label><b>URL</b></Label> <br/>
                                                {!isEditingCompany ?
                                                    <a href={company.instagram?.url} target="_blank">{company.name}</a>
                                                    : <Input value={company.instagram?.url} name="url"
                                                             onChange={onChangeCompany(company._id, 'instagram')}/>}
                                            </FormGroup>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column gap-2">
                                        <h4>Facebook</h4>
                                        <div className="ms-3">
                                            <FormGroup>
                                                <Label><b>Email</b></Label> <br/>
                                                {!isEditingCompany ? <span>{company.facebook?.username}</span>
                                                    : <Input value={company.facebook?.username} name="username"
                                                             onChange={onChangeCompany(company._id, 'facebook')}/>}
                                            </FormGroup>
                                            <FormGroup>
                                                <Label><b>Password</b></Label> <br/>
                                                {!isEditingCompany ? <span>{company.facebook?.password}</span>
                                                    : <Input value={company.facebook?.password} name="password"
                                                             onChange={onChangeCompany(company._id, 'facebook')}/>}
                                            </FormGroup>
                                            <FormGroup>
                                                <Label><b>URL</b></Label> <br/>
                                                {!isEditingCompany ?
                                                    <a href={company.facebook?.url} target="_blank">{company.name}</a>
                                                    : <Input value={company.facebook?.url} name="url"
                                                             onChange={onChangeCompany(company._id, 'facebook')}/>}
                                            </FormGroup>
                                        </div>
                                    </div>

                                </Form>
                            </CardBody>
                            <CardFooter className="d-flex align-items-center justify-content-between">
                                {isEditingCompany && <Button
                                    onClick={handleUpdateCompany(company._id)} color="success" outline>Guardar</Button>}
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
                            <Input value={companyToCreate.name} name="name"
                                   onChange={onChangeCreateCompany}/>
                        </FormGroup>
                        <FormGroup>
                            <Label><b>Logo</b></Label> <br/>
                            <Input value={companyToCreate.logo} name="logo"
                                   onChange={onChangeCreateCompany}/>
                        </FormGroup>
                        <FormGroup>
                            <Label><b>Company ID</b></Label> <br/>
                            <Input value={companyToCreate.companyId} name="companyId"
                                   onChange={onChangeCreateCompany}/>
                        </FormGroup>
                        <FormGroup>
                            <Label><b>Telefono</b></Label> <br/>
                            <Input value={companyToCreate.phone} name="phone"
                                   onChange={onChangeCreateCompany}/>
                        </FormGroup>
                    </Form>
                </CardBody>
                <CardFooter>
                    <Button color="success" onClick={handleAddNewCompany}>Crear</Button>
                </CardFooter>
            </Card>
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

    );
}