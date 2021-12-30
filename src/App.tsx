import React from 'react';
import './App.css';
import {Dashboard, Login} from "./screens";
import {ToastContainer} from "react-toastify";
import { Switch, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="*" component={Dashboard} />
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
