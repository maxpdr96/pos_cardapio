import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Menu, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';
import { ProdutoController } from '../src/controllers/ProdutoController';
import { RestauranteController } from '../src/controllers/RestauranteController';
import { Restaurante } from '../src/types';

export default function CadastroProduto() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [categoria, setCategoria] = useState('');
  const [restauranteSelecionado, setRestauranteSelecionado] = useState<Restaurante | null>(null);
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carregandoRestaurantes, setCarregandoRestaurantes] = useState(true);
  
  const { isAdmin } = useAuth();
  const router = useRouter();
  const produtoController = new ProdutoController();
  const restauranteController = new RestauranteController();

  useEffect(() => {
    carregarRestaurantes();
  }, []);

  const carregarRestaurantes = async () => {
    try {
      const result = await restauranteController.listarRestaurantes();
      if (result.sucesso && result.restaurantes) {
        setRestaurantes(result.restaurantes);
        // Se houver apenas um restaurante, selecione automaticamente
        if (result.restaurantes.length === 1) {
          setRestauranteSelecionado(result.restaurantes[0]);
        }
      } else {
        Alert.alert('Erro', 'Erro ao carregar restaurantes');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar restaurantes');
    } finally {
      setCarregandoRestaurantes(false);
    }
  };

  if (!isAdmin) {
    Alert.alert('Acesso Negado', 'Apenas administradores podem cadastrar produtos');
    router.back();
    return null;
  }

  const handleCadastro = async () => {
    if (!nome.trim() || !descricao.trim() || !preco.trim() || !imagem.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!restauranteSelecionado) {
      Alert.alert('Erro', 'Por favor, selecione um restaurante');
      return;
    }

    const precoNumerico = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      Alert.alert('Erro', 'Preço deve ser um valor numérico válido');
      return;
    }

    setLoading(true);
    try {
      const result = await produtoController.cadastrarProduto({
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: precoNumerico,
        imagem: imagem.trim(),
        categoria: categoria.trim() || undefined,
        restauranteId: restauranteSelecionado.id
      });
      
      if (result.sucesso) {
        Alert.alert(
          'Sucesso!', 
          `Produto cadastrado com sucesso no restaurante "${restauranteSelecionado.nome}"!`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Erro', result.erro || 'Erro desconhecido');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro interno do aplicativo');
    } finally {
      setLoading(false);
    }
  };

  if (carregandoRestaurantes) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Cadastrar Produto" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>Carregando restaurantes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (restaurantes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Cadastrar Produto" />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>🏪</Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Nenhum restaurante cadastrado
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            É necessário cadastrar pelo menos um restaurante antes de criar produtos
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/cadastro-restaurante')}
            style={styles.button}
          >
            Cadastrar Restaurante
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Cadastrar Produto" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    style={styles.input}
                    contentStyle={styles.menuButton}
                  >
                    {restauranteSelecionado 
                      ? `🏪 ${restauranteSelecionado.nome}` 
                      : 'Selecionar Restaurante *'}
                  </Button>
                }
              >
                {restaurantes.map((restaurante) => (
                  <Menu.Item
                    key={restaurante.id}
                    onPress={() => {
                      setRestauranteSelecionado(restaurante);
                      setMenuVisible(false);
                    }}
                    title={`🏪 ${restaurante.nome}`}
                    leadingIcon="store"
                  />
                ))}
              </Menu>

              <TextInput
                label="Nome do Produto *"
                value={nome}
                onChangeText={setNome}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Descrição *"
                value={descricao}
                onChangeText={setDescricao}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <TextInput
                label="Preço (R$) *"
                value={preco}
                onChangeText={setPreco}
                mode="outlined"
                keyboardType="numeric"
                placeholder="Ex: 25.90"
                style={styles.input}
              />

              <TextInput
                label="URL da Imagem *"
                value={imagem}
                onChangeText={setImagem}
                mode="outlined"
                placeholder="https://exemplo.com/imagem.jpg"
                style={styles.input}
              />

              <TextInput
                label="Categoria (opcional)"
                value={categoria}
                onChangeText={setCategoria}
                mode="outlined"
                placeholder="Ex: Prato Principal, Sobremesa"
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={handleCadastro}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Cadastrar Produto
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  card: {
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  menuButton: {
    justifyContent: 'flex-start',
  },
  button: {
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
}); 