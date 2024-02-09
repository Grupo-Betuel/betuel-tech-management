import React, {createContext} from 'react';
import './App.css';
import {Dashboard, Login} from "./screens";
import {ToastContainer} from "react-toastify";
import {Switch, Route, Redirect} from 'react-router-dom';
import {TemplatesDesign} from "./screens/TemplateDesign/TemplatesDesign";
import {OrdersManagement} from "./screens/OrdersManagement/OrdersManagement";
import {OrderDetail} from "./screens/OrdersManagement/components/OrderDetail";
import {CompanyManagement} from "./screens/CompanyManagement/CompanyManagement";
import {CreateMessenger} from "./components/CreateMessenger/CreateMessenger";
import {Accounting} from "./screens/Accounting/Accounting";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";
import {Schedule} from "./components/Schedule/Schedule";
import {Navigation} from "./components/Navigation/Navigation";

export interface IAppContext {
    setToken: (token: string) => void;
}

export const AppContext = createContext<IAppContext>({
    setToken: () => {
    },
});

function App() {
    const [token, setToken] = React.useState(localStorage.getItem('authToken'));

    return (
        <div className="App">
            <AppContext.Provider value={{setToken}}>
                {/* eslint-disable-next-line no-undef */}
                {token && <Navigation/>}
                <Switch>
                    {token ?
                        <>
                            <Route path="/dashboard" component={() => <Dashboard setToken={setToken}/>}/>
                            <Route path="/templates" component={() => <TemplatesDesign/>}/>
                            <Route path="/orders" component={() => <OrdersManagement/>}/>
                            <Route path="/order-detail/:orderId" component={() => <OrderDetail/>}/>
                            <Route path="/companies" component={() => <CompanyManagement/>}/>
                            <Route path="/register-messenger" component={() => <CreateMessenger/>}/>
                            <Route path="/accounting" component={() => <Accounting/>}/>
                        </> :
                        <Route path="/login" component={() => <Login setToken={setToken}/>}/>
                    }
                    <Route path="/portfolio/betueldance"
                           component={() => <Dashboard setToken={setToken} portfolioMode={true}
                                                       company="betueldance"/>}/>
                    <Route path="/portfolio/betueltech"
                           component={() => <Dashboard setToken={setToken} portfolioMode={true}
                                                       company="betueltech"/>}/>
                    <Route path="*" component={() => <Redirect to={token ? "/dashboard" : "/login"}/>}/>

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
