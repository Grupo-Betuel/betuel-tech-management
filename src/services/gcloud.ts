export const uploadPhoto = async (file: File) => {
    const filename = encodeURIComponent(file.name);
    const res = await fetch(`${process.env.REACT_APP_API}products/upload-url/${filename}`);
    const {url, fields} = await res.json();
    const formData = new FormData();

    Object.entries({...fields, file}).forEach(([key, value]: any) => {
        formData.append(key, value);
    });

    return await fetch(url, {
        method: 'POST',
        body: formData,
    });
};

export const gcloudPublicURL = "https://storage.googleapis.com/betuel-tech-photos/"
export const gcloudAuthenticatedURL = "https://storage.cloud.google.com/betuel-tech-photos/"
