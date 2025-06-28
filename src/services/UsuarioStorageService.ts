import { STORAGE_KEYS, Usuario } from '../types';
import { gerarId } from '../utils/helpers';
import { validarEmail } from '../utils/validators';
import { BaseStorage } from './BaseStorage';

export class UsuarioStorageService extends BaseStorage {
  constructor() {
    super(STORAGE_KEYS.USUARIOS);
  }

  /**
   * Salva um usuário no storage
   */
  async salvarUsuario(usuario: Omit<Usuario, 'id' | 'dataCriacao'>): Promise<Usuario> {
    try {
      // Verifica se email já existe
      const usuarioExistente = await this.buscarUsuarioPorEmail(usuario.email);
      if (usuarioExistente) {
        throw new Error('Email já cadastrado');
      }

      const novoUsuario: Usuario = {
        ...usuario,
        id: gerarId(),
        dataCriacao: new Date().toISOString()
      };

      await this.save(novoUsuario.id, novoUsuario);
      return novoUsuario;
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por email
   */
  async buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
    try {
      const usuarios = await this.listarUsuarios();
      return usuarios.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  }

  /**
   * Busca usuário por ID
   */
  async buscarUsuarioPorId(id: string): Promise<Usuario | null> {
    try {
      return await this.get<Usuario>(id);
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }

  /**
   * Lista todos os usuários
   */
  async listarUsuarios(): Promise<Usuario[]> {
    try {
      const keys = await this.getAllKeys();
      const usuarios: Usuario[] = [];
      
      for (const key of keys) {
        const id = key.split(':').pop();
        if (id) {
          const usuario = await this.get<Usuario>(id);
          if (usuario) {
            usuarios.push(usuario);
          }
        }
      }
      
      return usuarios.sort((a, b) => 
        new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
      );
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return [];
    }
  }

  /**
   * Atualiza dados do usuário
   */
  async atualizarUsuario(id: string, dados: Partial<Usuario>): Promise<Usuario | null> {
    try {
      const usuarioExistente = await this.buscarUsuarioPorId(id);
      if (!usuarioExistente) {
        throw new Error('Usuário não encontrado');
      }

      // Verifica se está tentando alterar email para um já existente
      if (dados.email && dados.email !== usuarioExistente.email) {
        const emailJaExiste = await this.buscarUsuarioPorEmail(dados.email);
        if (emailJaExiste) {
          throw new Error('Email já está em uso por outro usuário');
        }
      }

      const usuarioAtualizado: Usuario = {
        ...usuarioExistente,
        ...dados,
        id: usuarioExistente.id, // Não permite alterar ID
        dataCriacao: usuarioExistente.dataCriacao // Não permite alterar data de criação
      };

      await this.save(id, usuarioAtualizado);
      return usuarioAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Remove usuário
   */
  async removerUsuario(id: string): Promise<boolean> {
    try {
      const usuario = await this.buscarUsuarioPorId(id);
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      await this.remove(id);
      return true;
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      return false;
    }
  }

  /**
   * Verifica se email já existe
   */
  async emailExiste(email: string): Promise<boolean> {
    try {
      const usuario = await this.buscarUsuarioPorEmail(email);
      return usuario !== null;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }

  /**
   * Valida credenciais de login
   */
  async validarCredenciais(email: string, senha: string): Promise<Usuario | null> {
    try {
      if (!validarEmail(email)) {
        throw new Error('Email inválido');
      }

      const usuario = await this.buscarUsuarioPorEmail(email);
      if (!usuario) {
        return null;
      }

      // Em produção, aqui seria verificado o hash da senha
      if (usuario.senha === senha) {
        return usuario;
      }

      return null;
    } catch (error) {
      console.error('Erro ao validar credenciais:', error);
      return null;
    }
  }

  /**
   * Lista usuários por tipo
   */
  async listarUsuariosPorTipo(tipo: 'cliente' | 'admin'): Promise<Usuario[]> {
    try {
      const usuarios = await this.listarUsuarios();
      return usuarios.filter(user => user.tipo === tipo);
    } catch (error) {
      console.error('Erro ao listar usuários por tipo:', error);
      return [];
    }
  }
} 