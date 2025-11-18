import { getData, postDataFormData, updateData, deleteData } from './api';
import { User, UserResponse } from './types';

const getAll = (offset: number = 0, limit: number = 50): Promise<User[]> => 
    getData<User[]>(`/users?offset=${offset}&limit=${limit}`);

const getOne = (id: string): Promise<User> => 
    getData<User>('/users/', id);

const create = (formData: FormData): Promise<UserResponse> => 
    postDataFormData<UserResponse>('/users', formData, "User registered successfully!");

const update = (id: string, data: Partial<User> | FormData): Promise<UserResponse> => {
    if (data instanceof FormData) {
        return postDataFormData<UserResponse>(`/users/${id}`, data, "User data updated successfully!");
    }
    return updateData<UserResponse>('/users/', id, data, "User data updated successfully!");
};

const remove = (id: string): Promise<boolean> => 
    deleteData('/users/', id, "User removed successfully!");

const forgotPassword = (email: string): Promise<UserResponse> => 
    postDataFormData<UserResponse>('/users/forgot-password', { email }, "If the email exists, a reset link has been sent!");

const resetPassword = (token: string, newPassword: string): Promise<UserResponse> => 
    postDataFormData<UserResponse>('/users/reset-password', { token, newPassword }, "Password updated successfully!");

export default {
    getAll,
    getOne,
    create,
    update,
    remove,
    forgotPassword,
    resetPassword
};