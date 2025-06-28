import { Restaurante, STORAGE_KEYS } from '../types';
import { gerarId } from '../utils/helpers';
import { BaseStorage } from './BaseStorage';

export class RestauranteStorageService extends BaseStorage {
  constructor() {
    super(STORAGE_KEYS.RESTAURANTES);
  }

  /**
   * Salva um restaurante no storage
   */
  async salvarRestaurante(restaurante: Omit<Restaurante, 'id' | 'dataCriacao'>): Promise<Restaurante> {
    try {
      // Verifica se CNPJ já existe
      const restauranteExistente = await this.buscarRestaurantePorCNPJ(restaurante.cnpj);
      if (restauranteExistente) {
        throw new Error('CNPJ já cadastrado');
      }

      const novoRestaurante: Restaurante = {
        ...restaurante,
        id: gerarId(),
        dataCriacao: new Date().toISOString()
      };

      await this.save(novoRestaurante.id, novoRestaurante);
      return novoRestaurante;
    } catch (error) {
      console.error('Erro ao salvar restaurante:', error);
      throw error;
    }
  }

  /**
   * Busca restaurante por ID
   */
  async buscarRestaurantePorId(id: string): Promise<Restaurante | null> {
    try {
      return await this.get<Restaurante>(id);
    } catch (error) {
      console.error('Erro ao buscar restaurante por ID:', error);
      return null;
    }
  }

  /**
   * Busca restaurante por CNPJ
   */
  async buscarRestaurantePorCNPJ(cnpj: string): Promise<Restaurante | null> {
    try {
      const restaurantes = await this.listarRestaurantes();
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      return restaurantes.find(rest => 
        rest.cnpj.replace(/\D/g, '') === cnpjLimpo
      ) || null;
    } catch (error) {
      console.error('Erro ao buscar restaurante por CNPJ:', error);
      return null;
    }
  }

  /**
   * Lista todos os restaurantes
   */
  async listarRestaurantes(): Promise<Restaurante[]> {
    try {
      const keys = await this.getAllKeys();
      const restaurantes: Restaurante[] = [];
      
      for (const key of keys) {
        const id = key.split(':').pop();
        if (id) {
          const restaurante = await this.get<Restaurante>(id);
          if (restaurante) {
            restaurantes.push(restaurante);
          }
        }
      }
      
      return restaurantes.sort((a, b) => 
        new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
      );
    } catch (error) {
      console.error('Erro ao listar restaurantes:', error);
      return [];
    }
  }

  /**
   * Atualiza dados do restaurante
   */
  async atualizarRestaurante(id: string, dados: Partial<Restaurante>): Promise<Restaurante | null> {
    try {
      const restauranteExistente = await this.buscarRestaurantePorId(id);
      if (!restauranteExistente) {
        throw new Error('Restaurante não encontrado');
      }

      // Verifica se está tentando alterar CNPJ para um já existente
      if (dados.cnpj && dados.cnpj !== restauranteExistente.cnpj) {
        const cnpjJaExiste = await this.buscarRestaurantePorCNPJ(dados.cnpj);
        if (cnpjJaExiste) {
          throw new Error('CNPJ já está em uso por outro restaurante');
        }
      }

      const restauranteAtualizado: Restaurante = {
        ...restauranteExistente,
        ...dados,
        id: restauranteExistente.id,
        dataCriacao: restauranteExistente.dataCriacao
      };

      await this.save(id, restauranteAtualizado);
      return restauranteAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar restaurante:', error);
      throw error;
    }
  }

  /**
   * Remove restaurante
   */
  async removerRestaurante(id: string): Promise<boolean> {
    try {
      const restaurante = await this.buscarRestaurantePorId(id);
      if (!restaurante) {
        throw new Error('Restaurante não encontrado');
      }

      await this.remove(id);
      return true;
    } catch (error) {
      console.error('Erro ao remover restaurante:', error);
      return false;
    }
  }

  /**
   * Verifica se CNPJ já existe
   */
  async cnpjExiste(cnpj: string): Promise<boolean> {
    try {
      const restaurante = await this.buscarRestaurantePorCNPJ(cnpj);
      return restaurante !== null;
    } catch (error) {
      console.error('Erro ao verificar CNPJ:', error);
      return false;
    }
  }

  /**
   * Busca restaurantes por cidade
   */
  async buscarPorCidade(cidade: string): Promise<Restaurante[]> {
    try {
      const restaurantes = await this.listarRestaurantes();
      return restaurantes.filter(rest => 
        rest.endereco.cidade.toLowerCase().includes(cidade.toLowerCase())
      );
    } catch (error) {
      console.error('Erro ao buscar por cidade:', error);
      return [];
    }
  }

  /**
   * Busca restaurantes por nome
   */
  async buscarPorNome(nome: string): Promise<Restaurante[]> {
    try {
      const restaurantes = await this.listarRestaurantes();
      return restaurantes.filter(rest => 
        rest.nome.toLowerCase().includes(nome.toLowerCase())
      );
    } catch (error) {
      console.error('Erro ao buscar por nome:', error);
      return [];
    }
  }
} 