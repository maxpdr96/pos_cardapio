// Funções utilitárias para a aplicação

/**
 * Gera um ID único simples
 */
export const gerarId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Formata CNPJ com máscara
 */
export const formatarCNPJ = (cnpj: string): string => {
  const numeros = cnpj.replace(/\D/g, '');
  return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

/**
 * Formata CEP com máscara
 */
export const formatarCEP = (cep: string): string => {
  const numeros = cep.replace(/\D/g, '');
  return numeros.replace(/^(\d{5})(\d{3})$/, '$1-$2');
};

/**
 * Formata preço para exibição
 */
export const formatarPreco = (preco: number): string => {
  return preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

/**
 * Remove caracteres especiais de uma string
 */
export const removerCaracteresEspeciais = (texto: string): string => {
  return texto.replace(/[^\w\s]/gi, '');
};

/**
 * Capitaliza primeira letra de cada palavra
 */
export const capitalizarPalavras = (texto: string): string => {
  return texto.split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Trunca texto com ellipsis
 */
export const truncarTexto = (texto: string, limite: number): string => {
  if (texto.length <= limite) return texto;
  return texto.slice(0, limite) + '...';
};

/**
 * Debounce para otimizar busca
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Formata data para exibição
 */
export const formatarData = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Converte string para slug
 */
export const criarSlug = (texto: string): string => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

/**
 * Verifica se string está vazia
 */
export const isVazio = (valor: string | null | undefined): boolean => {
  return !valor || valor.trim().length === 0;
};

/**
 * Lista de UFs brasileiras
 */
export const UFS_BRASIL = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

/**
 * Máscaras para inputs
 */
export const aplicarMascaraCNPJ = (valor: string): string => {
  return valor
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

export const aplicarMascaraCEP = (valor: string): string => {
  return valor
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

/**
 * Remove máscara do CEP deixando apenas números
 */
export const removerMascaraCEP = (cep: string): string => {
  return cep.replace(/\D/g, '');
}; 