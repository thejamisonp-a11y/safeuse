import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ResultData {
  risk_level: string;
  risk_color: string;
  explanation: string;
  harm_advice: string[];
  emergency_symptoms: Array<{
    name: string;
    description: string;
    action: string;
  }> | null;
  substances: string[];
}

const RISK_CONFIG: { [key: string]: { icon: string; bg: string; border: string; text: string; label: string } } = {
  low: {
    icon: 'checkmark-circle',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#10B981',
    label: 'LOW RISK',
  },
  moderate: {
    icon: 'alert-circle',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#F59E0B',
    label: 'MODERATE RISK',
  },
  high: {
    icon: 'warning',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
    text: '#EF4444',
    label: 'HIGH RISK',
  },
  avoid: {
    icon: 'skull',
    bg: 'rgba(220, 38, 38, 0.15)',
    border: 'rgba(220, 38, 38, 0.4)',
    text: '#DC2626',
    label: 'AVOID',
  },
  unknown: {
    icon: 'help-circle',
    bg: 'rgba(107, 114, 128, 0.12)',
    border: 'rgba(107, 114, 128, 0.3)',
    text: '#6B7280',
    label: 'UNKNOWN',
  },
};

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  let resultData: ResultData;
  try {
    resultData = JSON.parse(params.data as string);
  } catch {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Unable to load results</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const alreadyTaken = params.alreadyTaken === 'true';
  const riskLevel = resultData.risk_level.toLowerCase();
  const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.unknown;

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#E1E8ED" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Substance Combination */}
        <View style={styles.substancesRow}>
          {resultData.substances.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <View style={styles.plusBadge}>
                  <Text style={styles.plusText}>+</Text>
                </View>
              )}
              <View style={styles.substancePill}>
                <Text style={styles.substancePillText}>{s}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Risk Banner */}
        <View style={[styles.riskBanner, { backgroundColor: config.bg, borderColor: config.border }]}>
          <Ionicons name={config.icon as any} size={44} color={config.text} />
          <Text style={[styles.riskLevel, { color: config.text }]}>{config.label}</Text>
          {alreadyTaken && (
            <View style={styles.alreadyTakenBadge}>
              <Ionicons name="alert-circle" size={14} color="#F59E0B" />
              <Text style={styles.alreadyTakenText}>Already Taken Mode</Text>
            </View>
          )}
        </View>

        {/* AI Explanation */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb" size={20} color="#6366F1" />
            <Text style={styles.cardTitle}>What does this mean?</Text>
          </View>
          <Text style={styles.explanation}>{resultData.explanation}</Text>
        </View>

        {/* Harm Reduction Advice */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => toggleSection('advice')}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.cardTitle}>
              {alreadyTaken ? 'What To Do Now' : 'Harm Reduction Advice'}
            </Text>
            <Ionicons
              name={expandedSections.has('advice') ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#556677"
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
          {!expandedSections.has('advice') && (
            <View style={styles.adviceList}>
              {resultData.harm_advice.map((advice, index) => (
                <View key={index} style={styles.adviceItem}>
                  <View style={styles.adviceDot} />
                  <Text style={styles.adviceText}>{advice}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Why This Matters */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleSection('why')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Why This Matters</Text>
            <Ionicons
              name={expandedSections.has('why') ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#556677"
              style={{ marginLeft: 'auto' }}
            />
          </View>
          {expandedSections.has('why') && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedText}>
                Risk levels are calculated from documented pharmacological interactions between these substances.
                Data sourced from TripSit.me and peer-reviewed medical literature. The AI explanation above provides context but does not determine the risk level.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Emergency Symptoms */}
        {resultData.emergency_symptoms && resultData.emergency_symptoms.length > 0 && (
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="alert-circle" size={22} color="#EF4444" />
              <Text style={styles.emergencyTitle}>When to Seek Help</Text>
            </View>
            <Text style={styles.emergencyIntro}>
              Call emergency services if you experience:
            </Text>
            {resultData.emergency_symptoms.map((symptom, index) => (
              <View key={index} style={styles.symptomItem}>
                <View style={styles.symptomHeader}>
                  <Ionicons name="warning" size={16} color="#EF4444" />
                  <Text style={styles.symptomName}>{symptom.name}</Text>
                </View>
                <Text style={styles.symptomDescription}>{symptom.description}</Text>
                <View style={styles.symptomActionRow}>
                  <Ionicons name="arrow-forward" size={14} color="#F59E0B" />
                  <Text style={styles.symptomAction}>{symptom.action}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Emergency Contact Reminder */}
        {(riskLevel === 'high' || riskLevel === 'avoid') && (
          <View style={styles.emergencyReminder}>
            <Ionicons name="call" size={20} color="#EF4444" />
            <Text style={styles.emergencyReminderText}>
              Being honest about what you've taken helps medical professionals provide better care.
            </Text>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.checkAnotherButton}
            onPress={() => router.push('/checker')}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color="#10B981" />
            <Text style={styles.checkAnotherText}>Check Another Combination</Text>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#8899A6',
  },
  errorButton: {
    backgroundColor: '#1A2332',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  errorButtonText: {
    color: '#E1E8ED',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#1A2332',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E1E8ED',
  },
  substancesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  substancePill: {
    backgroundColor: '#1A2332',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#253341',
  },
  substancePillText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E1E8ED',
  },
  plusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#253341',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8899A6',
  },
  riskBanner: {
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
  },
  riskLevel: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: 1,
  },
  alreadyTakenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  alreadyTakenText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1A2332',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#253341',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E1E8ED',
    flex: 1,
  },
  explanation: {
    fontSize: 15,
    color: '#AAB8C2',
    lineHeight: 23,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#253341',
  },
  expandedText: {
    fontSize: 14,
    color: '#8899A6',
    lineHeight: 21,
  },
  adviceList: {
    gap: 10,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  adviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 7,
  },
  adviceText: {
    flex: 1,
    fontSize: 14,
    color: '#AAB8C2',
    lineHeight: 21,
  },
  emergencyCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EF4444',
  },
  emergencyIntro: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 14,
    fontWeight: '500',
  },
  symptomItem: {
    backgroundColor: 'rgba(15, 20, 25, 0.5)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  symptomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  symptomName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  symptomDescription: {
    fontSize: 13,
    color: '#8899A6',
    marginBottom: 8,
    marginLeft: 24,
  },
  symptomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 24,
  },
  symptomAction: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
  },
  emergencyReminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  emergencyReminderText: {
    flex: 1,
    fontSize: 13,
    color: '#AAB8C2',
    lineHeight: 19,
  },
  bottomActions: {
    gap: 10,
    marginTop: 12,
  },
  checkAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A2332',
    borderWidth: 1.5,
    borderColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 52,
  },
  checkAnotherText: {
    color: '#10B981',
    fontSize: 16,
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
