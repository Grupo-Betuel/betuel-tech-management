import React from 'react';
import './App.css';
import {Dashboard, Login} from "./screens";
import {ToastContainer} from "react-toastify";
import {Switch, Route, Redirect} from 'react-router-dom';
import FlyerDesigner from "./components/FlyerDesigner/FlyerDesigner";
import {TemplatesDesign} from "./screens/TemplateDesign/TemplatesDesign";

function App() {
    const [token, setToken] = React.useState(localStorage.getItem('authToken'));

    return (
        <div className="App">
            <Switch>

                {token ?
                    <>
                        <Route path="/dashboard" component={() => <Dashboard setToken={setToken}/>}/>
                        <Route path="/templates" component={() => <TemplatesDesign/>}/>
                        <Route path="*" component={() => <Redirect to={token ? "/dashboard" : "/login"}/>}/>
                    </> :
                    <Route path="/login" component={() => <Login setToken={setToken}/>}/>
                }
                <Route path="/portfolio/betueldance"
                       component={() => <Dashboard setToken={setToken} portfolioMode={true} company="betueldance"/>}/>
                <Route path="/portfolio/betueltech"
                       component={() => <Dashboard setToken={setToken} portfolioMode={true} company="betueltech"/>}/>
                <Route path="*" component={() => <Redirect to={token ? "/dashboard" : "/login"}/>}/>

            </Switch>
            {/*<Dashboard />*/}
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
        </div>
    );
}

export default App;
