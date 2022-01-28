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

export interface IClientFormProps {
    toggle: () => any;
    loadClients: () => any;
    isOpen?: boolean;
    promotionLoading: { [N in ECommerceTypes]?: boolean };
    editClient?: Partial<any>;
}


const ClientModalForm: React.FC<IClientFormProps> = (
  {
    isOpen,
    toggle,
    loadClients,
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
      loadClients();
    }

    toggleModal();
  };

  const validForm = () => {
    setIsValidForm(['name', 'cost', 'price', 'commission'].map((key: any) => !!(client as any)[key]).reduce((a, b) => a && b, true));
  };

  return (

    <Modal isOpen={isOpen} toggle={toggleModal} className="client-form-container">
      {
                !isSubmiting ? null
                  : (
                    <div className="loading-sale-container">
                      <Spinner animation="grow" variant="secondary" />
                    </div>
                  )
            }
      <ModalHeader
        toggle={toggleModal}
      >
        {editClient ? `Editar ${editClient.name}` : 'Crear Cliente'}
      </ModalHeader>
      <Form onSubmit={!isSubmiting && isValidForm ? onSubmit : undefined}>
        <ModalBody>
            <ClientList
                clientList={[
                    {
                        firstName: 'Williams',
                        lastName: 'Padilla',
                        number: '8094055531',
                    }
                ]}
            />
        </ModalBody>
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
    </Modal>
  );
};

export default ClientModalForm;
