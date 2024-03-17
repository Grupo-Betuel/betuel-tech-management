import React from "react";
import {deletePhoto, getGCloudImages} from "../../services/gcloud";
import "./GCloudImagesHandler.scss";
import {toast} from "react-toastify";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import {TagContainer, TagItem} from "../Tag/Tag";
import {onChangeMediaToUpload} from "../../utils/gcloud.utils";

export interface IMedia {
    name: string;
    content: string;
    type: string;
    uploaded?: boolean;
    tag: string;
}

export interface IGCloudImagesHandlerProps {
    onClickMedia: (media: IMedia) => void;
    mediaName?: string;
    preselectTag?: IMediaTagTypes;
    mediasData:IMedia[];
}

export type IMediaTagTypes = 'element' | 'product' | 'background' | 'logo' | 'flyer' | 'image' | 'audio' | 'video' | 'wallpaper' | 'receipt' | 'storyTemplate' | 'messenger' | 'invoice';
export type ITaggedImages = { [N in IMediaTagTypes]: IMedia[] };

export const GCloudMediaHandler = ({onClickMedia, mediaName, preselectTag, mediasData}: IGCloudImagesHandlerProps) => {
    const [medias, setMedias] = React.useState<IMedia[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [imageToDelete, setImageToDelete] = React.useState<IMedia>();
    const [taggedImages, setTaggedImages] = React.useState<ITaggedImages>({} as ITaggedImages);
    const [selectedTag, setSelectedTag] = React.useState<IMediaTagTypes>(preselectTag || 'product');
    const [tags, setTags] = React.useState<IMediaTagTypes[]>([]);

    const computeMedias = () => {
        // setLoading(true);
        // const data = await getGCloudImages();
        const taggedImagesData: ITaggedImages = {} as ITaggedImages;
        mediasData.forEach((image: IMedia) => {
            const tag = image.tag as IMediaTagTypes || 'element';
            taggedImagesData[tag] = [...(taggedImagesData[tag] || []), image];
        });
        setTaggedImages(taggedImagesData);
        setTags(Object.keys(taggedImagesData) as IMediaTagTypes[]);
        // setImages(taggedImagesData[selectedTag] || []);
        // setLoading(false);
    }

    React.useEffect(() => {
        computeMedias();
    }, [mediasData])

    React.useEffect(() => {
        if (preselectTag !== selectedTag) {
            setSelectedTag(preselectTag || selectedTag);
        }
    }, [preselectTag])

    React.useEffect(() => {
        setMedias(taggedImages[selectedTag] || []);
    }, [selectedTag, taggedImages]);

    const handleClickImage = (image: IMedia) => () => {
        onClickMedia(image)
    }

    React.useEffect(() => {
        computeMedias();
    }, []);


    const onChangeElementImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        await onChangeMediaToUpload(selectedTag, handleUploadedMedia, mediaName)(event);
        setLoading(false);

        // const input = event.target;
        // const url = event.target.value;
        // const ext = '.' + url.substring(url.lastIndexOf('.') + 1).toLowerCase();

        // // if (input.files && input.files[0]) {
        // //     const file = new File([input.files[0]], Date.now() + ext, {type: input.files[0].type});
        // //     const reader = new FileReader();
        // //     reader.onload = async function (e: any) {
        //         setLoading(true);
        // // const res = e.target.result;
        // // const mediaObject: IMedia = {
        // //     name: file.name,
        // //     content: res,
        // //     type: file.type,
        // //     tag: selectedTag,
        // // };
        // // const media = await uploadImage(mediaObject);

        // // media && onClickMedia(media);

        // }

        // reader.readAsDataURL(input.files[0]);
        // renaming file
        // }

    }


    const handleUploadedMedia = (media: IMedia) => {
        setMedias([media, ...medias]);
        onClickMedia && onClickMedia(media);
    }

    const uploadImage = async (media: IMedia) => {
        setLoading(true);
        try {
            // const mediaResults = await uploadMedia(media, selectedTag);

            // const blob = dataURItoBlob(media.content)
            // const productURLName = 'image';
            // const photoName = `${productURLName}-${Date.now()}.png`;
            // const file = new File([blob], photoName);
            // const responseImage = await uploadGCloudImage(file, selectedTag);
            // const url = `https://storage.googleapis.com/download/storage/v1/b/betuel-tech-photos/o/${photoName}?alt=media`;
            // media.content = url;
            // setImages([mediaResults, ...images]);
            // toast("Media Agregada", {type: "default"})
            // return mediaResults;

        } catch (err: any) {
            toast(err.message, {type: "error"})
        }
        setLoading(false);
    }

    const deleteImage = async (image: IMedia) => {
        setLoading(true);
        try {
            await deletePhoto(image.name);
            const imagesData = medias.filter((img) => img.name !== image.name);
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
    const selectImageToDelete = (image: IMedia) => (ev: any) => {
        ev.stopPropagation();
        setImageToDelete(image)
    };

    return (
        <div className={`images-handler-wrapper`}>
            <div className="images-handler-tags">
                <TagContainer className="d-flex w-100">
                    {
                        tags.map((tag, key) => (
                            <TagItem onClick={() => setSelectedTag(tag)}
                                     selected={selectedTag === tag} key={`${key}-${tag}`}>
                                <span>{tag}</span>
                            </TagItem>
                        ))
                    }
                </TagContainer>
            </div>
            <div className="images-handler-grid">
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
                           accept="image/png, image/jpeg, image/webp"/>
                </label>
                {
                    medias.map((image, key) =>
                        <div className="image-handler-wrapper" onClick={handleClickImage(image)}
                             key={`${key}-${image.name}`}>
                            <i className="bi bi-trash image-handler-delete" onClick={selectImageToDelete(image)}/>
                            {image.type.includes('video') ?
                                <video className="image-item" controls>
                                    <source src={image.content} type={image.type}/>
                                </video>
                                : <img className="image-item" src={image.content} alt=""/>
                            }
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
