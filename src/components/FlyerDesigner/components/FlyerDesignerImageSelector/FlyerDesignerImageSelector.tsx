import React from "react";
import "./FlyerDesignerImageSelector.scss";
import {GCloudMediaHandler, IMedia, IMediaTagTypes} from "../../../GCloudMediaHandler/GCloudMediaHandler";
import {ImageTypes} from "../../../../model/interfaces/FlyerDesigner.interfaces";

export interface IFlyerDesignerImageSelectorProps {
    onClickMedia: (media: IMedia) => void;
    mediaName?: string;
    imageToChangeType?: ImageTypes;
    medias: IMedia[];
}

export const FlyerDesignerImageSelector = (
    {
        onClickMedia,
        mediaName,
        imageToChangeType,
        medias,
    }: IFlyerDesignerImageSelectorProps) => {
    const [preselectMediaTag, setPreselectMediaTag] = React.useState<IMediaTagTypes>();

    React.useEffect(() => {
        if (imageToChangeType) {
            let tag = preselectMediaTag;
            switch (imageToChangeType) {
                case 'templateImage':
                    tag = 'background';
                    break;
                case 'content':
                    tag = 'product';
                    break;
                default:
                    break;
            }
            tag && setPreselectMediaTag(tag);
        }
    }, [imageToChangeType]);

    const handleClickMedia = (media: IMedia) => {
        onClickMedia(media);
    }


    return (
        <div className="flyer-designer-image-selector">
            <GCloudMediaHandler mediasData={medias} onClickMedia={handleClickMedia} mediaName={mediaName} preselectTag={preselectMediaTag}/>
        </div>
    )
}