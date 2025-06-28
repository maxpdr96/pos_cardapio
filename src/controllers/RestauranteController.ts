import { AuthStorageService } from '../services/AuthStorageService';
import { RestauranteStorageService } from '../services/RestauranteStorageService';
import { CadastroRestauranteData, Restaurante } from '../types';
import { validarRestaurante } from '../utils/validators';

export class RestauranteController {
  private restauranteService: RestauranteStorageService;
  private authService: AuthStorageService;

  constructor() {
    this.restauranteService = new RestauranteStorageService();
    this.authService = new AuthStorageService();
  }

  /**
   * Cadastra novo restaurante (apenas admin)
   */
  async cadastrarRestaurante(dados: CadastroRestauranteData): Promise<{
    sucesso: boolean;
    restaurante?: Restaurante;
    erro?: string;
  }> {
    try {
      // Verifica se usuário é admin
      const isAdmin = await this.authService.usuarioEhAdmin();
      if (!isAdmin) {
        return {
          sucesso: false,
          erro: 'Acesso negado. Apenas administradores podem cadastrar restaurantes.'
        };
      }

      // Validações
      const validacao = validarRestaurante(dados);
      if (!validacao.valido) {
        return {
          sucesso: false,
          erro: validacao.erros.join(', ')
        };
      }

      // Verifica se CNPJ já existe
      const cnpjExiste = await this.restauranteService.cnpjExiste(dados.cnpj);
      if (cnpjExiste) {
        return {
          sucesso: false,
          erro: 'CNPJ já cadastrado'
        };
      }

      // Salva restaurante
      const novoRestaurante = await this.restauranteService.salvarRestaurante(dados);

      return {
        sucesso: true,
        restaurante: novoRestaurante
      };
    } catch (error) {
      console.error('Erro ao cadastrar restaurante:', error);
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Lista todos os restaurantes
   */
  async listarRestaurantes(): Promise<{
    sucesso: boolean;
    restaurantes?: Restaurante[];
    erro?: string;
  }> {
    try {
      const restaurantes = await this.restauranteService.listarRestaurantes();
      return {
        sucesso: true,
        restaurantes
      };
    } catch (error) {
      console.error('Erro ao listar restaurantes:', error);
      return {
        sucesso: false,
        erro: 'Erro ao carregar restaurantes'
      };
    }
  }

  /**
   * Busca restaurante por ID
   */
  async buscarRestaurantePorId(id: string): Promise<{
    sucesso: boolean;
    restaurante?: Restaurante;
    erro?: string;
  }> {
    try {
      const restaurante = await this.restauranteService.buscarRestaurantePorId(id);
      
      if (!restaurante) {
        return {
          sucesso: false,
          erro: 'Restaurante não encontrado'
        };
      }

      return {
        sucesso: true,
        restaurante
      };
    } catch (error) {
      console.error('Erro ao buscar restaurante:', error);
      return {
        sucesso: false,
        erro: 'Erro ao carregar restaurante'
      };
    }
  }

  /**
   * Atualiza restaurante (apenas admin)
   */
  async atualizarRestaurante(id: string, dados: Partial<Restaurante>): Promise<{
    sucesso: boolean;
    restaurante?: Restaurante;
    erro?: string;
  }> {
    try {
      // Verifica se usuário é admin
      const isAdmin = await this.authService.usuarioEhAdmin();
      if (!isAdmin) {
        return {
          sucesso: false,
          erro: 'Acesso negado. Apenas administradores podem editar restaurantes.'
        };
      }

      const restauranteAtualizado = await this.restauranteService.atualizarRestaurante(id, dados);
      
      if (!restauranteAtualizado) {
        return {
          sucesso: false,
          erro: 'Restaurante não encontrado'
        };
      }

      return {
        sucesso: true,
        restaurante: restauranteAtualizado
      };
    } catch (error) {
      console.error('Erro ao atualizar restaurante:', error);
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Remove restaurante (apenas admin)
   */
  async removerRestaurante(id: string): Promise<{
    sucesso: boolean;
    erro?: string;
  }> {
    try {
      // Verifica se usuário é admin
      const isAdmin = await this.authService.usuarioEhAdmin();
      if (!isAdmin) {
        return {
          sucesso: false,
          erro: 'Acesso negado. Apenas administradores podem remover restaurantes.'
        };
      }

      const removido = await this.restauranteService.removerRestaurante(id);
      
      if (!removido) {
        return {
          sucesso: false,
          erro: 'Restaurante não encontrado'
        };
      }

      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao remover restaurante:', error);
      return {
        sucesso: false,
        erro: 'Erro ao remover restaurante'
      };
    }
  }
} 