import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthController } from '../controllers/AuthController';
import { Usuario } from '../types';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  cadastrar: (dados: any) => Promise<{ sucesso: boolean; erro?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const authController = new AuthController();

  useEffect(() => {
    verificarSessao();
  }, []);

  const verificarSessao = async () => {
    try {
      const sessao = await authController.verificarSessao();
      if (sessao.ativa && sessao.usuario) {
        setUsuario(sessao.usuario);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      const result = await authController.login({ email, senha });
      
      if (result.sucesso && result.usuario) {
        setUsuario(result.usuario);
        return { sucesso: true };
      }
      
      return { sucesso: false, erro: result.erro };
    } catch (error) {
      return { sucesso: false, erro: 'Erro interno do servidor' };
    }
  };

  const cadastrar = async (dados: any) => {
    try {
      const result = await authController.cadastrar(dados);
      
      if (result.sucesso && result.usuario) {
        setUsuario(result.usuario);
        return { sucesso: true };
      }
      
      return { sucesso: false, erro: result.erro };
    } catch (error) {
      return { sucesso: false, erro: 'Erro interno do servidor' };
    }
  };

  const logout = async () => {
    try {
      await authController.logout();
      setUsuario(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isAdmin = usuario?.tipo === 'admin';

  const value: AuthContextType = {
    usuario,
    loading,
    login,
    cadastrar,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 