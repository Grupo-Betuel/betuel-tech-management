import React, {useState} from 'react';
import {Button, Form, FormGroup, Input, Label, Spinner} from 'reactstrap';
import {IWsGroup} from "../../../models/interfaces/WhatsappModels";
import {BibleUserModel} from "../../../models/interfaces/BibleModel";

interface BibleUserFormProps {
    bibleUser: BibleUserModel; // Optional initial data for update mode
    onSubmit: (formData: BibleUserModel) => void; // Function to handle form submission
}

const BibleUserForm: React.FC<BibleUserFormProps> = ({bibleUser, onSubmit}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<BibleUserModel>(bibleUser);

    React.useEffect(() => {
        if (bibleUser) {
            setFormData(bibleUser);
        }
    }, [bibleUser]);

    const [selectedWsGroup, setSelectedWsGroup] = useState<IWsGroup>();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = {
            ...formData,
        };
        setLoading(true);
        await onSubmit(data);
        setLoading(false);
    };

    return (

        <Form onSubmit={handleSubmit}>
            {!loading ? null : (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}
            <FormGroup>
                <Label for="firstName">Nombre</Label>
                <Input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter FirstName"
                />
            </FormGroup>
            <FormGroup>
                <Label for="lastName">Apellido</Label>
                <Input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter FirstName"
                />
            </FormGroup>
            <Button type="submit" color="primary">
                Submit
            </Button>
        </Form>
    );
};

export default BibleUserForm;
