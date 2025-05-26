import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native'; // Added ScrollView
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../context/AuthContext'; // Assuming you need auth here too

// You'll likely want a more detailed interface for a single patient if it differs
interface PacienteDetalhes {
  id: number;
  nome_completo: string;
  email: string;
  telefone_principal: string;
  data_nascimento: string;
  cpf: string;
  // ... add all other fields you expect from /api/pacientes/{id}
}

const PacienteDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>(); // Get id from route params
  const { token: authToken, isLoading: authIsLoading } = useAuth();
  const [paciente, setPaciente] = useState<PacienteDetalhes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authIsLoading || !id) return;

    if (!authToken) {
      Alert.alert("Erro de Autenticação", "Token não encontrado.");
      setIsLoading(false);
      // router.replace('/'); // Optionally redirect
      return;
    }

    const fetchPacienteDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`https://fisioonhand.work/api/pacientes/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Falha ao buscar detalhes do paciente: ${response.status} - ${errorData}`);
        }

        const data: PacienteDetalhes = await response.json();
        setPaciente(data);
      } catch (e: any) {
        setError(e.message);
        Alert.alert("Erro ao Carregar Detalhes", e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPacienteDetails();
  }, [id, authToken, authIsLoading]);

  if (isLoading || authIsLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  if (error) {
    return <View style={styles.container}><Text style={styles.errorText}>{error}</Text></View>;
  }

  if (!paciente) {
    return <View style={styles.container}><Text>Paciente não encontrado.</Text></View>;
  }

  return (
    <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Detalhes do Paciente</Text>
      <Text style={styles.label}>Nome:</Text>
      <Text style={styles.value}>{paciente.nome_completo}</Text>
      
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{paciente.email || 'Não informado'}</Text>
      
      <Text style={styles.label}>Telefone:</Text>
      <Text style={styles.value}>{paciente.telefone_principal || 'Não informado'}</Text>
      
      <Text style={styles.label}>CPF:</Text>
      <Text style={styles.value}>{paciente.cpf || 'Não informado'}</Text>
      
      <Text style={styles.label}>Data de Nascimento:</Text>
      <Text style={styles.value}>{paciente.data_nascimento || 'Não informada'}</Text>

      <Text style={styles.label}>Gênero:</Text>
      <Text style={styles.value}>{paciente.genero || 'Não informado'}</Text>

      <Text style={styles.label}>RG:</Text>
      <Text style={styles.value}>{paciente.rg || 'Não informado'}</Text>

      <Text style={styles.label}>Endereço:</Text>
      <Text style={styles.value}>{
        `${paciente.endereco_rua || ''}, ${paciente.endereco_numero || ''} ${paciente.endereco_complemento || ''} - ${paciente.endereco_bairro || ''}, ${paciente.endereco_cidade || ''} - ${paciente.endereco_estado || ''}, CEP: ${paciente.endereco_cep || ''}`.trim() === ',  - ,  - , CEP:' ? 'Não informado' : `${paciente.endereco_rua || ''}, ${paciente.endereco_numero || ''} ${paciente.endereco_complemento || ''} - ${paciente.endereco_bairro || ''}, ${paciente.endereco_cidade || ''} - ${paciente.endereco_estado || ''}, CEP: ${paciente.endereco_cep || ''}`
      }</Text>

      <Text style={styles.label}>Profissão:</Text>
      <Text style={styles.value}>{paciente.profissao || 'Não informada'}</Text>

      <Text style={styles.label}>Estado Civil:</Text>
      <Text style={styles.value}>{paciente.estado_civil || 'Não informado'}</Text>
      
      {/* Adicione mais campos conforme necessário */}

      <TouchableOpacity 
        onPress={() => router.push(`/pacientes/fichas/${id}`)} 
        style={styles.actionButton}
      >
        <Text style={styles.actionButtonText}>Ver Ficha</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Voltar para Lista</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: { // Style for the ScrollView itself
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  contentContainer: { // Style for the content inside ScrollView
    padding: 20,
    paddingBottom: 40, // Add some padding at the bottom so content isn't cut off by the button
  },
  container: { // Kept for loading/error states if they don't need scrolling
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center', // Center loading/error messages
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
    paddingLeft: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 5,
  },
  actionButton: {
    marginTop: 20,
    backgroundColor: '#27ae60', // Cor diferente para ações principais
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PacienteDetailScreen;