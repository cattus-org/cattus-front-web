import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { API_URL } from './api';
import { LoginCredentials, LoginResponse } from './types';

const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${API_URL}/auth`, {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                'Accept': "*/*"
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (data.success) {
            Cookies.set("token", data.data.token);
            return data as LoginResponse;
        } else {
            toast.error(data.message || "Error logging in");
            throw new Error(data.message || "Error logging in");
        }
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
};

const logout = async (): Promise<void> => {
    Cookies.remove("token");
    window.location.href = "/login";
};

export default {
    login,
    logout
};