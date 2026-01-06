import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Substance {
  id: string;
  name: string;
  drug_class: string;
  common_names: string[];
}

export default function CheckerScreen() {
  const router = useRouter();
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadSubstances();
  }, []);

  const loadSubstances = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/substances`);
      setSubstances(response.data);
    } catch (error) {
      console.error('Failed to load substances:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubstance = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleCheck = async () => {
    if (selectedIds.length < 2) {
      return;
    }

    setChecking(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/check`, {
        substance_ids: selectedIds,
        already_taken: alreadyTaken,
      });

      // Navigate to results with the data
      router.push({
        pathname: '/result',
        params: {
          data: JSON.stringify(response.data),
          alreadyTaken: alreadyTaken.toString(),
        },
      });
    } catch (error) {
      console.error('Failed to check interaction:', error);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading substances...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Substances</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsText}>
            Select 2-3 substances to check their interaction risk.
          </Text>
          <Text style={styles.selectedCount}>
            {selectedIds.length} of 3 selected
          </Text>
        </View>

        {/* Already Taken Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleContent}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Already taken?</Text>
              <Text style={styles.toggleSubtitle}>
                This changes the advice to focus on monitoring and immediate harm reduction
              </Text>
            </View>
            <Switch
              value={alreadyTaken}
              onValueChange={setAlreadyTaken}
              trackColor={{ false: '#D1D5DB', true: '#6EE7B7' }}
              thumbColor={alreadyTaken ? '#10B981' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Substance List */}
        <View style={styles.substanceList}>
          {substances.map((substance) => {
            const isSelected = selectedIds.includes(substance.id);
            const isDisabled = !isSelected && selectedIds.length >= 3;

            return (
              <TouchableOpacity
                key={substance.id}
                style={[
                  styles.substanceCard,
                  isSelected && styles.substanceCardSelected,
                  isDisabled && styles.substanceCardDisabled,
                ]}
                onPress={() => toggleSubstance(substance.id)}
                disabled={isDisabled}
              >
                <View style={styles.substanceContent}>
                  <View style={styles.substanceInfo}>
                    <Text style={[
                      styles.substanceName,
                      isSelected && styles.substanceNameSelected,
                    ]}>
                      {substance.name}
                    </Text>
                    <Text style={styles.substanceClass}>{substance.drug_class}</Text>
                    {substance.common_names.length > 0 && (
                      <Text style={styles.substanceCommon}>
                        {substance.common_names.join(', ')}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Check Button */}
        <TouchableOpacity
          style={[
            styles.checkButton,
            selectedIds.length < 2 && styles.checkButtonDisabled,
          ]}
          onPress={handleCheck}
          disabled={selectedIds.length < 2 || checking}
        >
          {checking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.checkButtonText}>Check Interaction</Text>
            </>
          )}
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  instructionsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 15,
    color: '#1E40AF',
    marginBottom: 8,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  toggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  substanceList: {
    gap: 12,
    marginBottom: 24,
  },
  substanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  substanceCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  substanceCardDisabled: {
    opacity: 0.5,
  },
  substanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  substanceInfo: {
    flex: 1,
  },
  substanceName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  substanceNameSelected: {
    color: '#059669',
  },
  substanceClass: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  substanceCommon: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    minHeight: 56,
  },
  checkButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
