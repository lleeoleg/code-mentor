import { View, Text, StyleSheet } from 'react-native';

export default function MyLearningScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Моё обучение</Text>
      <Text style={styles.muted}>Здесь будут курсы, которые вы начали проходить.</Text>
      <Text style={styles.muted}>Пока вы не начали ни одного курса.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  muted: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 8 },
});
