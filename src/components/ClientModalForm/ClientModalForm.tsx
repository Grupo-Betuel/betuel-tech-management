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
import { Messaging } from "../index";

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
    const [isValidForm, setIsValidForm] = React.useState(false);
    const [isSubmiting, setIsSubmiting] = React.useState(false);
    const [step, setStep] = React.useState(1);

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

    const handleSubmit = () => {
         console.log('selected clients', clients)
        if (step === 1) {
            setStep(2);

        } else {
            setStep(1);
        }

    }

    const onSelectClient = (data: IClient[]) => {
        setClients(data)
    }

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} className="client-form-container">

            {
                isSubmiting ?
                    (
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    ) : null
            }
            <ModalHeader
                toggle={toggleModal}
            >
                {editClient ? `Editar ${editClient.name}` : 'Crear Cliente'}
            </ModalHeader>
            <ModalBody>
                <Form onSubmit={!isSubmiting && isValidForm ? onSubmit : undefined}>
                    <div className={step === 2 ? 'd-block' : 'd-none'}>
                        {/*<ClientList onSelectClient={onSelectClient}/>*/}
                    </div>
                    <div className={step === 1 ? 'd-block' : 'd-none'}>
                        <Messaging contacts={clients}/>
                    </div>
                    {/*<ModalFooter>*/}
                    {/*    {step === 1 && <Button color="info" onClick={toggleModal} outline>Añadir Etiqueta</Button>}*/}
                    {/*    {' '}*/}
                    {/*    <Button*/}
                    {/*        color="success"*/}
                    {/*        outline*/}
                    {/*        type="button"*/}
                    {/*        onClick={handleSubmit}*/}
                    {/*    >*/}
                    {/*        {step === 1 ? 'Siguiente' : 'Volver'}*/}
                    {/*    </Button>*/}
                    {/*</ModalFooter>*/}
                </Form>
            </ModalBody>

        </Modal>
    );
};

export default ClientModalForm;
