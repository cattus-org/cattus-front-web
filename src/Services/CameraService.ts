import { getData, postDataJSON, updateData, deleteData } from './api';
import { Camera, CameraResponse } from './types';

const getAll = (offset: number = 0, limit: number = 50): Promise<Camera[]> => 
    getData<Camera[]>(`/cameras`);

const getOne = (id: string | number): Promise<Camera> => 
    getData<Camera>('/cameras/', id.toString());

const create = (data: Partial<Camera>): Promise<CameraResponse> => 
    postDataJSON<CameraResponse>('/cameras', data, "Camera registered successfully!");

const update = (id: string | number, data: Partial<Camera>): Promise<CameraResponse> => 
    updateData<CameraResponse>('/cameras/', id.toString(), data, "Camera data updated successfully!");

const remove = (id: string | number): Promise<boolean> => 
    deleteData('/cameras/', id.toString(), "Camera removed successfully!");

const softDelete = (id: string | number): Promise<CameraResponse> => 
    updateData<CameraResponse>('/cameras/', id.toString(), {}, "Camera removed successfully!");

export default {
    getAll,
    getOne,
    create,
    update,
    remove,
    softDelete
};