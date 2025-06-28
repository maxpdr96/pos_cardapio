import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, RadioButton, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipo, setTipo] = useState<'cliente' | 'admin'>('cliente');
  const [loading, setLoading] = useState(false);
  
  const { cadastrar } = useAuth();
  const router = useRouter();

  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim() || !confirmarSenha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const result = await cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        confirmarSenha,
        tipo
      });
      
      if (result.sucesso) {
        Alert.alert(
          'Sucesso!', 
          'Cadastro realizado com sucesso!',
          [{ text: 'OK', onPress: () => router.replace('/cardapio') }]
        );
      } else {
        Alert.alert('Erro no Cadastro', result.erro || 'Erro desconhecido');
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
        <Appbar.Content title="Cadastro" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Criar Nova Conta
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Nome Completo"
                value={nome}
                onChangeText={setNome}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <TextInput
                label="Senha"
                value={senha}
                onChangeText={setSenha}
                mode="outlined"
                secureTextEntry
                style={styles.input}
              />

              <TextInput
                label="Confirmar Senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                mode="outlined"
                secureTextEntry
                style={styles.input}
              />

              <View style={styles.radioContainer}>
                <Text variant="bodyLarge" style={styles.radioTitle}>
                  Tipo de Usuário:
                </Text>
                
                <RadioButton.Group 
                  onValueChange={(value) => setTipo(value as 'cliente' | 'admin')} 
                  value={tipo}
                >
                  <View style={styles.radioItem}>
                    <RadioButton value="cliente" />
                    <Text variant="bodyMedium">Cliente</Text>
                  </View>
                  
                  <View style={styles.radioItem}>
                    <RadioButton value="admin" />
                    <Text variant="bodyMedium">Administrador</Text>
                  </View>
                </RadioButton.Group>
              </View>

              <Button
                mode="contained"
                onPress={handleCadastro}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Cadastrar
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
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  card: {
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  radioContainer: {
    marginBottom: 16,
    padding: 8,
  },
  radioTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
  },
}); 