import React from 'react';
import {Col, ColProps} from "reactstrap";
import "./MoneyStatisticLabels.scss";

export interface IMoneyStatisticLabel {
    label: string;
    amount?: number | string;
    text?: string | number;
    className?: string;
}

const StatisticLabel: React.FunctionComponent<IMoneyStatisticLabel> = (
    {
        label,
        amount,
        className,
        text
    }
) => {

    return (
        <div className={className}>
            <Col
                sm={12}
                className="d-flex justify-content-center"
            >
                <h4 className="amount">{amount ? 'RD$' : ''} {(amount || text)?.toLocaleString('en-US')}</h4>
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

export default StatisticLabel
