import React from "react";
import "./FlyerDesignerImageSelector.scss";
import {GCloudMediaHandler, IMedia} from "../../../GCloudMediaHandler/GCloudMediaHandler";

export interface IFlyerDesignerImageSelectorProps {
    onClickMedia: (media: IMedia) => void;
    mediaName?: string;
}

export const FlyerDesignerImageSelector = (
    {
        onClickMedia,
        mediaName,
    }: IFlyerDesignerImageSelectorProps) => {

    const handleClickMedia = (media: IMedia) => {
        onClickMedia(media);
    }

    return (
        <div className="flyer-designer-image-selector">
            <GCloudMediaHandler onClickMedia={handleClickMedia} mediaName={mediaName}/>
        </div>
    )
}