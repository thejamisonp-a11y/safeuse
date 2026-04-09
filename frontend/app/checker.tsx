import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Switch,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Substance {
  id: string;
  name: string;
  drug_class: string;
  common_names: string[];
}

interface Category {
  category: string;
  substances: Substance[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Stimulants': '#EF4444',
  'Empathogens': '#EC4899',
  'Depressants': '#6366F1',
  'Psychedelics': '#8B5CF6',
  'Dissociatives': '#06B6D4',
  'Cannabinoids': '#22C55E',
  'Antidepressants': '#3B82F6',
  'Opioid-like': '#F97316',
  'Gabapentinoids': '#14B8A6',
  'Other': '#6B7280',
};

const CATEGORY_ICONS: { [key: string]: string } = {
  'Stimulants': 'flash',
  'Empathogens': 'heart',
  'Depressants': 'moon',
  'Psychedelics': 'eye',
  'Dissociatives': 'prism',
  'Cannabinoids': 'leaf',
  'Antidepressants': 'medical',
  'Opioid-like': 'bandage',
  'Gabapentinoids': 'pulse',
  'Other': 'ellipsis-horizontal',
};

export default function CheckerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [alreadyTaken, setAlreadyTaken] = useState(params.alreadyTaken === 'true');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubstances();
  }, []);

  const loadSubstances = async () => {
    try {
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/substance-categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load substances:', err);
      setError('Unable to load substances. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map(cat => ({
        ...cat,
        substances: cat.substances.filter(
          s =>
            s.name.toLowerCase().includes(q) ||
            s.drug_class.toLowerCase().includes(q) ||
            s.common_names.some(cn => cn.toLowerCase().includes(q))
        ),
      }))
      .filter(cat => cat.substances.length > 0);
  }, [categories, searchQuery]);

  const selectedSubstances = useMemo(() => {
    const allSubstances = categories.flatMap(c => c.substances);
    return selectedIds.map(id => allSubstances.find(s => s.id === id)).filter(Boolean) as Substance[];
  }, [selectedIds, categories]);

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
    if (selectedIds.length < 2) return;
    setChecking(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/check`, {
        substance_ids: selectedIds,
        already_taken: alreadyTaken,
      });
      router.push({
        pathname: '/result',
        params: {
          data: JSON.stringify(response.data),
          alreadyTaken: alreadyTaken.toString(),
        },
      });
    } catch (err) {
      console.error('Failed to check interaction:', err);
      setError('Unable to check interaction. Please try again.');
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

  if (error && categories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud-offline" size={48} color="#556677" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSubstances}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#E1E8ED" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Substances</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#556677" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search substances..."
            placeholderTextColor="#556677"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#556677" />
            </TouchableOpacity>
          )}
        </View>

        {/* Selected Chips */}
        {selectedSubstances.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContainer}
          >
            {selectedSubstances.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.chip}
                onPress={() => toggleSubstance(s.id)}
              >
                <Text style={styles.chipText}>{s.name}</Text>
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Counter & Toggle Row */}
        <View style={styles.controlsRow}>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {selectedIds.length} of 3 selected
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.takenToggle, alreadyTaken && styles.takenToggleActive]}
            onPress={() => setAlreadyTaken(!alreadyTaken)}
          >
            <Ionicons
              name={alreadyTaken ? 'alert-circle' : 'alert-circle-outline'}
              size={16}
              color={alreadyTaken ? '#F59E0B' : '#556677'}
            />
            <Text style={[styles.takenToggleText, alreadyTaken && styles.takenToggleTextActive]}>
              Already taken
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Substance List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.inlineError}>
            <Text style={styles.inlineErrorText}>{error}</Text>
          </View>
        )}

        {filteredCategories.map((category) => (
          <View key={category.category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[category.category] || '#6B7280' }]} />
              <Text style={styles.categoryTitle}>{category.category}</Text>
              <Text style={styles.categoryCount}>{category.substances.length}</Text>
            </View>
            {category.substances.map((substance) => {
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
                  activeOpacity={0.7}
                >
                  <View style={styles.substanceContent}>
                    <View style={styles.substanceInfo}>
                      <Text
                        style={[
                          styles.substanceName,
                          isSelected && styles.substanceNameSelected,
                        ]}
                      >
                        {substance.name}
                      </Text>
                      {substance.common_names.length > 0 && (
                        <Text style={styles.substanceCommon} numberOfLines={1}>
                          {substance.common_names.join(' · ')}
                        </Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {filteredCategories.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={40} color="#3D5466" />
            <Text style={styles.emptyText}>No substances match "{searchQuery}"</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Check Button */}
      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={[
            styles.checkButton,
            selectedIds.length < 2 && styles.checkButtonDisabled,
          ]}
          onPress={handleCheck}
          disabled={selectedIds.length < 2 || checking}
          activeOpacity={0.8}
        >
          {checking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
              <Text style={styles.checkButtonText}>
                {selectedIds.length < 2
                  ? `Select ${2 - selectedIds.length} more`
                  : 'Check Interaction'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: '#8899A6',
  },
  errorText: {
    fontSize: 15,
    color: '#8899A6',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: '#0F1419',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2332',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#1A2332',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E1E8ED',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2332',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#253341',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#E1E8ED',
    paddingVertical: 0,
  },
  chipsScroll: {
    marginBottom: 10,
  },
  chipsContainer: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterContainer: {},
  counterText: {
    fontSize: 13,
    color: '#8899A6',
    fontWeight: '500',
  },
  takenToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A2332',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#253341',
  },
  takenToggleActive: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  takenToggleText: {
    fontSize: 13,
    color: '#556677',
    fontWeight: '500',
  },
  takenToggleTextActive: {
    color: '#F59E0B',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  inlineError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  inlineErrorText: {
    color: '#EF4444',
    fontSize: 13,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8899A6',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    color: '#556677',
    backgroundColor: '#1A2332',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  substanceCard: {
    backgroundColor: '#1A2332',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#253341',
    marginBottom: 8,
  },
  substanceCardSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  substanceCardDisabled: {
    opacity: 0.35,
  },
  substanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  substanceInfo: {
    flex: 1,
    marginRight: 12,
  },
  substanceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E1E8ED',
    marginBottom: 2,
  },
  substanceNameSelected: {
    color: '#10B981',
  },
  substanceCommon: {
    fontSize: 12,
    color: '#556677',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#3D5466',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#556677',
  },
  stickyBottom: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: '#0F1419',
    borderTopWidth: 1,
    borderTopColor: '#1A2332',
  },
  checkButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    minHeight: 54,
  },
  checkButtonDisabled: {
    backgroundColor: '#253341',
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
