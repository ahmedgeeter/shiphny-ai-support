import urllib.request
import json
import sys

# Force utf-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000/api"

def login():
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=json.dumps({"username": "admin@shiphny.com", "password": "admin123"}).encode('utf-8'), headers={'Content-Type': 'application/json'}, method="POST")
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8')).get("access_token")

def chat(token):
    req = urllib.request.Request(f"{BASE_URL}/chat", data=json.dumps({"message": "اخبرني عن العميل Tonya Johnson", "session_id": "999", "language": "ar"}).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            print(json.loads(response.read().decode('utf-8')))
    except urllib.error.HTTPError as e:
        print("Chat Failed HTTPError", e.code, e.read().decode('utf-8'))

if __name__ == "__main__":
    token = login()
    chat(token)
