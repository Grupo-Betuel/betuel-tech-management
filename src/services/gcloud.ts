// import {IMediaTagTypes} from "../components/GCloudMediaHandler/GCloudMediaHandler";
//
// export const uploadGCloudImage = async (file: File, selectedTag: IMediaTagTypes, type: string = 'image/png') => {
//     const filename = encodeURIComponent(file.name);
//     const res = await fetch(`${process.env.REACT_APP_API}gcloud/upload-url/${filename}/${selectedTag}/${type.replace('/', '^')}`);
//     const {url, fields} = await res.json();
//     const formData = new FormData();
//
//     Object.entries({...fields, file}).forEach(([key, value]: any) => {
//         formData.append(key, value);
//     });
//
//     return await fetch(url, {
//         method: 'POST',
//         body: formData,
//     });
// };
//
// export const gcloudPublicURL = "https://storage.googleapis.com/betuel-tech-photos/"
// export const gcloudAuthenticatedURL = "https://storage.cloud.google.com/betuel-tech-photos/"
//
// export const deletePhoto = async (filename: string) => {
//
//         return await fetch(`${process.env.REACT_APP_API}gcloud/image/${filename}`, {
//             method: 'DELETE',
//         });
//
// }
//
//
// export const getGCloudImages = async () => {
//     try {
//         const response = await fetch(`${process.env.REACT_APP_API}gcloud/images`);
//         return await response.json() as any;
//     } catch (e) {
//         throw e;
//     }
// }


import { IMediaTagTypes } from "../components/GCloudMediaHandler/GCloudMediaHandler";
import imageCompression from 'browser-image-compression';

// Function to compress the image
const compressImage = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 0.300, // Maximum size in MB
        maxWidthOrHeight: 800, // Maximum width or height in pixels
        useWebWorker: true,
    };
    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error("Error compressing the image:", error);
        return file;
    }
};

// Function to upload the image to Google Cloud Storage
export const uploadGCloudImage = async (file: File, selectedTag: IMediaTagTypes, type: string = 'image/png') => {
    try {
        const compressedFile = await compressImage(file);
        const filename = encodeURIComponent(compressedFile.name);
        const res = await fetch(`${process.env.REACT_APP_API}gcloud/upload-url/${filename}/${selectedTag}/${type.replace('/', '^')}`);
        const { url, fields } = await res.json();
        const formData = new FormData();

        Object.entries({ ...fields, file: compressedFile }).forEach(([key, value]: any) => {
            formData.append(key, value);
        });

        return await fetch(url, {
            method: 'POST',
            body: formData,
        });
    } catch (error) {
        console.error("Error uploading the image:", error);
        throw error;
    }
};

// Function to delete the photo
export const deletePhoto = async (filename: string) => {
    try {
        return await fetch(`${process.env.REACT_APP_API}gcloud/image/${filename}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error("Error deleting the image:", error);
        throw error;
    }
};

// Function to get images from Google Cloud Storage
export const getGCloudImages = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API}gcloud/images`);
        return await response.json() as any;
    } catch (error) {
        console.error("Error fetching images:", error);
        throw error;
    }
};

// Constants for Google Cloud Storage URLs
export const gcloudPublicURL = "https://storage.googleapis.com/betuel-tech-photos/";
export const gcloudAuthenticatedURL = "https://storage.cloud.google.com/betuel-tech-photos/";
