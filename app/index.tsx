import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from './context/AuthContext'; // Importe o useAuth

interface AuthResponse {
  token: string;
  expires_in: number;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  crefito_id: string;
  created_at: string;
  updated_at: string;
}

const Home = () => {
  const router = useRouter(); // Adicionado para navegação programática
  const frases = [
    "Organize sua rotina, atenda com excelência.",
    "Sua clínica na palma da mão.",
    "Gestão completa para fisioterapeutas modernos.",
    "Mais tempo para cuidar, menos tempo com papelada.",
    "Controle total da sua agenda, pacientes e finanças.",
    "Porque sua carreira merece organização profissional.",
    "Foco no paciente. A gente cuida do resto.",
    "Otimize seu dia, melhore seus resultados.",
    "Seu consultório digital começa aqui.",
    "Tecnologia pensada para fisioterapeutas."
  ];

  const [textoAtual, setTextoAtual] = useState("");
  const [indiceFrase, setIndiceFrase] = useState(0);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { signIn, signOut, token: authTokenFromContext, userData: userDataFromContext, isLoading: authLoading } = useAuth(); // Use o hook
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Não é mais necessário, use authTokenFromContext
  const [userData, setUserData] = useState<UserData | null>(null); // Não é mais necessário
  const [authToken, setAuthToken] = useState<string | null>(null); // Não é mais necessário
  const [isLoading, setIsLoading] = useState(false);

  const charIndexRef = useRef(0);
  const isTypingRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExistingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    const fraseCompleta = frases[indiceFrase];

    const step = () => {
      if (isTypingRef.current) {
        if (charIndexRef.current < fraseCompleta.length) {
          charIndexRef.current += 1;
          setTextoAtual(fraseCompleta.slice(0, charIndexRef.current));
          clearExistingTimeout();
          timeoutRef.current = setTimeout(step, 100); 
        } else {
          clearExistingTimeout();
          timeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            step(); 
          }, 2000);
        }
      } else {
        if (charIndexRef.current > 0) {
          charIndexRef.current -= 1;
          setTextoAtual(fraseCompleta.slice(0, charIndexRef.current));
          clearExistingTimeout();
          timeoutRef.current = setTimeout(step, 50); 
        } else {
          clearExistingTimeout();
          isTypingRef.current = true;
          setIndiceFrase(prev => (prev + 1) % frases.length);
        }
      }
    };

    step();

    return () => {
      clearExistingTimeout();
    };
  }, [indiceFrase]);

  // Função para buscar os dados do usuário usando o token
  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('https://fisioonhand.work/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao verificar token');
      }

      const userData: UserData = await response.json();
      return userData;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Por favor, preencha email e senha");
      return;
    }
    setIsLoading(true); // isLoading local para o botão de login
    try {
      const response = await fetch('https://fisioonhand.work/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: senha })
      });
      if (!response.ok) throw new Error('Credenciais inválidas');
      const authResponse: AuthResponse = await response.json();
      
      // Buscar dados do usuário com o token recebido
      const userDataResponse = await fetchUserData(authResponse.token); // fetchUserData permanece o mesmo
      
      await signIn(authResponse.token, userDataResponse); // Chame signIn do AuthContext
      
      Alert.alert("Login realizado com sucesso", `Bem-vindo, ${userDataResponse.username}!`);
    } catch (error) {
      Alert.alert("Erro de autenticação", "Não foi possível realizar o login. Verifique suas credenciais.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(); // Chame signOut do AuthContext
    setEmail("");
    setSenha("");
  };

  // Use authTokenFromContext para verificar se está logado
  if (authLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>; // Tela de carregamento inicial
  }

  if (authTokenFromContext && userDataFromContext) {
    return (
      <View style={styles.loggedInContainer}>
        <Text style={styles.title}>Bem-vindo, {userDataFromContext.username}!</Text>
        <Text style={styles.subtitle}>Selecione uma opção:</Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => router.push('/agenda')}
          >
            <Text style={styles.navButtonText}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => router.push('/pacientes')}
          >
            <Text style={styles.navButtonText}>Pacientes</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem vindo ao fisio on hand!</Text>
      <Text style={styles.subtitle}>{textoAtual}</Text>
      
      {!isLoggedIn ? (
        <View style={styles.loginContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input}
              placeholder="Seu email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput 
              style={styles.input}
              placeholder="Sua senha"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? "Entrando..." : "Entrar"}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.userInfoContainer}>
          <Text style={styles.welcomeText}>Olá, {userData?.username}</Text>
          <Text style={styles.userInfoText}>Email: {userData?.email}</Text>
          <Text style={styles.userInfoText}>CREFITO: {userData?.crefito_id}</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f4f8", 
  },
  loggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28, 
    fontWeight: "bold",
    color: "#2c3e50", 
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18, 
    color: "#34495e", 
    textAlign: "center",
    marginBottom: 30, 
    minHeight: 50, 
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400, 
    backgroundColor: '#ffffff',
    padding: 25, 
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#34495e", 
    marginBottom: 8, 
  },
  input: {
    height: 50, 
    borderColor: "#bdc3c7", 
    borderWidth: 1,
    borderRadius: 8, 
    paddingHorizontal: 15, 
    fontSize: 16,
    backgroundColor: '#ecf0f1',
  },
  button: {
    backgroundColor: "#3498db", 
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#a9cce3", 
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#e74c3c", 
    marginTop: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  navButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Added missing styles:
  forgotPassword: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  userInfoContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 20, // Or adjust as needed
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  userInfoText: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 5,
  },
});

export default Home;
