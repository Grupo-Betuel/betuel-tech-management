import {Spinner} from "reactstrap";
import "./Loading.scss";
import React from "react";

export interface ILoadingProps {
    loading?: boolean;
}

export const Loading = ({ loading } : ILoadingProps ) => {
    return (
        <div className={`loading-wrapper ${loading ? '' : 'd-none'}`}>
            <Spinner animation="grow" variant="secondary"/>
        </div>
    )
}
