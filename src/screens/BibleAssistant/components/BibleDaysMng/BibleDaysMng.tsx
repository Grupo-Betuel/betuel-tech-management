import React, { useState } from 'react';
import { Card, CardBody, CardTitle, CardText, CardImg, Button, Input, FormGroup, Label, Col, Row, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {BibleDays, BibleDayResources} from "../../../../model/interfaces/BibleModel";

interface BibleDaysGridProps {
    bibleDays: BibleDays[];
}

const BibleDaysGrid: React.FC<BibleDaysGridProps> = ({ bibleDays }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editFormVisible, setEditFormVisible] = useState<number | null>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const toggleEditForm = (index: number) => {
        setEditFormVisible(editFormVisible === index ? null : index);
    };

    const toggleDeleteModal = (index: number) => {
        setDeleteModalVisible(deleteModalVisible === index ? null : index);
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>, index: number) => {
        e.preventDefault();
        console.log('Updated data for BibleDay at index:', index);
        // Toggle visibility of edit form
        toggleEditForm(index);
    };

    const handleDeleteConfirm = (index: number) => {
        console.log('Deleted BibleDay at index:', index);
        // Hide delete modal
        toggleDeleteModal(null);
    };

    const handleDeleteResource = (index: number, resourceIndex: number) => {
        console.log(`Deleted resource ${resourceIndex} of BibleDay at index ${index}`);
    };

    return (
        <div>
            <FormGroup>
                <Input type="text" placeholder="Search" value={searchTerm} onChange={handleSearch} />
            </FormGroup>
            <CreateDayCard onDeleteResource={handleDeleteResource} />
            <Row xs="1" md="2" lg="3">
                {bibleDays
                    .filter(day => day.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((day, index) => (
                        <Col key={index} className="mb-4">
                            <Card>
                                <CardBody>
                                    <CardTitle>{day.title}</CardTitle>
                                    <CardText>{day.description}</CardText>
                                    <CardText>{day.url}</CardText>
                                    <Button color="danger" onClick={() => toggleDeleteModal(index)}>Delete</Button>
                                    <Button color="primary" onClick={() => toggleEditForm(index)}>{editFormVisible === index ? 'Cancel Update' : 'Edit'}</Button>
                                    {editFormVisible === index ? <EditDayForm day={day} onSubmit={(e) => handleEditSubmit(e, index)} /> : null}
                                    <ResourceSection resources={day.resources} index={index} />
                                </CardBody>
                            </Card>
                            <Modal isOpen={deleteModalVisible === index} toggle={() => toggleDeleteModal(index)}>
                                <ModalHeader toggle={() => toggleDeleteModal(index)}>Confirm Delete</ModalHeader>
                                <ModalBody>Are you sure you want to delete this Bible Day?</ModalBody>
                                <ModalFooter>
                                    <Button color="danger" onClick={() => handleDeleteConfirm(index)}>Delete</Button>{' '}
                                    <Button color="secondary" onClick={() => toggleDeleteModal(index)}>Cancel</Button>
                                </ModalFooter>
                            </Modal>
                        </Col>
                    ))}
            </Row>
        </div>
    );
};

const ResourceSection: React.FC<{ resources: BibleDayResources[]; index: number; }> = ({ resources, index }) => {
    const [editMode, setEditMode] = useState(false);
    const [resourceInputs, setResourceInputs] = useState<BibleDayResources[]>(resources);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, resourceIndex: number) => {
        const { name, value } = e.target;
        const updatedResources = [...resourceInputs];
        updatedResources[resourceIndex][name] = value;
        setResourceInputs(updatedResources);
    };

    const handleDeleteResource = (resourceIndex: number) => {
        setResourceInputs(prevResources => prevResources.filter((_, idx) => idx !== resourceIndex));
    };

    return (
        <div className="resource-section d-flex flex-wrap gap-2">
            <h6>Resources</h6>
            {resourceInputs.map((resource, resourceIndex) => (
                <div key={resourceIndex} className="resource-item d-flex align-items-center">
                    <CardImg src={getThumbnail(resource.type)} alt={resource.title} style={{ maxWidth: '100px' }} />
                    <div>
                        <FormGroup className="mb-0">
                            <Input type="text" placeholder="Resource Title" value={resource.title} onChange={(e) => handleInputChange(e, resourceIndex)} disabled={!editMode} />
                        </FormGroup>
                        <FormGroup className="mb-0">
                            <Input type="text" placeholder="Resource Description" value={resource.description} onChange={(e) => handleInputChange(e, resourceIndex)} disabled={!editMode} />
                        </FormGroup>
                        {editMode && <Button color="danger" className="ml-2" onClick={() => handleDeleteResource(resourceIndex)}>Remove Resource</Button>}
                    </div>
                </div>
            ))}
            <Button color="primary" className="ml-2" onClick={() => setEditMode(!editMode)}>{editMode ? 'Save' : 'Edit Resources'}</Button>
        </div>
    );
};

const CreateDayCard: React.FC<{ onDeleteResource: (index: number, resourceIndex: number) => void; }> = ({ onDeleteResource }) => {
    const [formData, setFormData] = useState<BibleDays>({
        position: 0,
        resources: [],
        updateDate: new Date(),
        createDate: new Date(),
        title: '',
        description: '',
        url: ''
    });

    const [resourceInputs, setResourceInputs] = useState<BibleDayResources[]>([{ url: '', title: '', description: '', language: '', type: 'image', updateDate: new Date(), createDate: new Date() }]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleResourceInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { name, value } = e.target;
        const updatedResources = [...resourceInputs];
        updatedResources[index][name] = value;
        setResourceInputs(updatedResources);
    };

    const handleAddResource = () => {
        setResourceInputs([...resourceInputs, { url: '', title: '', description: '', language: '', type: 'image', updateDate: new Date(), createDate: new Date() }]);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(formData); // Send formData to your backend for creation
    };

    return (
        <Col className="mb-4">
            <Card>
                <CardBody>
                    <form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="title">Title</Label>
                            <Input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <Input type="text" name="description" id="description" value={formData.description} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="url">URL</Label>
                            <Input type="text" name="url" id="url" value={formData.url} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Resources</Label>
                            {resourceInputs.map((resource, index) => (
                                <div key={index}>
                                    <FormGroup>
                                        <Label for={`resource-title-${index}`}>Title</Label>
                                        <Input type="text" name={`resource-title-${index}`} id={`resource-title-${index}`} value={resource.title} onChange={(e) => handleResourceInputChange(e, index)} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for={`resource-description-${index}`}>Description</Label>
                                        <Input type="text" name={`resource-description-${index}`} id={`resource-description-${index}`} value={resource.description} onChange={(e) => handleResourceInputChange(e, index)} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for={`resource-file-${index}`}>File</Label>
                                        <Input type="file" name={`resource-file-${index}`} id={`resource-file-${index}`} />
                                    </FormGroup>
                                </div>
                            ))}
                            <Button type="button" onClick={handleAddResource}>Add Resource</Button>
                        </FormGroup>
                        <Button type="submit" color="primary">Create Day</Button>
                    </form>
                </CardBody>
            </Card>
        </Col>
    );
};

const EditDayForm: React.FC<{ day: BibleDays; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }> = ({ day, onSubmit }) => {
    const [formData, setFormData] = useState<BibleDays>(day);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(formData); // Send updated formData to your backend
    };

    return (
        <Col className="mb-4">
            <Card>
                <CardBody>
                    <form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="title">Title</Label>
                            <Input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <Input type="text" name="description" id="description" value={formData.description} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="url">URL</Label>
                            <Input type="text" name="url" id="url" value={formData.url} onChange={handleInputChange} />
                        </FormGroup>
                        <Button type="submit" color="primary">Save</Button>
                    </form>
                </CardBody>
            </Card>
        </Col>
    );
};

const getThumbnail = (type: string) => {
    // Add logic to return the thumbnail URL based on the resource type
    return 'thumbnail-url';
};

export default BibleDaysGrid;
