import React from 'react';
import {Button, Input, Pagination, PaginationItem, PaginationLink, Table} from "reactstrap";

export interface IHeader {
    label: string;
    property: string,
    render?: (data: any) => any;
}

export interface IAction {
    method: (item: any) => (e: React.MouseEvent<any>) => any;
    label: string;
    className?: string;
}

export interface ITable {
    headers: IHeader[];
    data: any[];
    actions?: IAction[];
}

const TableComponent: React.FunctionComponent<any> = ({headers, data, actions = [], onSelectItem}) => {
    const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
    const selectItem = (item: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let selected = [];
        if (e.target.checked) {
            selected = [...selectedItems, item]
            setSelectedItems(selected);
        } else {
            selected = selectedItems.filter((it: any) => JSON.stringify(it) !== JSON.stringify(item))
            setSelectedItems(selected);
        }

        onSelectItem && onSelectItem(selected, item);
    }


    return (
        <div>
            <Table responsive>
                <thead>
                <tr>
                    <th></th>
                    <th>#</th>
                    {
                        headers.map((item: any, u: number) =>
                            <th key={u}>{item.label}</th>
                        )
                    }
                </tr>
                </thead>
                <tbody>
                {data.map((item: any, i: number) =>
                    <tr key={i}>
                        <>
                            <th><Input type="checkbox" checked={selectedItems.find(it => JSON.stringify(it) === JSON.stringify(item))} onChange={selectItem(item)}/></th>
                            <th>{i + 1}</th>
                            {
                                headers.map((head: IHeader, i: number) => <td key={i}>{
                                    head.render ? head.render(item) :
                                        item[head.property]
                                }</td>)
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
