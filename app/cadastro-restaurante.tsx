import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Card, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';
import { RestauranteController } from '../src/controllers/RestauranteController';
import { aplicarMascaraCEP, aplicarMascaraCNPJ, removerMascaraCEP } from '../src/utils/helpers';

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export default function CadastroRestaurante() {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [cep, setCep] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [consultandoCep, setConsultandoCep] = useState(false);
  
  const { isAdmin } = useAuth();
  const router = useRouter();
  const restauranteController = new RestauranteController();

  if (!isAdmin) {
    Alert.alert('Acesso Negado', 'Apenas administradores podem cadastrar restaurantes');
    router.back();
    return null;
  }

  const consultarCEP = async (cepValue: string) => {
    const cepLimpo = removerMascaraCEP(cepValue);
    
    // Verifica se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return;
    }

    setConsultandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data: ViaCEPResponse = await response.json();
      
      if (data.erro) {
        Alert.alert('CEP não encontrado', 'O CEP informado não foi encontrado. Verifique e tente novamente.');
        return;
      }

      // Preenche os campos com os dados da API
      if (data.logradouro) setRua(data.logradouro);
      if (data.bairro) setBairro(data.bairro);
      if (data.localidade) setCidade(data.localidade);
      if (data.uf) setUf(data.uf);

      // Se algum campo não veio preenchido da API, mantém em branco
      if (!data.logradouro) setRua('');
      if (!data.bairro) setBairro('');
      if (!data.localidade) setCidade('');
      if (!data.uf) setUf('');

      Alert.alert('CEP encontrado!', 'Endereço preenchido automaticamente. Verifique os dados e complete as informações que faltam.');
      
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      Alert.alert('Erro', 'Erro ao consultar CEP. Verifique sua conexão e tente novamente.');
    } finally {
      setConsultandoCep(false);
    }
  };

  const handleCepChange = (text: string) => {
    const cepFormatado = aplicarMascaraCEP(text);
    setCep(cepFormatado);
    
    // Consulta a API quando o CEP estiver completo (8 dígitos)
    const cepLimpo = removerMascaraCEP(cepFormatado);
    if (cepLimpo.length === 8) {
      consultarCEP(cepFormatado);
    }
  };

  const handleCadastro = async () => {
    if (!nome.trim() || !cnpj.trim() || !rua.trim() || !numero.trim() || 
        !cep.trim() || !bairro.trim() || !cidade.trim() || !uf.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const lat = parseFloat(latitude || '0');
    const lng = parseFloat(longitude || '0');

    setLoading(true);
    try {
      const result = await restauranteController.cadastrarRestaurante({
        nome: nome.trim(),
        cnpj: cnpj.trim(),
        endereco: {
          rua: rua.trim(),
          numero: numero.trim(),
          cep: cep.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          uf: uf.trim().toUpperCase(),
          latitude: lat,
          longitude: lng
        }
      });
      
      if (result.sucesso) {
        Alert.alert(
          'Sucesso!', 
          'Restaurante cadastrado com sucesso!',
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

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Cadastrar Restaurante" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Informações Básicas
              </Text>
              
              <TextInput
                label="Nome do Restaurante *"
                value={nome}
                onChangeText={setNome}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="CNPJ *"
                value={cnpj}
                onChangeText={(text) => setCnpj(aplicarMascaraCNPJ(text))}
                mode="outlined"
                placeholder="XX.XXX.XXX/XXXX-XX"
                style={styles.input}
              />

              <Text variant="titleMedium" style={styles.sectionTitle}>
                Endereço
              </Text>

              <View style={styles.cepContainer}>
                <TextInput
                  label="CEP *"
                  value={cep}
                  onChangeText={handleCepChange}
                  mode="outlined"
                  placeholder="XXXXX-XXX"
                  style={[styles.input, styles.cepInput]}
                  right={consultandoCep ? <TextInput.Icon icon={() => <ActivityIndicator size="small" />} /> : undefined}
                />
                {consultandoCep && (
                  <Text variant="bodySmall" style={styles.consultandoText}>
                    🔍 Consultando CEP...
                  </Text>
                )}
              </View>

              <TextInput
                label="Rua *"
                value={rua}
                onChangeText={setRua}
                mode="outlined"
                style={styles.input}
                placeholder="Será preenchido automaticamente"
              />

              <TextInput
                label="Número *"
                value={numero}
                onChangeText={setNumero}
                mode="outlined"
                style={styles.input}
                placeholder="Ex: 123, 45A"
              />

              <TextInput
                label="Bairro *"
                value={bairro}
                onChangeText={setBairro}
                mode="outlined"
                style={styles.input}
                placeholder="Será preenchido automaticamente"
              />

              <TextInput
                label="Cidade *"
                value={cidade}
                onChangeText={setCidade}
                mode="outlined"
                style={styles.input}
                placeholder="Será preenchido automaticamente"
              />

              <TextInput
                label="UF *"
                value={uf}
                onChangeText={setUf}
                mode="outlined"
                maxLength={2}
                placeholder="Será preenchido automaticamente"
                style={styles.input}
              />

              <Text variant="titleMedium" style={styles.sectionTitle}>
                Coordenadas (Opcional)
              </Text>

              <TextInput
                label="Latitude"
                value={latitude}
                onChangeText={setLatitude}
                mode="outlined"
                keyboardType="numeric"
                placeholder="-23.550520"
                style={styles.input}
              />

              <TextInput
                label="Longitude"
                value={longitude}
                onChangeText={setLongitude}
                mode="outlined"
                keyboardType="numeric"
                placeholder="-46.633308"
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={handleCadastro}
                loading={loading}
                disabled={loading || consultandoCep}
                style={styles.button}
                icon="store"
              >
                Cadastrar Restaurante
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
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
    color: '#6200EE',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  cepContainer: {
    marginBottom: 16,
  },
  cepInput: {
    marginBottom: 4,
  },
  consultandoText: {
    color: '#6200EE',
    fontStyle: 'italic',
    marginBottom: 12,
  },
}); 