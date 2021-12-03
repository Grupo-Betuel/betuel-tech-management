import React, {useRef} from 'react';
import { useDownloadExcel } from 'react-export-table-to-excel';
import { Button } from "reactstrap";

const Test = () =>  {
    const tableRef = useRef(null);

    const { onDownload } = useDownloadExcel({
        currentTableRef: tableRef.current,
        filename: 'Users table',
        sheet: 'Users'
    })

    return (
        <div>
            <Button onClick={onDownload}> Export excel </Button>

            <table  ref={tableRef}>
                <tr>
                    <th>Firstname</th>
                    <th>Lastname</th>
                    <th>Age</th>
                </tr>
                <tr>
                    <td>Edison</td>
                    <td>Padilla</td>
                    <td>20</td>
                </tr>
                <tr>
                    <td>Alberto</td>
                    <td>Lopez</td>
                    <td>94</td>
                </tr>
            </table>

        </div>
    );
}

export default Test
