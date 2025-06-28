import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Classe base para serviços de persistência usando AsyncStorage
 */
export class BaseStorage {
  protected prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  /**
   * Salva dados no AsyncStorage
   */
  protected async save<T>(key: string, data: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(`${this.prefix}:${key}`, jsonValue);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      throw new Error('Falha ao salvar dados');
    }
  }

  /**
   * Recupera dados do AsyncStorage
   */
  protected async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(`${this.prefix}:${key}`);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados:', error);
      throw new Error('Falha ao recuperar dados');
    }
  }

  /**
   * Remove dados do AsyncStorage
   */
  protected async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.prefix}:${key}`);
    } catch (error) {
      console.error('Erro ao remover dados:', error);
      throw new Error('Falha ao remover dados');
    }
  }

  /**
   * Recupera todas as chaves que começam com um prefixo
   */
  protected async getAllKeys(prefix?: string): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const searchPrefix = prefix ? `${this.prefix}:${prefix}` : this.prefix;
      return allKeys.filter(key => key.startsWith(searchPrefix));
    } catch (error) {
      console.error('Erro ao recuperar chaves:', error);
      throw new Error('Falha ao recuperar chaves');
    }
  }

  /**
   * Recupera múltiplos itens de uma vez
   */
  protected async getMultiple<T>(keys: string[]): Promise<Array<T | null>> {
    try {
      const prefixedKeys = keys.map(key => `${this.prefix}:${key}`);
      const values = await AsyncStorage.multiGet(prefixedKeys);
      
      return values.map(([key, value]) => {
        try {
          return value ? JSON.parse(value) : null;
        } catch {
          return null;
        }
      });
    } catch (error) {
      console.error('Erro ao recuperar múltiplos dados:', error);
      throw new Error('Falha ao recuperar múltiplos dados');
    }
  }

  /**
   * Limpa todos os dados do prefixo atual
   */
  protected async clear(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      if (keys.length > 0) {
        await AsyncStorage.multiRemove(keys);
      }
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw new Error('Falha ao limpar dados');
    }
  }

  /**
   * Verifica se uma chave existe
   */
  protected async exists(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(`${this.prefix}:${key}`);
      return value !== null;
    } catch (error) {
      console.error('Erro ao verificar existência:', error);
      return false;
    }
  }

  /**
   * Salva múltiplos itens de uma vez
   */
  protected async saveMultiple<T>(items: Array<[string, T]>): Promise<void> {
    try {
      const prefixedItems: Array<[string, string]> = items.map(([key, value]) => [
        `${this.prefix}:${key}`,
        JSON.stringify(value)
      ]);
      
      await AsyncStorage.multiSet(prefixedItems);
    } catch (error) {
      console.error('Erro ao salvar múltiplos dados:', error);
      throw new Error('Falha ao salvar múltiplos dados');
    }
  }
} 