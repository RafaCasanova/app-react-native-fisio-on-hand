import { Stack } from 'expo-router';
import React from 'react';


export default function PacientesLayout() {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Pacientes' }} />
        <Stack.Screen name="cadastrar" options={{ title: 'Cadastrar Paciente' }} />
      </Stack>
    );
  }