// Validadores para dados da aplicação

/**
 * Valida se um email tem formato correto
 */
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida CNPJ (formato básico)
 */
export const validarCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cnpjNumeros = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpjNumeros.length !== 14) return false;
  
  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1+$/.test(cnpjNumeros)) return false;
  
  return true; // Validação básica - em produção seria mais complexa
};

/**
 * Valida CEP (formato XXXXX-XXX)
 */
export const validarCEP = (cep: string): boolean => {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(cep);
};

/**
 * Valida coordenadas de latitude e longitude
 */
export const validarCoordenadas = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Valida preço (deve ser número positivo)
 */
export const validarPreco = (preco: number): boolean => {
  return typeof preco === 'number' && preco > 0;
};

/**
 * Valida URL (formato básico)
 */
export const validarURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida força da senha
 */
export const validarSenha = (senha: string): { valida: boolean; mensagem: string } => {
  if (senha.length < 6) {
    return { valida: false, mensagem: 'Senha deve ter pelo menos 6 caracteres' };
  }
  
  if (!/[A-Za-z]/.test(senha)) {
    return { valida: false, mensagem: 'Senha deve conter pelo menos uma letra' };
  }
  
  if (!/\d/.test(senha)) {
    return { valida: false, mensagem: 'Senha deve conter pelo menos um número' };
  }
  
  return { valida: true, mensagem: 'Senha válida' };
}; 

/**
 * Valida dados completos do usuário
 */
export const validarUsuario = (usuario: Partial<any>): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];
  
  if (!usuario.nome || usuario.nome.trim().length < 2) {
    erros.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  if (!usuario.email || !validarEmail(usuario.email)) {
    erros.push('Email inválido');
  }
  
  if (!usuario.senha) {
    erros.push('Senha é obrigatória');
  } else {
    const validacaoSenha = validarSenha(usuario.senha);
    if (!validacaoSenha.valida) {
      erros.push(validacaoSenha.mensagem);
    }
  }
  
  if (!usuario.tipo || !['cliente', 'admin'].includes(usuario.tipo)) {
    erros.push('Tipo de usuário inválido');
  }
  
  return { valido: erros.length === 0, erros };
};

/**
 * Valida dados completos do restaurante
 */
export const validarRestaurante = (restaurante: Partial<any>): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];
  
  if (!restaurante.nome || restaurante.nome.trim().length < 2) {
    erros.push('Nome do restaurante deve ter pelo menos 2 caracteres');
  }
  
  if (!restaurante.cnpj || !validarCNPJ(restaurante.cnpj)) {
    erros.push('CNPJ inválido');
  }
  
  if (!restaurante.endereco) {
    erros.push('Endereço é obrigatório');
  } else {
    const endereco = restaurante.endereco;
    
    if (!endereco.rua || endereco.rua.trim().length < 3) {
      erros.push('Rua deve ter pelo menos 3 caracteres');
    }
    
    if (!endereco.numero || endereco.numero.trim().length < 1) {
      erros.push('Número é obrigatório');
    }
    
    if (!endereco.cep || !validarCEP(endereco.cep)) {
      erros.push('CEP inválido');
    }
    
    if (!endereco.bairro || endereco.bairro.trim().length < 2) {
      erros.push('Bairro deve ter pelo menos 2 caracteres');
    }
    
    if (!endereco.cidade || endereco.cidade.trim().length < 2) {
      erros.push('Cidade deve ter pelo menos 2 caracteres');
    }
    
    if (!endereco.uf || endereco.uf.length !== 2) {
      erros.push('UF deve ter 2 caracteres');
    }
    
    if (typeof endereco.latitude !== 'number' || typeof endereco.longitude !== 'number') {
      erros.push('Coordenadas devem ser números');
    } else if (!validarCoordenadas(endereco.latitude, endereco.longitude)) {
      erros.push('Coordenadas inválidas');
    }
  }
  
  return { valido: erros.length === 0, erros };
};

/**
 * Valida dados completos do produto
 */
export const validarProduto = (produto: Partial<any>): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];
  
  if (!produto.nome || produto.nome.trim().length < 2) {
    erros.push('Nome do produto deve ter pelo menos 2 caracteres');
  }
  
  if (!produto.descricao || produto.descricao.trim().length < 10) {
    erros.push('Descrição deve ter pelo menos 10 caracteres');
  }
  
  if (!produto.preco || !validarPreco(produto.preco)) {
    erros.push('Preço deve ser um valor positivo');
  }
  
  if (!produto.imagem) {
    erros.push('Imagem é obrigatória');
  } else if (!validarURL(produto.imagem)) {
    erros.push('URL da imagem inválida');
  }
  
  if (!produto.restauranteId || produto.restauranteId.trim().length === 0) {
    erros.push('ID do restaurante é obrigatório');
  }
  
  return { valido: erros.length === 0, erros };
}; 