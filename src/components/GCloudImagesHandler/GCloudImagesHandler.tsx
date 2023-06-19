import React from "react";
import {deletePhoto, getGCloudImages, uploadGCloudImage} from "../../services/gcloud";
import "./GCloudImagesHandler.scss";
import {dataURItoBlob} from "../../utils/blob";
import {toast} from "react-toastify";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import {ImageTypes} from "../../model/interfaces/FlyerDesigner.interfaces";
import {TagContainer, TagItem} from "../Tag/Tag";
import {whatsappSessionList, whatsappSessionNames} from "../../model/interfaces/WhatsappModels";

export interface IImage {
    name: string;
    content: string;
    type: string;
    uploaded?: boolean;
    tag: string;
}

export interface IGCloudImagesHandlerProps {
    onClickImage: (image: IImage) => void;
    toggle: () => void;
    open?: boolean;
}

export type ImageTagTypes = 'element' | 'product' | 'background' | 'logo' | 'flyer';
export type ITaggedImages = { [N in ImageTagTypes]: IImage[] };

export const GCloudImagesHandler = ({onClickImage, toggle, open}: IGCloudImagesHandlerProps) => {
    const [images, setImages] = React.useState<IImage[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [imageToDelete, setImageToDelete] = React.useState<IImage>();
    const [taggedImages, setTaggedImages] = React.useState<ITaggedImages>({} as ITaggedImages);
    const [selectedTag, setSelectedTag] = React.useState<ImageTagTypes>('element');
    const [tags, setTags] = React.useState<ImageTagTypes[]>([]);

    const getImages = async () => {
        setLoading(true);
        const data = await getGCloudImages();
        const taggedImagesData: ITaggedImages = {} as ITaggedImages;
        data.forEach((image: IImage) => {
            const tag = image.tag as ImageTagTypes || 'element';
            taggedImagesData[tag] = [...(taggedImagesData[tag] || []), image];
        });
        setTaggedImages(taggedImagesData);
        setTags(Object.keys(taggedImagesData) as ImageTagTypes[]);
        // setImages(taggedImagesData[selectedTag] || []);

        setLoading(false);
    }

    React.useEffect(() => {
        setImages(taggedImages[selectedTag] || []);
    }, [selectedTag, taggedImages]);

    const handleClickImage = (image: IImage) => () => {
        onClickImage(image)
    }

    React.useEffect(() => {
        getImages();
    }, []);


    const onChangeElementImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const url = event.target.value;
        const ext = '.' + url.substring(url.lastIndexOf('.') + 1).toLowerCase();

        if (input.files && input.files[0]) {
            const productFile = new File([input.files[0]], Date.now() + ext, {type: input.files[0].type});
            const reader = new FileReader();
            reader.onload = function (e: any) {
                const res = e.target.result;
                const imgObject: IImage = {
                    name: productFile.name,
                    content: res,
                    type: productFile.type,
                    tag: selectedTag,
                };
                uploadImage(imgObject);


                console.log("productFile", productFile, imgObject);
                onClickImage(imgObject);
            }

            reader.readAsDataURL(input.files[0]);
            // renaming file
        }

    }


    const uploadImage = async (image: IImage) => {
        setLoading(true);
        try {
            const blob = dataURItoBlob(image.content)
            const productURLName = 'image';
            const photoName = `${productURLName}-${Date.now()}.png`;
            const file = new File([blob], photoName);
            const responseImage = await uploadGCloudImage(file, selectedTag);
            const url = `https://storage.googleapis.com/download/storage/v1/b/betuel-tech-photos/o/${photoName}?alt=media`;
            image.content = url;
            setImages([image, ...images]);

            console.log(responseImage, "image");
            toast("Foto Agregada", {type: "default"})
        } catch (err: any) {
            toast(err.message, {type: "error"})
        }
        setLoading(false);
    }

    const deleteImage = async (image: IImage) => {
        setLoading(true);
        try {
            await deletePhoto(image.name);
            const imagesData = images.filter((img) => img.name !== image.name);
            setTaggedImages({...taggedImages, [selectedTag]: imagesData});
            toast("Foto Eliminada", {type: "default"})
        } catch (err: any) {
            toast(err.message, {type: "error"})
        }
        setLoading(false);
        resetImageToDelete()
    }

    const resetImageToDelete = () => setImageToDelete(undefined);

    const deleteSelectedImage = () => imageToDelete && deleteImage(imageToDelete)
    const selectImageToDelete = (image: IImage) => (ev: any) => {
        ev.stopPropagation();
        setImageToDelete(image)
    };

    return (
        <div className={`images-handler-wrapper ${open ? 'open' : ''}`}>
            <div>
                <TagContainer className="d-flex w-100">
                    {
                        tags.map((tag, key) => (
                            <TagItem onClick={() => setSelectedTag(tag)}
                                     selected={selectedTag === tag} key={key}>
                                <span>{tag}</span>
                            </TagItem>
                        ))
                    }
                </TagContainer>
            </div>
            <div className="images-handler-grid">
                <i className={`bi bi-x-lg image-handler-close ${!open ? 'd-none' : ''}`} onClick={toggle}/>
                {!loading ? null : (
                    <div className="images-handler-loading-container">
                        <Spinner animation="grow" variant="secondary"/>
                    </div>
                )}
                <label className="image-handler-uploader">
                    <i className="bi bi-plus"></i>
                    <input type="file"
                           className="invisible position-absolute image-handler-input-file"
                           onChange={onChangeElementImage}
                           accept="image/png, image/gif, image/jpeg, image/webp"/>
                </label>
                {
                    images.map((image) =>
                        <div className="image-handler-wrapper" onClick={handleClickImage(image)}>
                            <i className="bi bi-trash image-handler-delete" onClick={selectImageToDelete(image)}/>
                            <img className="image-item" src={image.content} alt=""/>
                            <p>{image.name}</p>
                        </div>
                    )
                }
            </div>
            <Modal isOpen={!!imageToDelete} toggle={resetImageToDelete}>
                <ModalHeader toggle={resetImageToDelete}>Confirmación</ModalHeader>
                <ModalBody>
                    ¿Estas Seguro que deseas eliminar esta imagen?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={deleteSelectedImage}>Confirmar</Button>{' '}
                    <Button color="secondary" onClick={resetImageToDelete}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}
