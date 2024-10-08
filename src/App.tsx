import React, {createContext, useMemo} from 'react';
import './App.css';
import {Dashboard, Login} from "./screens";
import {ToastContainer} from "react-toastify";
import {Switch, Route, Redirect, RouteProps} from 'react-router-dom';
import {TemplatesDesign} from "./screens/TemplateDesign/TemplatesDesign";
import {OrdersManagement} from "./screens/OrdersManagement/OrdersManagement";
import {OrderDetail} from "./screens/OrdersManagement/components/OrderDetail";
import {CompanyManagement} from "./screens/CompanyManagement/CompanyManagement";
import {CreateMessenger} from "./components/CreateMessenger/CreateMessenger";
import {Accounting} from "./screens/Accounting/Accounting";
import {Navigation} from "./components/Navigation/Navigation";
import {BibleAssistant} from "./screens/BibleAssistant/BibleAssistant";
import {getAuthUser} from "./utils/token";
import IUser from "./models/interfaces/user";
import Excursions from "./screens/BetuelTravel/Excursions/Excursions";
import {BibleUserUpdate} from "./screens/BibleAssistant/BibleUserUpdate";
import useDisableScrollOnNumberInput from "./components/hooks/useDisableScrollOnNumberInput";
import {RedirectPromotion} from "./components/RedirectPromotion";

export interface IAppContext {
    setToken: (token: string) => void;
}

export const AppContext = createContext<IAppContext>({
    setToken: () => {
    },
});

export const privateRoutes: { path: string, element: any, icon: string, inBackground?: boolean }[] = [
    {
        path: "dashboard",
        element: () => <Dashboard/>,
        icon: 'bi bi-layout-text-window-reverse',
    },
    {
        path: "orders",
        element: () => <OrdersManagement/>,
        icon: 'truck',
    },
    {
        path: "templates",
        element: () => <TemplatesDesign/>,
        icon: 'easel2',
    },
    {
        path: "companies",
        element: () => <CompanyManagement/>,
        icon: 'building',
    },
    {
        path: "accounting",
        element: () => <Accounting/>,
        icon: '123',
    },
    {
        path: "bible-assistant",
        element: () => <BibleAssistant/>,
        icon: 'book',
    },
    {
        path: "excursions",
        element: () => <Excursions/>,
        icon: 'car',
    },
    {
        path: "register-messenger",
        element: () => <CreateMessenger/>,
        icon: 'box-arrow-right',
        inBackground: true,
    },
    {
        path: "order-detail/:orderId",
        element: () => <OrderDetail/>,
        icon: 'building',
        inBackground: true,
    },
];



function App() {
    const [token, setToken] = React.useState(localStorage.getItem('authToken'));
    const authUser: IUser | null = useMemo(() => {
        if (!token) {
            return null;
        }
        return getAuthUser() as IUser;
    }, [token]);

    useDisableScrollOnNumberInput();

    return (
        <div className="App">
            <AppContext.Provider value={{setToken}}>
                {/* eslint-disable-next-line no-undef */}
                {token && <Navigation user={authUser}/>}
                <Switch>
                    <Route path="/betuelgroup/promotion" component={() => <RedirectPromotion />}/>

                    {token ?
                        <>
                            {
                                (authUser?.role === 'accountant') ?
                                    <Route
                                        exact
                                        path="/accounting"
                                        component={() => <Accounting/>}
                                    /> :
                                    privateRoutes.map((route, index) => {
                                        return (
                                            <Route
                                                exact
                                                key={index}
                                                path={`/${route.path}`}
                                                component={route.element}
                                                render={() => {
                                                    if (token) {
                                                        return route.element
                                                    }
                                                    return <Redirect to={{pathname: "/login"}}/>
                                                }}
                                            />
                                        )
                                    })

                            }
                        </> :
                        <>
                            <Route path="/login" component={() => <Login setToken={setToken}/>}/>
                            <Route path="/bible-assistant/fill-user-data/:phone" component={() => <BibleUserUpdate />}/>
                        </>
                    }
                    <Route component={() => <Redirect
                        to={{pathname: token ? authUser?.role === 'accountant' ? "/accounting" : "/dashboard" : "/login"}}/>}/>

                </Switch>

                <ToastContainer
                    position="bottom-left"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    pauseOnHover
                />
            </AppContext.Provider>

        </div>
    );
}

export default React.memo(App);
