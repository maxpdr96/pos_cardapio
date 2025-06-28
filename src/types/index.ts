// Tipos e interfaces centralizadas da aplicação

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo: 'cliente' | 'admin';
  dataCriacao: string;
}

export interface Endereco {
  rua: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: number;
  longitude: number;
}

export interface Restaurante {
  id: string;
  nome: string;
  cnpj: string;
  endereco: Endereco;
  dataCriacao: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  restauranteId: string;
  categoria?: string;
  dataCriacao: string;
}

export interface Sessao {
  usuario: Usuario;
  dataLogin: string;
  ativo: boolean;
}

// Tipos para formulários
export interface LoginData {
  email: string;
  senha: string;
}

export interface CadastroUsuarioData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  tipo: 'cliente' | 'admin';
}

export interface CadastroRestauranteData extends Omit<Restaurante, 'id' | 'dataCriacao'> {}

export interface CadastroProdutoData extends Omit<Produto, 'id' | 'dataCriacao'> {}

// Estados da aplicação
export interface AppState {
  loading: boolean;
  error: string | null;
  usuario: Usuario | null;
  produtos: Produto[];
  restaurantes: Restaurante[];
}

// Constantes de chaves AsyncStorage
export const STORAGE_KEYS = {
  USUARIOS: '@cardapio:usuarios',
  RESTAURANTES: '@cardapio:restaurantes',
  PRODUTOS: '@cardapio:produtos',
  SESSAO: '@cardapio:sessao',
  APP_DATA: '@cardapio:app_data'
} as const; 