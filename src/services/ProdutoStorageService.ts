import { Produto, STORAGE_KEYS } from '../types';
import { gerarId } from '../utils/helpers';
import { BaseStorage } from './BaseStorage';

export class ProdutoStorageService extends BaseStorage {
  constructor() {
    super(STORAGE_KEYS.PRODUTOS);
  }

  /**
   * Salva um produto no storage
   */
  async salvarProduto(produto: Omit<Produto, 'id' | 'dataCriacao'>): Promise<Produto> {
    try {
      const novoProduto: Produto = {
        ...produto,
        id: gerarId(),
        dataCriacao: new Date().toISOString()
      };

      await this.save(novoProduto.id, novoProduto);
      return novoProduto;
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      throw error;
    }
  }

  /**
   * Busca produto por ID
   */
  async buscarProdutoPorId(id: string): Promise<Produto | null> {
    try {
      return await this.get<Produto>(id);
    } catch (error) {
      console.error('Erro ao buscar produto por ID:', error);
      return null;
    }
  }

  /**
   * Lista todos os produtos
   */
  async listarProdutos(): Promise<Produto[]> {
    try {
      const keys = await this.getAllKeys();
      const produtos: Produto[] = [];
      
      for (const key of keys) {
        const id = key.split(':').pop();
        if (id) {
          const produto = await this.get<Produto>(id);
          if (produto) {
            produtos.push(produto);
          }
        }
      }
      
      return produtos.sort((a, b) => 
        new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
      );
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return [];
    }
  }

  /**
   * Lista produtos por restaurante
   */
  async listarProdutosPorRestaurante(restauranteId: string): Promise<Produto[]> {
    try {
      const produtos = await this.listarProdutos();
      return produtos.filter(produto => produto.restauranteId === restauranteId);
    } catch (error) {
      console.error('Erro ao listar produtos por restaurante:', error);
      return [];
    }
  }

  /**
   * Atualiza dados do produto
   */
  async atualizarProduto(id: string, dados: Partial<Produto>): Promise<Produto | null> {
    try {
      const produtoExistente = await this.buscarProdutoPorId(id);
      if (!produtoExistente) {
        throw new Error('Produto não encontrado');
      }

      const produtoAtualizado: Produto = {
        ...produtoExistente,
        ...dados,
        id: produtoExistente.id,
        dataCriacao: produtoExistente.dataCriacao
      };

      await this.save(id, produtoAtualizado);
      return produtoAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  /**
   * Remove produto
   */
  async removerProduto(id: string): Promise<boolean> {
    try {
      const produto = await this.buscarProdutoPorId(id);
      if (!produto) {
        throw new Error('Produto não encontrado');
      }

      await this.remove(id);
      return true;
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      return false;
    }
  }

  /**
   * Busca produtos por nome
   */
  async buscarPorNome(nome: string): Promise<Produto[]> {
    try {
      const produtos = await this.listarProdutos();
      return produtos.filter(produto => 
        produto.nome.toLowerCase().includes(nome.toLowerCase())
      );
    } catch (error) {
      console.error('Erro ao buscar produtos por nome:', error);
      return [];
    }
  }

  /**
   * Busca produtos por categoria
   */
  async buscarPorCategoria(categoria: string): Promise<Produto[]> {
    try {
      const produtos = await this.listarProdutos();
      return produtos.filter(produto => 
        produto.categoria?.toLowerCase() === categoria.toLowerCase()
      );
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return [];
    }
  }

  /**
   * Busca produtos por faixa de preço
   */
  async buscarPorFaixaPreco(precoMin: number, precoMax: number): Promise<Produto[]> {
    try {
      const produtos = await this.listarProdutos();
      return produtos.filter(produto => 
        produto.preco >= precoMin && produto.preco <= precoMax
      );
    } catch (error) {
      console.error('Erro ao buscar produtos por faixa de preço:', error);
      return [];
    }
  }

  /**
   * Lista produtos ordenados por preço
   */
  async listarProdutosOrdenadosPorPreco(ordem: 'asc' | 'desc' = 'asc'): Promise<Produto[]> {
    try {
      const produtos = await this.listarProdutos();
      return produtos.sort((a, b) => 
        ordem === 'asc' ? a.preco - b.preco : b.preco - a.preco
      );
    } catch (error) {
      console.error('Erro ao listar produtos ordenados por preço:', error);
      return [];
    }
  }

  /**
   * Busca produtos por múltiplos critérios
   */
  async buscarComFiltros(filtros: {
    nome?: string;
    categoria?: string;
    precoMin?: number;
    precoMax?: number;
    restauranteId?: string;
  }): Promise<Produto[]> {
    try {
      let produtos = await this.listarProdutos();

      if (filtros.nome) {
        produtos = produtos.filter(produto => 
          produto.nome.toLowerCase().includes(filtros.nome!.toLowerCase())
        );
      }

      if (filtros.categoria) {
        produtos = produtos.filter(produto => 
          produto.categoria?.toLowerCase() === filtros.categoria!.toLowerCase()
        );
      }

      if (filtros.precoMin !== undefined) {
        produtos = produtos.filter(produto => produto.preco >= filtros.precoMin!);
      }

      if (filtros.precoMax !== undefined) {
        produtos = produtos.filter(produto => produto.preco <= filtros.precoMax!);
      }

      if (filtros.restauranteId) {
        produtos = produtos.filter(produto => produto.restauranteId === filtros.restauranteId);
      }

      return produtos;
    } catch (error) {
      console.error('Erro ao buscar produtos com filtros:', error);
      return [];
    }
  }
} 