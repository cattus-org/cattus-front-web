import { getData, postDataJSON, updateData, deleteData } from './api';
import { Animal, AnimalResponse } from './types';

const getAll = (offset: number = 0, limit: number = 50): Promise<Animal[]> => 
    getData<Animal[]>(`/cats?offset=${offset}&limit=${limit}`);

const getOne = (id: string | number): Promise<Animal> => 
    getData<Animal>('/cats/', id.toString());

const create = (data: Partial<Animal>): Promise<AnimalResponse> => 
    postDataJSON<AnimalResponse>('/cats', data, "Cat registered successfully!");

const update = (id: string | number, data: Partial<Animal>): Promise<AnimalResponse> => 
    updateData<AnimalResponse>('/cats/', id.toString(), data, "Cat data updated successfully!");

const remove = (id: string | number): Promise<boolean> => 
    deleteData('/cats/', id.toString(), "Cat removed successfully!");

const softDelete = (id: string | number): Promise<AnimalResponse> => 
    updateData<AnimalResponse>('/cats/', id.toString(), {}, "Cat removed successfully!");

const changeFavorite = (id: string | number): Promise<AnimalResponse> => 
    updateData<AnimalResponse>('/cats/', id.toString(), {}, "Favorite updated successfully!");

const generateReport = (id: string | number, offset: number = 0, limit: number = 50): Promise<any> => 
    getData<any>(`/cats/report/${id}?offset=${offset}&limit=${limit}`);

const getMarkedAnimals = async (): Promise<Animal[]> => {
    const cats = await getAll();
    return cats.filter(cat => cat.favorite);
}

export default {
    getAll,
    getOne,
    create,
    update,
    remove,
    softDelete,
    changeFavorite,
    generateReport,
    getMarkedAnimals
};