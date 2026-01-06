# SAFEUSE - Feature Roadmap & Implementation Guide

This document outlines the implementation strategy for five major feature enhancements to SAFEUSE, based on research of authoritative harm reduction resources and technical best practices.

---

## 1. 📊 Dosage Guidance System

### Research Summary
**Data Sources**:
- **PsychonautWiki**: Comprehensive dosage charts with threshold/common/strong/heavy classifications
- **DanceSafe/Erowid**: Evidence-based dosing recommendations
- **Clinical Research**: MAPS, Johns Hopkins studies (psilocybin 5-40mg, MDMA 100-125mg therapeutic doses)

**Key Findings**:
- MDMA recreational: 80-125mg average, but street tablets vary wildly (50-350mg)
- LSD: 15-50µg common, 50-100µg strong, 100µg+ heavy
- Psilocybin: 5-20mg (0.5-2.5g dried mushrooms) common, 20-30mg strong
- Ketamine: 30-75mg insufflated common, 75-150mg strong

### Implementation Strategy

#### Database Schema Addition
```python
# Add to MongoDB collections
dosages = {
    "substance_id": "mdma",
    "route": "oral",  # oral, insufflated, injected, sublingual
    "unit": "mg",
    "threshold": {"min": 50, "max": 75},
    "light": {"min": 75, "max": 100},
    "common": {"min": 100, "max": 125},
    "strong": {"min": 125, "max": 175},
    "heavy": {"min": 175, "max": null},  # null = open-ended
    "duration": {
        "onset": "20-60 minutes",
        "peak": "1.5-2.5 hours",
        "offset": "2-4 hours",
        "total": "4-8 hours"
    },
    "harm_notes": [
        "Start with threshold dose if first time",
        "Wait 2+ hours before redosing",
        "Street tablets vary 50-350mg - test your substance",
        "Stay hydrated: ~250ml water per hour"
    ],
    "body_weight_adjusted": true,
    "purity_assumption": "Pure substance - street purity often 40-80%"
}
```

#### UI Components
**New Screen**: `app/dosage-info.tsx`
- Substance selector (linked to checker screen)
- Route of administration selector
- Dosage range visualization (color-coded bar chart)
- Duration timeline graphic
- Body weight adjustment calculator (optional)
- Purity disclaimer banner

**Warning Modals**:
- "This is for educational purposes only"
- "Street purity varies significantly"
- "Individual reactions differ"
- "Always test your substances"

#### Safety Considerations
⚠️ **Critical Design Principles**:
1. Always show ranges, never single "recommended" doses
2. Emphasize "START LOW" prominently
3. Include purity disclaimers (street drugs rarely pure)
4. Link to substance testing resources
5. Note contraindications (medical conditions, medications)
6. Explain body weight adjustments without calculating exact doses
7. Never provide dosing for inherently dangerous combinations

#### Data Sources to Integrate
- PsychonautWiki API (if available) or manual scraping with attribution
- DanceSafe dosing guides
- Erowid experience vaults (for ranges validation)
- Clinical trial protocols (psilocybin, MDMA therapy)

#### Estimated Effort
- **Backend**: 2-3 days (schema, API endpoints, data seeding)
- **Frontend**: 3-4 days (UI components, visualizations, responsive design)
- **Data Collection**: 5-7 days (researching/validating 33 substances across routes)
- **Testing**: 2 days
- **Total**: ~2 weeks

---

## 2. 💊 Prescription Medication Interactions

### Research Summary
**Available APIs**:
- **DDInter 2.0**: 2,310 drugs, 302,516 interactions, CYP450 mechanisms
- **DrugBank DDI API**: Programmatic endpoint (commercial license required)
- **FDB MedKnowledge**: Clinical-grade screening for healthcare IT integration
- **NIH DailyMed**: Free, comprehensive drug labels/interactions

**Critical Interactions to Prioritize**:
- SSRIs + recreational drugs (reduced psychedelic effects, MDMA serotonin syndrome)
- MAOIs + tyramine-containing drugs/foods (hypertensive crisis)
- Benzodiazepines + CNS depressants (respiratory depression)
- Stimulants + cardiac medications (arrhythmias)
- Opioids + sedatives (fatal overdose risk)

### Implementation Strategy

#### API Integration Options

**Option 1: DrugBank API (Recommended)**
- **Cost**: Commercial license (~$500-2000/year depending on volume)
- **Coverage**: 14,000+ drugs, comprehensive DDI database
- **Endpoint**: `POST https://api.drugbank.com/v1/ddi`
- **Authentication**: API key-based

```python
# Backend implementation
async def check_medication_interaction(drug_names: List[str]):
    """Check prescription drug interactions via DrugBank"""
    headers = {"Authorization": f"Bearer {DRUGBANK_API_KEY}"}
    payload = {"drugs": drug_names}
    response = await httpx.post(
        "https://api.drugbank.com/v1/ddi",
        headers=headers,
        json=payload
    )
    return response.json()
```

**Option 2: DDInter 2.0 (Open Access)**
- **Cost**: Free (academic resource)
- **Coverage**: 302,516 interactions with mechanisms
- **Implementation**: Download database, self-host lookup
- **Update Frequency**: Manual updates required

**Option 3: NIH DailyMed (Free)**
- **Cost**: Free
- **Coverage**: FDA-approved drug labels
- **Limitation**: No programmatic DDI API, requires parsing

#### Database Expansion
```python
# Add new collection
medications = {
    "id": "fluoxetine",
    "name": "Fluoxetine",
    "brand_names": ["Prozac", "Sarafem"],
    "drug_class": "SSRI",
    "interacts_with_substances": [
        {
            "substance_id": "mdma",
            "risk_level": "high",
            "mechanism": "Reduces MDMA subjective effects, increases neurotoxicity risk",
            "notes": "SSRIs block serotonin reuptake, diminishing MDMA's empathogenic effects while maintaining risks"
        },
        {
            "substance_id": "lsd",
            "risk_level": "moderate",
            "mechanism": "Significantly dampens psychedelic effects",
            "notes": "SSRIs reduce LSD intensity by 30-70% depending on dose and duration"
        }
    ]
}
```

#### UI Updates
**Checker Screen Enhancement**:
- Add "Medications" section below substance selector
- Searchable medication database (common names + brands)
- Visual distinction (different icon/color from recreational substances)
- Warning banner: "Only showing recreational + medication interactions"

**Result Screen Addition**:
- Separate section for medication interactions
- Clearer language for medical context
- "Consult your prescriber" messaging
- Links to pharmacist consultation resources

#### Ethical & Legal Considerations
⚠️ **Important Constraints**:
1. This is NOT medical advice - prominent disclaimers required
2. Cannot replace pharmacist/doctor consultation
3. Must reference authoritative sources (FDA, medical literature)
4. Consider liability implications - consult legal counsel
5. Different tone required: "Discuss with your healthcare provider" vs harm reduction voice

#### Estimated Effort
- **API Research & Licensing**: 1-2 weeks (includes negotiations)
- **Backend Integration**: 1 week (API wrapper, error handling)
- **Database Schema**: 3-4 days (medications collection, linking)
- **Data Population**: 2-3 weeks (common prescriptions, interactions validation)
- **Frontend**: 1 week (search UI, medication display, warnings)
- **Legal Review**: 1-2 weeks (disclaimers, risk mitigation)
- **Testing**: 1 week
- **Total**: ~6-8 weeks

---

## 3. 🌍 Multilingual Support (i18n)

### Research Summary
**Technical Approach**:
- **expo-localization**: Device locale detection
- **i18next + react-i18next**: Industry-standard translation framework
- **react-native-localize**: Alternative for bare workflow

**Best Practices**:
- Semantic translation keys (e.g., `checker.selectSubstances` not `page2.text1`)
- Type-safe translations (TypeScript interfaces)
- RTL support for Arabic, Hebrew, Farsi
- Cultural adaptations beyond literal translation
- TMS integration (Lokalise, Crowdin) for scalability

### Implementation Strategy

#### Priority Languages (Phase 1)
1. **English** (en) - Default
2. **Spanish** (es) - 2nd most common in harm reduction contexts
3. **Portuguese** (pt-BR) - Brazil has significant user base
4. **French** (fr) - Europe, Canada, Africa
5. **German** (de) - Strong harm reduction culture

#### Priority Languages (Phase 2)
6. **Dutch** (nl) - Netherlands harm reduction leadership
7. **Polish** (pl) - Growing Eastern European presence
8. **Russian** (ru) - Wide reach
9. **Chinese Simplified** (zh-CN) - Massive potential user base
10. **Arabic** (ar) - RTL language, Middle East/North Africa

#### Technical Implementation

**1. Install Dependencies**
```bash
cd /app/frontend
yarn add i18next react-i18next expo-localization
```

**2. Translation File Structure**
```
/app/frontend/translations/
├── en.json
├── es.json
├── pt-BR.json
├── fr.json
├── de.json
└── index.ts
```

**3. Translation Keys Structure**
```json
// en.json
{
  "common": {
    "appName": "SAFEUSE",
    "tagline": "If you're going to use, use safely",
    "loading": "Loading...",
    "error": "Error",
    "back": "Back"
  },
  "home": {
    "checkCombination": "Check a Combination",
    "alreadyTaken": "Already Taken Something?",
    "infoTitle": "If you're going to use, use safely",
    "infoBody1": "SAFEUSE provides non-judgmental, evidence-based information about drug interactions.",
    "infoBody2": "This tool is for harm reduction, not encouragement. Your privacy is protected.",
    "disclaimer": "This is not medical advice. In an emergency, always call local emergency services."
  },
  "checker": {
    "title": "Select Substances",
    "instructions": "Select 2-3 substances to check their interaction risk.",
    "selectedCount": "{{count}} of 3 selected",
    "alreadyTakenToggle": "Already taken?",
    "alreadyTakenExplanation": "This changes the advice to focus on monitoring and immediate harm reduction",
    "checkButton": "Check Interaction"
  },
  "results": {
    "title": "Interaction Result",
    "riskLevel": {
      "low": "LOW",
      "moderate": "MODERATE",
      "high": "HIGH",
      "avoid": "AVOID",
      "unknown": "UNKNOWN"
    },
    "whyMatters": "Why This Matters",
    "harmAdviceTitle": "Harm Reduction Advice",
    "alreadyTakenAdvice": "What To Do Now",
    "emergencyTitle": "When to Seek Help",
    "emergencyIntro": "Contact emergency services if experiencing:",
    "checkAnother": "Check Another Combination",
    "backHome": "Back to Home"
  },
  "substances": {
    "mdma": "MDMA",
    "alcohol": "Alcohol",
    "cocaine": "Cocaine"
    // ... all 33 substances
  },
  "riskExplanations": {
    "respiratoryDepression": "Severe respiratory depression",
    "cardiovascularStrain": "Cardiovascular strain",
    "serotoninSyndrome": "Serotonin syndrome risk",
    "seizureRisk": "Increased seizure risk"
  }
}
```

**4. i18n Configuration**
```typescript
// /app/frontend/config/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '../translations/en.json';
import es from '../translations/es.json';
import pt from '../translations/pt-BR.json';
import fr from '../translations/fr.json';
import de from '../translations/de.json';

const resources = { en, es, pt, fr, de };

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale.split('-')[0], // 'en-US' -> 'en'
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

**5. Component Usage**
```typescript
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('home.checkCombination')}</Text>
      <Text>{t('checker.selectedCount', { count: 2 })}</Text>
    </View>
  );
}
```

#### Translation Workflow
1. **Professional Translation**: Use services like Gengo, Smartling, or hire native speakers
2. **Harm Reduction Expertise**: Translators MUST understand drug terminology and cultural context
3. **Review Process**: Native speakers in harm reduction communities review for accuracy
4. **Continuous Updates**: As interaction database grows, translations must keep pace

#### Cultural Considerations
- **Tone**: Non-judgmental voice must translate accurately (some languages are inherently more formal/informal)
- **Terminology**: Street drug names vary by region (e.g., "Molly" in US, "Mandy" in UK)
- **Emergency Numbers**: Localize emergency contact info (911 vs 112 vs 999)
- **Units**: Metric vs imperial for dosages
- **Cultural Sensitivity**: Some substances have different social stigmas by region

#### RTL Language Support
```typescript
// Detect RTL
import { I18nManager } from 'react-native';

const isRTL = I18nManager.isRTL;

// Apply RTL styles
const styles = StyleSheet.create({
  container: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    textAlign: isRTL ? 'right' : 'left',
  },
});
```

#### Estimated Effort
- **Technical Setup**: 3-4 days (i18n framework, configuration)
- **Key Extraction**: 2-3 days (identifying all strings, creating semantic keys)
- **Translation (5 languages)**: 2-3 weeks (professional translation + review)
- **UI Adaptation**: 1 week (RTL support, dynamic layouts)
- **Testing**: 1 week (all languages, edge cases)
- **Total**: ~5-6 weeks

---

## 4. 💾 Offline Caching

### Research Summary
**Storage Solutions**:
- **AsyncStorage**: Simple key-value (deprecated but still used)
- **MMKV**: 30x faster than AsyncStorage, modern replacement
- **WatermelonDB**: Offline-first database with sync capabilities
- **expo-file-system**: Asset caching (images, fonts)
- **Redux Persist**: Auto-persist Redux state

**Best Practices**:
- Offline-first architecture: Load local cache first, sync in background
- Connectivity detection with @react-native-community/netinfo
- Stale-while-revalidate caching strategy
- Optimistic updates for better UX

### Implementation Strategy

#### Data to Cache (Priority Order)
1. **Substances List** (33 items, ~5KB) - CRITICAL
2. **Interactions Database** (93 items, ~50KB) - CRITICAL
3. **Harm Reduction Advice** (9 items, ~2KB) - HIGH
4. **Emergency Symptoms** (7 items, ~3KB) - HIGH
5. **Dosage Information** (if implemented, ~30KB) - MEDIUM
6. **User's Recent Checks** (last 10 searches) - LOW

#### Technical Architecture

**Option 1: MMKV (Recommended for SAFEUSE)**
Best for our use case: Small structured data, fast reads, simple API

```typescript
// Install
yarn add react-native-mmkv

// Configuration
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'safeuse-cache',
  encryptionKey: 'optional-encryption-key'
});

// Usage
storage.set('substances', JSON.stringify(substances));
const cached = storage.getString('substances');
```

**Option 2: WatermelonDB**
Best if adding complex features (user accounts, sync, search history)

#### Implementation Steps

**1. Install Dependencies**
```bash
cd /app/frontend
yarn add react-native-mmkv @react-native-community/netinfo
```

**2. Create Cache Service**
```typescript
// /app/frontend/services/cacheService.ts
import { MMKV } from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';

const storage = new MMKV({ id: 'safeuse-cache' });

export class CacheService {
  private static CACHE_VERSION = 'v1';
  private static CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  static async cacheSubstances(substances: Substance[]) {
    const cacheData = {
      version: this.CACHE_VERSION,
      timestamp: Date.now(),
      data: substances
    };
    storage.set('substances', JSON.stringify(cacheData));
  }
  
  static getSubstances(): Substance[] | null {
    const cached = storage.getString('substances');
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    
    // Check expiry
    if (Date.now() - parsed.timestamp > this.CACHE_EXPIRY) {
      return null;
    }
    
    // Check version
    if (parsed.version !== this.CACHE_VERSION) {
      return null;
    }
    
    return parsed.data;
  }
  
  static async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }
  
  static clearCache() {
    storage.clearAll();
  }
}
```

**3. Update API Service with Offline-First Logic**
```typescript
// /app/frontend/services/apiService.ts
export async function getSubstances(): Promise<Substance[]> {
  // Try cache first
  const cached = CacheService.getSubstances();
  
  // Check connectivity
  const online = await CacheService.isOnline();
  
  // If offline and have cache, return cache
  if (!online && cached) {
    console.log('Using cached substances (offline mode)');
    return cached;
  }
  
  // If online, fetch fresh data
  try {
    const response = await axios.get(`${BACKEND_URL}/api/substances`);
    const freshData = response.data;
    
    // Update cache
    await CacheService.cacheSubstances(freshData);
    
    return freshData;
  } catch (error) {
    // Network error - fall back to cache if available
    if (cached) {
      console.log('Network error, using cached substances');
      return cached;
    }
    throw error;
  }
}
```

**4. Offline Indicator UI**
```typescript
// /app/frontend/components/OfflineIndicator.tsx
import { useNetInfo } from '@react-native-community/netinfo';

export function OfflineIndicator() {
  const netInfo = useNetInfo();
  
  if (netInfo.isConnected) return null;
  
  return (
    <View style={styles.offlineBanner}>
      <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
      <Text style={styles.offlineText}>
        Offline Mode - Using cached data
      </Text>
    </View>
  );
}
```

**5. Cache Initialization on App Start**
```typescript
// /app/frontend/app/_layout.tsx
export default function Layout() {
  const [initializing, setInitializing] = useState(true);
  
  useEffect(() => {
    async function initializeCache() {
      // Preload critical data on first launch
      try {
        const substances = await getSubstances();
        const interactions = await getInteractions();
        // Cache is automatically updated by API service
        console.log('Cache initialized');
      } catch (error) {
        console.error('Cache initialization failed', error);
      } finally {
        setInitializing(false);
      }
    }
    
    initializeCache();
  }, []);
  
  if (initializing) {
    return <LoadingScreen />;
  }
  
  return <Stack />;
}
```

#### Cache Invalidation Strategy
1. **Time-based**: 7 days expiry for substance/interaction data
2. **Version-based**: App updates can force cache refresh
3. **Manual**: Settings option to "Clear cache and refresh"
4. **Smart sync**: When online, check for updates without blocking UI

#### Offline Functionality Scope
**Works Offline** ✅:
- Browse all substances
- Check interactions (if data cached)
- Read harm reduction advice
- View emergency symptoms
- Access recently viewed combinations

**Requires Online** ❌:
- AI explanations (OpenAI API calls)
- Fresh data updates
- New substance additions

#### Estimated Effort
- **MMKV Integration**: 2 days
- **Cache Service Implementation**: 2-3 days
- **API Service Refactoring**: 2 days
- **Offline UI Indicators**: 1-2 days
- **Testing**: 2-3 days (network simulation, edge cases)
- **Total**: ~2 weeks

---

## 5. 🧪 Drug Testing Resource Locator

### Research Summary
**Primary Resources**:
- **DanceSafe**: 
  - Online shop: testing kits shipped from Northern California
  - 17 local chapters across US/Canada
  - On-site testing at music festivals/raves
  - Complete kit (9 reagents): $119, includes fentanyl strips
  
- **DrugsData.org** (formerly EcstasyData): Mail-in lab testing (GC/MS confirmation)
  
- **International**: 
  - Energy Control (Spain): Walk-in and mail-in
  - WEDINOS (Wales): Free postal testing
  - The Loop (UK): Festival testing

### Implementation Strategy

#### Database Schema
```python
# New collection: testing_resources
testing_locations = {
    "id": "dancesafe-sf",
    "organization": "DanceSafe",
    "type": "chapter",  # chapter, online_shop, event, mail_in
    "location": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "coordinates": {"lat": 37.7749, "lng": -122.4194}
    },
    "services": [
        "Reagent kits for purchase",
        "Harm reduction education",
        "Peer support",
        "Narcan distribution"
    ],
    "contact": {
        "website": "https://dancesafe.org/chapters/san-francisco",
        "email": "sf@dancesafe.org",
        "social_media": {"instagram": "@dancesafesf"}
    },
    "availability": "Monthly events, check website",
    "testing_types": ["Marquis", "Mandelin", "Mecke", "Simon's", "Fentanyl strips"],
    "cost": "Free at events, purchase kits online",
    "notes": "No on-site GC/MS, reagent testing only"
}

online_testing = {
    "id": "drugsdata",
    "organization": "DrugsData",
    "type": "mail_in",
    "location": {"city": "Online", "country": "USA"},
    "services": ["GC/MS lab analysis", "Public results database"],
    "contact": {"website": "https://drugsdata.org"},
    "cost": "$40-100 depending on substance",
    "testing_types": ["GC/MS confirmatory analysis"],
    "turnaround": "2-4 weeks",
    "notes": "Results published anonymously, no quantities reported due to US law"
}
```

#### API Endpoints
```python
# Backend additions
@api_router.get("/testing-resources")
async def get_testing_resources(
    location: Optional[str] = None,
    resource_type: Optional[str] = None,
    country: Optional[str] = None
):
    """Get drug testing resources filtered by location/type"""
    query = {}
    if location:
        # Geolocation search (requires coords from frontend)
        pass
    if resource_type:
        query["type"] = resource_type
    if country:
        query["location.country"] = country
    
    resources = await db.testing_resources.find(query).to_list(100)
    return resources

@api_router.get("/testing-resources/nearest")
async def get_nearest_resources(lat: float, lng: float, radius: int = 50):
    """Find testing resources within radius (km) of coordinates"""
    # MongoDB geospatial query
    resources = await db.testing_resources.find({
        "location.coordinates": {
            "$near": {
                "$geometry": {"type": "Point", "coordinates": [lng, lat]},
                "$maxDistance": radius * 1000  # convert to meters
            }
        }
    }).to_list(50)
    return resources
```

#### Frontend Implementation

**New Screen**: `/app/testing-resources.tsx`
```typescript
export default function TestingResourcesScreen() {
  const [resources, setResources] = useState([]);
  const [location, setLocation] = useState(null);
  const [filter, setFilter] = useState('all'); // all, online, local, event
  
  // Request location permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        fetchNearestResources(loc.coords.latitude, loc.coords.longitude);
      }
    })();
  }, []);
  
  return (
    <SafeAreaView>
      <ScrollView>
        {/* Filter buttons */}
        <FilterButtons filter={filter} onChange={setFilter} />
        
        {/* Online resources (always shown) */}
        <Section title="Online Testing Kits">
          <ResourceCard
            icon="cart"
            title="DanceSafe Shop"
            subtitle="Complete 9-reagent kit - $119"
            action={() => Linking.openURL('https://dancesafe.org/shop')}
          />
        </Section>
        
        {/* Local chapters/events */}
        {location && (
          <Section title="Near You">
            {resources.map(resource => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </Section>
        )}
        
        {/* Mail-in lab testing */}
        <Section title="Lab Testing (Mail-In)">
          <ResourceCard
            icon="flask"
            title="DrugsData.org"
            subtitle="GC/MS confirmatory analysis - $40-100"
            action={() => Linking.openURL('https://drugsdata.org')}
          />
        </Section>
        
        {/* Educational content */}
        <Section title="Learn About Testing">
          <InfoCard>
            <Text>Reagent tests provide preliminary screening...</Text>
          </InfoCard>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
```

#### Navigation Integration
```typescript
// Add to home screen
<TouchableOpacity 
  style={styles.testingButton}
  onPress={() => router.push('/testing-resources')}
>
  <Ionicons name="flask" size={24} color="#10B981" />
  <Text>Find Testing Resources</Text>
</TouchableOpacity>
```

#### Key Features
1. **Location-based Search**: 
   - Request GPS permission
   - Show nearest DanceSafe chapters
   - Upcoming events in user's area
   
2. **Filter Options**:
   - Online shops (always accessible)
   - Local chapters (regular meetings)
   - Festival/event testing (seasonal)
   - Mail-in services (lab confirmation)
   
3. **Resource Details**:
   - What tests are available
   - Cost (free vs purchase)
   - How to access
   - Contact information
   - What to expect
   
4. **Educational Component**:
   - What reagent tests can/cannot tell you
   - Difference between reagent and GC/MS
   - How to use test kits safely
   - Interpreting results
   - Limitations of testing

#### Data Collection
**Phase 1 (US/Canada)**:
- All 17 DanceSafe chapters
- Major festival testing schedules
- State-by-state resources
- Online retailers (DanceSafe, Bunk Police, Elevation Chemicals)

**Phase 2 (International)**:
- Energy Control (Spain)
- WEDINOS (UK/Wales)
- The Loop (UK)
- Know Your Stuff NZ (New Zealand)
- Pill Testing Australia (proposed sites)

#### Legal Considerations
⚠️ **Important Notes**:
- Drug checking laws vary by jurisdiction
- Some US states have paraphernalia laws that could apply to test kits
- Include disclaimer: "Check local laws before purchasing test kits"
- Frame as harm reduction, not facilitating illegal activity
- Some events may have legal exemptions (e.g., RAVE Act considerations)

#### Estimated Effort
- **Database Design**: 2 days
- **Data Collection**: 1-2 weeks (researching all resources)
- **Backend API**: 2-3 days (geolocation queries)
- **Frontend UI**: 1 week (map integration, cards, filters)
- **Location Permissions**: 1-2 days (iOS/Android config)
- **Testing**: 3-4 days (location accuracy, permissions)
- **Total**: ~3-4 weeks

---

## Implementation Priority & Timeline

### Recommended Phased Approach

**Phase 1: Foundation (Weeks 1-4)**
- ✅ COMPLETED: Core interaction checker with TripSit/PsychonautWiki data
- ✅ COMPLETED: 33 substances, 93 interactions, AI explanations
- **NEXT**: Offline caching (~2 weeks)
- **NEXT**: Drug testing resources (~3 weeks)

**Phase 2: Enhanced Safety (Weeks 5-10)**
- Dosage guidance system (~2 weeks)
- Prescription medication interactions (~6-8 weeks, includes legal review)

**Phase 3: Accessibility (Weeks 11-16)**
- Multilingual support (5 languages) (~5-6 weeks)

### Resource Requirements

**Development**:
- 1 Senior Full-Stack Developer (React Native + Python)
- 1 UI/UX Designer (mobile-first, harm reduction sensitive)
- 1 Data Researcher (substance/dosage/interaction validation)

**Subject Matter Experts**:
- Harm reduction specialist (consulting basis)
- Pharmacologist/toxicologist (medication interactions review)
- Legal counsel (disclaimers, liability)

**Services**:
- DrugBank API license ($500-2000/year)
- Professional translation services ($0.10-0.25/word × ~5000 words × 5 languages = $2500-6250)
- DanceSafe partnership/data sharing agreement (potentially free if non-commercial)

### Total Estimated Cost
- **Development Labor**: 16 weeks × $8000/week = $128,000
- **API Licenses**: $2,000/year
- **Translation**: $6,000 (one-time)
- **Legal Review**: $5,000
- **Total Phase 1-3**: ~$141,000

### Success Metrics
- Offline mode usage: % of sessions without network
- Testing resource clicks: engagement with harm reduction tools
- Dosage page views: educational reach
- Language adoption: % users switching from English
- Medication checker usage: at-risk user identification

---

## Conclusion

These five enhancements transform SAFEUSE from an interaction checker into a comprehensive harm reduction platform. Each feature directly serves the core mission: **"If you're going to use, use safely."**

**Critical Success Factors**:
1. Maintain non-judgmental tone across all languages
2. Ensure dosage info emphasizes ranges and variability
3. Make offline mode seamless (users shouldn't notice)
4. Partner with established harm reduction orgs (credibility)
5. Robust legal disclaimers (medical/legal advice)

**Next Steps**:
1. Prioritize offline caching (quick win, major UX improvement)
2. Establish DanceSafe partnership (resource locator credibility)
3. Secure DrugBank license (medication interactions)
4. Begin dosage data collection with PsychonautWiki attribution
5. Plan multilingual rollout with community translators

---

**Last Updated**: January 2026  
**Author**: SAFEUSE Development Team  
**Version**: 1.0
