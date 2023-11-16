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
import React, {KeyboardEvent, useMemo, useState} from "react";
import {toast} from "react-toastify";
import {IMedia, IMediaTagTypes} from "../../../../components/GCloudMediaHandler/GCloudMediaHandler";
import {ICategory} from "../../../../model/CategoryModel";
import {CompanyModel} from "../../../../model/companyModel";
import "./CategoryList.scss"
export interface ICategoryListProps {
    categories: ICategory[],
    updateCategoryMedia: (companyToUpdate: ICategory, tag: IMediaTagTypes, event: any, onLoadedMedia?: (media: IMedia) => Promise<void>) => Promise<void>,
    updateCategory: (company: ICategory) => Promise<void>,
    addCategory: (company: ICategory) => Promise<void>,
    deleteCategory: (company: ICategory) => Promise<void>,
    companies: CompanyModel[]
}

export const CategoryList = (
    {
        categories, updateCategoryMedia,
        updateCategory, addCategory,
        deleteCategory,
        companies,
    }: ICategoryListProps) => {
    const [isEditing, setIsEditing] = useState<{ [N in string]: Partial<ICategory> | null }>({});
    const [categoryToCreate, setCategoryToCreate] = useState<ICategory>({} as ICategory);
    const [newTag, setNewTag] = useState<string>('');
    const [companyToDelete, setCategoryToDelete] = useState<ICategory | null>(null);

    const companieIds = useMemo(() => companies.map(item => item.companyId), [companies]);

    const onChangeNewTag = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        setNewTag(value)
    }

    const onChangeCategory = (
        companyId: string,
        // key?: keyof ICategory
    ) =>
        ({
             target: {
                 name,
                 type,
                 value
             }
         }: React.ChangeEvent<HTMLInputElement>) => {


            let newCategory = {
                ...isEditing[companyId],
            }
            // if (key) {
            //     newCategory = {
            //         ...newCategory,
            //         [key]: {
            //             ...newCategory[key],
            //             [name]: type === 'number' ? Number(value) : value
            //         }
            //     }
            // } else {
            newCategory = {
                ...newCategory,
                [name]: type === 'number' ? Number(value) : value

            }
            // }

            setIsEditing({
                ...isEditing,
                [companyId]: newCategory
            });
        }

    const onChangeCreateCategory = ({target: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryToCreate({
            ...categoryToCreate,
            [name]: value
        })

    }

    const toggleEditing = (company: ICategory) => () => {
        const isEditingCategory = !!isEditing[company._id]
        setIsEditing({
            ...isEditing,
            [company._id]: isEditingCategory ? null : company
        })
    }

    const validCategory = (category: ICategory) => {
        const {title, description} = category
        const res = (!!title && !!description)
        if (!res) {
            toast("Todos los campos son requeridos")
        }
        return res
    }

    const addTag = (companyId: string) => (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            const company = isEditing[companyId];

            if (company) {
                const tags = company.tags as string[];

                const newTags = [...tags, newTag];
                onChangeCategory(companyId)({
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
            onChangeCategory(companyId)({
                target: {
                    name: 'tags',
                    value: newTags
                }
            } as any)
        }
    }

    const handleUpdateMedia = (id: string, tag: IMediaTagTypes) => async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        const companyToUpdate: ICategory = isEditing[id] as ICategory;

        if (file && companyToUpdate) {
            await updateCategoryMedia(
                companyToUpdate, tag, event, async (media: IMedia) => {
                    setIsEditing({
                        ...isEditing,
                        [id]: null
                    });
                    onChangeCategory(id)({
                        target: {
                            name: tag,
                            type: 'string',
                            value: media.content
                        }
                    } as any)
                });

        }

    }

    const handleUpdateCategory = (companyId: string) => async () => {
        const company = isEditing[companyId] as ICategory;
        if (validCategory(company as ICategory)) {
            await updateCategory(company)
            setIsEditing({
                ...isEditing,
                [companyId]: null
            });
        }

    }

    const resetCategoryToDelete = () => {
        setCategoryToDelete(null);
    }

    const handleAddNewCategory = async () => {
        if (validCategory(categoryToCreate)) {
            await addCategory(categoryToCreate)
        }
    }
    const handleDeleteCategory = async () => {
        await deleteCategory(companyToDelete as ICategory)
        resetCategoryToDelete();
    }

    return (
        <div className="categories-grid">
            {categories.map(catData => {
                    const category = {
                        ...catData,
                        ...(isEditing[catData._id] || {} as any)
                    } as ICategory;

                    const isEditingCategory = !!isEditing[category._id];
                    return (
                        <Card key={category._id}>
                            <img
                                alt="Sample"
                                src={category.wallpaper}
                            />
                            <CardBody>
                                <Form onSubmit={e => e.preventDefault()}>
                                    <FormGroup>
                                        <Label><b>Título</b></Label> <br/>
                                        {!isEditingCategory ? <h2>{category.title}</h2>
                                            : <Input value={category.title} name="title"
                                                     onChange={onChangeCategory(category._id)}/>}
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><b>Compañia</b></Label> <br/>
                                        {!isEditingCategory ? <span>{category.company}</span>
                                            : <Input value={category.company}
                                                     name="company"
                                                     type="select"
                                                     onChange={onChangeCategory(category._id)}
                                            >
                                                <option value="">Seleccionar</option>
                                                {companieIds.map( (item) => <option value={item}>{item}</option>)}
                                            </Input>
                                        }
                                    </FormGroup>

                                    <FormGroup>
                                        <Label><b>Descripcion</b></Label> <br/>
                                        {!isEditingCategory ? <span>{category.description}</span>
                                            : <Input type="textarea" value={category.description} name="description"
                                                     onChange={onChangeCategory(category._id)}/>}
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><b>Wallpaper</b> <br/>
                                            {!isEditingCategory ? <span>{category.wallpaper}</span>
                                                : <Input className=""
                                                         type="file"
                                                         name="wallpaper"
                                                         accept="image/png,image/jpg,image/jpeg"
                                                         onChange={handleUpdateMedia(category._id, 'wallpaper')}/>}
                                        </Label>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><b>Etiquetas</b></Label> <br/>
                                        <div className="d-flex w-100 flex-column gap-3">
                                            {isEditingCategory && <Input
                                                type="text"
                                                className="w-100"
                                                value={newTag}
                                                placeholder="Agregar nueva etiqueta"
                                                onChange={onChangeNewTag}
                                                onKeyDown={addTag(category._id)}
                                            />}

                                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                                {category.tags?.map((tag: string, i: number) =>
                                                    <Badge key={`${tag}-${i}`} pill
                                                           className="d-flex align-items-center gap-2 p-2 cursor-no-pointer"
                                                           color="primary">
                                                        {tag}
                                                        {isEditingCategory &&
                                                            <i className="cursor-pointer bi bi-x-circle-fill tex-white cursor-pointer font-weight-bold"
                                                               onClick={removeTag(category._id, tag)}/>}
                                                    </Badge>)}
                                            </div>
                                        </div>

                                    </FormGroup>
                                    <FormGroup>
                                        <Label><b>Video</b> <br/>
                                            <video width="300px" height="auto" controls>
                                                <source src={category.video} type="video/mp4"/>
                                            </video>
                                            {!isEditingCategory ? <span>{category.video}</span>
                                                : <Input className=""
                                                         type="file"
                                                         name="video"
                                                         accept="video/mp4,video/x-m4v,video/*"
                                                         onChange={handleUpdateMedia(category._id, 'video')}/>}
                                        </Label>
                                    </FormGroup>

                                </Form>
                            </CardBody>
                            <CardFooter className="d-flex align-items-center justify-content-between">
                                {isEditingCategory && <Button
                                    onClick={handleUpdateCategory(category._id)} color="success" outline>Guardar</Button>}
                                <Button onClick={() => setCategoryToDelete(category)} color="danger"
                                        outline>Eliminar</Button>
                                <Button color={isEditingCategory ? "danger" : "info"}
                                        onClick={toggleEditing(category)}>{isEditingCategory ? 'Cancelar' : 'Editar'}</Button>

                            </CardFooter>
                        </Card>
                    )
                }
            )}
            <Card>
                <CardBody>
                    <Form>
                        <FormGroup>
                            <Label><b>Titulo</b></Label> <br/>
                            <Input value={categoryToCreate.title} name="title"
                                   onChange={onChangeCreateCategory}/>
                        </FormGroup>
                        <FormGroup>
                            <Label><b>Descripcion</b></Label> <br/>
                            <Input type="textarea" value={categoryToCreate.description} name="description"
                                   onChange={onChangeCreateCategory}/>
                        </FormGroup>
                    </Form>
                </CardBody>
                <CardFooter>
                    <Button color="success" onClick={handleAddNewCategory}>Crear</Button>
                </CardFooter>
            </Card>
            <Modal isOpen={!!companyToDelete} toggle={resetCategoryToDelete}>
                <ModalHeader toggle={resetCategoryToDelete}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas Seguro que deseas eliminar esta Category?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleDeleteCategory}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={resetCategoryToDelete}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>

    );
}