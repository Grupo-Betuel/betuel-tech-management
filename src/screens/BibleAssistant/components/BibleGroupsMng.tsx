import React, { useState } from 'react';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import {BibleGroups} from "../../../model/interfaces/BibleModel";

interface BibleGroupFormProps {
    initialData?: BibleGroups; // Optional initial data for update mode
    onSubmit: (formData: BibleGroups) => void; // Function to handle form submission
}

const BibleGroupForm: React.FC<BibleGroupFormProps> = ({ initialData, onSubmit }) => {
    const [formData, setFormData] = useState<BibleGroups>(
        initialData || {
            title: '',
            description: '',
            startDate: new Date(),
            whatsappGroupID: '',
            type: '',
            users: [],
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label for="title">Title</Label>
                <Input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter title"
                />
            </FormGroup>
            <FormGroup>
                <Label for="description">Description</Label>
                <Input
                    type="textarea"
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                />
            </FormGroup>
            <FormGroup>
                <Label for="startDate">Start Date</Label>
                <Input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate.toISOString().split('T')[0]}
                    onChange={handleChange}
                />
            </FormGroup>
            <FormGroup>
                <Label for="whatsappGroupID">WhatsApp Group ID</Label>
                <Input
                    type="select"
                    name="whatsappGroupID"
                    id="whatsappGroupID"
                    value={formData.whatsappGroupID}
                    onChange={handleChange}
                    placeholder="Enter WhatsApp Group ID"
                >
                    <option value="">Select Group</option>
                </Input>
            </FormGroup>
            {/*<FormGroup>*/}
            {/*    <Label for="type">Type</Label>*/}
            {/*    <Input*/}
            {/*        type="select"*/}
            {/*        name="type"*/}
            {/*        id="type"*/}
            {/*        value={formData.type}*/}
            {/*        onChange={handleChange}*/}
            {/*    >*/}
            {/*        <option value="">Select type</option>*/}
            {/*        <option value="Type1">Type1</option>*/}
            {/*        <option value="Type2">Type2</option>*/}
            {/*        /!* Add more options as needed *!/*/}
            {/*    </Input>*/}
            {/*</FormGroup>*/}
            <Button type="submit" color="primary">
                Submit
            </Button>
        </Form>
    );
};

export default BibleGroupForm;
