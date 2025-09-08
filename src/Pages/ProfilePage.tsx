import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { EmployeeData, CompanyData } from '@/Components/Profile';
import { EmployeeService } from '@/Services';
import { Company } from '@/Services/types';

interface JwtPayload {
  id?: string;
  name?: string;
  picture?: string;
  company?: string;
  [key: string]: any;
}

interface EmployeeWithCompany {
  _id: string;
  employeeName: string;
  employeeEmail: string;
  employeePicture: string;
  employeeAccessLevel: number;
  company: Company;
}

const ProfilePage = () => {
  const [employee, setEmployee] = useState<EmployeeWithCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          setError('Você precisa estar autenticado');
          setLoading(false);
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        const employeeId = decoded.id;
        
        if (!employeeId) {
          setError('ID do funcionário não encontrado');
          setLoading(false);
          return;
        }

        const employeeData = await EmployeeService.getOne(employeeId);
        
        if (employeeData && typeof employeeData.company === 'object') {
          setEmployee(employeeData as unknown as EmployeeWithCompany);
        } else {
          setError('Dados da empresa não encontrados');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Erro ao carregar dados do perfil');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6">
        <p className="text-xl text-red-500">{error || 'Dados não encontrados'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Perfil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmployeeData 
          _id={employee._id}
          name={employee.employeeName}
          picture={employee.employeePicture}
          email={employee.employeeEmail}
        />
        
        <CompanyData 
          _id={employee.company._id}
          cnpj={employee.company.companyCNPJ}
          name={employee.company.companyName}
          logo={employee.company.companyLogo}
          phone={employee.company.companyDetails?.companyPhone !== undefined ? String(employee.company.companyDetails.companyPhone) : ''}
          color={employee.company.companyDetails?.companyColor || '#3c8054'}
        />
      </div>
    </div>
  );
};

export default ProfilePage;