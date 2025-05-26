import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';

// We'll need to get the auth token here, e.g., from a global state or passed via params
// For now, let's assume we have a placeholder function to get it.
const getAuthToken = async () => {
  // In a real app, retrieve this from secure storage or global state
  // This is a placeholder. You'll need to manage the token properly.
  console.warn("Auth token is not implemented yet in cadastrar.tsx");
  return "YOUR_AUTH_TOKEN_HERE"; // Replace with actual token retrieval
};

const CadastrarPacienteScreen = () => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [email, setEmail] = useState('');
  const [telefoneCelular, setTelefoneCelular] = useState('');
  const [telefoneFixo, setTelefoneFixo] = useState('');
  const [enderecoRua, setEnderecoRua] = useState('');
  const [enderecoNumero, setEnderecoNumero] = useState('');
  const [enderecoComplemento, setEnderecoComplemento] = useState('');
  const [enderecoBairro, setEnderecoBairro] = useState('');
  const [enderecoCidade, setEnderecoCidade] = useState('');
  const [enderecoEstado, setEnderecoEstado] = useState('');
  const [enderecoCep, setEnderecoCep] = useState('');
  const [profissao, setProfissao] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [genero, setGenero] = useState('');
  const [comoConheceu, setComoConheceu] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    const authToken = await getAuthToken();
    if (!authToken || authToken === "YOUR_AUTH_TOKEN_HERE") {
        Alert.alert("Erro", "Token de autenticação não encontrado. Faça login novamente.");
        setIsLoading(false);
        return;
    }

    const pacienteData = {
      nome_completo: nomeCompleto,
      data_nascimento: dataNascimento, // Ensure YYYY-MM-DD format
      cpf,
      rg,
      email,
      telefone_celular: telefoneCelular,
      telefone_fixo: telefoneFixo,
      endereco_rua: enderecoRua,
      endereco_numero: enderecoNumero,
      endereco_complemento: enderecoComplemento,
      endereco_bairro: enderecoBairro,
      endereco_cidade: enderecoCidade,
      endereco_estado: enderecoEstado,
      endereco_cep: enderecoCep,
      profissao,
      estado_civil: estadoCivil,
      genero,
      como_conheceu: comoConheceu,
    };

    try {
      const response = await fetch('https://fisioonhand.work/api/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(pacienteData),
      });

      const responseData = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', 'Paciente cadastrado com sucesso!');
        console.log('Paciente cadastrado:', responseData);
        // Optionally navigate back or to the patient list
        router.back(); 
      } else {
        console.error('Erro ao cadastrar paciente:', responseData);
        Alert.alert('Erro', responseData.message || 'Não foi possível cadastrar o paciente.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert('Erro', 'Ocorreu um erro na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastrar Novo Paciente</Text>
      
      {/* Add TextInput for each field similar to the example below */}
      <TextInput style={styles.input} placeholder="Nome Completo" value={nomeCompleto} onChangeText={setNomeCompleto} />
      <TextInput style={styles.input} placeholder="Data de Nascimento (AAAA-MM-DD)" value={dataNascimento} onChangeText={setDataNascimento} />
      <TextInput style={styles.input} placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="RG" value={rg} onChangeText={setRg} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Telefone Celular" value={telefoneCelular} onChangeText={setTelefoneCelular} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Telefone Fixo (opcional)" value={telefoneFixo} onChangeText={setTelefoneFixo} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Endereço: Rua" value={enderecoRua} onChangeText={setEnderecoRua} />
      <TextInput style={styles.input} placeholder="Endereço: Número" value={enderecoNumero} onChangeText={setEnderecoNumero} />
      <TextInput style={styles.input} placeholder="Endereço: Complemento (opcional)" value={enderecoComplemento} onChangeText={setEnderecoComplemento} />
      <TextInput style={styles.input} placeholder="Endereço: Bairro" value={enderecoBairro} onChangeText={setEnderecoBairro} />
      <TextInput style={styles.input} placeholder="Endereço: Cidade" value={enderecoCidade} onChangeText={setEnderecoCidade} />
      <TextInput style={styles.input} placeholder="Endereço: Estado (UF)" value={enderecoEstado} onChangeText={setEnderecoEstado} />
      <TextInput style={styles.input} placeholder="Endereço: CEP" value={enderecoCep} onChangeText={setEnderecoCep} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Profissão" value={profissao} onChangeText={setProfissao} />
      <TextInput style={styles.input} placeholder="Estado Civil" value={estadoCivil} onChangeText={setEstadoCivil} />
      <TextInput style={styles.input} placeholder="Gênero" value={genero} onChangeText={setGenero} />
      <TextInput style={styles.input} placeholder="Como Conheceu?" value={comoConheceu} onChangeText={setComoConheceu} />

      <Button title={isLoading ? "Salvando..." : "Salvar Paciente"} onPress={handleSubmit} disabled={isLoading} />
      <View style={{ marginTop: 10 }}>
        <Button title="Cancelar" onPress={() => router.back()} color="#888" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default CadastrarPacienteScreen;