import React from "react";
import {CardBody, FormGroup, Label, Input} from "reactstrap";

// Constants for selectors
import {
    BibleDayResourceTypesList,
    BibleStudyActionsModel,
    bibleStudyActionTypesList
} from "../../../models/interfaces/BibleModel";

export interface IActionFormProps {
    action: BibleStudyActionsModel;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ActionForm = ({action, onChange}: IActionFormProps) => {
    return (
        <CardBody>
            <FormGroup>
                <Label for={`hour_${action._id}`}>Hour:</Label>
                <Input type="select" name="hour" id={`hour_${action._id}`} value={action.hour} onChange={onChange}>
                    {[...Array(24)].map((_, i) => (
                        <option key={i} value={i}>{i}</option>
                    ))}
                </Input>
            </FormGroup>
            <FormGroup>
                <Label for={`minute_${action._id}`}>Minute:</Label>
                <Input type="select" name="minute" id={`minute_${action._id}`} value={action.minute}
                       onChange={onChange}>
                    {[...Array(60)].map((_, i) => (
                        <option key={i} value={i}>{i}</option>
                    ))}
                </Input>
            </FormGroup>
            <FormGroup>
                <Label for={`day_${action._id}`}>Day:</Label>
                <Input type="select" name="day" id={`day_${action._id}`} value={action.day}
                       onChange={onChange}>
                    <option value="">Select Day</option>
                    {[...Array(7)].map((_, i) => (
                        <option key={i} value={i}>{i}</option>
                    ))}
                </Input>
            </FormGroup>
            <FormGroup>
                <Label for={`date_${action._id}`}>Date:</Label>
                <Input type="date" name="date" id={`date_${action._id}`} value={action.date ? new Date(action.date).toISOString().split('T')[0] : ''} onChange={onChange}/>
            </FormGroup>
            <FormGroup>
                <Label for={`type_${action._id}`}>Action Type:</Label>
                <Input type="select" name="type" id={`type_${action._id}`} value={action.type} onChange={onChange}>
                    {bibleStudyActionTypesList.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                    ))}
                </Input>
            </FormGroup>
            <FormGroup>
                <Label for={`resourceType_${action._id}`}>Resource Type:</Label>
                <Input type="select" name="resourceType" id={`resourceType_${action._id}`} value={action.resourceType}
                       onChange={onChange}>
                    {BibleDayResourceTypesList.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Input>
            </FormGroup>
            <FormGroup switch>
                <Label for={`pinMessage_${action._id}`}>Pin Message</Label>
                <Input type="switch" name="pinMessage" id={`pinMessage_${action._id}`} checked={!!action.pinMessage}
                       onChange={onChange} />
            </FormGroup>
        </CardBody>
    );
};

export default ActionForm;
