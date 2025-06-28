import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

export default function Index() {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (usuario) {
        // Se usuário está logado, vai para o cardápio
        router.replace('/cardapio');
      } else {
        // Se não está logado, vai para login
        router.replace('/login');
      }
    }
  }, [usuario, loading, router]);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return null;
}
