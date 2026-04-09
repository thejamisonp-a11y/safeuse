import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LoadingScreen from '../components/LoadingScreen';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_harmreduce-app/artifacts/d5b11qlb_602a290a-24ce-4243-a5d2-b6e192ad40f9.png';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: LOGO_URL }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>Drug Interaction Checker</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconRow}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.infoTitle}>Harm reduction, not encouragement</Text>
          </View>
          <Text style={styles.infoText}>
            Non-judgmental, evidence-based information about drug interactions. Your privacy is protected — no accounts, no tracking.
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/checker')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonIconBg}>
              <Ionicons name="search" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.primaryButtonText}>Check a Combination</Text>
              <Text style={styles.buttonSubtext}>Select 2-3 substances to check risk</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.urgentButton}
            onPress={() => router.push('/already-taken')}
            activeOpacity={0.8}
          >
            <View style={[styles.buttonIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="alert-circle" size={22} color="#F59E0B" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.urgentButtonText}>Already Taken Something?</Text>
              <Text style={styles.urgentButtonSubtext}>Get immediate safety guidance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(245, 158, 11, 0.6)" />
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="analytics" size={18} color="#10B981" />
            </View>
            <Text style={styles.featureText}>Evidence-based risk levels</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <Ionicons name="bulb" size={18} color="#6366F1" />
            </View>
            <Text style={styles.featureText}>AI-powered explanations</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="medkit" size={18} color="#EF4444" />
            </View>
            <Text style={styles.featureText}>Emergency symptom guidance</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="lock-closed" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.featureText}>100% private — no data stored</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color="#556677" />
          <Text style={styles.disclaimerText}>
            This is not medical advice. In an emergency, always call local emergency services.
          </Text>
        </View>

        {/* Data source */}
        <View style={styles.dataSource}>
          <Text style={styles.dataSourceText}>Data sourced from TripSit.me</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: '#1A2332',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
      default: {
        boxShadow: '0 0 16px rgba(16, 185, 129, 0.15)',
      },
    }),
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  subtitle: {
    fontSize: 15,
    color: '#8899A6',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#1A2332',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#253341',
  },
  infoIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E1E8ED',
  },
  infoText: {
    fontSize: 14,
    color: '#8899A6',
    lineHeight: 21,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 14,
    minHeight: 72,
  },
  buttonIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextContainer: {
    flex: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  urgentButton: {
    backgroundColor: '#1A2332',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 14,
    minHeight: 72,
  },
  urgentButtonText: {
    color: '#F59E0B',
    fontSize: 17,
    fontWeight: '700',
  },
  urgentButtonSubtext: {
    color: '#8899A6',
    fontSize: 13,
    marginTop: 2,
  },
  featuresContainer: {
    backgroundColor: '#1A2332',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#253341',
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#AAB8C2',
    flex: 1,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#556677',
    lineHeight: 17,
  },
  dataSource: {
    alignItems: 'center',
  },
  dataSourceText: {
    fontSize: 11,
    color: '#3D5466',
    letterSpacing: 0.3,
  },
});
