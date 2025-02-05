import { EncodedFile } from "../interfaces/file-utils.interface";
import { Attachment } from "../interfaces/task.interface";

export const fileToBase64 = ({file, id}: Attachment): Promise<EncodedFile> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve({ fileId: id, base64: base64String, filename: file.name, mimeType: file.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file); // Converts the file to base64
    });
};

export const base64ToFile = ({ base64, filename, mimeType, fileId }: EncodedFile): Attachment => {
    const byteCharacters = atob(base64.split(',')[1]); // Decode base64 string (remove the "data:*/*;base64," part)
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset++) {
        const byte = byteCharacters.charCodeAt(offset);
        byteArrays.push(byte);
    }

    const blob = new Blob([new Uint8Array(byteArrays)], { type: mimeType });
    return {file: new File([blob], filename, { type: mimeType }), id: fileId};
};
