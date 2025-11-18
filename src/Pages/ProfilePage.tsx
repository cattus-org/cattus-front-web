import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { EmployeeData, CompanyData } from '@/Components/Profile';
import { EmployeeService, CompanyService } from '@/Services';
import { User, Company } from '@/Services/types';

interface JwtPayload {
  id?: string;
  name?: string;
  picture?: string;
  company?: string;
  [key: string]: any;
}

interface EmployeeWithCompany {
  id?: string | number;
  _id?: string;
  name: string;
  email: string;
  picture?: string;
  access_level: string;
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
          setError('You need to be authenticated');
          setLoading(false);
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        const employeeId = decoded.id;
        
        if (!employeeId) {
          setError('Employee ID not found');
          setLoading(false);
          return;
        }

        const employeeData = await EmployeeService.getOne(employeeId);
        console.log('Employee data received:', employeeData);
        
        if (employeeData && employeeData.company) {
          setEmployee(employeeData as EmployeeWithCompany);
        } else {
          setError('Company data not found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Error loading profile data');
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
        <p className="text-xl text-red-500">{error || 'Data not found'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmployeeData 
          _id={String(employee.id || employee._id || '')}
          name={employee.name}
          picture={employee.picture || '/imgs/profile_sample.png'}
          email={employee.email}
        />
        
        <CompanyData 
          _id={String(employee.company.id)}
          cnpj={employee.company.cnpj || ''}
          name={employee.company.name || ''}
          logo={employee.company.logo || employee.company.logotype || '/imgs/logo_compact.png'}
          phone={employee.company.phone || ''}
          color={employee.company.color || '#3c8054'}
        />
      </div>
    </div>
  );
};

export default ProfilePage;