import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AlreadyTakenScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={64} color="#10B981" />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Already Taken Something?</Text>
          <Text style={styles.description}>
            If you've already taken substances, focus on staying safe right now.
          </Text>

          {/* Immediate Actions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Immediate Steps:</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.bulletText}>Stay with someone you trust</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.bulletText}>Sip water regularly (don't overdo it)</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.bulletText}>Avoid taking more substances</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.bulletText}>Rest in a cool, comfortable place</Text>
              </View>
            </View>
          </View>

          {/* Warning Signs */}
          <View style={[styles.card, styles.warningCard]}>
            <Text style={styles.cardTitle}>Seek Help If You Experience:</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.bulletText}>Chest pain or difficulty breathing</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.bulletText}>Severe confusion or can't stay awake</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.bulletText}>Seizures or uncontrolled shaking</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.bulletText}>Extreme overheating</Text>
              </View>
            </View>
          </View>

          {/* Emergency Note */}
          <View style={styles.emergencyNote}>
            <Ionicons name="call" size={24} color="#EF4444" />
            <Text style={styles.emergencyText}>
              If symptoms are severe, call emergency services. Being honest about what was taken helps them provide better care.
            </Text>
          </View>

          {/* Check Interaction Button */}
          <TouchableOpacity
            style={styles.checkButton}
            onPress={() => router.push('/checker')}
          >
            <Text style={styles.checkButtonText}>Check Your Combination</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  content: {
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  bulletList: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  emergencyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  emergencyText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
    fontWeight: '500',
  },
  checkButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
