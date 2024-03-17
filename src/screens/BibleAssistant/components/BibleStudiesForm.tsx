import React, {useState} from 'react';
import {Button, Form, FormGroup, Input, Label} from 'reactstrap';
import {bibleStudyInteractionModeList, BibleStudyModel} from "../../../model/interfaces/BibleModel";
interface BibleStudyFormProps {
    onSubmit: (formData: BibleStudyModel) => void; // Function to handle form submission
    study?: BibleStudyModel; // Optional study to edit
}

const BibleStudyForm: React.FC<BibleStudyFormProps> = ({onSubmit, study}) => {
    const [formData, setFormData] = useState<BibleStudyModel>(
        {
            ...study,
            title: '',
            description: '',
            interactionMode: 'daily',
            groups: [],
            days: [],
            actions: [],
        }
    );

    React.useEffect(() => {
        if (study) {
            setFormData(study);
        }
    }, [study]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({
            ...formData,
        });
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
                <Label for="interactionMode">Type</Label>
                <Input
                    type="select"
                    name="interactionMode"
                    id="interactionMode"
                    value={formData.interactionMode}
                    onChange={handleChange}
                >
                    <option value="Type2">Modo de interaccion</option>
                    {bibleStudyInteractionModeList.map((mode) => (
                        <option key={mode} value={mode}>{mode}</option>
                    ))}
                </Input>
            </FormGroup>
            <Button type="submit" color="primary">
                Submit
            </Button>
        </Form>
    );
};

export default BibleStudyForm;
