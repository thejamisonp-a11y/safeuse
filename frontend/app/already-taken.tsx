import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AlreadyTakenScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#E1E8ED" />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBg}>
            <Ionicons name="shield-checkmark" size={48} color="#10B981" />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>You're Not Alone</Text>
          <Text style={styles.description}>
            Focus on staying safe right now. Here's what you can do.
          </Text>

          {/* Immediate Actions */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.cardTitle}>Do This Now</Text>
            </View>
            <View style={styles.bulletList}>
              {[
                'Stay with someone you trust',
                'Sip water regularly — don\'t overdo it',
                'Do not take more substances',
                'Rest in a cool, comfortable place',
                'Monitor your breathing and heart rate',
              ].map((text, i) => (
                <View key={i} style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Warning Signs */}
          <View style={styles.warningCard}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={[styles.cardTitle, { color: '#EF4444' }]}>Seek Help Immediately If:</Text>
            </View>
            <View style={styles.bulletList}>
              {[
                { text: 'Chest pain or difficulty breathing', icon: 'heart-dislike' },
                { text: 'Severe confusion or can\'t stay awake', icon: 'cloudy-night' },
                { text: 'Seizures or uncontrolled shaking', icon: 'flash' },
                { text: 'Extreme overheating or high temperature', icon: 'thermometer' },
                { text: 'Blue lips, fingertips, or skin', icon: 'water' },
              ].map((item, i) => (
                <View key={i} style={styles.warningItem}>
                  <Ionicons name={item.icon as any} size={18} color="#EF4444" />
                  <Text style={styles.warningText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Emergency Note */}
          <View style={styles.emergencyNote}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="call" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.emergencyTextContainer}>
              <Text style={styles.emergencyTitle}>Call Emergency Services</Text>
              <Text style={styles.emergencyText}>
                Being honest about what you took helps them provide better care. You won't get in trouble.
              </Text>
            </View>
          </View>

          {/* Check Interaction Button */}
          <TouchableOpacity
            style={styles.checkButton}
            onPress={() => router.push({ pathname: '/checker', params: { alreadyTaken: 'true' } })}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
            <Text style={styles.checkButtonText}>Check Your Combination</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
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
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#1A2332',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  content: {
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#E1E8ED',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#8899A6',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#1A2332',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#253341',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E1E8ED',
  },
  bulletList: {
    gap: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#AAB8C2',
    lineHeight: 22,
  },
  warningCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 15,
    color: '#AAB8C2',
    lineHeight: 22,
  },
  emergencyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 13,
    color: '#AAB8C2',
    lineHeight: 19,
  },
  checkButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    minHeight: 54,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  homeButton: {
    backgroundColor: '#253341',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#8899A6',
    fontSize: 16,
    fontWeight: '600',
  },
});
