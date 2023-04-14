import React from 'react';
import './App.css';
import { Dashboard, Login } from "./screens";
import { ToastContainer } from "react-toastify";
import { Switch, Route, Redirect } from 'react-router-dom';
import FlyerDesigner from "./components/FlyerDesigner/FlyerDesigner";

function App() {
    const [token, setToken] = React.useState(localStorage.getItem('authToken'));
    const product = {
        "lastFbPublicationDate": "2023-04-12T18:16:32.446Z",
        "lastIgPublicationDate": "2023-04-11T14:51:00.159Z",
        "company": "betueltech",
        "_id": "61a82561f2c7530008c27cda",
        "name": "Smartwatch Serie 6",
        "GodWord": "Cristo te Ama!",
        "price": 1995,
        "cost": 1150,
        "commission": 100,
        "image": "https://storage.googleapis.com/betuel-tech-photos/flyer-1680644950030.png",
        "flyerOptions": "{\"width\":438,\"height\":385,\"x\":21,\"y\":40,\"fontSize\":41,\"enableShadow\":true}",
        "__v": 0,
        "productImage": "https://storage.googleapis.com/betuel-tech-photos/1638938145335.png",
        "description": "\nSmartwatch Serie 6 pantalla completa, WhatsApp, facebook, juegos,fotos, llamadas,musica\n\nFunciones principales:\n\n📌 Realiza y recibe llamadas\n📌 Notifica redes y apps Acceso a contactos\n📌 Control de música\n📌 Captura remota de fotos\n📌 Rastreador Anti perdida\n📌 Reloj Despertador\n📌 Cronometro, Calculadora, Calendario, Clima\n📌 Medidor de pasos\n📌 Mide la presión arterial\n📌 Mide ritmo cardíaco\n📌 Mide Oxígeno en sangre\n📌 Mide temperatura corporal\n📌 Monitor de ejercicio Monitor de sueño\n📌 Personalización de pantalla Compatibilidad con iPhone y Android",
        "facebookId": "404",
        "instagramId": "1681224654926"
    }

    return (
        <div className="App">
            <Switch>
                {token ? <Route path="/dashboard" component={ () => <Dashboard setToken={setToken} />}/> : <Route path="/login" component={() => <Login setToken={setToken} />} />}
                <Route path="/portfolio/betueldance" component={ () => <Dashboard setToken={setToken} portfolioMode={true} company="betueldance" />}/>
                <Route path="/portfolio/betueltech" component={ () => <Dashboard setToken={setToken} portfolioMode={true} company="betueltech" />}/>
                <Route path="/design" component={ () => <FlyerDesigner product={product as any} validForm={() => {}} editProduct={product as any} company="betueltech" />}/>
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
