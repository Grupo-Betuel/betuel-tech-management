import React from 'react';
import { Table, Badge, Progress } from 'reactstrap';
import {BibleUsers} from "../../../model/interfaces/BibleModel";

interface BibleUsersTableProps {
    bibleUsers: BibleUsers[];
}

const BibleUsersTable: React.FC<BibleUsersTableProps> = ({ bibleUsers }) => {
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

    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Phone</th>
                <th>Password</th>
                <th>Last Congrat</th>
                <th>Status</th>
                <th>Bible Day</th>
                <th>Update Date</th>
                <th>Create Date</th>
            </tr>
            </thead>
            <tbody>
            {bibleUsers.map((user, index) => {
                const progress = getBibleDayProgress(user?.bibleDay?.position);
               return (
                    <tr key={index}>
                        <td>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.phone}</td>
                        <td>{user.password}</td>
                        <td>{new Date(user.lastCongrat).toLocaleDateString()}</td>
                        <td>
                            <Badge color={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                        </td>
                        <td>
                            <div className="text-center py-1">Día {user.bibleDay.position}</div>
                            <Progress
                                value={progress}>{progress}%</Progress>
                        </td>
                        <td>{new Date(user.updateDate).toLocaleDateString()}</td>
                        <td>{new Date(user.createDate).toLocaleDateString()}</td>
                    </tr>
                )
            })}
            </tbody>
        </Table>
    );
};

export default BibleUsersTable;
