
import { getData, postDataJSON, deleteData } from './api';
import { Activity, ActivityResponse } from './types';

const getAll = (animalId: string): Promise<Activity[]> => 
    getData<Activity[]>(`/activity/select-all/${animalId}`);

const getOne = (id: string): Promise<Activity> => 
    getData<Activity>('/activity/select-one/', id);

const create = (data: Partial<Activity>): Promise<ActivityResponse> => 
    postDataJSON<ActivityResponse>('/activity/create', data, "Atividade registrada com sucesso!");

const remove = (id: string): Promise<boolean> => 
    deleteData('/activity/delete/', id, "Atividade removida com sucesso!");

const getAverageActivity = (interval: string): Promise<any> => 
    getData<any>(`/activity/charts/average-animal-activity/${interval}`);

const getByCameraId = (cameraId: string): Promise<Activity[]> =>
    getData<Activity[]>(`/activity/select-by-camera/${cameraId}`);

export default {
    getAll,
    getOne,
    create,
    remove,
    getAverageActivity,
    getByCameraId
};