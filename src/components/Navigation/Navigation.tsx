import React, {useContext} from "react";
import {FloatButton} from "../../screens/Dashboard/Dashboard";
import {useHistory} from "react-router";
import {AppContext} from "../../App";
import "./Navigation.scss";

export const Navigation = () => {
    const history = useHistory();
    const { setToken } = useContext(AppContext)
    const logOut = () => {
        localStorage.setItem("authToken", "");
        setToken("");
    };

    const goTo = (path: 'dashboard'| 'templates' | 'companies' | 'orders' | 'accounting') => () => {
        history.push(`/${path}`);
    }

    return localStorage.getItem("authToken") &&
        (
            <div className="float-options">
                <FloatButton
                    className="btn btn-outline-danger"
                    title="Dashboard"
                    onClick={goTo('dashboard')}
                >
                    <i className="bi bi-layout-text-window-reverse"/>
                </FloatButton>
                <FloatButton
                    className="btn btn-outline-danger go-to-portfolio"
                    title={`Ordenes`}
                    onClick={goTo('orders')}
                >
                    <i
                        className="bi bi-truck"
                    />
                </FloatButton>
                <FloatButton
                    className="btn btn-outline-danger go-to-portfolio"
                    title={`Disenio de Plantillas`}
                    onClick={goTo('templates')}
                >
                    <i
                        className="bi bi-easel2"
                    />
                </FloatButton>
                <FloatButton
                    className="btn btn-outline-danger go-to-portfolio"
                    title={`Companies`}
                    onClick={goTo('companies')}
                >
                    <i
                        className="bi bi-building"
                    />
                </FloatButton>
                <FloatButton
                    className="btn btn-outline-danger go-to-portfolio"
                    title={`Contabilidad`}
                    onClick={goTo('accounting')}
                >
                    <i
                        className="bi bi-123"
                    />
                </FloatButton>
                <FloatButton
                    className="btn btn-outline-danger go-to-portfolio"
                    title={`Salir`}
                    onClick={logOut}
                >
                    <i
                        className="bi bi-box-arrow-right"
                    />
                </FloatButton>
            </div>
        )
}