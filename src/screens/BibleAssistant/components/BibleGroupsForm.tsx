import React, {useMemo, useState} from 'react';
import {Button, Form, FormGroup, Input, Label, Spinner} from 'reactstrap';
import {BibleGroupModel, BibleUserModel} from "../../../models/interfaces/BibleModel";
import useWhatsapp from "../../../components/hooks/UseWhatsapp";
import {IWsGroup, whatsappSessionKeys} from "../../../models/interfaces/WhatsappModels";
import {toast} from "react-toastify";
import {BibleAssistantActionTypes} from "../BibleAssistant";
import {useConfirmAction} from "../../../components/hooks/confirmActionHook";
import {initial} from "lodash";

interface BibleGroupFormProps {
    editableGroup?: BibleGroupModel; // Optional initial data for update mode
    groups: BibleGroupModel[];
    onSubmit: (formData: BibleGroupModel) => void; // Function to handle form submission
}

const BibleGroupForm: React.FC<BibleGroupFormProps> = ({editableGroup, onSubmit, groups}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<BibleGroupModel>(
        editableGroup || {
            title: '',
            description: '',
            startDate: new Date(),
            whatsappGroupID: '',
            type: '',
            dueDaysLimit: 7,
        } as BibleGroupModel,
    );

    React.useEffect(() => {
        if (editableGroup) {
            setFormData(editableGroup);
        }
    }, [editableGroup]);

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
        const data = {
            ...formData,
            startDate: new Date(formData.startDate),
            users: editableGroup ? formData.users : (selectedWsGroup?.participants || []) as any,
        };
        // console.log('data =>', data)
        onSubmit(data);
    };

    const {
        fetchWsSeedData,
        seedData: {groups: wsGroups},
        logged: wsIsLogged,
        fetchGroupParticipants,
        loading: wsLoading,
    } = useWhatsapp(whatsappSessionKeys.bibleAssistant);


    React.useEffect(() => {
        setSelectedWsGroup(wsGroups?.find(group => group.id === formData.whatsappGroupID));
    }, [wsGroups])


    const selectableGroups = React.useMemo(() => {
        return wsGroups?.filter(group => !groups.find(g => g.whatsappGroupID === group.id)) || [];
    }, [groups, wsGroups]);


    const handleConfirmedAction = async (actionToConfirm?: BibleAssistantActionTypes, data?: any) => {
        setLoading(true);
        switch (actionToConfirm) {
            case 'sync-ws-groups':
                await fetchWsSeedData(whatsappSessionKeys.bibleAssistant, 'groups')
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


    const onSelectGroup = async ({target: {value: groupId}}: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        const group = wsGroups.find((group) => group.id === groupId);
        const participants = await fetchGroupParticipants(groupId);
        if (group) {
            group.participants = participants;
        }

        setFormData((prevData) => ({
            ...prevData,
            users: participants as BibleUserModel[],
            whatsappGroupID: groupId,
            description: group?.description || '',
            title: group?.title || '',
        }));
        setSelectedWsGroup(group);
        setLoading(false);
    }

    const disableGroupInfoEdition = useMemo(() => (!!selectedWsGroup || !!editableGroup?.whatsappGroupID), [selectedWsGroup, editableGroup])

    return (

        <Form onSubmit={handleSubmit}>
            {!loading && !wsLoading ? null : (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}
            <FormGroup className="d-flex align-items-end gap-2">
                <div className="w-100">
                    <Label for="whatsappGroupID">WhatsApp Group ID</Label>
                    <Input
                        className="w-100"
                        type="select"
                        name="whatsappGroupID"
                        id="whatsappGroupID"
                        value={selectedWsGroup?.id || ''}
                        disabled={disableGroupInfoEdition}
                        onChange={onSelectGroup}
                        placeholder="Enter WhatsApp Group ID"
                    >
                        <option value="">Select Group</option>
                        {selectableGroups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.title}
                            </option>
                        ))}
                    </Input>
                </div>
                <Button outline color="info" onClick={() => handleSetActionToConfirm('sync-ws-groups')}>
                    <i className="bi bi-arrow-clockwise"/>
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
                    disabled={disableGroupInfoEdition}
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
                    disabled={disableGroupInfoEdition}
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
            <FormGroup>
                <Label for="dueDays">Maximo Retraso</Label>
                <div className="d-flex justify-content-between gap-4 align-items-center">
                    <Input
                        type="number"
                        name="dueDays"
                        id="dueDays"
                        value={formData.dueDaysLimit}
                        onChange={handleChange}
                    />
                    <span>Días</span>
                </div>
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
