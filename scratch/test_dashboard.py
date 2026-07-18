import urllib.request
import json
import uuid

BASE_URL = "http://localhost:8000/api"

def run_test():
    # 1. Register
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    data = {"email": email, "password": "password123", "full_name": "Dash User", "role": "customer"}
    req = urllib.request.Request(f"{BASE_URL}/auth/register", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            print("Register OK")
    except Exception as e:
        print("Register failed", e)
        return

    # 2. Login
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=json.dumps({"username": email, "password": "password123"}).encode('utf-8'), headers={'Content-Type': 'application/json'}, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            token = json.loads(response.read().decode('utf-8'))['access_token']
            print("Login OK")
    except Exception as e:
        print("Login failed", e)
        return

    # 3. Get Dashboard
    req = urllib.request.Request(f"{BASE_URL}/auth/me/dashboard", headers={'Authorization': f'Bearer {token}'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            print("Dashboard OK:", res)
    except Exception as e:
        print("Dashboard failed", e)

if __name__ == "__main__":
    run_test()
