import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../context/AuthContext'; // Importe o useAuth

interface Paciente {
  id: number;
  user_id: number;
  nome_completo: string;
  data_nascimento: string;
  genero: string;
  cpf: string;
  rg: string;
  telefone_principal: string;
  email: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_complemento: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  profissao: string;
  estado_civil: string;
  created_at: string;
  updated_at: string;
}

const PacientesScreen = () => {
  const { token: authToken, isLoading: authIsLoading } = useAuth(); // Obtenha o token do AuthContext
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading da tela de pacientes
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      if (authIsLoading) return; // Aguarde o AuthContext carregar

      if (!authToken) {
        Alert.alert("Erro de Autenticação", "Você não está logado ou seu token é inválido.");
        setIsLoading(false);
        setError("Token de autenticação não encontrado.");
        // Opcionalmente, redirecionar para a tela de login: router.replace('/');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('https://fisioonhand.work/api/pacientes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Falha ao buscar pacientes: ${response.status} - ${errorData}`);
        }

        const data: Paciente[] = await response.json();
        setPacientes(data);
      } catch (e: any) {
        setError(e.message);
        Alert.alert("Erro ao Carregar Pacientes", e.message);
        console.error("Erro detalhado: ", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPacientes();
  }, [authToken, authIsLoading]); // Adicionado authIsLoading como dependência

  const renderPaciente = ({ item }: { item: Paciente }) => (
    <View style={styles.pacienteItemContainer}>
      <Text style={styles.pacienteNome}>{item.nome_completo}</Text>
      <Text>Email: {item.email || 'Não informado'}</Text>
      <Text>Telefone: {item.telefone_principal || 'Não informado'}</Text>
      {/* Adicione mais detalhes se desejar e um botão para ver detalhes/editar */}
      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={() => router.push(`/pacientes/${item.id}`)} // Assumindo que você terá uma tela de detalhes
      >
        <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
      </TouchableOpacity>
    </View>
  );

  if (authIsLoading || isLoading) { // Mostrar loading se AuthContext ou a busca de pacientes estiver carregando
    return <View style={styles.container}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Pacientes</Text>

      <Link href="/pacientes/cadastrar" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Cadastrar Novo Paciente</Text>
        </TouchableOpacity>
      </Link>

      {isLoading ? (
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>Erro ao carregar pacientes: {error}</Text>
      ) : pacientes.length === 0 ? (
        <Text style={styles.placeholderText}>Nenhum paciente cadastrado.</Text>
      ) : (
        <FlatList
          data={pacientes}
          renderItem={renderPaciente}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
        />
      )}
      
      <View style={styles.backButtonContainer}>
        <Button title="Voltar para o Início" onPress={() => router.replace('/')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8', // Cor de fundo suave
  },
  title: {
    fontSize: 26, // Aumentado
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50', // Cor escura para o título
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d', // Cor mais suave para placeholder
    marginTop: 30, // Espaçamento
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25, // Aumentado
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  list: {
    flex: 1, // Para ocupar o espaço disponível
  },
  pacienteItemContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15, // Espaçamento entre itens
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pacienteNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e', // Cor para o nome
    marginBottom: 5,
  },
  detailsButton: {
    marginTop: 10,
    backgroundColor: '#2ecc71', // Cor verde para o botão de detalhes
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  backButtonContainer: {
    marginTop: 20, // Ajustado para dar espaço para a lista
    paddingBottom: 10, // Reduzido um pouco
  }
});

export default PacientesScreen;