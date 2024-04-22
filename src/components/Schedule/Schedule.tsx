import {Button, FormGroup, Input} from "reactstrap";
import React from "react";
import {ILaborDay, ILaborDayData, LaborDayTypes} from "../../models/interfaces/LaborDayModel";
import {getLaborDays, updateLaborDays} from "../../services/laborDaysService";
import {toast} from "react-toastify";
import "./Schedule.scss"

export const Schedule = () => {
    const [laborDays, setLaborDays] = React.useState<ILaborDay[]>([]);
    const [oldLaborDays, setOldLaborDays] = React.useState<ILaborDay[]>([]);

    React.useEffect(() => {
        handleGetLaborDays();
    }, []);

    const handleGetLaborDays = async () => {
        const laborDays = await getLaborDays();
        setLaborDays(laborDays);
        setOldLaborDays(laborDays);
    }


    const laborDaysData = React.useMemo(() => {
        const data: ILaborDayData = {} as ILaborDayData;

        laborDays.forEach((laborDay) => {
            data[laborDay.day] = laborDay
        });

        return data;
    }, [laborDays]);

    const onSaveSchedule = () => {
        Promise.all(Object.keys(laborDaysData).map(async (day: LaborDayTypes | any) => {
            const laborDay = laborDaysData[day as LaborDayTypes];
            const oldLaborDay = JSON.stringify(oldLaborDays.find((oldLaborDay) => oldLaborDay.day === Number(day)) || '{}');

            if (oldLaborDay !== JSON.stringify(laborDay)) {
                await updateLaborDays(JSON.stringify(laborDay));
            }
        })).then(() => {
            toast('Horario guardado con éxito', {type: 'success'});
        });
    }
    const onChangeLaborDay = (day: LaborDayTypes) => ({target: {value, name, type, checked}}: any) => {
        if (type === 'checkbox') {
            value = checked
        }
        setLaborDays(laborDays.map((laborDay) => {
            if (laborDay.day === day) {
                return {
                    ...laborDay,
                    [name]: value
                }
            }

            return laborDay;
        }));
    }


    return (
        <div className="d-flex flex-column gap-4">
            <div className="schedule-grid">
                {laborDays.map(laborDay =>
                    <div key={laborDay.name} className="d-flex flex-column gap-1 align-items-center schedule-grid-item">
                        <div className="d-flex align-items-center gap-2">
                            <h4>{laborDay.name}</h4>
                            <FormGroup switch={true} className="m-0">
                                <Input type="switch" checked={laborDay.available}
                                       name="available" id="available"
                                       label="Disponible" onChange={onChangeLaborDay(laborDay.day)}
                                       role="switch"/>
                            </FormGroup>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <div className="d-flex flex-column gap-2 align-items-center">
                                <b>Desde</b>
                                <Input name="timeFrom" type="time"
                                       value={laborDay.timeFrom}
                                       onChange={onChangeLaborDay(laborDay.day)}/>
                            </div>
                            <div className="d-flex flex-column gap-2 align-items-center">
                                <b>Hasta</b>
                                <Input name="timeTo" type="time" value={laborDay.timeTo}
                                       onChange={onChangeLaborDay(laborDay.day)}/>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Button color="primary" onClick={onSaveSchedule}>Guardar</Button>

        </div>
    );
}