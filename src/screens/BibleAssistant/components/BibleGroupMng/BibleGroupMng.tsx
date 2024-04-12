import React, {useMemo} from 'react';
import {Table, Badge, Progress, Button} from 'reactstrap';
import {BibleDayModel, BibleGroupModel, BibleUserModel} from "../../../../model/interfaces/BibleModel";
import "./BibleGroupMng.scss";

interface BibleGroupTableProps {
    group: BibleGroupModel;
    onGroupDelete: (group: BibleGroupModel) => void;
}

const BibleGroupMng: React.FC<BibleGroupTableProps> = ({group, onGroupDelete}) => {
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

    const getBibleDayProgress = (position: number) => {
        return Math.ceil((position / 365) * 100);
    };

    const handleDeleteGroup = () => {
        onGroupDelete(group);
    }

    const handleSyncGroupUsersWithWs = () => {
        //
    }

    const currentDay = useMemo(() => {
        const daysAgo = Math.floor((new Date().getTime() - new Date(group?.startDate || new Date()).getTime()) / (1000 * 3600 * 24)) || 1;
        return daysAgo;
    }, [group?.startDate]);


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
                    <th>Last Congrat</th>
                    <th>Status</th>
                    <th>Bible Day</th>
                    <th>Create Date</th>
                </tr>
                </thead>
                <tbody>
                {group?.users.map((user, index) => {
                    const progress = user?.bibleDay?.position ? getBibleDayProgress(user?.bibleDay?.position) : 0;
                    return (
                        <tr key={index}>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.phone}</td>
                            <td>{new Date(user.lastCongrat).toLocaleDateString()}</td>
                            <td>
                                <Badge color={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                            </td>
                            <td>
                                <div className="text-center py-1">Día {user.bibleDay?.position}</div>
                                <Progress
                                    value={progress}>{progress}%</Progress>
                            </td>
                            <td>{new Date(user.createDate).toLocaleDateString()}</td>
                        </tr>
                    )
                })}
                </tbody>
            </Table>
        </div>
    );
};

export default BibleGroupMng;
