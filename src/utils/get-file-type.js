import {ERROR} from "src/libs/log";

export const getFileType = (fileUrl) => {
    try {
        const images = ["jpg", "gif", "png", "jpeg"]
        const videos = ["mp4", "3gp", "ogg", "avi"]
        const extension = getFileExtension(fileUrl);
        if (images.includes(extension)) {
            return "image";
        } else if (videos.includes(extension)) {
            return "video"
        }

        return "other";
    } catch (e) {
        ERROR("Error", e);
        return "other";
    }

};

export const getFileExtension = (fileUrl) => {
    const url = new URL(fileUrl);
    return url.pathname.split(".").pop().toLowerCase();
};