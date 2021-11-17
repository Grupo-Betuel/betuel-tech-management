import React from 'react';
import { Button, Pagination, PaginationItem, PaginationLink, Table } from "reactstrap";

export interface IHeader {label: string; property: string}

export interface IAction {
    method: (item: any) => () => any;
    label: string;
    className?: string;
}

export interface ITable {
    headers: IHeader[];
    data: any[];
    actions?: IAction[];
}

const TableComponent: React.FunctionComponent<any> = ({ headers, data, actions = [] }) => {

    return(
    <div>
        <Table responsive>
            <thead>
            <tr>
                <th>#</th>
                {
                    headers.map((item: any, u: number) =>
                    <th key={u}>{item.label}</th>
                    )
                }
            </tr>
            </thead>
            <tbody>
            { data.map( (item: any, i: number) =>
                <tr key={i}>
                    <>
                        <th>{ i + 1}</th>
                        {
                            headers.map((head: IHeader, i: number) => <td key={i}>{item[head.property]}</td>)
                        }
                        {
                            actions.map(
                                (action: IAction, i: number) =>
                                    <td key={i}>
                                        <Button type="button" onClick={action.method(item as any)}>
                                            {action.label}
                                        </Button>
                                    </td>
                            )
                        }
                    </>
                </tr>
            )
            }
            </tbody>
        </Table>
    </div>)
}

export default TableComponent;
