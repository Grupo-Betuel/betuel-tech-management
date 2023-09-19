import LZString from "lz-string";
export class StorageImpl {
     getItem(key: string) {
        const response = LZString.decompressFromUTF16(localStorage.getItem(key) || '');
         if(response?.includes('@@@')) {
             return localStorage.getItem(key)
         }
        return response
    }
    setItem (key: string, value: string) {
        try {
            localStorage.setItem(key, LZString.compressToUTF16(value));
        } catch (err) {
            // quota exceeded or some other error
            // handle this however you want
        }
    }
    removeItem (key: string) {
        localStorage.removeItem(key);
    }
}

export const localStorageImpl = new StorageImpl()
