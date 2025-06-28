import { Sessao, STORAGE_KEYS, Usuario } from '../types';
import { BaseStorage } from './BaseStorage';

export class AuthStorageService extends BaseStorage {
  constructor() {
    super(STORAGE_KEYS.SESSAO);
  }

  /**
   * Salva sessão do usuário logado
   */
  async salvarSessao(usuario: Usuario): Promise<void> {
    try {
      const sessao: Sessao = {
        usuario,
        dataLogin: new Date().toISOString(),
        ativo: true
      };

      await this.save('current', sessao);
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      throw new Error('Falha ao salvar sessão');
    }
  }

  /**
   * Obtém sessão atual
   */
  async obterSessao(): Promise<Usuario | null> {
    try {
      const sessao = await this.get<Sessao>('current');
      
      if (!sessao || !sessao.ativo) {
        return null;
      }

      // Verifica se a sessão não expirou (24 horas)
      const dataLogin = new Date(sessao.dataLogin);
      const agora = new Date();
      const diferencaHoras = (agora.getTime() - dataLogin.getTime()) / (1000 * 60 * 60);
      
      if (diferencaHoras > 24) {
        await this.limparSessao();
        return null;
      }

      return sessao.usuario;
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
  }

  /**
   * Limpa sessão atual (logout)
   */
  async limparSessao(): Promise<void> {
    try {
      await this.remove('current');
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
      throw new Error('Falha ao limpar sessão');
    }
  }

  /**
   * Verifica se há sessão ativa
   */
  async verificarSessaoAtiva(): Promise<boolean> {
    try {
      const usuario = await this.obterSessao();
      return usuario !== null;
    } catch (error) {
      console.error('Erro ao verificar sessão ativa:', error);
      return false;
    }
  }

  /**
   * Atualiza dados do usuário na sessão
   */
  async atualizarUsuarioSessao(usuarioAtualizado: Usuario): Promise<void> {
    try {
      const sessaoAtual = await this.get<Sessao>('current');
      
      if (!sessaoAtual) {
        throw new Error('Nenhuma sessão ativa encontrada');
      }

      const sessaoAtualizada: Sessao = {
        ...sessaoAtual,
        usuario: usuarioAtualizado
      };

      await this.save('current', sessaoAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar usuário na sessão:', error);
      throw error;
    }
  }

  /**
   * Verifica se usuário é admin
   */
  async usuarioEhAdmin(): Promise<boolean> {
    try {
      const usuario = await this.obterSessao();
      return usuario?.tipo === 'admin' || false;
    } catch (error) {
      console.error('Erro ao verificar se usuário é admin:', error);
      return false;
    }
  }

  /**
   * Obtém informações da sessão atual
   */
  async obterInfoSessao(): Promise<{
    usuario: Usuario | null;
    dataLogin: string | null;
    tempoLogado: number | null; // em minutos
  }> {
    try {
      const sessao = await this.get<Sessao>('current');
      
      if (!sessao) {
        return {
          usuario: null,
          dataLogin: null,
          tempoLogado: null
        };
      }

      const dataLogin = new Date(sessao.dataLogin);
      const agora = new Date();
      const tempoLogado = Math.floor((agora.getTime() - dataLogin.getTime()) / (1000 * 60));

      return {
        usuario: sessao.usuario,
        dataLogin: sessao.dataLogin,
        tempoLogado
      };
    } catch (error) {
      console.error('Erro ao obter informações da sessão:', error);
      return {
        usuario: null,
        dataLogin: null,
        tempoLogado: null
      };
    }
  }

  /**
   * Renova sessão (atualiza timestamp)
   */
  async renovarSessao(): Promise<void> {
    try {
      const sessaoAtual = await this.get<Sessao>('current');
      
      if (!sessaoAtual) {
        throw new Error('Nenhuma sessão ativa encontrada');
      }

      const sessaoRenovada: Sessao = {
        ...sessaoAtual,
        dataLogin: new Date().toISOString()
      };

      await this.save('current', sessaoRenovada);
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
      throw error;
    }
  }
} 