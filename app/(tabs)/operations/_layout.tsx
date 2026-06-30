import { Stack } from "expo-router";

export default function OperationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="equipment/index" />
      <Stack.Screen name="equipment/[tagCode]" />
    </Stack>
  );
}
