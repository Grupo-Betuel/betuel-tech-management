import React, {useState} from 'react';
import {Button, Form, FormGroup, Input, Label} from 'reactstrap';
import {BibleGroupModel} from "../../../model/interfaces/BibleModel";
import useWhatsapp from "../../../components/hooks/UseWhatsapp";
import {IWsGroup, whatsappSessionKeys} from "../../../model/interfaces/WhatsappModels";
import {toast} from "react-toastify";
import {BibleAssistantActionTypes} from "../BibleAssistant";
import {useConfirmAction} from "../../../components/hooks/confirmActionHook";

interface BibleGroupFormProps {
    initialData?: BibleGroupModel; // Optional initial data for update mode
    groups: BibleGroupModel[];
    onSubmit: (formData: BibleGroupModel) => void; // Function to handle form submission
}

const BibleGroupForm: React.FC<BibleGroupFormProps> = ({initialData, onSubmit, groups}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<BibleGroupModel>(
        initialData || {
            title: '',
            description: '',
            startDate: new Date(),
            whatsappGroupID: '',
            type: '',
            users: [],
        }
    );
    const [selectedWsGroup, setSelectedWsGroup] = useState<IWsGroup>();

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
            startDate: new Date(formData.startDate),
            users: (selectedWsGroup?.participants || []) as any,
        });
    };

    const {
        fetchWsSeedData,
        seedData: {groups: wsGroups},
        logged: wsIsLogged
    } = useWhatsapp(whatsappSessionKeys.wpadilla);


    const selectableGroups = React.useMemo(() => {
        return wsGroups.filter(group => !groups.find(g => g.whatsappGroupID === group.id))
    }, [groups, wsGroups]);

    console.log(wsGroups, 'wsGroups');


    const handleConfirmedAction = async (actionToConfirm?: BibleAssistantActionTypes, data?: any) => {
        setLoading(true);
        switch (actionToConfirm) {
            case 'sync-ws-groups':
                await fetchWsSeedData(whatsappSessionKeys.wpadilla, 'groups')
                toast('¡Datos Actualizados!', {type: 'success'});
                break;
        }
        setLoading(false);

    }

    const handleDeniedAction = () => {

    }
    const {
        handleSetActionToConfirm,
        resetActionToConfirm,
        ConfirmModal,
    } = useConfirmAction<BibleAssistantActionTypes, any>(handleConfirmedAction, handleDeniedAction)


    const onSelectGroup = ({ target: { value: groupId }}: React.ChangeEvent<HTMLInputElement>) => {
        const group = wsGroups.find((group) => group.id === groupId);

        setFormData((prevData) => ({
            ...prevData,
            whatsappGroupID: groupId,
            description: group?.description || '',
            title: group?.subject || '',
        }));

        setSelectedWsGroup(group);
    }


    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup className="d-flex align-items-end gap-2">
                <div className="w-100">
                    <Label for="whatsappGroupID">WhatsApp Group ID</Label>
                    <Input
                        className="w-100"
                        type="select"
                        name="whatsappGroupID"
                        id="whatsappGroupID"
                        value={selectedWsGroup?.id || ''}
                        onChange={onSelectGroup}
                        placeholder="Enter WhatsApp Group ID"
                    >
                        <option value="">Select Group</option>
                        {selectableGroups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.subject}
                            </option>
                        ))}
                    </Input>
                </div>
                <Button outline color="info" onClick={() => handleSetActionToConfirm('sync-ws-groups')}>
                    <i className="bi bi-arrow-clockwise" />
                </Button>
            </FormGroup>
            <FormGroup>
                <Label for="title">Title</Label>
                <Input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={!!selectedWsGroup}
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
                    disabled={!!selectedWsGroup}
                    placeholder="Enter description"
                />
            </FormGroup>
            <FormGroup>
                <Label for="startDate">Start Date</Label>
                <Input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={new Date(formData.startDate).toISOString().split('T')[0]}
                    onChange={handleChange}
                />
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
            <ConfirmModal/>
        </Form>
    );
};

export default BibleGroupForm;
