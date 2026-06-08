import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile } from '@/utils/profileStore';
import { certificates } from '@/lib/api';
import { Image } from 'expo-image';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function getInitials(profile: { firstName?: string; lastName?: string } | null, username: string | undefined): string {
  if (profile?.firstName && profile?.lastName) {
    return (profile.firstName[0] + profile.lastName[0]).toUpperCase().slice(0, 2);
  }
  if (profile?.firstName) return profile.firstName.slice(0, 2).toUpperCase();
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

function getDisplayName(profile: { firstName?: string; lastName?: string } | null, username: string | undefined): string {
  if (profile?.firstName || profile?.lastName) {
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  }
  return username ?? 'Гость';
}

type CertRow = {
  id: number;
  certificate_number: string;
  issued_at: string;
  course_id: number;
  course_title: string;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>> | null>(null);
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [dlCourseId, setDlCourseId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (user?.username) getProfile(user.username).then(setProfile);
      if (user) {
        setCertsLoading(true);
        certificates
          .list()
          .then((data) => setCerts(Array.isArray(data) ? data : []))
          .catch(() => setCerts([]))
          .finally(() => setCertsLoading(false));
      } else {
        setCerts([]);
      }
    }, [user])
  );

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const downloadCert = async (courseId: number) => {
    setDlCourseId(courseId);
    try {
      const buf = await certificates.downloadPdf(courseId);
      const base64 = arrayBufferToBase64(buf as ArrayBuffer);
      const path = `${FileSystem.cacheDirectory}certificate_course_${courseId}.pdf`;
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) await Sharing.shareAsync(path);
      else Alert.alert('Файл сохранён', path);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message || 'Не удалось скачать сертификат');
    } finally {
      setDlCourseId(null);
    }
  };

  const initials = getInitials(profile, user?.username);
  const displayName = getDisplayName(profile, user?.username);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <Text style={styles.name}>{displayName}</Text>

        <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/settings')}>
          <Text style={styles.menuBtnText}>Настройки</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/whats-new')}>
          <Text style={styles.menuBtnText}>Что нового</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuBtn, styles.logoutBtn]} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Сертификаты</Text>
      {certsLoading ? (
        <ActivityIndicator style={{ marginVertical: 12 }} />
      ) : certs.length === 0 ? (
        <Text style={styles.muted}>Сертификатов пока нет — пройдите итоговый тест курса.</Text>
      ) : (
        certs.map((c) => (
          <View key={c.id} style={styles.certCard}>
            <View style={styles.certInfo}>
              <Text style={styles.certCourse} numberOfLines={2}>{c.course_title}</Text>
              <Text style={styles.certMeta}>№ {c.certificate_number} • {c.issued_at}</Text>
            </View>
            <TouchableOpacity
              style={styles.certDl}
              onPress={() => downloadCert(c.course_id)}
              disabled={dlCourseId === c.course_id}
            >
              <Text style={styles.certDlText}>{dlCourseId === c.course_id ? '…' : 'PDF'}</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 24, paddingBottom: 48 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  menuBtn: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  menuBtnText: { fontSize: 16 },
  logoutBtn: { borderBottomWidth: 0, marginTop: 8 },
  logoutBtnText: { color: '#dc2626', fontSize: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, color: '#111' },
  muted: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3f8cff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  certInfo: { flex: 1, minWidth: 0 },
  certCourse: { fontSize: 15, fontWeight: '600', color: '#111' },
  certMeta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  certDl: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#16a34a',
    borderRadius: 8,
  },
  certDlText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
