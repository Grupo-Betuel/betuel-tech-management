import React, { ChangeEvent } from 'react';
import { Form, FormGroup, Label, Input, Button, Spinner } from 'reactstrap';
import "./Login.scss";
import IUser from "../../model/interfaces/user";
import { login } from "../../services/auth";
import { useHistory } from 'react-router';
import { toast } from "react-toastify";
import {parseToken} from "../../utils/token";

export interface ILoginProps {
    setToken: any;
}

const Login: React.FC<ILoginProps> = ( { setToken }) => {
    const [user, setUser] = React.useState<IUser>({} as IUser);
    const [loading, setLoading] = React.useState(false);
    const history = useHistory();
    const onChange = ({target}: React.ChangeEvent<HTMLInputElement>) => setUser({
        ...user,
        [target.name]: target.value
    });

    const onSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        if (isValid()) {
            const response: any = await (await login(JSON.stringify(user))).json();
            if (!!response.token) {
                toast("¡Bienvenido!", {type: "default"});
                localStorage.setItem('authToken', response.token);
                setToken(response.token)
                const authUser = parseToken(response.token);
                if(authUser?.role === 'accountant'){
                    history.push("/accounting");
                } else {
                    history.push("/dashboard");
                }
            } else {
                toast(response.message, {type: "error"})

            }
        } else {
            toast("Los datos ingresados no son validos", {type: "error"})
        }
        setLoading(false);

    }

    const isValid = () => user.password && user.password.length > 3 && user.username && user.username.length > 3;

    return (
        <div className="container w-100 h-100 d-flex align-items-center justify-content-center p-5">
            <Form className="login-form position-relative" onSubmit={onSubmit}>
                {
                    loading ?
                        <div className="hover-loading">
                            <Spinner color="secondary"/>
                        </div> : null}
                <h1 className="text-center">Betuel Tech Management</h1>
                <FormGroup>
                    <Label for="username">
                        Usuario
                    </Label>
                    <Input
                        id="username"
                        onChange={onChange}
                        name="username"
                        placeholder="Usuario"
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="examplePassword">
                        Password
                    </Label>
                    <Input
                        onChange={onChange}
                        id="examplePassword"
                        name="password"
                        placeholder="Contraseña"
                        type="password"
                    />
                </FormGroup>
                <FormGroup className="d-flex justify-content-center">
                    <Button type="submit" color="danger" outline className="mt-4">Iniciar Sesion</Button>
                </FormGroup>
            </Form>
        </div>
    )

}

export default Login;
