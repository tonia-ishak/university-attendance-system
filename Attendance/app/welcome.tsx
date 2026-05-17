import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const features = [
    {
      title: 'Face Recognition',
      subtitle: 'Fast & accurate',
      icon: <MaterialCommunityIcons name="face-recognition" size={28} color="#F59E0B" />,
    },
    {
      title: 'Secure Access',
      subtitle: 'Protected login',
      icon: <Ionicons name="shield-checkmark-outline" size={28} color="#F59E0B" />,
    },
    {
      title: 'Track Attendance',
      subtitle: 'Real-time records',
      icon: <Ionicons name="bar-chart-outline" size={28} color="#F59E0B" />,
    },
  ];

  return (
    <LinearGradient
      colors={['#FFF8E7', '#FFE7A8', '#FFD27A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8E7" />

      <View style={styles.bgCircleTopRight} />
      <View style={styles.bgCircleLeft} />
      <View style={styles.bgCircleBottom} />
      <View style={styles.bgCircleMid} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.smallTitle}>Welcome to</Text>
          <Text style={styles.mainTitle}>University Attendance System</Text>

          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />

            <View style={styles.phoneMockup}>
              <View style={styles.phoneHeader} />
              <View style={styles.faceBox}>
                <MaterialCommunityIcons name="face-recognition" size={50} color="#2C348C" />
              </View>
              <Text style={styles.phoneText}>AI Face Scan</Text>
              <Text style={styles.phoneSubText}>Identify students instantly</Text>
            </View>

            <View style={styles.floatingBadgeLeft}>
              <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.floatingBadgeRight}>
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.description}>
            Mark attendance quickly and securely using face recognition technology designed for instructors.
          </Text>

          <View style={styles.featuresRow}>
            {features.map((item, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.iconWrap}>{item.icon}</View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonShadow}
            onPress={() => router.push('/login')}
          >
            <LinearGradient
              colors={['#F97316', '#FBBF24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  smallTitle: {
    fontSize: 20,
    color: '#F97316',
    fontWeight: '600',
    marginTop: 18,
  },
  mainTitle: {
    fontSize: 30,
    color: '#2C348C',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 36,
  },
  heroCard: {
    width: '100%',
    marginTop: 14,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.35)',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  phoneMockup: {
    width: 200,
    borderRadius: 24,
    backgroundColor: '#FFFDF7',
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#C97A00',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  phoneHeader: {
    width: 70,
    height: 6,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    marginBottom: 22,
  },
  faceBox: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#FBBF24',
    borderRadius: 20,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7DA',
  },
  phoneText: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '800',
    color: '#2C348C',
  },
  phoneSubText: {
    marginTop: 6,
    fontSize: 14,
    color: '#7C6F64',
    textAlign: 'center',
  },
  floatingBadgeLeft: {
    position: 'absolute',
    left: 28,
    top: 38,
    backgroundColor: '#F59E0B',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBadgeRight: {
    position: 'absolute',
    right: 30,
    bottom: 42,
    backgroundColor: '#2C348C',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    marginTop: 14,
    fontSize: 14,
    color: '#5B5563',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  featuresRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    minHeight: 120,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFF6DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C348C',
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#7C6F64',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  buttonShadow: {
    width: '100%',
    marginTop: 18,
    borderRadius: 18,
    shadowColor: '#F97316',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bgCircleTopRight: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(251,191,36,0.28)',
    top: -40,
    right: -50,
  },
  bgCircleLeft: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(249,115,22,0.16)',
    left: -60,
    top: 260,
  },
  bgCircleBottom: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(245,158,11,0.20)',
    bottom: -60,
    left: -70,
  },
  bgCircleMid: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(251,191,36,0.18)',
    right: -40,
    bottom: 180,
  },
});
