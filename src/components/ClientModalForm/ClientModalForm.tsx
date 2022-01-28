import {
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader, Spinner,
} from 'reactstrap';
import React, { useEffect } from 'react';
import './ClientModalForm.scss';
import { ECommerceTypes } from '../../services/promotions';
import styled, { StyledComponent } from 'styled-components';
import { ClientItem } from '..';
import ClientList from "../ClientList/ClientList";
import { toast } from "react-toastify";
import { getClients } from '../../services/clients';
import { IClient } from "../../model/interfaces/ClientModel";

const TagItem: any = styled.div`
  border-radius: 20px;
  border: 1px solid #dc3545;
  background-color: ${(props: any) => props.selected ? '#dc3545': 'white'};
  color: ${(props: any) => props.selected ? 'white': '#dc3545'};
  padding: 3px 10px;
  margin-right: 10px;
  cursor: pointer;
`
export interface IClientFormProps {
    toggle: () => any;
    isOpen?: boolean;
    promotionLoading: { [N in ECommerceTypes]?: boolean };
    editClient?: Partial<any>;
}


const ClientModalForm: React.FC<IClientFormProps> = (
    {
        isOpen,
        toggle,
        editClient,
    },
) => {
    const [client, setClient] = React.useState<Partial<any>>(editClient || {});
    const [clients, setClients] = React.useState<IClient[]>([]);
    const [allClients, setAllClients] = React.useState<IClient[]>([]);
    const [isValidForm, setIsValidForm] = React.useState(false);
    const [isSubmiting, setIsSubmiting] = React.useState(false);
    const [loading, setIsLoading] = React.useState(false);

    useEffect(() => {
        setClient(editClient || {});
        validForm();
    }, [editClient]);

    useEffect(() => {
        const loadClients = async () => {
            setIsLoading(true);
            try {
                const res = await getClients();
                setClients(res);
                setAllClients(res);
            } catch (error) {
                toast('Error mientras cargaba los clientes: ' + error.message, {type: 'error'})
            }
            setIsLoading(false);
        }
        loadClients();
    }, [])

    const toggleModal = () => {
        toggle();
    };

    const onChangeClient = async (ev: React.ChangeEvent<any>) => {
        validForm();
    };

    const onSubmit = async (form: any) => {
        form.preventDefault();
        setIsSubmiting(true);
        if (editClient) {
            const body = JSON.stringify({
                ...client,
            });

            // await updateProducts(body);
            setIsSubmiting(false);
        }

        toggleModal();
    };

    const validForm = () => {
        setIsValidForm(['name', 'cost', 'price', 'commission'].map((key: any) => !!(client as any)[key]).reduce((a, b) => a && b, true));
    };

    const onSearchClient = (e: any) => {
        const value = e.target.value ? e.target.value.toLowerCase()  : '';
        setClients(allClients.filter((item: any) => !value  || JSON.stringify(item).toLowerCase().includes(value)))
    }

    return (

        <Modal isOpen={isOpen} toggle={toggleModal} className="client-form-container">
            {
                isSubmiting || loading ?
                     (
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    ): null
            }
            <ModalHeader
                toggle={toggleModal}
            >
                {editClient ? `Editar ${editClient.name}` : 'Crear Cliente'}
            </ModalHeader>
            <ModalBody>
                <Input type="text" onChange={onSearchClient} placeholder="Buscar Client" className="mb-3" />
                <div className="tags-container mb-3">
                    <TagItem selected={true} >Promotion</TagItem>
                    <TagItem>Friends</TagItem>
                    <TagItem>Friends</TagItem>
                    <TagItem>Friends</TagItem>
                    <TagItem>Friends</TagItem>
                    <TagItem>Friends</TagItem>
                    <TagItem>Friends</TagItem>
                    <TagItem>Friends</TagItem>
                    <TagItem>Friends</TagItem>
                    <TagItem>Friends</TagItem>
                    <TagItem>Friends</TagItem>
                </div>
                <Form onSubmit={!isSubmiting && isValidForm ? onSubmit : undefined}>
                    <ClientList
                        clientList={clients}
                    />
                    <ModalFooter>
                        <Button color="danger" onClick={toggleModal} outline>Cancel</Button>
                        {' '}
                        <Button
                            color={isSubmiting || !isValidForm ? 'dark' : 'primary'}
                            outline
                            type="submit"
                            disabled={isSubmiting || !isValidForm}
                        >
                            {editClient ? 'Actualizar' : 'Añadir'}
                        </Button>
                    </ModalFooter>
                </Form>
            </ModalBody>

        </Modal>
    );
};

export default ClientModalForm;
