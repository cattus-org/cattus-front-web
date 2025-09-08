import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { AuthService } from '../Services';
import { Switch } from '../Components/ui/switch';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { LoginCredentials } from '../Services/types';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    employeeEmail: '',
    employeePassword: ''
  });
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.employeeEmail || !credentials.employeePassword) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await AuthService.login(credentials);
      
      if (response.ok && response.token) {
        Cookies.set("token", response.token, { expires: rememberMe ? 7 : 1 });
        navigate('/loading');
      } else {
        setError(response.message || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Falha ao tentar fazer login. Credenciais inválidas.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black">

      <div className="hidden md:flex md:w-1/2 relative bg-cover bg-center" style={{ backgroundImage: "url('/imgs/login_background.jpg')" }}>
        <div className="absolute bottom-10 left-10 text-white">
          <p className="text-lg mb-2">
            Baixe o app para celular e acompanhe<br />
            seus gatos em qualquer lugar
          </p>
          <button className="flex items-center px-4 py-2 bg-black bg-opacity-50 rounded-md text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Google Play
          </button>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">

          <div className="flex justify-center mb-8">
            <img src="/imgs/logo_compact.png" alt="Cattus Icon" className="h-32 mr-4" /> 
            <img src="/imgs/logo_extended.png" alt="Cattus" className="h-16 mt-8" /> 
          </div>


          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-white">E-mail</label>
              <Input
                id="email"
                name="employeeEmail"
                type="email"
                value={credentials.employeeEmail}
                onChange={handleInputChange}
                placeholder="email@provedor.com"
                className={`w-full bg-gray-800 border-gray-700 text-white ${error ? 'border-red-500' : ''}`}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-white">Senha</label>
              <Input
                id="password"
                name="employeePassword"
                type="password"
                value={credentials.employeePassword}
                onChange={handleInputChange}
                placeholder="**********"
                className={`w-full bg-gray-800 border-gray-700 text-white ${error ? 'border-red-500' : ''}`}
                required
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  id="remember-me"
                />
                <label htmlFor="remember-me" className="text-sm text-white">
                  Lembrar de mim
                </label>
              </div>

              <button type="button" className="text-sm text-white hover:underline">
                Esqueci a senha?
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2"
              disabled={isLoading}
            >
              {isLoading ? "ENTRANDO..." : "ENTRAR"}
            </Button>

            <Button 
              type="button" 
              className="w-full border border-purple-600 text-white py-2 bg-transparent hover:bg-purple-900"
              disabled={isLoading}
            >
              ACESSAR COM QR CODE
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;