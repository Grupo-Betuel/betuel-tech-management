import {FormGroup, Input, Label} from "reactstrap";
import React, {useEffect} from "react";
import styled from "styled-components";
import {clientStageList, IClient} from "../../model/interfaces/ClientModel";
import {IMessenger} from "../../model/messengerModels";

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

    // @ts-ignore
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
                <Label for="number">Phone:</Label>
                <Input
                    onChange={onChangeClient}
                    type="text"
                    name="phone"
                    id="phone"
                    value={client.phone}
                    maxLength={10}
                />
                <span className="client-item-data">{client.phone}</span>
            </FormGroup>
            <FormGroup className="client-item">
                <Label for="number">Stage:</Label>
                <Input
                    onChange={onChangeClient}
                    type="text"
                    name="stage"
                    id="stage"
                    value={client.stage}
                />
                <Input
                    onChange={onChangeClient}
                    name="stage"
                    id="stage"
                    value={client.stage}
                    type="select">
                    <option value="">Select Messenger</option>
                    {clientStageList.map((m: string) =>
                        <option value={m} key={m}>{m}</option>)
                    }
                </Input>
                <span className="client-item-data">{client.phone}</span>
            </FormGroup>
        </ClientWrapper>

    )
}

export default ClientItem;
