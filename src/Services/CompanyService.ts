import { getData, postDataFormData, updateData } from './api';
import { Company, CompanyResponse } from './types';

const getOne = (id: string): Promise<Company> => 
    getData<Company>('/companies/', id);

const create = (formData: FormData): Promise<CompanyResponse> => 
    postDataFormData<CompanyResponse>('/companies', formData, "Company registered successfully!");

const update = (id: string, data: Partial<Company> | FormData): Promise<CompanyResponse> => {
    if (data instanceof FormData) {
        return postDataFormData<CompanyResponse>(`/companies/${id}`, data, "Company data updated successfully!");
    }
    return updateData<CompanyResponse>('/companies/', id, data, "Company data updated successfully!");
};

export default {
    getOne,
    create,
    update
};