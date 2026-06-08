import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { HOME_PROGRAMS } from '@/constants/homeScreenContent';

export function HomeProgramSlider() {
  const router = useRouter();

  const openCatalog = (searchQuery: string) => {
    router.push({
      pathname: '/(tabs)/courses',
      params: { q: searchQuery },
    });
  };

  return (
    <View style={styles.section}>
      <View style={styles.headRow}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Программы курсов</Text>
          <Ionicons name="book-outline" size={20} color="#3f8cff" style={styles.titleIcon} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.track}
        style={styles.trackScroll}
      >
        {HOME_PROGRAMS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.card}
            onPress={() => openCatalog(p.searchQuery)}
            activeOpacity={0.88}
          >
            <View style={styles.iconWrap}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- имена из HOME_PROGRAMS */}
              <MaterialCommunityIcons name={p.mci as any} size={26} color={p.iconColor} />
            </View>
            <Text style={styles.cardLabel} numberOfLines={2}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sliderBar}>
        <View style={styles.sliderThumb} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    paddingTop: 28,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
  trackScroll: { marginBottom: 12 },
  track: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 200,
    maxWidth: 260,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 18,
  },
  sliderBar: {
    marginHorizontal: 16,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    position: 'relative',
    overflow: 'hidden',
  },
  sliderThumb: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '22%',
    backgroundColor: '#3f8cff',
    borderRadius: 999,
  },
});
