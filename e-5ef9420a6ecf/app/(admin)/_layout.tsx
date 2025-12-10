
import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="users" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="user/[id]" />
    </Stack>
  );
}
