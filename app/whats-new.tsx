import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { news } from '@/lib/api';

const MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = MONTHS_RU[d.getMonth()];
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} г. в ${h}:${m}`;
}

type NewsItem = { id: number; published_at: string; content: string };

export default function WhatsNewScreen() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    news
      .list()
      .then(setItems)
      .catch(() => setError('Не удалось загрузить новости.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.loader} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (items.length === 0) return <Text style={styles.muted}>Пока нет новостей.</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Новости CodeMentor</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.date}>{formatDate(item.published_at)}</Text>
          <Text style={styles.content}>{item.content.replace(/<[^>]+>/g, '')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, marginTop: 48 },
  error: { color: '#dc2626', padding: 24 },
  muted: { padding: 24, color: '#6b7280' },
  title: { fontSize: 20, fontWeight: '700', padding: 20, paddingBottom: 12 },
  item: { padding: 20, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  date: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  content: { fontSize: 16, lineHeight: 24 },
});
