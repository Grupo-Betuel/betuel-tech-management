import { FormGroup, Input, Label } from "reactstrap";
import React, { useEffect } from "react";
import styled from "styled-components";
import { IClient } from "../../model/interfaces/ClientModel";

const ClientWrapper: any = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
  width: 100%;

  input {
    display: ${({editable}: any) => editable ? 'block' : 'none'};
    border: unset;
    border-bottom: 1px solid #ced4da;
    border-radius: 0;
  }

  label {
    display: ${({editable}: any) => editable ? 'block' : 'none'};
  }

  .client-item {
    margin-bottom: 0px !important;

    .client-item-data {
      display: ${({editable}: any) => editable ? 'none' : 'block'};
    }
  }


`


export interface IClientItem {
    client: IClient;
    editable?: boolean;
    onChange?: (client: IClient) => any;
}

const ClientItem: React.FC<IClientItem> = (
    {
        client,
        editable,
        onChange,
    }
) => {
    // const [client, setClient] = React.useState<Partial<IClient>>(client || {});

    const onChangeClient = async (ev: React.ChangeEvent<any>) => {
        const {name, value, type} = ev.target;
        const finalValue = type === 'number' ? Number(value) : value;
        // setting price values when cost is added

        const newClient: IClient = {
            ...client,
            [name]: finalValue,
        } as any;

        // await setClient(newClient);
        onChange && onChange(newClient)

    };

    // useEffect(() => {
    //     setClient(client || {});
    // }, [client]);

    return (
        <ClientWrapper editable={editable}>
            <FormGroup className="client-item">
                <Label for="name">Nombre:</Label>
                <Input
                    onChange={onChangeClient}
                    name="firstName"
                    id="firstName"
                    value={client.firstName}
                />
                <span className="client-item-data">{client.firstName}</span>
            </FormGroup>
            <FormGroup className="client-item">
                <Label for="lastName">Apellido:</Label>
                <Input
                    onChange={onChangeClient}
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={client.lastName}
                />
                <span className="client-item-data">{client.lastName}</span>
            </FormGroup>
            <FormGroup className="client-item">
                <Label for="number">Number:</Label>
                <Input
                    onChange={onChangeClient}
                    type="text"
                    name="number"
                    id="number"
                    value={client.number}
                    maxLength={10}
                />
                <span className="client-item-data">{client.number}</span>
            </FormGroup>
        </ClientWrapper>

    )
}

export default ClientItem;
