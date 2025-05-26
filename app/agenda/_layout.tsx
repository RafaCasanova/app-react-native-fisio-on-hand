import { Stack } from 'expo-router';
import React from 'react';

export default function AgendaLayout() {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Agenda' }} />
      </Stack>
    );
  }