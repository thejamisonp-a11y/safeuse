# SAFEUSE - Harm Reduction Drug Interaction Checker

**"If you're going to use, use safely"**

SAFEUSE is a privacy-first, non-judgmental mobile application that provides evidence-based information about drug interactions for harm reduction purposes.

## 🛡️ Core Philosophy

- **Harm Reduction, Not Encouragement**: This tool is designed to reduce harm, not promote drug use
- **Non-Judgmental**: Calm, factual, supportive language with no moralizing
- **Privacy-First**: No accounts, no tracking, no personal data storage
- **Evidence-Based**: Risk calculations based on pharmacological data
- **AI-Assisted Explanations**: GPT-4 provides clear, calm explanations of pre-calculated risks

## 🎯 Features

### ✅ Implemented

1. **Drug Combination Checker**
   - Select 2-3 substances from comprehensive library (33+ substances)
   - Deterministic risk calculation (LOW, MODERATE, HIGH, AVOID)
   - AI-generated harm reduction explanations
   - 64+ documented interactions

2. **"Already Taken" Mode**
   - Toggle changes advice tone to focus on immediate safety
   - Monitoring guidance and harm reduction steps
   - Emergency symptom recognition

3. **Risk Visualization**
   - Color-coded risk levels (Green → Red)
   - Clear visual hierarchy
   - Mobile-optimized interface

4. **Harm Reduction Advice**
   - Context-specific guidance
   - Hydration reminders
   - Avoiding redosing recommendations
   - Emergency escalation when appropriate

5. **Emergency Guidance**
   - Symptom-based escalation (only for HIGH/AVOID risks)
   - Calm, supportive framing
   - Clear action steps

## 🏗️ Technical Architecture

### Frontend (Expo + React Native)
- **Framework**: Expo Router with file-based routing
- **UI**: Native React Native components
- **Styling**: StyleSheet with 8pt grid system
- **Navigation**: Stack-based navigation
- **State**: Local component state (no Redux needed for MVP)

### Backend (FastAPI + Python)
- **Framework**: FastAPI with async/await
- **Database**: MongoDB with Motor (async driver)
- **AI Integration**: OpenAI GPT-4 via Emergent LLM Key
- **Key Features**:
  - Deterministic risk calculation engine
  - AI explanation generation (temperature 0.3)
  - RESTful API design

### Database Schema

**Collections:**
1. `substances` - Drug information (id, name, drug_class, common_names)
2. `interactions` - Interaction data (substance_a, substance_b, risk_level, mechanism, notes)
3. `harm_advice` - Context-specific advice (context, advice)
4. `symptoms` - Emergency symptoms (name, severity, description, action)

## 📚 Substance Library (33 Substances)

### Stimulants
- MDMA, Cocaine, Amphetamine, Methamphetamine, Caffeine, Methylphenidate

### Depressants
- Alcohol, Benzodiazepines, Opioids, GHB/GBL, Barbiturates, Zolpidem

### Psychedelics
- LSD, Psilocybin, DMT, Mescaline, 2C-B, Ayahuasca

### Dissociatives
- Ketamine, DXM, PCP, Nitrous Oxide

### Cannabinoids
- Cannabis, Synthetic Cannabinoids

### Antidepressants
- SSRIs, MAOIs, Tricyclics

### Other
- Tramadol, Pregabalin, Gabapentin, Diphenhydramine, Poppers, Kratom

## 🔥 Critical Interactions (AVOID Level)

- Alcohol + Benzodiazepines (respiratory depression)
- Alcohol + Opioids (fatal overdose risk)
- MAOIs + MDMA (serotonin syndrome)
- MAOIs + Stimulants (hypertensive crisis)
- Benzodiazepines + Opioids (leading cause of overdose deaths)
- And 13 more documented dangerous combinations...

## 🚀 Getting Started

### Prerequisites
- Node.js and Yarn
- Python 3.11+
- MongoDB
- Expo CLI

### Installation

1. **Backend Setup**
```bash
cd /app/backend
pip install -r requirements.txt
# Database seeds automatically on first run
```

2. **Frontend Setup**
```bash
cd /app/frontend
yarn install
```

3. **Environment Variables**
- Backend: `.env` includes MONGO_URL, DB_NAME, EMERGENT_LLM_KEY
- Frontend: `.env` includes EXPO_PUBLIC_BACKEND_URL

### Running the App

**Backend:**
```bash
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001
```

**Frontend:**
```bash
cd /app/frontend
expo start
```

**Seed Database:**
```bash
curl -X POST http://localhost:8001/api/seed-data
```

## 📡 API Endpoints

### GET `/api/substances`
Returns list of all substances

### POST `/api/check`
Check drug interaction
```json
{
  "substance_ids": ["mdma", "alcohol"],
  "already_taken": false
}
```

Response:
```json
{
  "risk_level": "high",
  "risk_color": "#EF4444",
  "explanation": "AI-generated explanation...",
  "harm_advice": ["advice1", "advice2"],
  "emergency_symptoms": [...],
  "substances": ["MDMA", "Alcohol"]
}
```

### GET `/api/symptoms`
Returns all emergency symptoms

### POST `/api/seed-data`
Seeds database with initial data

## 🎨 UI/UX Guidelines

### Design Principles
- **Mobile-first**: Optimized for one-handed use
- **Touch targets**: Minimum 48px for all interactive elements
- **Color coding**:
  - 🟢 LOW: #10B981 (green)
  - 🟡 MODERATE: #F59E0B (orange)
  - 🔴 HIGH: #EF4444 (red)
  - ⛔ AVOID: #991B1B (dark red)
- **Typography**: Clear hierarchy, readable sizes
- **Spacing**: 8pt grid system (8px, 16px, 24px, 32px)

### Tone of Voice
✅ **DO:**
- "This combination increases strain on the heart"
- "If you've already taken these, focus on hydration"
- "Stay with someone who can help"

❌ **DON'T:**
- "This is extremely dangerous and should never be done"
- "You shouldn't have done this"
- Anything alarmist or judgmental

## 🧪 Testing

### Backend Testing
```bash
# Test substances endpoint
curl http://localhost:8001/api/substances

# Test dangerous interaction
curl -X POST http://localhost:8001/api/check \
  -H "Content-Type: application/json" \
  -d '{"substance_ids": ["alcohol", "benzos"], "already_taken": false}'
```

### Frontend Testing
- Use Expo Go app on physical device
- Test on both iOS and Android
- Verify touch targets are adequate
- Test keyboard handling on forms

## 🔐 Privacy & Ethics

### Privacy Guarantees
- ✅ No user accounts
- ✅ No personal data collection
- ✅ No usage tracking
- ✅ No analytics
- ✅ Client-side only substance selection
- ✅ API calls contain no identifiable information

### Ethical Considerations
1. **Not Medical Advice**: Clear disclaimer throughout app
2. **Accurate Information**: Based on harm reduction literature
3. **Emergency Guidance**: Appropriate escalation for serious symptoms
4. **Supportive Framing**: Medical help framed as support, not consequence

## 🚨 Emergency Protocol

The app provides emergency guidance when:
- Risk level is HIGH or AVOID
- User reports they've already taken substances
- Symptoms indicate serious danger

Emergency advice:
1. Always calm and supportive
2. Clear action steps
3. Emphasizes "support" not "consequences"
4. Encourages honesty with medical professionals

## 📊 AI Integration Details

### OpenAI GPT-4 Configuration
- **Model**: GPT-4
- **Temperature**: 0.3 (for consistency)
- **Purpose**: Explain pre-calculated risk levels only
- **Key Protection**: AI cannot override risk calculations

### System Prompt
```
You are a harm-reduction assistant.
You provide non-judgemental, evidence-informed explanations of drug interaction risks.
You do not calculate risk.
You do not invent pharmacology.
You do not shame or moralise.
You prioritise safety, clarity, and calm language.
```

## 📄 License & Disclaimer

### Disclaimer
**SAFEUSE IS NOT MEDICAL ADVICE**

This application provides general harm reduction information based on available pharmacological data. It should not replace professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions regarding medical conditions or substance use.

**In an emergency, call your local emergency services immediately.**

### Purpose
This tool is designed to reduce harm among people who use drugs. It is not intended to encourage or promote drug use.

## 🙏 Acknowledgments

- Harm reduction principles from DanceSafe, Erowid, and PsychonautWiki
- Pharmacological data from peer-reviewed literature
- Built with Emergent AI platform
- OpenAI GPT-4 for explanation generation

## 📞 Support

For questions about harm reduction practices, please consult:
- Local harm reduction organizations
- DanceSafe: https://dancesafe.org
- Erowid: https://erowid.org
- Your healthcare provider

---

**Remember: If you're going to use, use safely. 🛡️**
