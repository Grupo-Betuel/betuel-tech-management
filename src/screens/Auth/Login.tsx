import React from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';

const Login = () => {
    return (
        <div className="container p-5">
            <Form>
                <h1 className="text-center">Betuel Tech Management</h1>
                <FormGroup>
                    <Label for="exampleEmail">
                        Email
                    </Label>
                    <Input
                        id="exampleEmail"
                        name="email"
                        placeholder="with a placeholder"
                        type="email"
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="examplePassword">
                        Password
                    </Label>
                    <Input
                        id="examplePassword"
                        name="password"
                        placeholder="password placeholder"
                        type="password"
                    />
                </FormGroup>
                <FormGroup className="d-flex justify-content-center">
                    <Button type="submit"  color="danger" outline>Iniciar Sesion</Button>
                </FormGroup>
            </Form>
        </div>
    )

}

export default Login;
