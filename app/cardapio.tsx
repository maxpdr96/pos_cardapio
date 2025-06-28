import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Chip, Divider, FAB, Searchbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';
import { ProdutoController } from '../src/controllers/ProdutoController';
import { RestauranteController } from '../src/controllers/RestauranteController';
import { Produto, Restaurante } from '../src/types';
import { formatarPreco } from '../src/utils/helpers';

interface RestauranteComProdutos {
  restaurante: Restaurante;
  produtos: Produto[];
}

export default function Cardapio() {
  const [restaurantesComProdutos, setRestaurantesComProdutos] = useState<RestauranteComProdutos[]>([]);
  const [restaurantesOriginais, setRestaurantesOriginais] = useState<RestauranteComProdutos[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState('');
  
  const { usuario, logout, isAdmin } = useAuth();
  const router = useRouter();
  const produtoController = new ProdutoController();
  const restauranteController = new RestauranteController();

  const carregarDados = useCallback(async () => {
    try {
      const [produtosResult, restaurantesResult] = await Promise.all([
        produtoController.listarProdutos(),
        restauranteController.listarRestaurantes()
      ]);
      
      console.log('🔍 DEBUG - Produtos carregados:', produtosResult);
      console.log('🏪 DEBUG - Restaurantes carregados:', restaurantesResult);
      
      if (produtosResult.sucesso && restaurantesResult.sucesso && 
          produtosResult.produtos && restaurantesResult.restaurantes) {
        
        console.log('✅ Dados carregados com sucesso');
        console.log('📊 Total de produtos:', produtosResult.produtos.length);
        console.log('🏪 Total de restaurantes:', restaurantesResult.restaurantes.length);
        
        // Corrige produtos com restauranteId 'default'
        let produtosCorrigidos = produtosResult.produtos;
        if (restaurantesResult.restaurantes.length > 0) {
          const primeiroRestaurante = restaurantesResult.restaurantes[0];
          const produtosComDefault = produtosResult.produtos.filter(p => p.restauranteId === 'default');
          
          if (produtosComDefault.length > 0) {
            console.log(`🔧 Corrigindo ${produtosComDefault.length} produtos com restauranteId 'default'`);
            
            for (const produto of produtosComDefault) {
              await produtoController.atualizarProduto(produto.id, {
                restauranteId: primeiroRestaurante.id
              });
            }
            
            // Recarrega produtos após correção
            const produtosCorrigidosResult = await produtoController.listarProdutos();
            if (produtosCorrigidosResult.sucesso && produtosCorrigidosResult.produtos) {
              produtosCorrigidos = produtosCorrigidosResult.produtos;
            }
          }
        }
        
        // Agrupa produtos por restaurante
        const restaurantesComProdutos: RestauranteComProdutos[] = restaurantesResult.restaurantes.map(restaurante => {
          const produtosDoRestaurante = produtosCorrigidos.filter(
            produto => produto.restauranteId === restaurante.id
          );
          
          console.log(`🏪 Restaurante "${restaurante.nome}" tem ${produtosDoRestaurante.length} produtos`);
          
          return {
            restaurante,
            produtos: produtosDoRestaurante
          };
        }); // REMOVIDO O FILTRO TEMPORARIAMENTE PARA DEBUG
        
        console.log('📋 Restaurantes processados:', restaurantesComProdutos.length);

        setRestaurantesComProdutos(restaurantesComProdutos);
        setRestaurantesOriginais(restaurantesComProdutos);
      } else {
        console.log('❌ Erro nos dados:', { produtosResult, restaurantesResult });
        Alert.alert('Erro', 'Erro ao carregar dados do cardápio');
      }
    } catch (error) {
      console.error('💥 Erro interno:', error);
      Alert.alert('Erro', 'Erro interno do aplicativo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const filtrarProdutos = (textoBusca: string) => {
    setBusca(textoBusca);
    
    if (textoBusca.trim() === '') {
      setRestaurantesComProdutos(restaurantesOriginais);
    } else {
      const restaurantesFiltrados = restaurantesOriginais.map(item => {
        const produtosFiltrados = item.produtos.filter(produto =>
          produto.nome.toLowerCase().includes(textoBusca.toLowerCase()) ||
          produto.descricao.toLowerCase().includes(textoBusca.toLowerCase()) ||
          item.restaurante.nome.toLowerCase().includes(textoBusca.toLowerCase())
        );
        
        return {
          ...item,
          produtos: produtosFiltrados
        };
      }).filter(item => item.produtos.length > 0);
      
      setRestaurantesComProdutos(restaurantesFiltrados);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const irParaCadastroRestaurante = () => {
    router.push('/cadastro-restaurante');
  };

  const irParaCadastroProduto = () => {
    router.push('/cadastro-produto');
  };

  const handleExcluirProduto = async (produto: Produto) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o produto "${produto.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await produtoController.removerProduto(produto.id);
              if (result.sucesso) {
                Alert.alert('Sucesso', 'Produto excluído com sucesso!');
                carregarDados(); // Recarrega os dados
              } else {
                Alert.alert('Erro', result.erro || 'Erro ao excluir produto');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro interno ao excluir produto');
            }
          }
        }
      ]
    );
  };

  const handleExcluirRestaurante = async (restaurante: Restaurante) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o restaurante "${restaurante.nome}"?\n\nATENÇÃO: Todos os produtos deste restaurante também serão removidos!`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              // Primeiro exclui todos os produtos do restaurante
              const produtosResult = await produtoController.listarProdutosPorRestaurante(restaurante.id);
              if (produtosResult.sucesso && produtosResult.produtos) {
                for (const produto of produtosResult.produtos) {
                  await produtoController.removerProduto(produto.id);
                }
              }
              
              // Depois exclui o restaurante
              const result = await restauranteController.removerRestaurante(restaurante.id);
              if (result.sucesso) {
                Alert.alert('Sucesso', 'Restaurante e todos os seus produtos foram excluídos!');
                carregarDados(); // Recarrega os dados
              } else {
                Alert.alert('Erro', result.erro || 'Erro ao excluir restaurante');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro interno ao excluir restaurante');
            }
          }
        }
      ]
    );
  };

  const renderProduto = (produto: Produto) => (
    <Card key={produto.id} style={styles.produtoCard}>
      {produto.imagem ? (
        <Card.Cover 
          source={{ uri: produto.imagem }} 
          style={styles.produtoImagem}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagemPlaceholder}>
          <Text variant="headlineSmall" style={styles.placeholderIcon}>🍽️</Text>
          <Text variant="bodySmall" style={styles.placeholderText}>Sem imagem</Text>
        </View>
      )}
      <Card.Content>
        <View style={styles.produtoHeader}>
          <View style={styles.produtoInfo}>
            <Text variant="titleMedium" style={styles.produtoNome}>
              {produto.nome}
            </Text>
            <Text variant="bodyMedium" style={styles.produtoDescricao} numberOfLines={2}>
              {produto.descricao}
            </Text>
            {produto.categoria && (
              <Chip compact style={styles.categoria}>
                {produto.categoria}
              </Chip>
            )}
          </View>
          <View style={styles.produtoActions}>
            <View style={styles.precoContainer}>
              <Text variant="titleLarge" style={styles.preco}>
                {formatarPreco(produto.preco)}
              </Text>
            </View>
            {isAdmin && (
              <Button
                mode="contained"
                onPress={() => handleExcluirProduto(produto)}
                style={styles.botaoExcluir}
                buttonColor="#D32F2F"
                textColor="#FFFFFF"
                compact
                icon="delete"
              >
                Excluir
              </Button>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRestaurante = (item: RestauranteComProdutos) => (
    <View key={item.restaurante.id} style={styles.restauranteContainer}>
      <Card style={styles.restauranteCard}>
        <Card.Content>
          <View style={styles.restauranteHeader}>
            <View style={styles.restauranteInfo}>
              <Text variant="headlineSmall" style={styles.restauranteNome}>
                🏪 {item.restaurante.nome}
              </Text>
              <Text variant="bodyMedium" style={styles.restauranteEndereco}>
                {item.restaurante.endereco.rua}, {item.restaurante.endereco.numero} - {item.restaurante.endereco.bairro}
              </Text>
              <Text variant="bodySmall" style={styles.restauranteCidade}>
                {item.restaurante.endereco.cidade} - {item.restaurante.endereco.uf}
              </Text>
            </View>
            <View style={styles.restauranteActions}>
              <View style={styles.contadorProdutos}>
                <Text variant="labelLarge" style={styles.quantidadeProdutos}>
                  {item.produtos.length} {item.produtos.length === 1 ? 'prato' : 'pratos'}
                </Text>
              </View>
              {isAdmin && (
                <Button
                  mode="contained"
                  onPress={() => handleExcluirRestaurante(item.restaurante)}
                  style={styles.botaoExcluirRestaurante}
                  buttonColor="#D32F2F"
                  textColor="#FFFFFF"
                  compact
                  icon="delete"
                >
                  Excluir
                </Button>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.produtosContainer}>
        {item.produtos.length > 0 ? (
          item.produtos.map(produto => renderProduto(produto))
        ) : (
          <Card style={styles.semProdutosCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.semProdutosText}>
                📝 Nenhum produto cadastrado ainda
              </Text>
              {isAdmin && (
                <Button
                  mode="outlined"
                  onPress={irParaCadastroProduto}
                  style={styles.botaoCadastrarProduto}
                  compact
                >
                  Cadastrar Produto
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </View>
      
      <Divider style={styles.divider} />
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        🍽️
      </Text>
      <Text variant="bodyLarge" style={styles.emptyText}>
        {busca ? 'Nenhum produto encontrado' : 'Nenhum cardápio disponível'}
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        {busca ? 'Tente uma busca diferente' : 'Cadastre restaurantes e produtos para ver o cardápio'}
      </Text>
      {isAdmin && !busca && (
        <View style={styles.emptyButtons}>
          <Button
            mode="contained"
            onPress={irParaCadastroRestaurante}
            style={styles.emptyButton}
            icon="store"
          >
            Cadastrar Restaurante
          </Button>
          <Button
            mode="outlined"
            onPress={irParaCadastroProduto}
            style={styles.emptyButton}
            icon="food"
          >
            Cadastrar Produto
          </Button>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Cardápio Digital" />
        <Appbar.Action 
          icon="account" 
          onPress={() => Alert.alert('Usuário', `Logado como: ${usuario?.nome}\nTipo: ${usuario?.tipo}`)} 
        />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar
          placeholder="Buscar restaurantes ou produtos..."
          onChangeText={filtrarProdutos}
          value={busca}
          style={styles.searchbar}
        />

        <ScrollView
          contentContainerStyle={restaurantesComProdutos.length === 0 ? styles.emptyList : styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {restaurantesComProdutos.length === 0 ? (
            renderEmptyList()
          ) : (
            restaurantesComProdutos.map(item => renderRestaurante(item))
          )}
        </ScrollView>
      </View>

      {isAdmin && (
        <View style={styles.fabContainer}>
          <FAB
            icon="store"
            label="Restaurante"
            onPress={irParaCadastroRestaurante}
            style={[styles.fab, styles.fabSecondary]}
            size="small"
          />
          <FAB
            icon="plus"
            label="Produto"
            onPress={irParaCadastroProduto}
            style={styles.fab}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  restauranteContainer: {
    marginBottom: 24,
  },
  restauranteCard: {
    elevation: 3,
    marginBottom: 12,
    backgroundColor: '#6200EE',
  },
  restauranteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restauranteInfo: {
    flex: 1,
  },
  restauranteNome: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  restauranteEndereco: {
    color: '#E8EAED',
    marginBottom: 2,
  },
  restauranteCidade: {
    color: '#BDC1C6',
  },
  restauranteActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  contadorProdutos: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quantidadeProdutos: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  produtosContainer: {
    marginLeft: 8,
    marginRight: 8,
  },
  produtoCard: {
    marginBottom: 8,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  produtoInfo: {
    flex: 1,
    marginRight: 16,
  },
  produtoNome: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  produtoDescricao: {
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  categoria: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
  },
  produtoActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  precoContainer: {
    alignItems: 'flex-end',
    backgroundColor: '#6200EE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  preco: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  divider: {
    marginTop: 16,
    height: 2,
    backgroundColor: '#E0E0E0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtext: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  emptyButtons: {
    width: '100%',
    gap: 12,
  },
  emptyButton: {
    marginBottom: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  fab: {
    backgroundColor: '#6200EE',
  },
  fabSecondary: {
    backgroundColor: '#03DAC6',
  },
  semProdutosCard: {
    marginBottom: 8,
    elevation: 1,
    backgroundColor: '#FFFFFF',
  },
  semProdutosText: {
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  botaoCadastrarProduto: {
    alignSelf: 'flex-end',
  },
  produtoImagem: {
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  imagemPlaceholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#666',
  },
  botaoExcluir: {
    minWidth: 80,
  },
  botaoExcluirRestaurante: {
    minWidth: 80,
  },
}); 