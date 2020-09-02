import React from 'react';
import {Col, ColProps} from "reactstrap";
import "./MoneyStatisticLabels.scss";

export interface IMoneyStatisticLabel {
    label: string;
    amount: number;
    className?: string;
}

const MoneyStatisticLabel: React.FunctionComponent<IMoneyStatisticLabel> = (
    {
        label,
        amount,
        className,
    }
) => {

    return (
        <div className={className}>
            <Col
                sm={12}
                className="d-flex justify-content-center"
            >
                <h4 className="amount">RD$ {amount ? amount.toLocaleString('en-US') : 0}</h4>
            </Col>
            <Col
                sm={12}
                className="d-flex justify-content-center"
            >
                <p>{label}</p>
            </Col>
        </div>
    );
};

export default MoneyStatisticLabel
