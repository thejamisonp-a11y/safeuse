import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
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

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const resultData: ResultData = JSON.parse(params.data as string);
  const alreadyTaken = params.alreadyTaken === 'true';

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'checkmark-circle';
      case 'moderate':
        return 'alert-circle';
      case 'high':
      case 'avoid':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interaction Result</Text>
        </View>

        {/* Substances */}
        <View style={styles.substancesContainer}>
          <Text style={styles.substancesText}>
            {resultData.substances.join(' + ')}
          </Text>
        </View>

        {/* Risk Banner */}
        <View style={[styles.riskBanner, { backgroundColor: resultData.risk_color }]}>
          <Ionicons
            name={getRiskIcon(resultData.risk_level)}
            size={40}
            color="#FFFFFF"
          />
          <Text style={styles.riskLevel}>{resultData.risk_level.toUpperCase()}</Text>
          <Text style={styles.riskSubtext}>{alreadyTaken ? 'Already Taken' : 'Risk Level'}</Text>
        </View>

        {/* Explanation */}
        <View style={styles.card}>
          <Text style={styles.explanation}>{resultData.explanation}</Text>
        </View>

        {/* Why This Matters - Expandable */}
        <TouchableOpacity
          style={styles.expandableCard}
          onPress={() => toggleSection('why')}
        >
          <View style={styles.expandableHeader}>
            <Text style={styles.expandableTitle}>Why This Matters</Text>
            <Ionicons
              name={expandedSection === 'why' ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#6B7280"
            />
          </View>
          {expandedSection === 'why' && (
            <View style={styles.expandableContent}>
              <Text style={styles.expandableText}>
                The risk level is calculated based on documented pharmacological interactions between these substances.
                This information comes from harm reduction databases and medical literature.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Harm Reduction Advice */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>
              {alreadyTaken ? 'What To Do Now' : 'Harm Reduction Advice'}
            </Text>
          </View>
          <View style={styles.adviceList}>
            {resultData.harm_advice.map((advice, index) => (
              <View key={index} style={styles.adviceItem}>
                <View style={styles.adviceBullet} />
                <Text style={styles.adviceText}>{advice}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Symptoms (if applicable) */}
        {resultData.emergency_symptoms && resultData.emergency_symptoms.length > 0 && (
          <View style={styles.emergencyCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
              <Text style={styles.emergencyTitle}>When to Seek Help</Text>
            </View>
            <Text style={styles.emergencyIntro}>
              Contact emergency services if experiencing:
            </Text>
            <View style={styles.symptomsList}>
              {resultData.emergency_symptoms.map((symptom, index) => (
                <View key={index} style={styles.symptomItem}>
                  <Text style={styles.symptomName}>{symptom.name}</Text>
                  <Text style={styles.symptomDescription}>{symptom.description}</Text>
                  <Text style={styles.symptomAction}>{symptom.action}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/checker')}
          >
            <Text style={styles.secondaryButtonText}>Check Another Combination</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  substancesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  substancesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  riskBanner: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  riskLevel: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  riskSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  explanation: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  expandableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandableTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  expandableContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  expandableText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  adviceList: {
    gap: 12,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  adviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 8,
  },
  adviceText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#991B1B',
  },
  emergencyIntro: {
    fontSize: 15,
    color: '#991B1B',
    marginBottom: 12,
    fontWeight: '500',
  },
  symptomsList: {
    gap: 16,
  },
  symptomItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  symptomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 4,
  },
  symptomDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  symptomAction: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  bottomActions: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '600',
  },
});
