import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile } from '@/utils/profileStore';
import { Image } from 'expo-image';

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

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>> | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (user?.username) getProfile(user.username).then(setProfile);
    }, [user?.username])
  );

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const initials = getInitials(profile, user?.username);
  const displayName = getDisplayName(profile, user?.username);

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: '#e5e7eb' },
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
});
