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
import { ECommerceTypes, startWhatsappServices } from '../../services/promotions';
import ClientList from "../ClientList/ClientList";
import { IClient } from "../../models/interfaces/ClientModel";
import { Messaging } from "../index";
import { WhatsappSessionTypes } from "../../models/interfaces/WhatsappModels";
import {IProduct} from "../Product/Product";
import {IProductData} from "../../models/products";

export interface IClientFormProps {
    toggle: () => any;
    isOpen?: boolean;
    promotionLoading: { [N in ECommerceTypes]?: boolean };
    editClient?: Partial<any>;
    selectedProducts: IProductData[];
    setSelectedProducts: (products: IProductData[]) => any;
}


const ClientModalForm: React.FC<IClientFormProps> = (
    {
        isOpen,
        toggle,
        editClient,
        selectedProducts,
        setSelectedProducts
    },
) => {
    const [client, setClient] = React.useState<Partial<any>>(editClient || {});
    const [clients, setClients] = React.useState<IClient[]>([]);
    const [isValidForm, setIsValidForm] = React.useState(false);
    const [isSubmiting, setIsSubmiting] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [sureToClose, setSureToClose] = React.useState(false);

    const toggleSureToClose = () => setSureToClose(!sureToClose);
    useEffect(() => {
        setClient(editClient || {});
        validForm();
    }, [editClient]);

    const handleSureToClose = async () => {
        setSureToClose(true)
    };

    const toggleModal = () => {
        toggle();
        setSureToClose(false);
    }

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
        <Modal isOpen={isOpen}
               backdrop="static"
               keyboard={false}
               toggle={handleSureToClose}
               className="client-form-container"
        >
            {
                isSubmiting ?
                    (
                        <div className="loading-sale-container">
                            <Spinner animation="grow" variant="secondary"/>
                        </div>
                    ) : null
            }
            <ModalHeader
                toggle={handleSureToClose}
            >
                {editClient ? `Editar ${editClient.name}` : 'Crear Cliente'}
            </ModalHeader>
            <ModalBody>
                <Form onSubmit={!isSubmiting && isValidForm ? onSubmit : undefined}>
                    <div className={step === 2 ? 'd-block' : 'd-none'}>
                        {/*<ClientList onSelectClient={onSelectClient}/>*/}
                    </div>
                    <div className={step === 1 ? 'd-block' : 'd-none'}>
                        <Messaging
                            contacts={clients}
                            selectedProducts={selectedProducts}
                            setSelectedProducts={setSelectedProducts}
                        />
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
            <Modal isOpen={sureToClose} toggle={toggleSureToClose}>
                <ModalHeader toggle={toggleSureToClose}>Confirmación</ModalHeader>
                <ModalBody>
                  ¿Estás seguro que deseas cerrar?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={toggleModal}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={toggleSureToClose}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </Modal>
    );
};

export default ClientModalForm;
