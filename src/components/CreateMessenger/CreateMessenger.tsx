import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Form,
    FormGroup,
    Input,
    Label,
    Modal, ModalBody, ModalFooter,
    ModalHeader,
    Spinner
} from "reactstrap";
import React, {useState} from "react";
import {IMessenger} from "../../models/messengerModels";
import {toast} from "react-toastify";
import {addMessenger} from "../../services/messengerService";
import InputMask from "react-input-mask";
import "./CreateMessenger.scss";
import {onChangeMediaToUpload} from "../../utils/gcloud.utils";
import {generateCustomID} from "../../utils/text.utils";
import {IMedia} from "../GCloudMediaHandler/GCloudMediaHandler";
import {sendWhatsappMessage} from "../../services/promotions";

export const CreateMessenger = () => {
    const [messengerToCreate, setMessengerToCreate] = useState<IMessenger>({} as IMessenger);
    const [phone, setPhone] = useState<string>('');
    const [loading, setLoading] = useState<boolean>();
    const [confirmed, setConfirmed] = useState<boolean>();
    const [photoFiles, setPhotoFiles] = useState<any>();
    const [previewPhoto, setPreviewPhoto] = useState<string>();


    const toggleConfirmation = (ev?: any) => {
        ev?.preventDefault();
        setConfirmed(!confirmed);
    }
    const onChangeMessengerToCreate = (ev: React.ChangeEvent<HTMLInputElement>) => {
        let {target: {name, value, type}} = ev;

        if (type === 'tel') {
            setPhone(value);
            value = value?.replace(/[- ()+_]/g, '');
        } else if (type === 'file') {
            setPhotoFiles(ev?.target?.files);
            const {files} = ev.target;
            // eslint-disable-next-line no-undef
            if (FileReader && files?.length) {
                setLoading(true);
                // eslint-disable-next-line no-undef
                const fr: any = new FileReader();

                fr.onload = async () => {
                    setPreviewPhoto(fr?.result);
                    setLoading(false);
                }

                fr.readAsDataURL(files[0]);
            }
            return;
        }

        setMessengerToCreate({
            ...messengerToCreate,
            [name]: value
        })
    }

    const uploadWithPhoto = async () => {
        setLoading(true);

        const photoName = `${messengerToCreate.firstName} ${messengerToCreate.lastName} mensajero ${generateCustomID()}`.replace(/[ ]/gi, '-');
        const creatMessengerWithPhoto = async (media: IMedia) => {
            await addNewMessenger({...messengerToCreate, photo: media.content});
            setLoading(false);
        }

        await onChangeMediaToUpload('messenger', creatMessengerWithPhoto, photoName)({ target: { files: photoFiles}} as any);
    }

    const addNewMessenger = async (messenger: IMessenger) => {
        setLoading(true);
        await addMessenger(JSON.stringify(messenger));
        toast("Mensajero creado con exito", {position: 'top-right'})
        setLoading(false);
    }

    const validMessenger = (messenger: IMessenger,) => {
        const {firstName, lastName, phone} = messenger
        const res = (!!firstName && !!lastName && !!phone) && phone.length > 10
        if (!res) {
            toast("Todos los campos son requeridos", {type: 'error', position: 'top-right'})
        }
        return res
    }


    const handleNewMessenger = async () => {
        if (validMessenger(messengerToCreate)) {
            if(photoFiles) {
                await uploadWithPhoto();
            } else {
                await addNewMessenger(messengerToCreate);
            }
            await sendWhatsappMessage('betuelgroup', [messengerToCreate], { text: 'Hola @firstName Dios te bendiga 🙌 te damos la bienvenida a Grupo betuel 🤗, por esta via nos comunicaremos contigo para hacer envios 📦✅, estamos a tus ordenes 🫡🧑‍💻'});
            setMessengerToCreate({} as any);
            setPhone('');
            setPhotoFiles(undefined);
            setPreviewPhoto(undefined);
        }
        toggleConfirmation();
        document?.body?.focus();
    }


    return (
        <div className="create-messenger">
            <Modal isOpen={!!confirmed} toggle={toggleConfirmation}>
                <ModalHeader toggle={toggleConfirmation}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas seguro que deseas crear el mensajero?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleNewMessenger}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={toggleConfirmation}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <h1>Crea un Mensajero</h1>

            <label className="create-messenger--image-uploader">
                {previewPhoto ?
                    <img className="create-messenger--preview-photo" src={previewPhoto} alt="messenger photo"/>
                    : <i className="bi bi-image-fill"></i>}
                <input type="file"
                       className="create-messenger--image-uploader__input-file"
                       onChange={onChangeMessengerToCreate}
                       accept="image/png, image/jpeg, image/webp"/>
            </label>
            {loading && (
                <>
                    <div className="loading-sale-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                </>
            )}
            <Form className="create-messenger--form" onSubmit={toggleConfirmation}>
                <FormGroup>
                    <Label><b>Nombre</b></Label> <br/>
                    <Input value={messengerToCreate.firstName || ''} name="firstName"
                           onChange={onChangeMessengerToCreate}/>
                </FormGroup>
                <FormGroup>
                    <Label><b>Apellido</b></Label> <br/>
                    <Input value={messengerToCreate.lastName || ''} name="lastName"
                           onChange={onChangeMessengerToCreate}/>
                </FormGroup>
                <FormGroup>
                    <Label><b>Telefono (Whatsapp)</b></Label> <br/>
                    <InputMask className="form-control mb-3" placeholder="Numero de whatsapp"
                               type="tel"
                               name="phone"
                               value={phone}
                               onChange={onChangeMessengerToCreate}
                               mask="+1 (999) 999-9999"/>
                </FormGroup>
                <Button type="submit" color="success" onClick={toggleConfirmation}>Enviar</Button>
            </Form>

        </div>
    )
}