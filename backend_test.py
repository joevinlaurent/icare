#!/usr/bin/env python3
"""
Backend API Test Suite for iCare Application
Tests all backend endpoints including authentication, user preferences, and time tracking
"""

import requests
import json
import os
from datetime import datetime, timedelta
import uuid

# Get backend URL from environment
BACKEND_URL = "https://icareclone.preview.emergentagent.com/api"

class iCareAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
        self.test_user_password = "SecurePassword123!"
        self.test_user_name = "Marie Dubois"
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def make_request(self, method, endpoint, data=None, headers=None, auth_required=False):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if required
        if auth_required:
            if headers is None:
                headers = {}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None
    
    def test_health_check(self):
        """Test GET /api/ - Health check endpoint"""
        print("\n=== Testing Health Check ===")
        
        response = self.make_request("GET", "/")
        
        if response is None:
            self.log_test("Health Check", False, "Request failed - no response")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "message" in data and "version" in data:
                    self.log_test("Health Check", True, f"API is running - {data['message']}", data)
                    return True
                else:
                    self.log_test("Health Check", False, "Response missing required fields", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Health Check", False, "Invalid JSON response", response.text)
                return False
        else:
            self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_user_registration(self):
        """Test POST /api/auth/register - User registration"""
        print("\n=== Testing User Registration ===")
        
        user_data = {
            "name": self.test_user_name,
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        response = self.make_request("POST", "/auth/register", data=user_data)
        
        if response is None:
            self.log_test("User Registration", False, "Request failed - no response")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("token") and data.get("user"):
                    self.auth_token = data["token"]
                    user = data["user"]
                    self.log_test("User Registration", True, 
                                f"User registered successfully - ID: {user.get('id')}", data)
                    return True
                else:
                    self.log_test("User Registration", False, 
                                f"Registration failed: {data.get('message', 'Unknown error')}", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("User Registration", False, "Invalid JSON response", response.text)
                return False
        else:
            self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_user_login(self):
        """Test POST /api/auth/login - User login"""
        print("\n=== Testing User Login ===")
        
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        response = self.make_request("POST", "/auth/login", data=login_data)
        
        if response is None:
            self.log_test("User Login", False, "Request failed - no response")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and data.get("token") and data.get("user"):
                    self.auth_token = data["token"]  # Update token
                    user = data["user"]
                    self.log_test("User Login", True, 
                                f"Login successful - User: {user.get('name')}", data)
                    return True
                else:
                    self.log_test("User Login", False, 
                                f"Login failed: {data.get('message', 'Unknown error')}", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("User Login", False, "Invalid JSON response", response.text)
                return False
        else:
            self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_get_current_user(self):
        """Test GET /api/auth/me - Get current user"""
        print("\n=== Testing Get Current User ===")
        
        if not self.auth_token:
            self.log_test("Get Current User", False, "No auth token available")
            return False
        
        response = self.make_request("GET", "/auth/me", auth_required=True)
        
        if response is None:
            self.log_test("Get Current User", False, "Request failed - no response")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("id") and data.get("email") == self.test_user_email:
                    self.log_test("Get Current User", True, 
                                f"User info retrieved - Name: {data.get('name')}", data)
                    return True
                else:
                    self.log_test("Get Current User", False, "Invalid user data returned", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Get Current User", False, "Invalid JSON response", response.text)
                return False
        else:
            self.log_test("Get Current User", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_get_user_preferences(self):
        """Test GET /api/user/preferences - Get user preferences"""
        print("\n=== Testing Get User Preferences ===")
        
        if not self.auth_token:
            self.log_test("Get User Preferences", False, "No auth token available")
            return False
        
        response = self.make_request("GET", "/user/preferences", auth_required=True)
        
        if response is None:
            self.log_test("Get User Preferences", False, "Request failed - no response")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                required_fields = ["hide_reels", "hide_stories", "hide_suggestions", "lock_mode"]
                if all(field in data for field in required_fields):
                    self.log_test("Get User Preferences", True, 
                                f"Preferences retrieved - Hide reels: {data.get('hide_reels')}", data)
                    return True
                else:
                    self.log_test("Get User Preferences", False, "Missing required preference fields", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Get User Preferences", False, "Invalid JSON response", response.text)
                return False
        else:
            self.log_test("Get User Preferences", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_update_user_preferences(self):
        """Test PUT /api/user/preferences - Update user preferences"""
        print("\n=== Testing Update User Preferences ===")
        
        if not self.auth_token:
            self.log_test("Update User Preferences", False, "No auth token available")
            return False
        
        preferences_data = {
            "hide_reels": False,
            "hide_stories": True,
            "hide_suggestions": False,
            "lock_mode": False
        }
        
        response = self.make_request("PUT", "/user/preferences", data=preferences_data, auth_required=True)
        
        if response is None:
            self.log_test("Update User Preferences", False, "Request failed - no response")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if (data.get("hide_reels") == False and 
                    data.get("hide_stories") == True and 
                    data.get("hide_suggestions") == False):
                    self.log_test("Update User Preferences", True, 
                                "Preferences updated successfully", data)
                    return True
                else:
                    self.log_test("Update User Preferences", False, "Preferences not updated correctly", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Update User Preferences", False, "Invalid JSON response", response.text)
                return False
        else:
            self.log_test("Update User Preferences", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_add_time_saved(self):
        """Test POST /api/user/time-saved - Add time saved"""
        print("\n=== Testing Add Time Saved ===")
        
        if not self.auth_token:
            self.log_test("Add Time Saved", False, "No auth token available")
            return False
        
        time_data = {
            "minutes": 15,
            "platform": "instagram"
        }
        
        response = self.make_request("POST", "/user/time-saved", data=time_data, auth_required=True)
        
        if response is None:
            self.log_test("Add Time Saved", False, "Request failed - no response")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "total_time_saved" in data:
                    total_time = data["total_time_saved"]
                    self.log_test("Add Time Saved", True, 
                                f"Time saved added - Total: {total_time} minutes", data)
                    return True
                else:
                    self.log_test("Add Time Saved", False, "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Add Time Saved", False, "Invalid JSON response", response.text)
                return False
        else:
            self.log_test("Add Time Saved", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_get_user_stats(self):
        """Test GET /api/user/stats - Get user statistics"""
        print("\n=== Testing Get User Stats ===")
        
        if not self.auth_token:
            self.log_test("Get User Stats", False, "No auth token available")
            return False
        
        response = self.make_request("GET", "/user/stats", auth_required=True)
        
        if response is None:
            self.log_test("Get User Stats", False, "Request failed - no response")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                required_fields = ["time_saved", "sessions_count", "weekly_time_saved", "total_sessions"]
                if all(field in data for field in required_fields):
                    self.log_test("Get User Stats", True, 
                                f"Stats retrieved - Time saved: {data.get('time_saved')} min", data)
                    return True
                else:
                    self.log_test("Get User Stats", False, "Missing required stats fields", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Get User Stats", False, "Invalid JSON response", response.text)
                return False
        else:
            self.log_test("Get User Stats", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        print("\n=== Testing Unauthorized Access ===")
        
        # Test 1: No Authorization header
        try:
            response = requests.get(f"{self.base_url}/auth/me", timeout=10)
            if response.status_code in [401, 403]:
                self.log_test("Unauthorized Access (No Header)", True, 
                            f"Correctly rejected request without auth header - HTTP {response.status_code}")
                success1 = True
            else:
                self.log_test("Unauthorized Access (No Header)", False, 
                            f"Should have returned 401/403, got {response.status_code}")
                success1 = False
        except Exception as e:
            self.log_test("Unauthorized Access (No Header)", False, f"Request failed: {e}")
            success1 = False
        
        # Test 2: Invalid token
        try:
            headers = {"Authorization": "Bearer invalid_token_12345"}
            response = requests.get(f"{self.base_url}/auth/me", headers=headers, timeout=10)
            if response.status_code == 401:
                self.log_test("Unauthorized Access (Invalid Token)", True, 
                            "Correctly rejected request with invalid token")
                success2 = True
            else:
                self.log_test("Unauthorized Access (Invalid Token)", False, 
                            f"Should have returned 401, got {response.status_code}")
                success2 = False
        except Exception as e:
            self.log_test("Unauthorized Access (Invalid Token)", False, f"Request failed: {e}")
            success2 = False
        
        return success1 and success2
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        print("\n=== Testing Invalid Login ===")
        
        invalid_login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        response = self.make_request("POST", "/auth/login", data=invalid_login_data)
        
        if response is None:
            self.log_test("Invalid Login", False, "Request failed - no response")
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if not data.get("success") and data.get("message"):
                    self.log_test("Invalid Login", True, 
                                f"Correctly rejected invalid login: {data.get('message')}", data)
                    return True
                else:
                    self.log_test("Invalid Login", False, "Should have rejected invalid credentials", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Invalid Login", False, "Invalid JSON response", response.text)
                return False
        else:
            self.log_test("Invalid Login", False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting iCare API Tests")
        print(f"Backend URL: {self.base_url}")
        print(f"Test User: {self.test_user_email}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_user_registration,
            self.test_user_login,
            self.test_get_current_user,
            self.test_get_user_preferences,
            self.test_update_user_preferences,
            self.test_add_time_saved,
            self.test_get_user_stats,
            self.test_unauthorized_access,
            self.test_invalid_login
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Exception occurred - {str(e)}")
                self.log_test(test.__name__, False, f"Exception: {str(e)}")
                failed += 1
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed, failed, self.test_results

def main():
    """Main test execution"""
    tester = iCareAPITester()
    passed, failed, results = tester.run_all_tests()
    
    # Save detailed results to file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "passed": passed,
                "failed": failed,
                "total": passed + failed,
                "success_rate": (passed/(passed+failed)*100) if (passed+failed) > 0 else 0
            },
            "results": results,
            "timestamp": datetime.now().isoformat()
        }, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    
    # Return exit code based on test results
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit(main())