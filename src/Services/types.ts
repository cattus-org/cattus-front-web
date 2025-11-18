// Generic response for API requests
export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse extends ApiResponse {
  data: {
    token: string;
  };
}

export interface Animal {
  id: number;
  name: string;
  birthDate: string | Date;
  sex: string;
  picture: string;
  observations: string;
  vaccines?: string[];
  comorbidities?: string[];
  weight?: number;
  favorite: boolean;
  status: string;
  company?: Company;
  createdBy?: User;
  updatedBy?: User;
  activities?: Activity[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  deleted?: boolean;
  deletedAt?: string | Date;
  // Legacy fields for backward compatibility
  _id?: string;
  petName?: string;
  petGender?: string;
  petBirth?: string | Date;
  petPicture?: string;
  petStatus?: {
    petCurrentStatus: string;
  };
}

export interface AnimalResponse extends ApiResponse {
  data?: Animal | Animal[];
}

export interface Camera {
  id: number;
  url: string;
  name: string;
  thumbnail?: string;
  company?: Company;
  createdBy?: User;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  deleted?: boolean;
  deletedAt?: string | Date;
  // Legacy fields for backward compatibility
  _id?: string;
  cameraLocation?: string;
  cameraStatus?: number;
  cameraPicture?: string;
}

export interface CameraResponse extends ApiResponse {
  data?: Camera | Camera[];
}

export type ActivityTitleEnum = 'eat' | 'sleep' | 'defecate' | 'urinate' | 'drink';

export interface Activity {
  id: number;
  title: ActivityTitleEnum;
  cat: Animal;
  startedAt: string | Date;
  endedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // Legacy fields
  camera?: Camera;
  startTime?: string | Date;
  endTime?: string | Date;
}

export interface ActivityResponse extends ApiResponse {
  data?: Activity | Activity[];
}

export interface Notification {
  id: number;
  date: Date;
  target: string;
  origin: string;
  status: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationResponse extends ApiResponse {
  data?: Notification | Notification[];
}

export interface Company {
  id?: number;
  _id?: string;
  name?: string;
  cnpj?: string;
  logo?: string;
  logotype?: string;
  color?: string;
  phone?: string;
  users?: User[];
  cats?: Animal[];
  cameras?: Camera[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyResponse extends ApiResponse {
  data?: Company;
}

export interface User {
  id?: number;
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  access_level?: string;
  company?: Company;
  createdCameras?: Camera[];
  createdAnimals?: Animal[];
  updatedAnimals?: Animal[];
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: boolean;
  deletedAt?: Date;
}

export interface Feedback {
    id: number;
    text: string;
    date: Date;
    author?: User;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserResponse extends ApiResponse {
  data?: User | User[];
}

export interface ImageUploadResponse extends ApiResponse {
  data: {
    img_url: string;
  };
}
