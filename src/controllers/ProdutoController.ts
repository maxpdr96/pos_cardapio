import { AuthStorageService } from '../services/AuthStorageService';
import { ProdutoStorageService } from '../services/ProdutoStorageService';
import { CadastroProdutoData, Produto } from '../types';
import { validarProduto } from '../utils/validators';

export class ProdutoController {
  private produtoService: ProdutoStorageService;
  private authService: AuthStorageService;

  constructor() {
    this.produtoService = new ProdutoStorageService();
    this.authService = new AuthStorageService();
  }

  /**
   * Cadastra novo produto (apenas admin)
   */
  async cadastrarProduto(dados: CadastroProdutoData): Promise<{
    sucesso: boolean;
    produto?: Produto;
    erro?: string;
  }> {
    try {
      // Verifica se usuário é admin
      const isAdmin = await this.authService.usuarioEhAdmin();
      if (!isAdmin) {
        return {
          sucesso: false,
          erro: 'Acesso negado. Apenas administradores podem cadastrar produtos.'
        };
      }

      // Validações
      const validacao = validarProduto(dados);
      if (!validacao.valido) {
        return {
          sucesso: false,
          erro: validacao.erros.join(', ')
        };
      }

      // Salva produto
      const novoProduto = await this.produtoService.salvarProduto(dados);

      return {
        sucesso: true,
        produto: novoProduto
      };
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Lista todos os produtos
   */
  async listarProdutos(): Promise<{
    sucesso: boolean;
    produtos?: Produto[];
    erro?: string;
  }> {
    try {
      const produtos = await this.produtoService.listarProdutos();
      return {
        sucesso: true,
        produtos
      };
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return {
        sucesso: false,
        erro: 'Erro ao carregar produtos'
      };
    }
  }

  /**
   * Lista produtos por restaurante
   */
  async listarProdutosPorRestaurante(restauranteId: string): Promise<{
    sucesso: boolean;
    produtos?: Produto[];
    erro?: string;
  }> {
    try {
      const produtos = await this.produtoService.listarProdutosPorRestaurante(restauranteId);
      return {
        sucesso: true,
        produtos
      };
    } catch (error) {
      console.error('Erro ao listar produtos por restaurante:', error);
      return {
        sucesso: false,
        erro: 'Erro ao carregar produtos'
      };
    }
  }

  /**
   * Busca produto por ID
   */
  async buscarProdutoPorId(id: string): Promise<{
    sucesso: boolean;
    produto?: Produto;
    erro?: string;
  }> {
    try {
      const produto = await this.produtoService.buscarProdutoPorId(id);
      
      if (!produto) {
        return {
          sucesso: false,
          erro: 'Produto não encontrado'
        };
      }

      return {
        sucesso: true,
        produto
      };
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return {
        sucesso: false,
        erro: 'Erro ao carregar produto'
      };
    }
  }

  /**
   * Atualiza produto (apenas admin)
   */
  async atualizarProduto(id: string, dados: Partial<Produto>): Promise<{
    sucesso: boolean;
    produto?: Produto;
    erro?: string;
  }> {
    try {
      // Verifica se usuário é admin
      const isAdmin = await this.authService.usuarioEhAdmin();
      if (!isAdmin) {
        return {
          sucesso: false,
          erro: 'Acesso negado. Apenas administradores podem editar produtos.'
        };
      }

      const produtoAtualizado = await this.produtoService.atualizarProduto(id, dados);
      
      if (!produtoAtualizado) {
        return {
          sucesso: false,
          erro: 'Produto não encontrado'
        };
      }

      return {
        sucesso: true,
        produto: produtoAtualizado
      };
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Remove produto (apenas admin)
   */
  async removerProduto(id: string): Promise<{
    sucesso: boolean;
    erro?: string;
  }> {
    try {
      // Verifica se usuário é admin
      const isAdmin = await this.authService.usuarioEhAdmin();
      if (!isAdmin) {
        return {
          sucesso: false,
          erro: 'Acesso negado. Apenas administradores podem remover produtos.'
        };
      }

      const removido = await this.produtoService.removerProduto(id);
      
      if (!removido) {
        return {
          sucesso: false,
          erro: 'Produto não encontrado'
        };
      }

      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      return {
        sucesso: false,
        erro: 'Erro ao remover produto'
      };
    }
  }

  /**
   * Busca produtos por nome
   */
  async buscarProdutosPorNome(nome: string): Promise<{
    sucesso: boolean;
    produtos?: Produto[];
    erro?: string;
  }> {
    try {
      const produtos = await this.produtoService.buscarPorNome(nome);
      return {
        sucesso: true,
        produtos
      };
    } catch (error) {
      console.error('Erro ao buscar produtos por nome:', error);
      return {
        sucesso: false,
        erro: 'Erro ao buscar produtos'
      };
    }
  }
} 