import { ActivityItem } from '@/Components/ActivityList';
import { getData, postDataJSON, updateData } from './api';
import { Activity, ActivityResponse } from './types';

const getByCat = (catId: string | number, offset: number = 0, limit: number = 50): Promise<Activity[]> => 
    getData<Activity[]>(`/activities/${catId}/cat?offset=${offset}&limit=${limit}`);

const getByCamera = (cameraId: string | number, offset: number = 0, limit: number = 5): Promise<ActivityItem[]> => 
    getData<ActivityItem[]>(`/activities/camera/${cameraId}`);

const getByCompany = (companyId: string | number, offset: number = 0, limit: number = 50): Promise<Activity[]> => 
    getData<Activity[]>(`/activities/${companyId}/company?offset=${offset}&limit=${limit}&relations=cat,camera`);

const create = (data: Partial<Activity>): Promise<ActivityResponse> => 
    postDataJSON<ActivityResponse>('/activities', data, "Atividade registrada com sucesso!");

const update = (id: string | number, data: Partial<Activity>): Promise<ActivityResponse> => 
    updateData<ActivityResponse>('/activities/', id.toString(), data, "Atividade atualizada com sucesso!");

export default {
    getByCat,
    getByCamera,
    getByCompany,
    create,
    update
};