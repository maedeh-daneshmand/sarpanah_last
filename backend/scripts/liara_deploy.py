import httpx
import json

TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2YWZhZmMzOTYyNWMxMGVlNzIzMWQ4M2EiLCJ0eXBlIjoiYXV0aCIsImlhdCI6MTc5NTAzOTU2NiwiZXhwIjoxNzk3NjMxNTY2fQ.AF0YVLh57ljU_0R91V26nWqSfkQvJO5AfcgMdKlJWxk'
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}
BASE_URL = 'https://api.iran.liara.ir'

def check_account():
    with httpx.Client(timeout=25.0) as client:
        r = client.get(f'{BASE_URL}/v1/me', headers=HEADERS)
        data = r.json()
        user = data.get('user', {})
        print(f"User: {user.get('fullname')} ({user.get('email')})")
        plans = data.get('plans', {}).get('projects', {})
        print("\nAvailable plans:")
        for k, v in plans.items():
            if v.get('available'):
                print(f" - {k}: RAM={v.get('ram')}, CPU={v.get('cpu')}, Price={v.get('displayPrice')} Tomans/mo")

if __name__ == '__main__':
    check_account()
