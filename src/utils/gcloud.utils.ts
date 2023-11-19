import {dataURItoBlob} from "./blob";
import {uploadGCloudImage} from "../services/gcloud";
import {IMedia, IMediaTagTypes} from "../components/GCloudMediaHandler/GCloudMediaHandler";
import React from "react";
import {removeExtraCharactersFromText, removeHTMLChars} from "./text.utils";

export const uploadMedia = async (media: IMedia, selectedTag: IMediaTagTypes, mediaNameText: string = 'media') => {
        const blob = dataURItoBlob(media.content)
        const type = media.type.split('/')[1];
        const mediaNameClean = removeExtraCharactersFromText(removeHTMLChars(mediaNameText)).replace(/ /g, '-').toLowerCase();
        const mediaName = `${mediaNameClean}-${Date.now()}.${type}`;

        const file = new File([blob], mediaName);
        const responseImage = await uploadGCloudImage(file, selectedTag, media.type);
        const url = `https://storage.googleapis.com/download/storage/v1/b/betuel-tech-photos/o/${mediaName}?alt=media`;
        media.content = url;
        return media;
}

export const onChangeMediaToUpload = (selectedTag: IMediaTagTypes, callBack?: (content: IMedia) => void, mediaName: string = 'media') => async (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const url = event.target?.value;
        const ext = url ? '.' + url.substring(url.lastIndexOf('.') + 1).toLowerCase(): '.png';
        if (input.files && input.files[0]) {
                const file = new File([input.files[0]], Date.now() + ext, {type: input.files[0].type});
                const reader = new FileReader();
                reader.onload = async function (e: any) {
                        // setLoading(true);
                        const res = e.target.result;
                        const mediaObject: IMedia = {
                                name: file.name,
                                content: res,
                                type: file.type,
                                tag: selectedTag,
                        };
                        const media = await uploadMedia(mediaObject, selectedTag, mediaName);

                        callBack && media && callBack(media);
                        // setLoading(false);
                }

                await reader.readAsDataURL(input.files[0]);
                // renaming file
        }

}
