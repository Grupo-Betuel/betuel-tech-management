import React, {useContext} from "react";
import {FloatButton} from "../../screens/Dashboard/Dashboard";
import {useHistory} from "react-router";
import {AppContext, privateRoutes} from "../../App";
import "./Navigation.scss";

export const Navigation = () => {
    const history = useHistory();
    const { setToken } = useContext(AppContext)
    const logOut = () => {
        localStorage.setItem("authToken", "");
        setToken("");
    };

    const goTo = (path: string) => () => {
        history.push(`/${path}`);
    }

    return localStorage.getItem("authToken") &&
        (
            <div className="float-options">
                {
                    privateRoutes.map((route, index) => {
                        return !route.inBackground && (
                            <FloatButton
                                key={index}
                                className="btn btn-outline-danger go-to-portfolio"
                                title={route.path}
                                onClick={goTo(route.path)}
                            >
                                <i
                                    className={`bi bi-${route.icon}`}
                                />
                            </FloatButton>
                        )
                    })
                }
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