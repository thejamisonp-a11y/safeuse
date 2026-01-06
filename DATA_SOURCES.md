# SAFEUSE - Data Sources & Attribution

## Primary Harm Reduction Resources

This application uses interaction data from the following authoritative harm reduction sources:

### TripSit Drug Combinations Chart
**Source**: https://wiki.tripsit.me/wiki/Drug_combinations  
**Version**: 3.0+ (accessed January 2026)

TripSit is a leading harm reduction organization providing:
- Comprehensive drug interaction matrix
- Peer-reviewed risk categorizations (Dangerous, Unsafe, Caution, Low Risk)
- Evidence-based pharmacological mechanisms
- Community-tested interaction reports

**Risk Level Mapping**:
- TripSit "Dangerous" → SAFEUSE "AVOID"
- TripSit "Unsafe" → SAFEUSE "HIGH"  
- TripSit "Caution" → SAFEUSE "MODERATE"
- TripSit "Low Risk" → SAFEUSE "LOW"

### PsychonautWiki
**Source**: https://psychonautwiki.org  
**Used For**: Cross-referencing interaction mechanisms and user experience reports

PsychonautWiki provides:
- Detailed pharmacological profiles
- Subjective effect documentation
- Cross-tolerance information
- Safety guidelines

## Interaction Database Statistics

**Total Substances**: 33  
**Total Documented Interactions**: 93  
**Data Coverage by Risk Level**:
- AVOID (Life-threatening): 13 interactions
- HIGH (Dangerous): 18 interactions  
- MODERATE (Significant risk): 23 interactions
- LOW (Minimal danger): 39 interactions

## Risk Categories Explained

### AVOID ⛔ (Dark Red #991B1B)
**Definition**: Life-threatening combinations that should never be mixed
**Examples**:
- Alcohol + Benzodiazepines (respiratory depression)
- MAOIs + MDMA (serotonin syndrome)
- Benzodiazepines + Opioids (leading cause of overdose deaths)
- Tramadol + SSRIs (seizure risk)

**Source Alignment**: TripSit "Dangerous" category

### HIGH 🔴 (Red #EF4444)
**Definition**: Serious harm potential requiring extreme caution
**Examples**:
- MDMA + Alcohol (dehydration, neurotoxicity)
- Cocaine + Alcohol (forms toxic cocaethylene)
- Ketamine + Alcohol (vomit aspiration risk)
- MDMA + SSRIs (reduced effects, increased neurotoxicity)

**Source Alignment**: TripSit "Unsafe" + some "Caution" entries

### MODERATE 🟡 (Orange #F59E0B)
**Definition**: Notable risks that require knowledge and careful dosing
**Examples**:
- Cannabis + Alcohol (greening out)
- LSD + Cannabis (intensified anxiety)
- Caffeine + MDMA (cardiovascular strain)
- LSD + Mushrooms (unpredictable intensity)

**Source Alignment**: TripSit "Caution" category

### LOW 🟢 (Green #10B981)
**Definition**: Minimal physical danger, psychological considerations apply
**Examples**:
- LSD + MDMA ("candyflip" - popular combination)
- Mushrooms + MDMA ("hippy flip")
- LSD + Ketamine (intense but not physically dangerous)
- LSD + Benzodiazepines (benzos reduce psychedelic effects)

**Source Alignment**: TripSit "Low Risk" + "Low Risk & Synergy"

## Data Quality & Limitations

### What This Data Covers
✅ Common substance combinations (mainstream and research chemicals)  
✅ Well-documented pharmacological interactions  
✅ Community-verified subjective effects  
✅ Emergency medical literature  
✅ Harm reduction field experience  

### What This Data Does NOT Cover
❌ Individual metabolic variations  
❌ Dose-dependent nuances  
❌ Rare substance combinations  
❌ Prescription medication interactions (beyond SSRIs/MAOIs)  
❌ Medical conditions affecting risk  
❌ Adulterant interactions  

### Unknown Interactions
When a combination is not in our database, the app returns "Unknown Risk" with an uncertainty disclaimer. This does NOT mean the combination is safe - it means we lack sufficient data to make a determination.

## Harm Reduction Principles Applied

### Non-Judgmental Language
All explanations avoid:
- Moralistic judgments ("you shouldn't do this")
- Scare tactics
- Shame-based messaging
- Legal threats
- Condescension

Instead, we use:
- Factual mechanism explanations
- Risk-based framing
- Supportive language
- Emergency guidance when appropriate
- Emphasis on safety over abstinence

### "Already Taken" Mode
When users indicate they've already consumed substances, advice shifts from "planning" to "monitoring":
- Focus on immediate harm reduction
- Symptom monitoring guidance
- When to seek help (framed as support, not consequences)
- Avoiding additional risk (redosing, mixing further)

### AI Explanation Layer
**Model**: OpenAI GPT-4  
**Temperature**: 0.3 (for consistency)  
**Role**: Explain pre-calculated risks ONLY

**Critical Constraints**:
- AI does NOT calculate or decide risk levels
- AI cannot override deterministic risk engine
- AI must maintain non-judgmental tone
- AI provides 2-3 sentence explanations maximum
- AI encouraged to focus on mechanisms and monitoring

## Evidence Base

### Pharmacological Mechanisms
Interaction mechanisms are derived from:
1. Peer-reviewed medical literature
2. Case reports in emergency medicine
3. Pharmacodynamic/pharmacokinetic interactions
4. Neurotransmitter system overlaps

### Risk Levels
Risk categorizations consider:
1. Respiratory depression potential
2. Cardiovascular strain
3. Seizure threshold lowering
4. Serotonin syndrome risk
5. Liver toxicity
6. Loss of consciousness / aspiration risk
7. Unpredictable psychological effects

### Community Input
While medical literature forms the foundation, harm reduction communities provide:
- Real-world experience reports
- Subjective effect documentation
- Early warning of emerging combinations
- Dosage guidance
- Set and setting considerations

## Continuous Improvement

This database is updated periodically based on:
- New research publications
- TripSit chart updates
- PsychonautWiki revisions
- User feedback (via harm reduction community channels)
- Emergency medicine case reports

## Attribution & Licensing

### Content Attribution
- Interaction mechanisms: Adapted from TripSit Wiki (CC BY-SA 3.0)
- Substance profiles: Based on PsychonautWiki (CC BY-SA 3.0)
- Risk classifications: Derived from TripSit Drug Combination Chart
- AI explanations: Generated via OpenAI GPT-4 (SAFEUSE-specific prompting)

### Our Contributions
- Risk level mapping (TripSit → SAFEUSE 4-level system)
- Mobile-first user interface
- "Already taken" contextual advice system
- Deterministic risk calculation engine
- Emergency symptom escalation logic
- Non-judgmental AI explanation layer

### Credit Where Due
**TripSit**: Foundational drug combination matrix, community-validated interactions  
**PsychonautWiki**: Pharmacological mechanisms, subjective effects  
**DanceSafe**: Harm reduction principles, testing kit advocacy  
**Erowid**: Historical substance documentation  
**Emergency medicine literature**: Medical risk assessments  

## Medical Disclaimer

**SAFEUSE IS NOT MEDICAL ADVICE**

This application provides general harm reduction information for educational purposes. It should not replace:
- Professional medical advice
- Emergency medical treatment
- Substance use disorder treatment
- Mental health counseling
- Medication consultation with prescribers

**In a medical emergency, always call your local emergency services.**

## Contact & Feedback

For corrections, updates, or additional data sources:
- TripSit IRC: https://chat.tripsit.me
- r/ReagentTesting (Reddit)
- r/HarmReduction (Reddit)

For academic collaboration or research inquiries:
- DanceSafe: https://dancesafe.org
- Multidisciplinary Association for Psychedelic Studies (MAPS): https://maps.org

---

**Last Updated**: January 2026  
**Data Version**: 1.0  
**Interaction Count**: 93  
**Substance Count**: 33  

Remember: **If you're going to use, use safely.** 🛡️
