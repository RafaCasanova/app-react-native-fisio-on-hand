import * as ImagePicker from 'expo-image-picker'; // Para capturar imagens/documentos
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Button // Added Button for simplicity for now
    ,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho

// Interfaces baseadas nos DTOs Go
interface FichaPacienteDTO {
    id?: number; // ID da ficha, se existente
    paciente_id: number;
    data_avaliacao: string; // ISO String YYYY-MM-DDTHH:MM:SSZ
    queixa_principal: string;
    historia_doenca_atual?: string;
    historia_medica_pregressa?: string;
    medicamentos_em_uso?: string;
    alergias?: string;
    habitos_vida?: string;
    historia_familiar?: string;
    avaliacao_postural?: string;
    avaliacao_articular?: string;
    avaliacao_muscular?: string;
    avaliacao_neurologica?: string;
    testes_especiais?: string;
    exames_complementares_relevantes?: string;
    diagnostico_fisioterapeutico: string;
    plano_tratamento: string;
    objetivos_curto_prazo?: string;
    objetivos_medio_prazo?: string;
    objetivos_longo_prazo?: string;
    conduta_proposta?: string;
    prognostico?: string;
    observacoes_adicionais?: string;
    created_at?: string;
    updated_at?: string;
}

interface AnotacaoFichaDTO {
    id?: number; // ID da anotação, se existente
    ficha_paciente_id: number;
    tipo_anotacao_id: number; // 1: texto, 2: pdf, 3: imagem, 4: anexo
    conteudo_anotacao: string; // Texto ou caminho/URL do arquivo
    nome_arquivo_original?: string;
    mime_type?: string;
    tamanho_arquivo_bytes?: number;
    descricao_curta?: string;
    user_id?: number; // Adicionado com base na tabela, mas não no DTO de criação
    created_at?: string;
}

const FichaPacienteScreen = () => {
    const { id: pacienteIdString } = useLocalSearchParams<{ id: string }>();
    const pacienteId = parseInt(pacienteIdString || '0');
    const { token: authToken, user, isLoading: authIsLoading } = useAuth(); // Assumindo que 'user' tem 'id'

    const [ficha, setFicha] = useState<Partial<FichaPacienteDTO>>({});
    const [anotacoes, setAnotacoes] = useState<AnotacaoFichaDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false); // Para mostrar/esconder formulário de criação/edição

    // --- Funções para Ficha --- 
    const fetchFichaEAnexos = useCallback(async () => {
        if (!authToken || !pacienteId) return;
        setIsLoading(true);
        setError(null);
        try {
            // 1. Buscar Ficha do Paciente
            // TODO: Substituir pelo endpoint GET correto para buscar ficha por paciente_id
            // Ex: const fichaResponse = await fetch(`https://fisioonhand.work/api/pacientes/${pacienteId}/ficha`, {
            const fichaResponse = await fetch(`https://fisioonhand.work/api/fichas-pacientes?paciente_id=${pacienteId}`, { // Tentativa de endpoint
                 headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (fichaResponse.ok) {
                const fichasData = await fichaResponse.json();
                if (fichasData && fichasData.length > 0) { // API pode retornar array
                    const fichaEncontrada = fichasData[0]; // Pega a primeira ou a mais relevante
                    setFicha(fichaEncontrada);
                    setShowForm(true); // Mostrar formulário para edição
                    // 2. Buscar Anotações da Ficha (se a ficha foi encontrada)
                    // TODO: Substituir pelo endpoint GET correto para buscar anotações da ficha
                    // Ex: const anotacoesResponse = await fetch(`https://fisioonhand.work/api/fichas-pacientes/${fichaEncontrada.id}/anotacoes`, {
                    const anotacoesResponse = await fetch(`https://fisioonhand.work/api/anotacoes-fichas-pacientes?ficha_paciente_id=${fichaEncontrada.id}`, { // Tentativa
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (anotacoesResponse.ok) {
                        const anotacoesData = await anotacoesResponse.json();
                        setAnotacoes(anotacoesData || []);
                    } else {
                        console.warn("Erro ao buscar anotações da ficha.");
                    }
                } else {
                    // Nenhuma ficha existente, prepara para criar uma nova
                    setFicha({ paciente_id: pacienteId, data_avaliacao: new Date().toISOString(), queixa_principal: '', diagnostico_fisioterapeutico: '', plano_tratamento: '' });
                    setShowForm(false); // Não mostrar form inicialmente, mas botão para criar
                    setAnotacoes([]);
                }
            } else {
                 console.warn("Nenhuma ficha encontrada ou erro ao buscar. Status: " + fichaResponse.status);
                 setFicha({ paciente_id: pacienteId, data_avaliacao: new Date().toISOString(), queixa_principal: '', diagnostico_fisioterapeutico: '', plano_tratamento: '' });
                 setShowForm(false);
                 setAnotacoes([]);
            }
        } catch (e: any) {
            setError("Erro ao carregar dados da ficha: " + e.message);
            Alert.alert("Erro", "Não foi possível carregar os dados da ficha.");
        } finally {
            setIsLoading(false);
        }
    }, [authToken, pacienteId]);

    useEffect(() => {
        if (!authIsLoading && pacienteId) {
            fetchFichaEAnexos();
        }
    }, [authIsLoading, pacienteId, fetchFichaEAnexos]);

    const handleInputChange = (field: keyof FichaPacienteDTO, value: string) => {
        setFicha(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveFicha = async () => {
        if (!authToken || !pacienteId) return;
        if (!ficha.queixa_principal || !ficha.diagnostico_fisioterapeutico || !ficha.plano_tratamento) {
            Alert.alert("Campos Obrigatórios", "Queixa Principal, Diagnóstico e Plano de Tratamento são obrigatórios.");
            return;
        }
        setIsSubmitting(true);
        setError(null);

        const payload: Partial<FichaPacienteDTO> = {
            ...ficha,
            paciente_id: pacienteId,
            data_avaliacao: ficha.data_avaliacao || new Date().toISOString(),
        };
        // Remover ID se for uma criação para evitar conflitos com a API
        if (!payload.id) delete payload.id;

        const method = payload.id ? 'PUT' : 'POST';
        const endpoint = payload.id ? `https://fisioonhand.work/api/fichas-pacientes/${payload.id}` : `https://fisioonhand.work/api/fichas-pacientes`;

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ${response.status} ao salvar ficha.`);
            }
            const result = await response.json();
            Alert.alert("Sucesso", `Ficha ${payload.id ? 'atualizada' : 'criada'} com sucesso!`);
            setFicha(result); // Atualiza o estado da ficha com o retorno da API (pode ter ID, created_at, etc)
            setShowForm(true);
            if (!payload.id) { // Se foi uma criação, busca as anotações (que estarão vazias)
                fetchFichaEAnexos(); // Para garantir que o ID da ficha está correto para novas anotações
            }
        } catch (e: any) {
            setError(e.message);
            Alert.alert("Erro ao Salvar Ficha", e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Funções para Anotações ---
    const handleAddAnotacao = async (tipo: 'texto' | 'imagem' | 'documento') => {
        if (!ficha.id) {
            Alert.alert("Atenção", "Salve a ficha principal antes de adicionar anotações.");
            return;
        }

        let anotacaoPayload: Partial<AnotacaoFichaDTO> = {
            ficha_paciente_id: ficha.id,
            // user_id: user?.id, // Se o user context tiver o ID do fisioterapeuta
        };

        if (tipo === 'texto') {
            // Poderia abrir um modal para input de texto
            const texto = prompt("Digite sua anotação:"); // Simples prompt, idealmente um modal
            if (texto) {
                anotacaoPayload.tipo_anotacao_id = 1; // 'texto'
                anotacaoPayload.conteudo_anotacao = texto;
            } else return;
        } else if (tipo === 'imagem' || tipo === 'documento') {
            const isCamera = tipo === 'imagem'; // Para imagem, podemos dar opção de câmera ou galeria
            const options: ImagePicker.ImagePickerOptions = {
                mediaTypes: isCamera ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.All, // All para documentos
                allowsEditing: isCamera, // Permitir edição para imagens
                quality: isCamera ? 0.7 : 1,
            };
            
            let result;
            if (isCamera) {
                 // Pedir permissão para câmera
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                if (!cameraPermission.granted) {
                    Alert.alert("Permissão Necessária", "Permissão para acessar a câmera é necessária!");
                    return;
                }
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                // Pedir permissão para galeria/documentos
                const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!mediaLibraryPermission.granted) {
                    Alert.alert("Permissão Necessária", "Permissão para acessar a galeria é necessária!");
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                anotacaoPayload.tipo_anotacao_id = isCamera ? 3 : (asset.mimeType?.startsWith('image/') ? 3 : (asset.mimeType === 'application/pdf' ? 2 : 4)); // 'imagem', 'pdf', 'anexo'
                anotacaoPayload.conteudo_anotacao = asset.uri; // URI local do arquivo
                anotacaoPayload.nome_arquivo_original = asset.fileName || `anexo_${Date.now()}`;
                anotacaoPayload.mime_type = asset.mimeType;
                anotacaoPayload.tamanho_arquivo_bytes = asset.fileSize;
                anotacaoPayload.descricao_curta = prompt("Descrição curta do anexo (opcional):") || undefined;

                // TODO: Upload do arquivo para o servidor!
                // O 'conteudo_anotacao' no DTO final deve ser o URL/caminho do arquivo no servidor, não o URI local.
                // Você precisará de uma função para fazer upload do 'asset.uri' e obter o URL de volta.
                // Por agora, vamos simular o envio do URI local para o DTO, mas isso NÃO FUNCIONARÁ com a API real.
                Alert.alert("Upload Pendente", "A lógica de upload do arquivo para o servidor precisa ser implementada. Por enquanto, a anotação não será salva corretamente com o arquivo.");
                // return; // Descomente após implementar upload
            } else return;
        }

        setIsSubmitting(true);
        try {
            // Endpoint para anotações: POST /api/fichas-pacientes/ (conforme DTO)
            // Idealmente seria POST /api/fichas-pacientes/{ficha.id}/anotacoes
            const response = await fetch(`https://fisioonhand.work/api/fichas-pacientes/`, { // Usando o endpoint do DTO Anotacao
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json', // Se for enviar JSON com URL do arquivo. Se for FormData, ajuste.
                    'Accept': 'application/json',
                },
                body: JSON.stringify(anotacaoPayload), // Se for FormData, construa o FormData aqui
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ${response.status} ao salvar anotação.`);
            }
            const novaAnotacao = await response.json();
            setAnotacoes(prev => [...prev, novaAnotacao]);
            Alert.alert("Sucesso", "Anotação adicionada!");
        } catch (e: any) {
            Alert.alert("Erro ao Adicionar Anotação", e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || authIsLoading) {
        return <View style={styles.container}><ActivityIndicator size="large" /></View>;
    }

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Ficha do Paciente</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}

            {!showForm && !ficha.id && (
                <TouchableOpacity onPress={() => { 
                    setFicha({ paciente_id: pacienteId, data_avaliacao: new Date().toISOString(), queixa_principal: '', diagnostico_fisioterapeutico: '', plano_tratamento: '' });
                    setShowForm(true); 
                }} style={styles.button}>
                    <Text style={styles.buttonText}>Criar Nova Ficha</Text>
                </TouchableOpacity>
            )}

            {showForm && (
                <View>
                    <Text style={styles.label}>Data da Avaliação:</Text>
                    <TextInput 
                        style={styles.input}
                        value={ficha.data_avaliacao ? new Date(ficha.data_avaliacao).toLocaleDateString('pt-BR') : ''} 
                        placeholder="YYYY-MM-DD" 
                        editable={false} // Usar DatePicker
                    />
                    <Text style={styles.label}>Queixa Principal (*):</Text>
                    <TextInput style={styles.input} value={ficha.queixa_principal || ''} onChangeText={(text) => handleInputChange('queixa_principal', text)} multiline />
                    
                    <Text style={styles.label}>História Doença Atual:</Text>
                    <TextInput style={styles.input} value={ficha.historia_doenca_atual || ''} onChangeText={(text) => handleInputChange('historia_doenca_atual', text)} multiline />

                    <Text style={styles.label}>Diagnóstico Fisioterapêutico (*):</Text>
                    <TextInput style={styles.input} value={ficha.diagnostico_fisioterapeutico || ''} onChangeText={(text) => handleInputChange('diagnostico_fisioterapeutico', text)} multiline />

                    <Text style={styles.label}>Plano de Tratamento (*):</Text>
                    <TextInput style={styles.input} value={ficha.plano_tratamento || ''} onChangeText={(text) => handleInputChange('plano_tratamento', text)} multiline />
                    
                    {/* Adicionar todos os outros campos da FichaPacienteDTO aqui */}
                    {/* Ex: 
                    <Text style={styles.label}>Alergias:</Text>
                    <TextInput style={styles.input} value={ficha.alergias || ''} onChangeText={(text) => handleInputChange('alergias', text)} multiline />
                    */}

                    <TouchableOpacity onPress={handleSaveFicha} style={styles.button} disabled={isSubmitting}>
                        <Text style={styles.buttonText}>{isSubmitting ? 'Salvando...' : (ficha.id ? 'Atualizar Ficha' : 'Salvar Nova Ficha')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {ficha.id && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Anotações</Text>
                    {anotacoes.map(anot => (
                        <View key={anot.id} style={styles.anotacaoCard}>
                            <Text style={styles.anotacaoDate}>{anot.created_at ? new Date(anot.created_at).toLocaleString('pt-BR') : 'Data não disponível'}</Text>
                            <Text style={styles.anotacaoDescricao}>{anot.descricao_curta || `Tipo: ${anot.tipo_anotacao_id}`}</Text>
                            {anot.tipo_anotacao_id === 1 && <Text>{anot.conteudo_anotacao}</Text>}
                            {(anot.tipo_anotacao_id === 2 || anot.tipo_anotacao_id === 3 || anot.tipo_anotacao_id === 4) && 
                                <Text>Arquivo: {anot.nome_arquivo_original || anot.conteudo_anotacao} (Clique para ver - não implementado)</Text>}
                        </View>
                    ))}
                    {anotacoes.length === 0 && <Text>Nenhuma anotação ainda.</Text>}
                    
                    <View style={styles.anotacaoActions}>
                        <Button title="Ad. Texto" onPress={() => handleAddAnotacao('texto')} />
                        <Button title="Ad. Imagem" onPress={() => handleAddAnotacao('imagem')} />
                        <Button title="Ad. Documento" onPress={() => handleAddAnotacao('documento')} />
                    </View>
                </View>
            )}

            <TouchableOpacity onPress={() => router.back()} style={[styles.button, styles.backButton]}>
                <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 40 },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10,
        fontSize: 16, marginBottom: 10, backgroundColor: '#fff', minHeight: 40,
    },
    button: {
        backgroundColor: '#007bff', padding: 15, borderRadius: 5,
        alignItems: 'center', marginTop: 20,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    backButton: { backgroundColor: '#6c757d', marginTop: 10 },
    errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
    sectionContainer: { marginTop: 30, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    anotacaoCard: {
        backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5, marginBottom: 10,
        borderWidth: 1, borderColor: '#eee',
    },
    anotacaoDate: { fontSize: 12, color: '#777', marginBottom: 5 },
    anotacaoDescricao: { fontWeight: 'bold', marginBottom: 5 }, 
    anotacaoActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
});

export default FichaPacienteScreen;