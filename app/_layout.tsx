import { Stack } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from "../src/contexts/AuthContext";

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="cadastro" />
          <Stack.Screen name="cadastro-restaurante" />
          <Stack.Screen name="cadastro-produto" />
          <Stack.Screen name="cardapio" />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}
