// Resosta genérica para as requisições da API
export interface ApiResponse {
  ok: boolean;
  message?: string;
  _id?: string;
}

export interface LoginCredentials {
  employeeEmail: string;
  employeePassword: string;
}

export interface LoginResponse extends ApiResponse {
  token: string;
}

export interface Animal {
  _id: string;
  petName: string;
  petBirth: Date;
  petGender: string;
  petPicture: string;
  petObs: string;
  petCharacteristics: {
      petCastrated: string;
      petBreed: string;
      petSize: string;
  };
  physicalCharacteristics: {
      furColor: string;
      furLength: string;
      eyeColor: string;
      size: number;
      weight: number;
  };
  behavioralCharacteristics: {
      personality: string;
      activityLevel: string;
      socialBehavior: string;
      meow: string;
  };
  petComorbidities: string;
  petVaccines: Array<string>;
  company: string;
  petStatus: {
      petCurrentStatus: string;
      petOccurrencesQuantity: number;
      petLastOccurrence: Date | null; 
  };
  petFavorite: boolean;
  lastEditedBy?: {
    _id: string;
    employeeName: string;
    employeeEmail?: string;
    employeePicture?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AnimalResponse extends ApiResponse {
  result?: Animal | Animal[];
}

export interface Camera {
  _id: string;
  cameraStatus: number;
  cameraLocation: string;
  cameraDescription: string;
  cameraUrl: string;
  cameraPicture?: string;
  company: string;
}

export interface CameraResponse extends ApiResponse {
  result?: Camera | Camera[];
}

export interface Activity {
  _id: string;
  activityAuthor: string | Animal;
  activityData: {
      activityName: string;
      activityStart: Date;
      activityEnd: Date;
  };
  activityCameraAuthor: string | Camera;
}

export interface ActivityResponse extends ApiResponse {
  result?: Activity | Activity[];
}

export interface Notification {
  _id: string;
  notificationDate: Date;
  notificationTarget: string;
  Targets: string;
  notificationOrigin: string;
  Origin: string;
  notificationStatus: boolean;
  notificationDescription: string;
}

export interface NotificationResponse extends ApiResponse {
  result?: Notification | Notification[];
}

export interface Company {
  _id: string;
  companyCNPJ: string;
  companyName: string;
  companyLogo: string;
  companyDetails: {
      companyColor: string;
      companyPhone: number;
  };
}

export interface CompanyResponse extends ApiResponse {
  result?: Company;
}

export interface Employee {
  _id: string;
  employeeName: string;
  employeeEmail: string;
  employeePassword?: string;
  employeePicture: string;
  employeeAccessLevel: number;
  company: string | Company;
}

export interface Feedback {
    _id: string;
    feedbackText: string;
    feedbackDate: Date;
    feedbackAuthor?: string | {
        _id: string;
        employeeName: string;
        employeeEmail?: string;
        employeePicture?: string;
    };
}

export interface EmployeeResponse extends ApiResponse {
  result?: Employee | Employee[];
}

export interface ImageUploadResponse extends ApiResponse {
  img_url: string;
}
