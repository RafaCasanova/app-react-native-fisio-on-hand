import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';

const AgendaScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda</Text>
      <Text>Conteúdo da Agenda aqui...</Text>
      <Button title="Voltar" onPress={() => router.back()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default AgendaScreen;