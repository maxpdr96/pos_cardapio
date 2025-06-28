import { AuthStorageService } from '../services/AuthStorageService';
import { UsuarioStorageService } from '../services/UsuarioStorageService';
import { CadastroUsuarioData, LoginData, Usuario } from '../types';
import { validarEmail, validarUsuario } from '../utils/validators';

export class AuthController {
  private usuarioService: UsuarioStorageService;
  private authService: AuthStorageService;

  constructor() {
    this.usuarioService = new UsuarioStorageService();
    this.authService = new AuthStorageService();
  }

  /**
   * Realiza login do usuário
   */
  async login(dados: LoginData): Promise<{
    sucesso: boolean;
    usuario?: Usuario;
    erro?: string;
  }> {
    try {
      // Validações básicas
      if (!dados.email || !dados.senha) {
        return {
          sucesso: false,
          erro: 'Email e senha são obrigatórios'
        };
      }

      if (!validarEmail(dados.email)) {
        return {
          sucesso: false,
          erro: 'Email inválido'
        };
      }

      // Valida credenciais
      const usuario = await this.usuarioService.validarCredenciais(dados.email, dados.senha);
      
      if (!usuario) {
        return {
          sucesso: false,
          erro: 'Email ou senha incorretos'
        };
      }

      // Salva sessão
      await this.authService.salvarSessao(usuario);

      return {
        sucesso: true,
        usuario
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        sucesso: false,
        erro: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Cadastra novo usuário
   */
  async cadastrar(dados: CadastroUsuarioData): Promise<{
    sucesso: boolean;
    usuario?: Usuario;
    erro?: string;
  }> {
    try {
      // Validação de confirmação de senha
      if (dados.senha !== dados.confirmarSenha) {
        return {
          sucesso: false,
          erro: 'Senhas não coincidem'
        };
      }

      // Validações dos dados
      const validacao = validarUsuario({
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        tipo: dados.tipo
      });

      if (!validacao.valido) {
        return {
          sucesso: false,
          erro: validacao.erros.join(', ')
        };
      }

      // Verifica se email já existe
      const emailExiste = await this.usuarioService.emailExiste(dados.email);
      if (emailExiste) {
        return {
          sucesso: false,
          erro: 'Email já cadastrado'
        };
      }

      // Salva usuário
      const novoUsuario = await this.usuarioService.salvarUsuario({
        nome: dados.nome.trim(),
        email: dados.email.toLowerCase().trim(),
        senha: dados.senha, // Em produção seria hash
        tipo: dados.tipo
      });

      // Faz login automático após cadastro
      await this.authService.salvarSessao(novoUsuario);

      return {
        sucesso: true,
        usuario: novoUsuario
      };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      await this.authService.limparSessao();
      return { sucesso: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return {
        sucesso: false,
        erro: 'Erro ao realizar logout'
      };
    }
  }

  /**
   * Verifica se há sessão ativa
   */
  async verificarSessao(): Promise<{
    ativa: boolean;
    usuario?: Usuario;
  }> {
    try {
      const usuario = await this.authService.obterSessao();
      
      return {
        ativa: usuario !== null,
        usuario: usuario || undefined
      };
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      return { ativa: false };
    }
  }

  /**
   * Obtém usuário da sessão atual
   */
  async obterUsuarioLogado(): Promise<Usuario | null> {
    try {
      return await this.authService.obterSessao();
    } catch (error) {
      console.error('Erro ao obter usuário logado:', error);
      return null;
    }
  }

  /**
   * Verifica se usuário logado é admin
   */
  async verificarPermissaoAdmin(): Promise<boolean> {
    try {
      return await this.authService.usuarioEhAdmin();
    } catch (error) {
      console.error('Erro ao verificar permissão admin:', error);
      return false;
    }
  }

  /**
   * Atualiza dados do usuário logado
   */
  async atualizarPerfil(dadosAtualizacao: Partial<Usuario>): Promise<{
    sucesso: boolean;
    usuario?: Usuario;
    erro?: string;
  }> {
    try {
      const usuarioLogado = await this.obterUsuarioLogado();
      
      if (!usuarioLogado) {
        return {
          sucesso: false,
          erro: 'Usuário não está logado'
        };
      }

      // Atualiza no storage
      const usuarioAtualizado = await this.usuarioService.atualizarUsuario(
        usuarioLogado.id,
        dadosAtualizacao
      );

      if (!usuarioAtualizado) {
        return {
          sucesso: false,
          erro: 'Erro ao atualizar perfil'
        };
      }

      // Atualiza sessão
      await this.authService.atualizarUsuarioSessao(usuarioAtualizado);

      return {
        sucesso: true,
        usuario: usuarioAtualizado
      };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Simula recuperação de senha (enviaria email)
   */
  async recuperarSenha(email: string): Promise<{
    sucesso: boolean;
    erro?: string;
  }> {
    try {
      if (!validarEmail(email)) {
        return {
          sucesso: false,
          erro: 'Email inválido'
        };
      }

      const usuario = await this.usuarioService.buscarUsuarioPorEmail(email);
      
      if (!usuario) {
        // Por segurança, retorna sucesso mesmo se email não existir
        return { sucesso: true };
      }

      // Aqui seria enviado um email com token de recuperação
      console.log(`Email de recuperação enviado para: ${email}`);
      
      return { sucesso: true };
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return {
        sucesso: false,
        erro: 'Erro interno do servidor'
      };
    }
  }
} 