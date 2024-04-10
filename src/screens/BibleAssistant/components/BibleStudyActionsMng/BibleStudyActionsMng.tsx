import React, {useState} from "react";
import {Card, CardBody, CardFooter, Button, Spinner} from "reactstrap";
import ActionForm from "../BibleStudyActionForm";
import {BibleStudyActionsModel, BibleStudyModel} from "../../../../model/interfaces/BibleModel";
import "./BibleStudyActions.scss";
import {BibleAssistantActionTypes} from "../../BibleAssistant";
import {whatsappSessionKeys} from "../../../../model/interfaces/WhatsappModels";
import {toast} from "react-toastify";
import {useConfirmAction} from "../../../../components/hooks/confirmActionHook";
import {CommonActionTypes} from "../../../../model/common";

export interface IBibleStudyActionsMngProps {
    onActionSubmit: (action: BibleStudyActionsModel) => void;
    onActionDelete: (id?: string) => void;
    study: BibleStudyModel;
}

export const BibleStudyActionsMng = ({onActionSubmit, study, onActionDelete}: IBibleStudyActionsMngProps) => {
    const [actions, setActions] = useState<BibleStudyActionsModel[]>(study.actions);
    const [newAction, setNewAction] = useState<BibleStudyActionsModel>({
        hour: 0,
        minute: 0,
        type: 'resource', // Default value
        resourceType: 'image' // Default value
    });
    const [loading, setLoading] = useState(false);


    React.useEffect(() => {
        setActions(study.actions);
    }, [study]);

    const handleConfirmedAction = async (actionToConfirm?: CommonActionTypes, data?: BibleStudyActionsModel | string) => {
        setLoading(true);
        switch (actionToConfirm) {
            case 'create':
            case 'update':
                onActionSubmit(data as BibleStudyActionsModel);
                toast('¡Datos Actualizados!', {type: 'success'});
                break;
            case 'delete':
                onActionDelete(data as string);
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
    } = useConfirmAction<CommonActionTypes, BibleStudyActionsModel | string>(handleConfirmedAction, handleDeniedAction)

    const handleChange = (e: any, id?: string) => {
        let {name, value, checked, type} = e.target;
        if (type === 'number') {
            value = parseInt(value);
        } else if (type === 'checkbox') {
            value = checked;
        }

        const updatedActions = actions.map(action => {
            if (action._id === id) {
                return {...action, [name]: value};
            }
            return action;
        });
        setActions(updatedActions);
    };

    const handleAddAction = async () => {
        setNewAction({
            hour: 0,
            minute: 0,
            day: 1,
            type: 'resource',
            resourceType: 'image'
        });
        handleSetActionToConfirm('create', {...newAction, _id: undefined});
    };

    const onChangeAction = ({target: { name, value, type, checked }}: any) => {
        if (type === 'number') {
            value = parseInt(value);
        } else if (type === 'checkbox') {
            value = checked;
        }
        setNewAction({
            ...newAction,
            [name]: value
        })
    }

    return (
        <div className="bible-study-actions">
            {!loading ? null : (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}
            <div className="bible-study-actions-grid">
                <Card className="bible-days-grid__item">
                    <CardBody>
                        <ActionForm action={newAction}
                                    onChange={onChangeAction}/>
                    </CardBody>
                    <CardFooter>
                        <Button color="primary" onClick={handleAddAction}>Add Action</Button>
                    </CardFooter>
                </Card>
                {actions.map(action => (
                    <Card key={action._id} className="bible-days-grid__item">
                        <CardBody>
                            <ActionForm action={action} onChange={(e) => handleChange(e, action._id)}/>
                        </CardBody>
                        <CardFooter className="d-flex justify-content-between">
                            <Button color="primary" onClick={() => handleSetActionToConfirm('update', action)}>Update</Button>
                            <Button color="danger" onClick={() => handleSetActionToConfirm('delete', action._id)}>Delete</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            <ConfirmModal />
        </div>
    );
};
