import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export const API_URL = import.meta.env.VITE_URL_API || 'http://localhost:3000';

export const getData = async <T>(path: string, id: string = ''): Promise<T> => {
    try {
        const response = await fetch(`${API_URL}${path}${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${Cookies.get("token") || ''}`,
                "Accept": "*/*"
            }
        });

        if (response.status === 500) {
            toast.error("Internal error, please try again later");
            throw new Error("Internal error, please try again later");
        }

        if (response.status === 401) {
            Cookies.remove("token");
            window.location.href = "/login";
            throw new Error("Session expired, please login again");
        }

        const data = await response.json();
        return data.data as T;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const postDataJSON = async <T>(path: string, body: any, message?: string): Promise<T> => {
    try {
        const response = await fetch(`${API_URL}${path}`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${Cookies.get("token") || ''}`,
                'Content-Type': "application/json",
                'Accept': "*/*"
            },
            body: JSON.stringify(body)
        });

        if (response.status === 401) {
            Cookies.remove("token");
            window.location.href = "/login";
            throw new Error("Session expired, please login again");
        }

        const data = await response.json();

        if (data.success && message) {
            toast.success(message);
        } else if (data.message) {
            toast.error(data.message);
        }

        return data as T;
    } catch (error) {
        console.error("API Error:", error);
        toast.error("Error connecting to server");
        throw error;
    }
};

export const postDataFormData = async <T>(path: string, formData: FormData, message?: string): Promise<T> => {
    try {
        const response = await fetch(`${API_URL}${path}`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${Cookies.get("token") || ''}`,
                'Accept': "*/*"
            },
            body: formData
        });

        if (response.status === 401) {
            Cookies.remove("token");
            window.location.href = "/login";
            throw new Error("Session expired, please login again");
        }

        const data = await response.json();

        if (data.success && message) {
            toast.success(message);
        } else if (data.message) {
            toast.error(data.message);
        }

        return data as T;
    } catch (error) {
        console.error("API Error:", error);
        toast.error("Error connecting to server");
        throw error;
    }
};

export const deleteData = async (path: string, id: string, message?: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}${path}${id}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${Cookies.get("token") || ''}`,
                'Accept': "*/*"
            }
        });

        if (response.status === 401) {
            Cookies.remove("token");
            window.location.href = "/login";
            throw new Error("Session expired, please login again");
        }

        if (response.ok && message) {
            toast.success(message);
        }

        return response.ok;
    } catch (error) {
        console.error("API Error:", error);
        toast.error("Error connecting to server");
        throw error;
    }
};

export const updateData = async <T>(path: string, id: string, body: any, message?: string): Promise<T> => {
    try {
        const response = await fetch(`${API_URL}${path}${id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get("token") || ''}`,
                'Accept': "*/*"
            },
            body: JSON.stringify(body)
        });

        if (response.status === 401) {
            Cookies.remove("token");
            window.location.href = "/login";
            throw new Error("Session expired, please login again");
        }

        const data = await response.json();
        
        if (data.success && message) {
            toast.success(message);
        }

        return data as T;
    } catch (error) {
        console.error("API Error:", error);
        toast.error("Error connecting to server");
        throw error;
    }
};

export const uploadImage = async <T>(formData: FormData): Promise<T> => {
    try {
        const response = await fetch(`${API_URL}/s3/upload-image`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${Cookies.get("token") || ''}`,
                'Accept': "*/*"
            },
            body: formData
        });

        if (response.status === 401) {
            Cookies.remove("token");
            window.location.href = "/login";
            throw new Error("Session expired, please login again");
        }

        // Accept 200-299 status codes (201 for successful creation)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error uploading image');
        }

        const data = await response.json();
        return data as T;
    } catch (error) {
        console.error("API Error:", error);
        toast.error(error instanceof Error ? error.message : "Error uploading image");
        throw error;
    }
};

export default {
    API_URL,
    getData,
    postDataJSON,
    postDataFormData,
    deleteData,
    updateData,
    uploadImage
};
