import {
    Button,
    Form,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader, Spinner,
} from 'reactstrap';
import React, { useEffect } from 'react';
import './ClientModalForm.scss';
import { ECommerceTypes } from '../../services/promotions';
import ClientList from "../ClientList/ClientList";
import { IClient } from "../../model/interfaces/ClientModel";

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
    const [isValidForm, setIsValidForm] = React.useState(false);
    const [isSubmiting, setIsSubmiting] = React.useState(false);

    useEffect(() => {
        setClient(editClient || {});
        validForm();
    }, [editClient]);

    const toggleModal = () => {
        toggle();
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

    return (

        <Modal isOpen={isOpen} toggle={toggleModal} className="client-form-container">
            {
                isSubmiting ?
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
                <Form onSubmit={!isSubmiting && isValidForm ? onSubmit : undefined}>
                    <ClientList />
                    <ModalFooter>
                        <Button color="info" onClick={toggleModal} outline>Añadir Etiqueta</Button>
                        {' '}
                        <Button
                            color={isSubmiting || !isValidForm ? 'dark' : 'primary'}
                            outline
                            type="submit"
                            disabled={isSubmiting || !isValidForm}
                        >
                            Siguiente
                        </Button>
                    </ModalFooter>
                </Form>
            </ModalBody>

        </Modal>
    );
};

export default ClientModalForm;
