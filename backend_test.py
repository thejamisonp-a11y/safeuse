#!/usr/bin/env python3
"""
SAFEUSE Backend API Testing Suite
Tests all critical endpoints for the harm reduction drug interaction checker
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any

# Backend URL from environment
BACKEND_URL = "https://safeuse-live.preview.emergentagent.com/api"

class SafeuseAPITester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    def log_result(self, test_name: str, passed: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_time": f"{response_time:.3f}s" if response_time > 0 else "N/A"
        }
        self.results.append(result)
        print(f"{status} - {test_name}")
        if details:
            print(f"    Details: {details}")
        if response_time > 0:
            print(f"    Response time: {response_time:.3f}s")
        print()

    def test_root_endpoint(self):
        """Test GET /api/ - Root endpoint"""
        try:
            start_time = time.time()
            response = requests.get(f"{BACKEND_URL}/", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if "SAFEUSE API" in data.get("message", ""):
                    self.log_result("Root Endpoint", True, f"Message: {data['message']}", response_time)
                else:
                    self.log_result("Root Endpoint", False, f"Unexpected message: {data}", response_time)
            else:
                self.log_result("Root Endpoint", False, f"Status: {response.status_code}, Response: {response.text}", response_time)
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Exception: {str(e)}")

    def test_seed_data(self):
        """Test POST /api/seed-data - Database seeding"""
        try:
            start_time = time.time()
            response = requests.post(f"{BACKEND_URL}/seed-data", timeout=30)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                counts = data.get("counts", {})
                expected_counts = {
                    "substances": 33,
                    "interactions": 75,
                    "harm_advice": 9,
                    "symptoms": 7
                }
                
                all_correct = True
                details = []
                for key, expected in expected_counts.items():
                    actual = counts.get(key, 0)
                    if actual == expected:
                        details.append(f"{key}: {actual} ✓")
                    else:
                        details.append(f"{key}: {actual} (expected {expected}) ✗")
                        all_correct = False
                
                self.log_result("Database Seeding", all_correct, "; ".join(details), response_time)
            else:
                self.log_result("Database Seeding", False, f"Status: {response.status_code}, Response: {response.text}", response_time)
        except Exception as e:
            self.log_result("Database Seeding", False, f"Exception: {str(e)}")

    def test_get_substances(self):
        """Test GET /api/substances - Get all substances"""
        try:
            start_time = time.time()
            response = requests.get(f"{BACKEND_URL}/substances", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                substances = response.json()
                if len(substances) == 33:
                    # Check structure of first substance
                    if substances:
                        first_substance = substances[0]
                        required_fields = ["id", "name", "drug_class", "common_names"]
                        has_all_fields = all(field in first_substance for field in required_fields)
                        
                        if has_all_fields:
                            self.log_result("Get Substances", True, f"Found {len(substances)} substances with correct structure", response_time)
                        else:
                            missing = [f for f in required_fields if f not in first_substance]
                            self.log_result("Get Substances", False, f"Missing fields: {missing}", response_time)
                    else:
                        self.log_result("Get Substances", False, "Empty substances list", response_time)
                else:
                    self.log_result("Get Substances", False, f"Expected 33 substances, got {len(substances)}", response_time)
            else:
                self.log_result("Get Substances", False, f"Status: {response.status_code}, Response: {response.text}", response_time)
        except Exception as e:
            self.log_result("Get Substances", False, f"Exception: {str(e)}")

    def test_get_symptoms(self):
        """Test GET /api/symptoms - Get emergency symptoms"""
        try:
            start_time = time.time()
            response = requests.get(f"{BACKEND_URL}/symptoms", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                symptoms = response.json()
                if len(symptoms) == 7:
                    # Check structure
                    if symptoms:
                        first_symptom = symptoms[0]
                        required_fields = ["name", "severity", "description", "action"]
                        has_all_fields = all(field in first_symptom for field in required_fields)
                        
                        if has_all_fields:
                            self.log_result("Get Symptoms", True, f"Found {len(symptoms)} symptoms with correct structure", response_time)
                        else:
                            missing = [f for f in required_fields if f not in first_symptom]
                            self.log_result("Get Symptoms", False, f"Missing fields: {missing}", response_time)
                    else:
                        self.log_result("Get Symptoms", False, "Empty symptoms list", response_time)
                else:
                    self.log_result("Get Symptoms", False, f"Expected 7 symptoms, got {len(symptoms)}", response_time)
            else:
                self.log_result("Get Symptoms", False, f"Status: {response.status_code}, Response: {response.text}", response_time)
        except Exception as e:
            self.log_result("Get Symptoms", False, f"Exception: {str(e)}")

    def test_substance_categories(self):
        """Test GET /api/substance-categories - NEW endpoint for grouped substances"""
        try:
            start_time = time.time()
            response = requests.get(f"{BACKEND_URL}/substance-categories", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                categories = response.json()
                
                # Check if it's an array
                if not isinstance(categories, list):
                    self.log_result("Substance Categories", False, "Response is not an array", response_time)
                    return
                
                # Expected categories
                expected_categories = [
                    "Stimulants", "Empathogens", "Depressants", "Psychedelics", 
                    "Dissociatives", "Cannabinoids", "Antidepressants", 
                    "Opioid-like", "Gabapentinoids", "Other"
                ]
                
                # Check structure and count substances
                total_substances = 0
                found_categories = []
                
                for category in categories:
                    if not isinstance(category, dict):
                        self.log_result("Substance Categories", False, "Category is not an object", response_time)
                        return
                    
                    if "category" not in category or "substances" not in category:
                        self.log_result("Substance Categories", False, "Missing 'category' or 'substances' field", response_time)
                        return
                    
                    found_categories.append(category["category"])
                    
                    if not isinstance(category["substances"], list):
                        self.log_result("Substance Categories", False, f"Substances in {category['category']} is not an array", response_time)
                        return
                    
                    total_substances += len(category["substances"])
                
                # Check if we have the expected categories
                missing_categories = [cat for cat in expected_categories if cat not in found_categories]
                extra_categories = [cat for cat in found_categories if cat not in expected_categories]
                
                # Check total substance count (should be 33)
                if total_substances == 33:
                    substance_count_ok = True
                    substance_details = f"Total substances: {total_substances} ✓"
                else:
                    substance_count_ok = False
                    substance_details = f"Total substances: {total_substances} (expected 33) ✗"
                
                # Overall success
                success = (len(missing_categories) == 0 and 
                          len(extra_categories) == 0 and 
                          substance_count_ok)
                
                details = [substance_details]
                if missing_categories:
                    details.append(f"Missing categories: {missing_categories}")
                if extra_categories:
                    details.append(f"Extra categories: {extra_categories}")
                
                self.log_result("Substance Categories", success, "; ".join(details), response_time)
                
                # Log category breakdown for review
                print(f"    Categories found: {len(found_categories)}")
                for category in categories:
                    print(f"      {category['category']}: {len(category['substances'])} substances")
                
            else:
                self.log_result("Substance Categories", False, f"Status: {response.status_code}, Response: {response.text}", response_time)
        except Exception as e:
            self.log_result("Substance Categories", False, f"Exception: {str(e)}")

    def test_interaction_check(self, test_name: str, substance_ids: List[str], expected_risk: str, already_taken: bool = False):
        """Test POST /api/check - Drug interaction checking"""
        try:
            payload = {
                "substance_ids": substance_ids,
                "already_taken": already_taken
            }
            
            start_time = time.time()
            response = requests.post(f"{BACKEND_URL}/check", json=payload, timeout=15)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["risk_level", "risk_color", "explanation", "harm_advice", "substances"]
                
                # Check all required fields exist
                missing_fields = [f for f in required_fields if f not in data]
                if missing_fields:
                    self.log_result(test_name, False, f"Missing fields: {missing_fields}", response_time)
                    return
                
                # Check risk level matches expected
                actual_risk = data["risk_level"].lower()
                if actual_risk == expected_risk.lower():
                    risk_match = True
                    risk_details = f"Risk: {actual_risk} ✓"
                else:
                    risk_match = False
                    risk_details = f"Risk: {actual_risk} (expected {expected_risk}) ✗"
                
                # Check AI explanation quality
                explanation = data["explanation"]
                has_explanation = len(explanation) > 20 and not explanation.startswith("Unable to generate")
                
                # Check harm advice
                harm_advice = data["harm_advice"]
                has_advice = isinstance(harm_advice, list) and len(harm_advice) > 0
                
                # Check emergency symptoms for high/avoid risk
                emergency_symptoms = data.get("emergency_symptoms")
                if expected_risk.lower() in ["high", "avoid"]:
                    has_emergency_info = emergency_symptoms is not None and len(emergency_symptoms) > 0
                    emergency_details = "Emergency symptoms: ✓" if has_emergency_info else "Emergency symptoms: ✗"
                else:
                    has_emergency_info = True  # Not required for low/moderate
                    emergency_details = "Emergency symptoms: N/A (not required)"
                
                # Overall success
                success = risk_match and has_explanation and has_advice and has_emergency_info
                
                details = f"{risk_details}; AI explanation: {'✓' if has_explanation else '✗'}; Harm advice: {'✓' if has_advice else '✗'}; {emergency_details}"
                
                self.log_result(test_name, success, details, response_time)
                
                # Log AI explanation quality for review
                if has_explanation:
                    print(f"    AI Explanation: {explanation[:100]}...")
                
            else:
                self.log_result(test_name, False, f"Status: {response.status_code}, Response: {response.text}", response_time)
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🧪 SAFEUSE Backend API Testing Suite")
        print("=" * 50)
        print()
        
        # Test 1: Root endpoint
        self.test_root_endpoint()
        
        # Test 2: Database seeding
        self.test_seed_data()
        
        # Test 3: Get substances
        self.test_get_substances()
        
        # Test 4: Get symptoms  
        self.test_get_symptoms()
        
        # Test 5: NEW - Substance Categories
        self.test_substance_categories()
        
        # Test 6-10: Interaction checks with different risk levels
        print("🔍 Testing Drug Interaction Checks:")
        print("-" * 30)
        
        # LOW risk: LSD + Ketamine
        self.test_interaction_check("LOW Risk: LSD + Ketamine", ["lsd", "ketamine"], "low")
        
        # MODERATE risk: Cannabis + Alcohol
        self.test_interaction_check("MODERATE Risk: Cannabis + Alcohol", ["cannabis", "alcohol"], "moderate")
        
        # HIGH risk: MDMA + Alcohol
        self.test_interaction_check("HIGH Risk: MDMA + Alcohol", ["mdma", "alcohol"], "high")
        
        # AVOID risk: Alcohol + Benzodiazepines
        self.test_interaction_check("AVOID Risk: Alcohol + Benzos", ["alcohol", "benzos"], "avoid")
        
        # Test "already_taken" mode
        self.test_interaction_check("Already Taken: MDMA + Alcohol", ["mdma", "alcohol"], "high", already_taken=True)
        
        # Edge cases
        print("🔍 Testing Edge Cases:")
        print("-" * 20)
        
        # Single substance
        self.test_interaction_check("Single Substance: MDMA", ["mdma"], "unknown")
        
        # Three substances
        self.test_interaction_check("Three Substances: LSD + MDMA + Cannabis", ["lsd", "mdma", "cannabis"], "moderate")
        
        # Unknown combination
        self.test_interaction_check("Unknown Combination: LSD + Caffeine", ["lsd", "caffeine"], "unknown")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests} ✅")
        print(f"Failed: {self.failed_tests} ❌")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        print()
        
        if self.failed_tests > 0:
            print("❌ FAILED TESTS:")
            print("-" * 20)
            for result in self.results:
                if "❌" in result["status"]:
                    print(f"• {result['test']}: {result['details']}")
            print()
        
        print("✅ PASSED TESTS:")
        print("-" * 20)
        for result in self.results:
            if "✅" in result["status"]:
                print(f"• {result['test']}")
        
        return self.failed_tests == 0

if __name__ == "__main__":
    tester = SafeuseAPITester()
    tester.run_all_tests()
    success = tester.print_summary()
    
    if success:
        print("\n🎉 All tests passed! Backend is working correctly.")
        sys.exit(0)
    else:
        print(f"\n⚠️  {tester.failed_tests} test(s) failed. Check the details above.")
        sys.exit(1)