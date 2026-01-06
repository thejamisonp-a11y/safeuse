from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class Substance(BaseModel):
    id: str
    name: str
    drug_class: str
    common_names: List[str] = []

class Interaction(BaseModel):
    substance_a: str
    substance_b: str
    risk_level: str  # low, moderate, high, avoid
    mechanism: str
    notes: str

class CheckRequest(BaseModel):
    substance_ids: List[str]
    already_taken: bool = False

class CheckResponse(BaseModel):
    risk_level: str
    risk_color: str
    explanation: str
    harm_advice: List[str]
    emergency_symptoms: Optional[List[dict]] = None
    substances: List[str]

class Symptom(BaseModel):
    name: str
    severity: str  # monitor, serious, emergency
    description: str
    action: str

# ==================== AI HELPER ====================

async def get_ai_explanation(risk_level: str, mechanism: str, substances: List[str], already_taken: bool) -> str:
    """Generate harm-reduction explanation using AI"""
    try:
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        if not emergent_key:
            return "Unable to generate explanation at this time."
        
        system_prompt = """You are a harm-reduction assistant.
You provide non-judgemental, evidence-informed explanations of drug interaction risks.
You do not calculate risk.
You do not invent pharmacology.
You do not shame or moralise.
You do not give medical diagnoses.
You prioritise safety, clarity, and calm language.
If the user may have already taken substances, focus on monitoring and harm reduction.
Encourage medical help only when symptoms indicate serious danger, and frame it as support.
Keep responses to 2-3 sentences maximum."""
        
        context = "already taken" if already_taken else "planning to take"
        substances_str = " and ".join(substances)
        
        prompt = f"""Risk level: {risk_level}
Mechanism: {mechanism}
Substances: {substances_str}
Context: User has {context} these substances.

Provide a brief, calm explanation of this interaction risk in 2-3 sentences."""
        
        chat = LlmChat(
            api_key=emergent_key,
            session_id="safeuse-harm-reduction",
            system_message=system_prompt
        ).with_model("openai", "gpt-4")
        
        # Set temperature to 0.3 for consistency
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return response.strip()
    except Exception as e:
        logger.error(f"AI explanation error: {e}")
        return "This combination may pose risks. Please review the harm-reduction advice below."

# ==================== RISK CALCULATION ENGINE ====================

def get_risk_color(risk_level: str) -> str:
    """Map risk level to color"""
    colors = {
        "low": "#10B981",  # green
        "moderate": "#F59E0B",  # yellow/orange
        "high": "#EF4444",  # red
        "avoid": "#991B1B",  # dark red
        "unknown": "#6B7280"  # gray
    }
    return colors.get(risk_level.lower(), "#6B7280")

async def calculate_interaction_risk(substance_ids: List[str]) -> dict:
    """Deterministic risk calculation from database"""
    if len(substance_ids) < 2:
        return {
            "risk_level": "unknown",
            "mechanism": "Insufficient substances selected",
            "notes": "Please select at least 2 substances to check interactions."
        }
    
    # Get all substances
    substances = await db.substances.find({"id": {"$in": substance_ids}}).to_list(100)
    substance_names = [s["name"] for s in substances]
    
    # Check pairwise interactions
    max_risk = "low"
    mechanisms = []
    notes = []
    
    risk_hierarchy = {"low": 1, "moderate": 2, "high": 3, "avoid": 4}
    
    for i in range(len(substance_ids)):
        for j in range(i + 1, len(substance_ids)):
            # Check both directions
            interaction = await db.interactions.find_one({
                "$or": [
                    {"substance_a": substance_ids[i], "substance_b": substance_ids[j]},
                    {"substance_a": substance_ids[j], "substance_b": substance_ids[i]}
                ]
            })
            
            if interaction:
                current_risk = interaction["risk_level"].lower()
                if risk_hierarchy.get(current_risk, 0) > risk_hierarchy.get(max_risk, 0):
                    max_risk = current_risk
                mechanisms.append(interaction["mechanism"])
                notes.append(interaction["notes"])
    
    if not mechanisms:
        return {
            "risk_level": "unknown",
            "mechanism": "No interaction data available for this combination",
            "notes": "This combination has not been studied or documented. Exercise extreme caution.",
            "substances": substance_names
        }
    
    return {
        "risk_level": max_risk,
        "mechanism": "; ".join(mechanisms),
        "notes": " ".join(notes),
        "substances": substance_names
    }

# ==================== API ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "SAFEUSE API - Harm Reduction Drug Interaction Checker"}

@api_router.get("/substances", response_model=List[Substance])
async def get_substances():
    """Get all available substances"""
    substances = await db.substances.find().to_list(1000)
    return [Substance(**s) for s in substances]

@api_router.post("/check", response_model=CheckResponse)
async def check_interaction(request: CheckRequest):
    """Check drug interaction - DETERMINISTIC risk calculation + AI explanation"""
    try:
        # Step 1: Calculate risk deterministically
        risk_data = await calculate_interaction_risk(request.substance_ids)
        risk_level = risk_data["risk_level"]
        mechanism = risk_data["mechanism"]
        substances = risk_data["substances"]
        
        # Step 2: Get AI explanation (AI does NOT decide risk)
        explanation = await get_ai_explanation(
            risk_level,
            mechanism,
            substances,
            request.already_taken
        )
        
        # Step 3: Get harm-reduction advice
        context = "already_taken" if request.already_taken else "planning"
        advice_docs = await db.harm_advice.find({
            "context": {"$in": [context, "both"]}
        }).to_list(100)
        
        harm_advice = [doc["advice"] for doc in advice_docs]
        
        # Add risk-specific advice
        if risk_level in ["high", "avoid"]:
            if request.already_taken:
                harm_advice.insert(0, "Monitor your symptoms closely and stay with someone who can help if needed.")
            else:
                harm_advice.insert(0, "Consider avoiding this combination to reduce risk.")
        
        # Step 4: Get emergency symptoms if high risk
        emergency_symptoms = None
        if risk_level in ["high", "avoid"]:
            symptoms = await db.symptoms.find({"severity": {"$in": ["serious", "emergency"]}}).to_list(50)
            emergency_symptoms = [
                {
                    "name": s["name"],
                    "description": s["description"],
                    "action": s["action"]
                }
                for s in symptoms
            ]
        
        return CheckResponse(
            risk_level=risk_level,
            risk_color=get_risk_color(risk_level),
            explanation=explanation,
            harm_advice=harm_advice,
            emergency_symptoms=emergency_symptoms,
            substances=substances
        )
    except Exception as e:
        logger.error(f"Check interaction error: {e}")
        raise HTTPException(status_code=500, detail="Unable to check interaction")

@api_router.get("/symptoms", response_model=List[Symptom])
async def get_symptoms():
    """Get symptom guidance"""
    symptoms = await db.symptoms.find().to_list(100)
    return [Symptom(**s) for s in symptoms]

@api_router.post("/seed-data")
async def seed_database():
    """Seed database with comprehensive substance library"""
    try:
        # Clear existing data
        await db.substances.delete_many({})
        await db.interactions.delete_many({})
        await db.harm_advice.delete_many({})
        await db.symptoms.delete_many({})
        
        # Comprehensive substance library
        substances = [
            # Stimulants
            {"id": "mdma", "name": "MDMA", "drug_class": "stimulant-empathogen", "common_names": ["Ecstasy", "Molly", "E", "X"]},
            {"id": "cocaine", "name": "Cocaine", "drug_class": "stimulant", "common_names": ["Coke", "Blow", "Snow"]},
            {"id": "amphetamine", "name": "Amphetamine", "drug_class": "stimulant", "common_names": ["Speed", "Adderall", "Dexedrine"]},
            {"id": "methamphetamine", "name": "Methamphetamine", "drug_class": "stimulant", "common_names": ["Meth", "Crystal", "Ice", "Tina"]},
            {"id": "caffeine", "name": "Caffeine", "drug_class": "stimulant", "common_names": ["Coffee", "Energy drinks"]},
            {"id": "methylphenidate", "name": "Methylphenidate", "drug_class": "stimulant", "common_names": ["Ritalin", "Concerta"]},
            
            # Depressants
            {"id": "alcohol", "name": "Alcohol", "drug_class": "depressant", "common_names": ["Booze", "Liquor", "Beer", "Wine"]},
            {"id": "benzos", "name": "Benzodiazepines", "drug_class": "depressant", "common_names": ["Xanax", "Valium", "Klonopin", "Ativan"]},
            {"id": "opioids", "name": "Opioids", "drug_class": "depressant", "common_names": ["Heroin", "Fentanyl", "Oxy", "Morphine"]},
            {"id": "ghb", "name": "GHB/GBL", "drug_class": "depressant", "common_names": ["G", "Liquid Ecstasy", "Gina"]},
            {"id": "barbiturates", "name": "Barbiturates", "drug_class": "depressant", "common_names": ["Phenobarbital", "Seconal"]},
            {"id": "zolpidem", "name": "Zolpidem", "drug_class": "depressant", "common_names": ["Ambien", "Stilnox"]},
            
            # Psychedelics
            {"id": "lsd", "name": "LSD", "drug_class": "psychedelic", "common_names": ["Acid", "Lucy", "Tabs"]},
            {"id": "mushrooms", "name": "Psilocybin", "drug_class": "psychedelic", "common_names": ["Shrooms", "Magic Mushrooms"]},
            {"id": "dmt", "name": "DMT", "drug_class": "psychedelic", "common_names": ["Dimitri", "Spirit Molecule"]},
            {"id": "mescaline", "name": "Mescaline", "drug_class": "psychedelic", "common_names": ["Peyote", "San Pedro"]},
            {"id": "2cb", "name": "2C-B", "drug_class": "psychedelic", "common_names": ["Nexus", "Bees"]},
            {"id": "ayahuasca", "name": "Ayahuasca", "drug_class": "psychedelic", "common_names": ["Aya", "Yagé"]},
            
            # Dissociatives
            {"id": "ketamine", "name": "Ketamine", "drug_class": "dissociative", "common_names": ["K", "Special K", "Ket"]},
            {"id": "dxm", "name": "DXM", "drug_class": "dissociative", "common_names": ["Dextromethorphan", "Robitussin", "Dex"]},
            {"id": "pcp", "name": "PCP", "drug_class": "dissociative", "common_names": ["Angel Dust", "Sherm"]},
            {"id": "nitrous", "name": "Nitrous Oxide", "drug_class": "dissociative", "common_names": ["Laughing Gas", "Nos", "Whippits"]},
            
            # Cannabinoids
            {"id": "cannabis", "name": "Cannabis", "drug_class": "cannabinoid", "common_names": ["Weed", "Marijuana", "THC", "Pot"]},
            {"id": "synthetic_cannabinoids", "name": "Synthetic Cannabinoids", "drug_class": "cannabinoid", "common_names": ["Spice", "K2"]},
            
            # Antidepressants
            {"id": "ssri", "name": "SSRIs", "drug_class": "antidepressant", "common_names": ["Prozac", "Zoloft", "Lexapro"]},
            {"id": "maoi", "name": "MAOIs", "drug_class": "antidepressant", "common_names": ["Nardil", "Parnate"]},
            {"id": "tricyclic", "name": "Tricyclic Antidepressants", "drug_class": "antidepressant", "common_names": ["Amitriptyline", "Imipramine"]},
            
            # Other
            {"id": "tramadol", "name": "Tramadol", "drug_class": "opioid-like", "common_names": ["Ultram", "Tramal"]},
            {"id": "pregabalin", "name": "Pregabalin", "drug_class": "gabapentinoid", "common_names": ["Lyrica"]},
            {"id": "gabapentin", "name": "Gabapentin", "drug_class": "gabapentinoid", "common_names": ["Neurontin"]},
            {"id": "dph", "name": "Diphenhydramine", "drug_class": "deliriant", "common_names": ["Benadryl", "DPH"]},
            {"id": "poppers", "name": "Alkyl Nitrites", "drug_class": "vasodilator", "common_names": ["Poppers", "Rush"]},
            {"id": "kratom", "name": "Kratom", "drug_class": "opioid-like", "common_names": ["Mitragyna speciosa"]},
        ]
        await db.substances.insert_many(substances)
        
        # Comprehensive interaction data
        interactions = [
            # ===== AVOID (LIFE-THREATENING) =====
            {"substance_a": "alcohol", "substance_b": "benzos", "risk_level": "avoid", "mechanism": "Both are CNS depressants causing severe respiratory depression", "notes": "Significantly increases risk of overdose, loss of consciousness, and death."},
            {"substance_a": "alcohol", "substance_b": "opioids", "risk_level": "avoid", "mechanism": "Synergistic respiratory depression", "notes": "Extremely dangerous - can lead to fatal overdose."},
            {"substance_a": "alcohol", "substance_b": "ghb", "risk_level": "avoid", "mechanism": "Severe CNS depression and respiratory failure", "notes": "Very high risk of unconsciousness, respiratory arrest, and death."},
            {"substance_a": "benzos", "substance_b": "opioids", "risk_level": "avoid", "mechanism": "Compounding respiratory depression", "notes": "Leading cause of overdose deaths. Extremely dangerous."},
            {"substance_a": "benzos", "substance_b": "ghb", "risk_level": "avoid", "mechanism": "Severe sedation and respiratory depression", "notes": "High risk of coma and death."},
            {"substance_a": "opioids", "substance_b": "ghb", "risk_level": "avoid", "mechanism": "Extreme respiratory depression", "notes": "Life-threatening combination."},
            {"substance_a": "maoi", "substance_b": "mdma", "risk_level": "avoid", "mechanism": "Risk of serotonin syndrome", "notes": "Can cause dangerously high body temperature, seizures, and death."},
            {"substance_a": "maoi", "substance_b": "ssri", "risk_level": "avoid", "mechanism": "Severe serotonin syndrome", "notes": "Medical emergency - can be fatal."},
            {"substance_a": "maoi", "substance_b": "amphetamine", "risk_level": "avoid", "mechanism": "Hypertensive crisis", "notes": "Dangerously elevated blood pressure."},
            {"substance_a": "maoi", "substance_b": "cocaine", "risk_level": "avoid", "mechanism": "Severe hypertensive crisis", "notes": "Risk of stroke and cardiovascular emergency."},
            {"substance_a": "maoi", "substance_b": "dxm", "risk_level": "avoid", "mechanism": "Serotonin syndrome", "notes": "Potentially fatal interaction."},
            {"substance_a": "tramadol", "substance_b": "ssri", "risk_level": "avoid", "mechanism": "Serotonin syndrome risk", "notes": "Can cause seizures and serotonin toxicity."},
            {"substance_a": "tramadol", "substance_b": "maoi", "risk_level": "avoid", "mechanism": "Severe serotonin syndrome", "notes": "Life-threatening interaction."},
            
            # ===== HIGH RISK =====
            {"substance_a": "mdma", "substance_b": "alcohol", "risk_level": "high", "mechanism": "Increased dehydration and masked intoxication", "notes": "MDMA masks alcohol effects leading to dangerous overconsumption."},
            {"substance_a": "mdma", "substance_b": "cocaine", "risk_level": "high", "mechanism": "Cardiovascular strain and neurotoxicity", "notes": "Both significantly increase heart rate and blood pressure."},
            {"substance_a": "mdma", "substance_b": "amphetamine", "risk_level": "high", "mechanism": "Increased neurotoxicity and overheating risk", "notes": "Risk of serotonin syndrome and hyperthermia."},
            {"substance_a": "mdma", "substance_b": "methamphetamine", "risk_level": "high", "mechanism": "Extreme cardiovascular stress and neurotoxicity", "notes": "Dangerous strain on heart and brain."},
            {"substance_a": "cocaine", "substance_b": "alcohol", "risk_level": "high", "mechanism": "Forms cocaethylene - increased cardiac toxicity", "notes": "Cocaethylene is more toxic than cocaine alone."},
            {"substance_a": "cocaine", "substance_b": "amphetamine", "risk_level": "high", "mechanism": "Excessive cardiovascular strain", "notes": "Risk of heart attack and stroke."},
            {"substance_a": "cocaine", "substance_b": "mdma", "risk_level": "high", "mechanism": "Compounding stimulant effects", "notes": "Extreme heart and blood pressure elevation."},
            {"substance_a": "ketamine", "substance_b": "alcohol", "risk_level": "high", "mechanism": "Risk of vomiting while unconscious", "notes": "High risk of aspiration and respiratory depression."},
            {"substance_a": "ketamine", "substance_b": "benzos", "risk_level": "high", "mechanism": "Excessive sedation and respiratory depression", "notes": "Dangerous combination increasing blackout risk."},
            {"substance_a": "ketamine", "substance_b": "opioids", "risk_level": "high", "mechanism": "Respiratory depression", "notes": "Risk of unconsciousness and breathing problems."},
            {"substance_a": "dxm", "substance_b": "alcohol", "risk_level": "high", "mechanism": "CNS depression and nausea", "notes": "Increased risk of vomiting and respiratory issues."},
            {"substance_a": "pcp", "substance_b": "alcohol", "risk_level": "high", "mechanism": "Unpredictable effects and respiratory depression", "notes": "Dangerous combination with erratic behavior risk."},
            {"substance_a": "synthetic_cannabinoids", "substance_b": "alcohol", "risk_level": "high", "mechanism": "Unpredictable interactions", "notes": "Synthetic cannabinoids have unpredictable effects."},
            {"substance_a": "mdma", "substance_b": "ssri", "risk_level": "high", "mechanism": "SSRIs reduce MDMA effects but increase neurotoxicity risk", "notes": "May feel underwhelming but brain impact remains."},
            {"substance_a": "tramadol", "substance_b": "alcohol", "risk_level": "high", "mechanism": "Respiratory depression and seizure risk", "notes": "Dangerous combination."},
            {"substance_a": "tramadol", "substance_b": "benzos", "risk_level": "high", "mechanism": "Respiratory depression", "notes": "Significant overdose risk."},
            {"substance_a": "amphetamine", "substance_b": "alcohol", "risk_level": "high", "mechanism": "Masked intoxication", "notes": "Stimulants mask alcohol effects leading to overconsumption."},
            {"substance_a": "methamphetamine", "substance_b": "alcohol", "risk_level": "high", "mechanism": "Masked intoxication and liver stress", "notes": "Dangerous overconsumption risk."},
            
            # Based on TripSit - additional dangerous/high risk
            {"substance_a": "tramadol", "substance_b": "amphetamine", "risk_level": "avoid", "mechanism": "Both increase seizure risk significantly", "notes": "Tramadol and stimulants both lower seizure threshold."},
            {"substance_a": "tramadol", "substance_b": "cocaine", "risk_level": "avoid", "mechanism": "Both increase seizure risk significantly", "notes": "Tramadol and stimulants both lower seizure threshold."},
            {"substance_a": "tramadol", "substance_b": "mdma", "risk_level": "avoid", "mechanism": "Both increase seizure risk significantly", "notes": "Tramadol and stimulants both lower seizure threshold."},
            {"substance_a": "dxm", "substance_b": "ssri", "risk_level": "avoid", "mechanism": "High risk of serotonin syndrome", "notes": "Can be fatal. SSRIs strongly potentiate DXM."},
            {"substance_a": "dxm", "substance_b": "maoi", "risk_level": "avoid", "mechanism": "Severe serotonin syndrome", "notes": "Potentially fatal - avoid completely."},
            {"substance_a": "cocaine", "substance_b": "opioids", "risk_level": "avoid", "mechanism": "Stimulants can mask respiratory depression from opioids", "notes": "When cocaine wears off, dangerous opioid concentration remains."},
            
            # ===== MODERATE RISK =====
            # Cannabis combinations
            {"substance_a": "cannabis", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Enhanced intoxication and nausea", "notes": "Can cause 'greening out' - severe nausea and dizziness."},
            {"substance_a": "lsd", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Intensified psychedelic effects", "notes": "May increase anxiety and confusion - start with low doses."},
            {"substance_a": "mushrooms", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Intensified psychedelic effects", "notes": "Can increase thought loops and anxiety."},
            {"substance_a": "cannabis", "substance_b": "ketamine", "risk_level": "moderate", "mechanism": "Intensified dissociation", "notes": "Can be disorienting and increase nausea."},
            
            # Psychedelic combinations  
            {"substance_a": "lsd", "substance_b": "mushrooms", "risk_level": "moderate", "mechanism": "Cross-tolerance and intensified effects", "notes": "Psychologically intense but not physically dangerous."},
            {"substance_a": "lsd", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Dulled psychedelic experience and nausea", "notes": "Alcohol reduces trip quality."},
            {"substance_a": "mushrooms", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Reduced trip quality and increased nausea", "notes": "Generally not recommended but not highly dangerous."},
            {"substance_a": "lsd", "substance_b": "nitrous", "risk_level": "moderate", "mechanism": "Intensely enhanced psychedelic effects", "notes": "Very intense but brief. Risk of falling - sit down."},
            {"substance_a": "mushrooms", "substance_b": "nitrous", "risk_level": "moderate", "mechanism": "Intensely enhanced psychedelic effects", "notes": "Powerful but brief synergy."},
            {"substance_a": "mdma", "substance_b": "2cb", "risk_level": "moderate", "mechanism": "Combined stimulant and psychedelic effects", "notes": "Intense experience with cardiovascular considerations."},
            
            # Dissociative combinations
            {"substance_a": "ketamine", "substance_b": "nitrous", "risk_level": "moderate", "mechanism": "Profound dissociation", "notes": "Risk of complete dissociation - sit or lie down."},
            {"substance_a": "dxm", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Intensified dissociation and confusion", "notes": "Can increase anxiety and nausea."},
            {"substance_a": "nitrous", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Increased sedation and ataxia", "notes": "Can lead to vomiting and blackouts."},
            
            # Stimulant combinations
            {"substance_a": "caffeine", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Masked intoxication", "notes": "Caffeine can mask alcohol effects leading to overconsumption."},
            {"substance_a": "caffeine", "substance_b": "mdma", "risk_level": "moderate", "mechanism": "Increased cardiovascular strain", "notes": "Adds to heart rate and anxiety."},
            {"substance_a": "mdma", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Cannabis can increase anxiety during comedown", "notes": "Some find helpful, others find anxiety-inducing."},
            {"substance_a": "amphetamine", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Cannabis can increase stimulant-induced anxiety", "notes": "Effects vary by individual."},
            
            # Gabapentinoid combinations
            {"substance_a": "pregabalin", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Enhanced sedation", "notes": "Increased risk of respiratory depression."},
            {"substance_a": "gabapentin", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Enhanced sedation", "notes": "Increased intoxication and blackout risk."},
            
            # ===== LOW RISK =====
            {"substance_a": "cannabis", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Enhanced intoxication and nausea", "notes": "Can cause 'greening out' - severe nausea and dizziness."},
            {"substance_a": "lsd", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Intensified psychedelic effects", "notes": "May increase anxiety and confusion."},
            {"substance_a": "mushrooms", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Intensified psychedelic effects", "notes": "Can increase thought loops and anxiety."},
            {"substance_a": "lsd", "substance_b": "mushrooms", "risk_level": "moderate", "mechanism": "Cross-tolerance and intensified effects", "notes": "Psychologically intense but not physically dangerous."},
            {"substance_a": "lsd", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Dulled psychedelic experience", "notes": "Alcohol can reduce trip intensity and increase nausea."},
            {"substance_a": "mushrooms", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Reduced trip quality and increased nausea", "notes": "Generally not recommended but not highly dangerous."},
            {"substance_a": "mdma", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Cannabis can increase anxiety during comedown", "notes": "Some find it helpful, others find it anxiety-inducing."},
            {"substance_a": "ketamine", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Intensified dissociation", "notes": "Can be disorienting and increase nausea."},
            {"substance_a": "nitrous", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Enhanced dissociation", "notes": "Can be disorienting - use while seated."},
            {"substance_a": "lsd", "substance_b": "nitrous", "risk_level": "moderate", "mechanism": "Intensely enhanced psychedelic effects", "notes": "Very intense but brief. Risk of falling."},
            {"substance_a": "mushrooms", "substance_b": "nitrous", "risk_level": "moderate", "mechanism": "Intensely enhanced psychedelic effects", "notes": "Powerful but brief synergy."},
            {"substance_a": "mdma", "substance_b": "2cb", "risk_level": "moderate", "mechanism": "Combined stimulant and psychedelic effects", "notes": "Intense experience with cardiovascular considerations."},
            {"substance_a": "lsd", "substance_b": "2cb", "risk_level": "moderate", "mechanism": "Cross-tolerance and intensified visuals", "notes": "Psychologically intense."},
            {"substance_a": "ketamine", "substance_b": "nitrous", "risk_level": "moderate", "mechanism": "Profound dissociation", "notes": "Risk of complete dissociation - sit or lie down."},
            {"substance_a": "dxm", "substance_b": "cannabis", "risk_level": "moderate", "mechanism": "Intensified dissociation and confusion", "notes": "Can increase anxiety and nausea."},
            {"substance_a": "caffeine", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Masked intoxication", "notes": "Caffeine can mask alcohol effects leading to overconsumption."},
            {"substance_a": "caffeine", "substance_b": "mdma", "risk_level": "moderate", "mechanism": "Increased cardiovascular strain", "notes": "Adds to heart rate and anxiety."},
            {"substance_a": "pregabalin", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Enhanced sedation", "notes": "Increased risk of respiratory depression."},
            {"substance_a": "gabapentin", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Enhanced sedation", "notes": "Increased intoxication and blackout risk."},
            {"substance_a": "dph", "substance_b": "alcohol", "risk_level": "moderate", "mechanism": "Enhanced sedation and confusion", "notes": "Uncomfortable combination."},
            
            # ===== LOW RISK =====
            {"substance_a": "lsd", "substance_b": "ketamine", "risk_level": "low", "mechanism": "Minimal dangerous interaction", "notes": "Psychologically intense but not physically dangerous. Can be very disorienting."},
            {"substance_a": "mushrooms", "substance_b": "ketamine", "risk_level": "low", "mechanism": "Minimal dangerous interaction", "notes": "Intense dissociative psychedelic experience."},
            {"substance_a": "lsd", "substance_b": "mdma", "risk_level": "low", "mechanism": "Enhanced empathogenic and psychedelic effects", "notes": "Popular combination ('candyflip') but intense. Stay hydrated."},
            {"substance_a": "mushrooms", "substance_b": "mdma", "risk_level": "low", "mechanism": "Enhanced effects", "notes": "Intense experience - 'hippy flip'. Stay hydrated."},
            {"substance_a": "cannabis", "substance_b": "mushrooms", "risk_level": "low", "mechanism": "Intensified effects", "notes": "Can increase anxiety in some - start with small amounts of cannabis."},
            {"substance_a": "cannabis", "substance_b": "lsd", "risk_level": "low", "mechanism": "Intensified psychedelic effects", "notes": "Can trigger anxiety or paranoia in some users."},
            {"substance_a": "lsd", "substance_b": "dmt", "risk_level": "low", "mechanism": "Cross-tolerance", "notes": "DMT experience may be less intense if LSD is already active."},
            {"substance_a": "mushrooms", "substance_b": "dmt", "risk_level": "low", "mechanism": "Cross-tolerance", "notes": "Both tryptamines - some cross-tolerance."},
            {"substance_a": "cannabis", "substance_b": "caffeine", "risk_level": "low", "mechanism": "Minimal interaction", "notes": "Generally safe but may increase anxiety in some."},
            {"substance_a": "lsd", "substance_b": "mescaline", "risk_level": "low", "mechanism": "Cross-tolerance", "notes": "Both psychedelics - tolerance overlap."},
            {"substance_a": "kratom", "substance_b": "cannabis", "risk_level": "low", "mechanism": "Minimal interaction", "notes": "Generally well tolerated combination."},
            {"substance_a": "nitrous", "substance_b": "mdma", "risk_level": "low", "mechanism": "Brief enhanced effects", "notes": "Popular combination but very brief."},
            {"substance_a": "poppers", "substance_b": "cannabis", "risk_level": "low", "mechanism": "Minimal interaction", "notes": "Can cause dizziness - sit down."},
        ]
        await db.interactions.insert_many(interactions)
        
        # Seed harm reduction advice
        harm_advice = [
            {"context": "both", "advice": "Stay hydrated with water, but don't overdo it - sip regularly."},
            {"context": "both", "advice": "Avoid mixing with additional substances."},
            {"context": "both", "advice": "Stay with trusted people who can help if needed."},
            {"context": "both", "advice": "Start with lower doses when combining substances."},
            {"context": "planning", "advice": "Test your substances if possible using a test kit."},
            {"context": "planning", "advice": "Plan for a safe environment and have emergency contacts ready."},
            {"context": "already_taken", "advice": "Avoid redosing - wait to see the full effects."},
            {"context": "already_taken", "advice": "Monitor your breathing and heart rate."},
            {"context": "already_taken", "advice": "Find a cool, comfortable place to rest if feeling overwhelmed."}
        ]
        await db.harm_advice.insert_many(harm_advice)
        
        # Seed symptoms
        symptoms = [
            {
                "name": "Chest pain or pressure",
                "severity": "emergency",
                "description": "Severe chest pain, tightness, or pressure",
                "action": "Seek immediate medical attention"
            },
            {
                "name": "Difficulty breathing",
                "severity": "emergency",
                "description": "Struggling to breathe, gasping, or very slow breathing",
                "action": "Call emergency services immediately"
            },
            {
                "name": "Loss of consciousness",
                "severity": "emergency",
                "description": "Unable to wake person or keep them awake",
                "action": "Call emergency services and place in recovery position"
            },
            {
                "name": "Seizures",
                "severity": "emergency",
                "description": "Uncontrolled shaking or convulsions",
                "action": "Protect from injury and call emergency services"
            },
            {
                "name": "Severe confusion or agitation",
                "severity": "serious",
                "description": "Extreme confusion, paranoia, or aggressive behavior",
                "action": "Move to calm environment; seek medical help if worsening"
            },
            {
                "name": "Overheating",
                "severity": "serious",
                "description": "Very hot skin, confusion, rapid heartbeat",
                "action": "Cool down immediately with water and air; seek medical attention"
            },
            {
                "name": "Severe nausea or vomiting",
                "severity": "monitor",
                "description": "Persistent vomiting or inability to keep fluids down",
                "action": "Rest, sip water slowly; seek help if continues for hours"
            }
        ]
        await db.symptoms.insert_many(symptoms)
        
        return {"message": "Database seeded successfully", "counts": {
            "substances": len(substances),
            "interactions": len(interactions),
            "harm_advice": len(harm_advice),
            "symptoms": len(symptoms)
        }}
    except Exception as e:
        logger.error(f"Seed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
