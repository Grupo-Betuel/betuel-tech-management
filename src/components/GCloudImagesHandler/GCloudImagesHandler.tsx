import React from "react";
import {deletePhoto, getGCloudImages, uploadGCloudImage} from "../../services/gcloud";
import "./GCloudImagesHandler.scss";
import {dataURItoBlob} from "../../utils/blob";
import {toast} from "react-toastify";
import {Spinner} from "reactstrap";
import {ImageTypes} from "../../model/interfaces/FlyerDesigner.interfaces";

export interface IImage {
    name: string;
    content: string;
    type: string;
    uploaded?: boolean;
}

export interface IGCloudImagesHandlerProps {
    onClickImage: (image: IImage) => void;
    toggle: () => void;
    open?: boolean;
}

export const GCloudImagesHandler = ({onClickImage, toggle, open }: IGCloudImagesHandlerProps) => {
    const [images, setImages] = React.useState<IImage[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    const getImages = async () => {
        setLoading(true);
        const data = await getGCloudImages();
        setImages(data);
        setLoading(false);

    }

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
            const responseImage = await uploadGCloudImage(file);
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

    const deleteImage = (image: IImage) => async () => {
        setLoading(true);
        try {
            await deletePhoto(image.name);
            setImages(images.filter((img) => img.name !== image.name));
            toast("Foto Eliminada", {type: "default"})
        } catch (err: any) {
            toast(err.message, {type: "error"})
        }
        setLoading(false);
    }


    return (
        <div className={`images-handler-grid ${open ? 'open' : ''}`} >
            <i className={`bi bi-x-lg image-handler-close ${!open ? 'd-none' : ''}`} onClick={toggle} />
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
                       accept="image/png, image/gif, image/jpeg"/>
            </label>
            {
                images.map((image) =>
                    <div className="image-handler-wrapper" onClick={handleClickImage(image)}>
                        <i className="bi bi-trash image-handler-delete" onClick={deleteImage(image)}/>
                        <img className="image-item" src={image.content} alt=""/>
                    </div>
                )
            }
        </div>
    )
}
