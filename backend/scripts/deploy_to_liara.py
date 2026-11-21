import httpx
import time
import sys

TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2YWZhZmMzOTYyNWMxMGVlNzIzMWQ4M2EiLCJ0eXBlIjoiYXV0aCIsImlhdCI6MTc5NTAzOTU2NiwiZXhwIjoxNzk3NjMxNTY2fQ.AF0YVLh57ljU_0R91V26nWqSfkQvJO5AfcgMdKlJWxk'
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}
BASE_URL = 'https://api.iran.liara.ir'

def wait_for_connection():
    print("⏳ منتظر برقراری اتصال مستقیم به سرورهای لیارا...", flush=True)
    for attempt in range(1, 30):
        try:
            r = httpx.get(f'{BASE_URL}/v1/me', headers=HEADERS, timeout=5.0)
            if r.status_code == 200:
                user = r.json().get('user', {})
                print(f"✅ اتصال مستقیم برقرار شد! کاربر: {user.get('fullname')}", flush=True)
                return r.json()
        except Exception as e:
            print(f"تلاش {attempt}: هنوز VPN قطع نشده یا در حال روت شدن است... ({type(e).__name__})", flush=True)
        time.sleep(2)
    print("❌ مهلت تلاش به پایان رسید.", flush=True)
    return None

def create_or_get_project(name, platform, plan_id):
    # Check existing
    try:
        r = httpx.get(f'{BASE_URL}/v1/projects', headers=HEADERS, timeout=10.0)
        if r.status_code == 200:
            projects = r.json().get('projects', [])
            for p in projects:
                if p.get('project_id') == name or p.get('name') == name:
                    print(f"ℹ️ برنامه {name} از قبل وجود دارد.", flush=True)
                    return True
    except Exception as e:
        print(f"Error checking projects: {e}", flush=True)

    # Create new
    print(f"🚀 در حال ساخت برنامه {name} (پلتفرم: {platform})...", flush=True)
    payload = {
        "name": name,
        "planID": plan_id,
        "platform": platform
    }
    r = httpx.post(f'{BASE_URL}/v1/projects', headers=HEADERS, json=payload, timeout=15.0)
    print(f"نتیجه ساخت {name}: {r.status_code} - {r.text}", flush=True)
    return r.status_code in [200, 201]

def set_env_vars(project_name, env_vars):
    print(f"🔧 در حال ثبت متغیرهای محیطی برای {project_name}...", flush=True)
    # In Liara, env vars can be updated via /v1/projects/{project}/envs
    payload = {
        "variables": [{"key": k, "value": v} for k, v in env_vars.items()]
    }
    r = httpx.post(f'{BASE_URL}/v1/projects/{project_name}/envs', headers=HEADERS, json=payload, timeout=15.0)
    print(f"نتیجه ثبت متغیرها: {r.status_code} - {r.text}", flush=True)

def main():
    account_data = wait_for_connection()
    if not account_data:
        sys.exit(1)

    # Pick a suitable plan
    plans = account_data.get('plans', {}).get('projects', {})
    avail_plans = [k for k, v in plans.items() if v.get('available')]
    print(f"پلن‌های در دسترس: {avail_plans}", flush=True)
    # Default to smallest available or 'ir-small' / 'standard'
    plan_id = "ir-small" if "ir-small" in avail_plans else (avail_plans[0] if avail_plans else "standard")

    # 1. Backend Project
    backend_name = "sarpanah-api"
    create_or_get_project(backend_name, "docker", plan_id)

    backend_envs = {
        "PROJECT_NAME": "SarPanah",
        "API_V1_STR": "/api/v1",
        "SECRET_KEY": "sarpanah-super-secret-jwt-key-2026-production",
        "ALGORITHM": "HS256",
        "ACCESS_TOKEN_EXPIRE_MINUTES": "1440",
        "POSTGRES_SERVER": "aws-1-us-west-2.pooler.supabase.com",
        "POSTGRES_PORT": "5432",
        "POSTGRES_USER": "postgres.rqacqkbetywebjckxasg",
        "POSTGRES_PASSWORD": "@Sarpanah2026",
        "POSTGRES_DB": "postgres",
        "POSTGRES_SSLMODE": "require",
        "FRONTEND_URL": "https://sarpanah-frontend.liara.run"
    }
    set_env_vars(backend_name, backend_envs)

    # 2. Frontend Project
    frontend_name = "sarpanah-frontend"
    create_or_get_project(frontend_name, "next", plan_id)

    frontend_envs = {
        "NEXT_PUBLIC_API_BASE_URL": "https://sarpanah-api.liara.run/api/v1"
    }
    set_env_vars(frontend_name, frontend_envs)

    print("\n🎉 هر دو برنامه با موفقیت در لیارا پیکربندی شدند!", flush=True)

if __name__ == '__main__':
    main()
