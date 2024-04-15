import React, {useCallback, useMemo} from 'react';
import {Table, Badge, Progress, Button, Spinner, Input} from 'reactstrap';
import {
    BibleDayModel,
    BibleGroupModel,
    BibleStudyModel,
    BibleUserModel,
    BibleGroupParticipationModel
} from "../../../../model/interfaces/BibleModel";
import "./BibleGroupMng.scss";
import {updateBibleGroup} from "../../../../services/bible/bibleGroupsService";
import {toast} from "react-toastify";

interface BibleGroupMngProps {
    study: BibleStudyModel;
    group: BibleGroupModel;
    onGroupDelete: (group: BibleGroupModel) => void;
    addCoordinator: (group: BibleGroupModel) => void;
    handleParticipations: (p: BibleGroupParticipationModel) => void;
}

const BibleGroupMng: React.FC<BibleGroupMngProps> = ({
                                                         group,
                                                         handleParticipations,
                                                         study,
                                                         onGroupDelete,
                                                         addCoordinator
                                                     }) => {
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'secondary';
            case 'three-days':
                return 'warning';
            case 'seven-days':
                return 'danger';
            default:
                return 'primary';
        }
    };

    const getBibleDayProgress = (participation?: BibleGroupParticipationModel | null) => {
        if (!participation) {
            return 0;
        }
        const position = participation.day?.position || 0;
        return Math.ceil((position / study.days.length) * 100);
    };

    const getBibleDayParticipation = (user: BibleUserModel) => {
        const participation = user.participations.find(participation => participation.group === group._id);
        if (!participation) {
            return null;
        }
        return participation;
    }

    const handleDeleteGroup = () => {
        onGroupDelete(group);
    }

    const handleSyncGroupUsersWithWs = () => {
        //
    }

    const currentDay = useMemo(() => {
        const passedDaysFromStartDate = (Math.floor(
            (new Date().getTime() - new Date(group?.startDate || new Date()).getTime()) / (1000 * 60 * 60 * 24),
        )) + 1;
        return passedDaysFromStartDate;
    }, [group?.startDate]);


    const handleCoordinator = (user: BibleUserModel) => async () => {
        await addCoordinator({
            ...group,
            coordinators: [...(group.coordinators), user],
        })
        toast("Coordinador agregado", {type: "success"});
    }

    const isCoordinator = useCallback((user: BibleUserModel) => {
        return group?.coordinators?.some(coordinator => coordinator._id === user._id);
    }, [group?.coordinators]);

    const handleUserDay = (user: BibleUserModel) => async ({target: {value}}: any) => {
        const day = study.days.find(day => day._id === value);
        if (!day) {
            toast("No se encontró el día", {type: "error"});
            return
        }
        const participation = user.participations.find(participation => participation.group === group._id);
        if (!participation) {
            toast("No se encontró participación", {type: "error"});
            return;
        }
        const newParticipation: BibleGroupParticipationModel = {
            ...participation,
            day,
        };

        await handleParticipations(newParticipation);
    }


    return (
        <div className="bible-group-mng ">
            <div className="d-flex align-items-center justify-content-between pb-4">
                <Button
                    onClick={handleDeleteGroup}
                    color="danger" outline>
                    Eliminar Grupo
                </Button>
                <h2>Día {currentDay}</h2>
                <Button onClick={handleSyncGroupUsersWithWs}
                        color="info" outline>
                    Sync Group Users
                </Button>
            </div>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Bible Day</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {group?.users.map((user, index) => {
                    const participation = getBibleDayParticipation(user);
                    const progress = getBibleDayProgress(participation);
                    return (
                        <tr key={index}>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.phone}</td>
                            <td>
                                <Badge color={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                                {isCoordinator(user) && <Badge color="primary">Coordinador</Badge>}
                            </td>
                            <td>
                                <div className="d-flex flex-column gap-3">
                                    <Input type="select" onChange={handleUserDay(user)} value={participation?.day?._id}>
                                        <option value="">Seleccionar Dia</option>
                                        {study?.days.map((day) => (
                                            <option value={day._id} key={day._id}
                                                    selected={user.bibleDay?.position === day.position}>Dia {day.position}</option>
                                        ))
                                        }
                                    </Input>
                                    <Progress
                                        value={progress}>{progress}%</Progress>
                                </div>
                            </td>
                            <td>
                                <div className="d-flex justify-content-between gap-2">
                                    {group.coordinators?.length <= 3 &&
                                        <Button className="cursor-pointer" color="info" outline
                                                onClick={handleCoordinator(user)}>
                                            Coordinador
                                        </Button>
                                    }
                                </div>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </Table>
        </div>
    );
};

export default BibleGroupMng;
