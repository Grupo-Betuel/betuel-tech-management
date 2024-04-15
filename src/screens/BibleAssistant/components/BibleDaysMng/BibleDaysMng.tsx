import React, {useState} from 'react';
import {
    Card,
    CardBody,
    CardImg,
    Button,
    Input,
    FormGroup,
    Label,
    Col,
    Row,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter, Spinner
} from 'reactstrap';
import {
    BibleDayModel,
    BibleDayResourcesModel,
    BibleDayResourceTypesList,
    BibleDayResourceTypes,
    UploableDayResourceTypes,
    BibleStudyModel,
    BibleStudyActionsModel,
    AvailableSourceTypes,
    BibleGroupParticipationModel
} from "../../../../model/interfaces/BibleModel";
import './BibleDaysMng.scss';
import {generateCustomID} from "../../../../utils/text.utils";
import {IMedia, IMediaTagTypes} from "../../../../components/GCloudMediaHandler/GCloudMediaHandler";
import {deletePhoto} from "../../../../services/gcloud";
import {toast} from "react-toastify";
import {onChangeMediaToUpload} from "../../../../utils/gcloud.utils";
import {CommonActionTypes} from "../../../../model/common";
import {useConfirmAction} from "../../../../components/hooks/confirmActionHook";

interface BibleDaysGridProps {
    study: BibleStudyModel;
    onDaySubmit: (day: BibleDayModel) => void;
    onDayDelete: (id?: string) => void;
    onResourceDelete: (id?: string) => void;
}

const BibleDaysGrid: React.FC<BibleDaysGridProps> = ({study, onDaySubmit, onDayDelete, onResourceDelete}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editMode, setEditMode] = useState<string | null>(null); // Tracks the ID of the BibleDay currently being edited
    const [editableFields, setEditableFields] = useState<{ [key: string]: any }>({});
    const [bibleDays, setBibleDays] = useState<BibleDayModel[]>(study.days);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setBibleDays(study.days);
    }, [study]);


    const handleConfirmedAction = async (actionToConfirm?: CommonActionTypes | 'delete-resource', data?: BibleDayModel | string) => {
        setLoading(true);
        switch (actionToConfirm) {
            case 'create':
            case 'update':
                onDaySubmit(data as BibleDayModel);
                toast('¡Datos Actualizados!', {type: 'success'});
                break;
            case 'delete':
                onDayDelete(data as string);
                break;
            case 'delete-resource':
                onResourceDelete(data as string);
                break;
        }
        setLoading(false);

    }

    const handleDeniedAction = () => {

    }


    const {
        handleSetActionToConfirm,
        ConfirmModal,
    } = useConfirmAction<CommonActionTypes | 'delete-resource', BibleDayModel | string>(handleConfirmedAction, handleDeniedAction)


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleAddResource = (dayId: string) => ({target: {value: type}}: any) => {
        const newResource: BibleDayResourcesModel = {
            _id: generateCustomID(),
            url: '',
            title: '',
            description: '',
            language: '',
            type,
            updateDate: new Date(),
            createDate: new Date(),
        };

        const dayToUpdate = bibleDays.find(day => day._id === dayId);
        if (dayToUpdate) {
            dayToUpdate.resources.unshift(newResource);
        }

        setBibleDays(bibleDays.map(day => day._id === dayId && dayToUpdate ? dayToUpdate : day));
        // setResourceInputs( );
    };

    const toggleEditMode = (id: string) => {
        setEditMode(editMode === id ? null : id);
        if (editMode !== id) {
            const dayToEdit = bibleDays.find(day => day._id === id);
            if (dayToEdit) {
                setEditableFields({title: dayToEdit.title, description: dayToEdit.description});
            }
        }
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setEditableFields({...editableFields, [field]: e.target.value});
    };

    const handleEditSubmit = async (id: string) => {
        setLoading(true);
        // Here you would typically send the update to your backend
        const dayToUpdate = bibleDays.find(day => day._id === id);
        const data: BibleDayModel = {
            ...(dayToUpdate || {}),
            ...editableFields,
        } as any;

        dayToUpdate && await onDaySubmit({
            ...data,
            resources: data.resources.map(resource => ({...resource, _id: undefined})),
        })
        toggleEditMode(id); // Exit edit mode
        setLoading(false);
    };

    const handleInputChange = (day: BibleDayModel) => (e: React.ChangeEvent<HTMLInputElement>, resourceId: string) => {
        const {name, value} = e.target;
        const dayToUpdate = bibleDays.find(d => d._id === day._id);
        if (!dayToUpdate) return;

        const updatedResources = dayToUpdate?.resources?.map(resource => resource._id === resourceId ? {
            ...resource,
            [name]: value
        } : resource);
        setBibleDays(bibleDays.map(d => d._id === day._id ? {
            ...dayToUpdate,
            resources: updatedResources || []
        } : d));

    };

    const handleDeleteResource = (resourceId: string) => {
        handleSetActionToConfirm('delete-resource', resourceId);

    };

    const handleUpdateMedia = async (dayToBeUpdate: BibleDayModel, resourceType: UploableDayResourceTypes, event: React.ChangeEvent<HTMLInputElement>) => {

        if (resourceType && !AvailableSourceTypes.includes(resourceType)) {
            toast('Invalid resource type');
            return;
        }

        const file = event.target.files && event.target.files[0];
        const mediaType: IMediaTagTypes = resourceType.includes('image') ? 'image' : 'audio';
        const tag: IMediaTagTypes = mediaType;
        if (file && dayToBeUpdate) {
            await onChangeMediaFile(
                dayToBeUpdate, tag, event, async (media: IMedia) => {
                    setBibleDays(bibleDays.map(day => day._id === dayToBeUpdate._id ? {
                        ...dayToBeUpdate,
                        resources: dayToBeUpdate.resources.map(resource => resource.type === resourceType ? {
                            ...resource,
                            url: media.content
                        } : resource)
                    } : day));
                });
        } else {
            toast('No file selected');
        }
    }

    const onChangeMediaFile = async (data: BibleDayModel, resourceType: IMediaTagTypes, event: any, onLoadedMedia?: (media: IMedia) => Promise<void>) => {
        // const companyIdString = companies.find(company => company.companyId === companyId)?._id;
        const tag: IMediaTagTypes = resourceType as IMediaTagTypes;

        const uploadCallBack = async (media: IMedia) => {
            // const companyToUpdate = isEditing[companyIdString];
            if (data) {
                const resource = data.resources.find(resource => resource.type === resourceType);
                const mediaToDelete = resource?.url?.split('/')?.pop() as string;
                mediaToDelete && await deletePhoto(mediaToDelete);
                onLoadedMedia && await onLoadedMedia(media);
                toast(`${tag} actualizado con exito`)
            }

        };

        await onChangeMediaToUpload(tag, uploadCallBack, `${(data._id || generateCustomID())}-bible-${tag}`)(event)
    }

    const addNewDay = async (data: BibleDayModel) => {
        setLoading(true)
        const position = bibleDays.length + 1;
        const newDay = {
            ...data,
            position,
            title: `Día ${position}`,
        }
        await onDaySubmit(newDay);
        // TODO: check if use it or not
        // setBibleDays([...bibleDays, newDay]);
        setLoading(false)
    }

    return (
        <div className="bible-days">
            {!loading ? null : (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}
            <FormGroup>
                <Input type="text" placeholder="Search" value={searchTerm} onChange={handleSearch}/>
            </FormGroup>
            <Row className="bible-days-grid" lg="12">
                <CreateDayCard onSubmit={addNewDay} position={bibleDays.length + 1}
                               uploadResourceFile={onChangeMediaFile}/>
                {bibleDays
                    .filter(day => day.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((day) => (
                        <Col key={day._id} className="mb-4 ">
                            <Card className="bible-days-grid__item">
                                <CardBody>
                                    <div className="bible-days-grid__item-actions-top mb-2">
                                        <b>{day.title}</b>
                                    </div>
                                    {editMode === day._id ? (
                                        <>
                                            {/*<div className="bible-days-grid__item-actions-top">*/}
                                            {/*    <Input type="text" value={editableFields.title}*/}
                                            {/*           onChange={(e) => handleFieldChange(e, 'title')}*/}
                                            {/*           placeholder="Title"/>*/}
                                            {/*</div>*/}
                                            <Input type="text" value={editableFields.description}
                                                   onChange={(e) => handleFieldChange(e, 'description')}
                                                   placeholder="Description"/>
                                        </>
                                    ) : (
                                        <>
                                            <i>{day.description}</i>
                                        </>
                                    )}
                                    {
                                        editMode === day._id && (
                                            <Input color="primary" outline
                                                   type="select"
                                                   value=""
                                                   className="w-100 mt-3"
                                                   onChange={handleAddResource(day._id as string)}>
                                                <option value="" disabled>Add Resource</option>
                                                {
                                                    BibleDayResourceTypesList.filter(item => {
                                                        const currentResourcesTypes = day.resources.map(resource => resource.type);
                                                        return !currentResourcesTypes.includes(item);
                                                    }).filter(item => {
                                                        const currentResourcesTypes = day.resources.map(resource => resource.type);
                                                        return !currentResourcesTypes.includes(item);
                                                    }).map((type) => (
                                                        <option value={type}>{type}</option>
                                                    ))
                                                }
                                            </Input>
                                        )
                                    }
                                    {/* ResourceSection if needed */}
                                    <ResourceSection resources={day.resources}
                                                     day={day}
                                                     editMode={editMode === day._id}
                                                     handleInputChange={handleInputChange(day)}
                                                     handleDeleteResource={handleDeleteResource}
                                                     uploadResourceFile={handleUpdateMedia}
                                    />
                                    <div className="bible-days-grid__item-actions d-flex justify-content-between">
                                        {
                                            editMode === day._id ? (<>
                                                        <Button color="success" outline
                                                                onClick={() => handleEditSubmit(day._id as string)}>Save</Button>
                                                        <Button color="secondary" outline
                                                                onClick={() => toggleEditMode(day._id as string)}>Cancel</Button>
                                                    </>
                                                )
                                                : (
                                                    <>
                                                        <Button color="danger" outline
                                                                onClick={() => handleSetActionToConfirm('delete', day._id as string)}>Delete</Button>
                                                        <Button color="primary" outline
                                                                onClick={() => toggleEditMode(day._id as string)}>Edit</Button>
                                                    </>
                                                )
                                        }
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
            </Row>
            <ConfirmModal/>
        </div>
    );
};

export interface IResourceSectionProps {
    resources: BibleDayResourcesModel[];
    day: BibleDayModel;
    editMode: boolean,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, resourceId: string) => void
    handleDeleteResource: (resourceId: string) => void,
    uploadResourceFile: (data: BibleDayModel, resourceType: UploableDayResourceTypes, event: any, onLoadedMedia?: (media: IMedia) => Promise<void>) => void;
}

const ResourceSection: React.FC<IResourceSectionProps> = (
    {
        resources,
        day,
        editMode,
        handleInputChange,
        handleDeleteResource,
        uploadResourceFile,
    }) => {

    const handleUploadFile = (type: UploableDayResourceTypes) => (event: any) => {
        console.log('type => ', type)

        if (type && !AvailableSourceTypes.includes(type)) {
            toast('Invalid resource type');
            return;
        } else {
            uploadResourceFile(day, type, event);
        }
    }

    return (
        <div className="bible-days-resource-section">

            {resources.map((resource) => (
                <div key={resource._id} className="resource-item">
                    <FormGroup
                        className="resource-item__form-group"
                    >
                        <Label for={`file-${resource._id}`} className="cursor-pointer">
                            <CardImg src={getThumbnail(resource)} className="resource-item__thumbnail"
                                     alt={resource.title}/>
                        </Label>
                        <Input placeholder="file" id={`file-${resource._id}`} type="file"
                               className="invisible position-absolute z-index-0"
                               onChange={handleUploadFile(resource.type as UploableDayResourceTypes)}
                        />
                    </FormGroup>

                    <div className="d-flex gap-2 align-items-center w-100">
                        <div className="d-flex flex-column justify-content-center w-100">
                            <FormGroup className="resource-item__form-group">
                                <Input type="text" className="resource-item__input" placeholder="Resource Title"
                                       name="title"
                                       value={resource.title}
                                       onChange={(e) => handleInputChange(e, resource._id as string)}
                                       disabled={!editMode}/>
                            </FormGroup>
                            <FormGroup className="resource-item__form-group">
                                <Input type="text" className="resource-item__input" placeholder="Resource Description"
                                       value={resource.description}
                                       onChange={(e) => handleInputChange(e, resource._id as string)}
                                       name="description"
                                       disabled={!editMode}/>
                            </FormGroup>
                            <FormGroup className="resource-item__form-group">
                                <Input type="text" className="resource-item__input" placeholder="Url"
                                       value={resource.url}
                                       name="url"
                                       onChange={(e) => handleInputChange(e, resource._id as string)}
                                       disabled={!editMode}/>
                            </FormGroup>
                        </div>
                        {editMode &&
                            <Button color="danger" className="ml-2" outline
                                    onClick={() => handleDeleteResource(resource._id as string)}>
                                <i className="bi bi-trash font-size-sm"/>
                            </Button>}
                    </div>
                </div>
            ))}
        </div>
    );
};


const CreateDayCard: React.FC<{
    onSubmit: (data: BibleDayModel) => void;
    position: number;
    uploadResourceFile: (data: BibleDayModel, resourceType: IMediaTagTypes, event: any, onLoadedMedia?: (media: IMedia) => Promise<void>) => void;
}> = ({
          uploadResourceFile,
          position,
          onSubmit
      }) => {
    const [newDayData, setNewDayData] = useState<BibleDayModel>({
        position: 1,
        resources: [],
        updateDate: new Date(),
        createDate: new Date(),
        title: '',
        description: '',
    });

    const [resourceInputs, setResourceInputs] = useState<BibleDayResourcesModel[]>([
        {
            _id: generateCustomID(), // Generate a unique ID for the initial resource
            url: '',
            title: '',
            description: '',
            language: '',
            type: 'image',
            updateDate: new Date(),
            createDate: new Date(),
        },
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setNewDayData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleResourceInputChange = (e: React.ChangeEvent<HTMLInputElement>, resourceId: string) => {
        const {name, value} = e.target;
        const updatedResources = resourceInputs.map((resource) =>
            resource._id === resourceId ? {...resource, [name]: value} : resource
        );
        setResourceInputs(updatedResources);
    };

    const handleAddResource = ({target: {value: type}}: any) => {
        const newResource = {
            _id: generateCustomID(), // Generate a unique ID for the new resource
            url: '',
            title: '',
            description: '',
            language: '',
            type,
            updateDate: new Date(),
            createDate: new Date(),
        };
        setResourceInputs([newResource, ...resourceInputs]);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({
            ...newDayData,
            resources: resourceInputs.map((resource) => ({...resource, _id: undefined})),
        });
    };

    const handleUploadFile = (type: UploableDayResourceTypes) => (event: any) => {
        const resourceType: IMediaTagTypes = type.includes('image') ? 'image' : 'audio';

        uploadResourceFile(newDayData, resourceType, event,
            async (media: IMedia) => {
                const newData = {...newDayData};
                newData.resources = newData.resources.map(resource => resource.type === type ? {
                    ...resource,
                    url: media.content
                } : resource);
                setNewDayData({...newData});
                setResourceInputs(newData.resources);
            });
    }

    const handleDeleteResource = (resourceId: string) => () => {
        setResourceInputs((prevResources) => prevResources.filter((resource) => resource._id !== resourceId));
    }

    React.useEffect(() => {
        setNewDayData({
            ...newDayData,
            resources: resourceInputs,
        });
    }, [resourceInputs]);

    return (
        <Col>
            <Card className="bible-days-grid__item">

                <CardBody>
                    <div className="bible-days-grid__item-actions-top">
                        {/*<FormGroup>*/}
                        {/*    <Label for="title">*/}
                        <b>
                            Día {position}
                        </b>
                        {/*</Label>*/}
                        {/*<Input type="text" name="title" id="title" value={formData.title}*/}
                        {/*       onChange={handleInputChange}/>*/}
                        {/*</FormGroup>*/}
                    </div>
                    <form onSubmit={handleSubmit}>
                        {/*<FormGroup>*/}
                        {/*    <Label for="title"><b>*/}
                        {/*        Día {position}*/}
                        {/*    </b></Label>*/}
                        {/*    /!*<Input type="text" name="title" id="title" value={formData.title}*!/*/}
                        {/*    /!*       onChange={handleInputChange}/>*!/*/}
                        {/*</FormGroup>*/}
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <Input type="text" name="description" id="description" value={newDayData.description}
                                   onChange={handleInputChange}/>
                        </FormGroup>
                        <Input color="primary" outline
                               type="select"
                               value=""
                               className="w-100 mt-3"
                               onChange={handleAddResource}>
                            <option value="" disabled>Add Resource</option>
                            {
                                BibleDayResourceTypesList
                                    .filter(item => {
                                        const currentResourcesTypes = resourceInputs.map(resource => resource.type);
                                        return !currentResourcesTypes.includes(item);
                                    }).map((type) => (
                                    <option value={type}>{type}</option>
                                ))
                            }
                        </Input>
                        <FormGroup className="bible-days-resource-section">
                            <Label>Resources</Label>
                            {resourceInputs.map((resource) => (
                                <div key={resource._id} className="resource-item">
                                    <FormGroup
                                        className="resource-item__form-group"
                                    >
                                        <Label for="file">
                                            <CardImg src={getThumbnail(resource as BibleDayResourcesModel)}
                                                     className="resource-item__thumbnail"
                                                     alt={resource.title}/>
                                        </Label>
                                        <Input
                                            onChange={handleUploadFile(resource.type as UploableDayResourceTypes)}
                                            placeholder="file" id="file" type="file"
                                            name={resource._id}
                                            className="invisible position-absolute"
                                        />
                                    </FormGroup>
                                    <div className="d-flex flex-column justify-content-center">
                                        <FormGroup
                                            className="resource-item__form-group"

                                        >
                                            <Input type="text"
                                                   placeholder="title"
                                                   className="resource-item__input"
                                                   value={resource.title}
                                                   name="title"
                                                   onChange={(e) => handleResourceInputChange(e, resource._id as string)}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            className="resource-item__form-group"
                                        >
                                            <Input type="text" placeholder="description"
                                                   className="resource-item__input"
                                                   value={resource.description}
                                                   name="description"
                                                   onChange={(e) => handleResourceInputChange(e, resource._id as string)}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            className="resource-item__form-group"
                                        >
                                            <Input type="text" placeholder="url"
                                                   className="resource-item__input"
                                                   value={resource.url}
                                                   name="url"
                                                   onChange={(e) => handleResourceInputChange(e, resource._id as string)}
                                            />
                                        </FormGroup>
                                    </div>
                                    <Button color="danger" className="ml-2" outline
                                            onClick={handleDeleteResource(resource._id as string)}>
                                        <i className="bi bi-trash font-size-sm"/>
                                    </Button>
                                </div>
                            ))}
                        </FormGroup>
                        <div className="bible-days-grid__item-actions">
                            <Button type="submit" color="primary">Agregar Dia</Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </Col>
    );
};


const getThumbnail = (resource: BibleDayResourcesModel) => {
    const {type, url} = resource;
    switch (type) {
        case "audio":
        case "audio-2":
        case "audio-3":
            return "https://cdn4.iconfinder.com/data/icons/web-ui-color/128/Audio-512.png"
        case "audio-lecture":
        case "audio-lecture-2":
        case "audio-lecture-3":
            return "https://t3.ftcdn.net/jpg/04/75/89/42/360_F_475894261_y9xHE0K72sCwiszwg3GXXuoOlieYNTac.jpg"
        case "video":
        case "video-2":
        case "video-3":
            return "https://www.freeiconspng.com/thumbs/video-icon/video-icon-1.png";
        case "lecture":
        case "lecture-2":
        case "lecture-3":
            return "https://cdn-icons-png.freepik.com/512/2702/2702154.png";
        case "image":
        case "image-2":
        case "image-3":
            return url;
        default:
            return "https://media.istockphoto.com/id/1322123064/photo/portrait-of-an-adorable-white-cat-in-sunglasses-and-an-shirt-lies-on-a-fabric-hammock.jpg?s=612x612&w=0&k=20&c=-G6l2c4jNI0y4cenh-t3qxvIQzVCOqOYZNvrRA7ZU5o=";
    }
};

export default BibleDaysGrid;
