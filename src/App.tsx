import React from 'react';
import './App.css';
import {Dashboard} from "./screens";
import {ToastContainer} from "react-toastify";

function App() {
  return (
    <div className="App">
      <Dashboard />
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
