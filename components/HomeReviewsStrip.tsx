import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HOME_REVIEWS } from '@/constants/homeScreenContent';

const CARD_W = 286;

export function HomeReviewsStrip() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.headRow}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Отзывы студентов</Text>
          <Ionicons name="people-outline" size={20} color="#3f8cff" style={styles.titleIcon} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.track}
        style={styles.trackScroll}
      >
        {HOME_REVIEWS.map((r) => (
          <View key={r.id} style={[styles.card, { width: CARD_W }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: r.color }]}>
                <Text style={styles.avatarText}>{r.initials}</Text>
              </View>
              <View style={styles.meta}>
                <Text style={styles.name} numberOfLines={2}>
                  {r.name}
                </Text>
                <Text style={styles.date}>{r.date}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.courseLink}
              onPress={() => router.push(`/course/${r.courseId}`)}
              activeOpacity={0.85}
            >
              <Ionicons name="play-circle-outline" size={16} color="#3f8cff" style={styles.playIcon} />
              <Text style={styles.courseLinkText} numberOfLines={2}>
                {r.course}
              </Text>
            </TouchableOpacity>

            <Text style={styles.body}>{r.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
    paddingBottom: 8,
  },
  headRow: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleIcon: { opacity: 0.85, marginTop: 2 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0d0d0d',
  },
  trackScroll: {},
  track: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
    minHeight: 48,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  meta: { flex: 1, minWidth: 0 },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  courseLink: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 10,
  },
  playIcon: { marginTop: 1 },
  courseLinkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#3f8cff',
    lineHeight: 18,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
});
