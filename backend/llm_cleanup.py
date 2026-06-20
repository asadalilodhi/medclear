import os
import time
from openai import OpenAI
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
client = OpenAI(api_key=os.environ.get("AIML_API_KEY"), base_url="https://api.aimlapi.com/v1", timeout=60.0)

res = supabase.table("hospital_policies").select("id, hospital_name, policy_text").execute()
hospitals = res.data

print(f"Verifying {len(hospitals)} hospitals with AI...")

deleted = 0
for h in hospitals:
    text_snippet = h["policy_text"][:2000]
    prompt = f"""
    You are an AI auditor. Read the following markdown scraped from a hospital website.
    Is this actually a Financial Assistance Policy, or is it an Error/404/Page Not Found/Stub page?
    If it is a valid policy or contains valid policy information, reply exactly 'YES_VALID'.
    If it is an error page, 404, 'page not found', 'unavailable', or lacks any actual policy details, reply exactly 'NO_INVALID'.
    
    TEXT:
    {text_snippet}
    """
    
    try:
        completion = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        answer = completion.choices[0].message.content.strip().upper()
        
        if "NO_INVALID" in answer:
            print(f"[DELETE] AI flagged as invalid: {h['hospital_name']}")
            supabase.table("hospital_policies").delete().eq("id", h["id"]).execute()
            deleted += 1
        else:
            print(f"[KEEP] Verified: {h['hospital_name']}")
            
        time.sleep(1) # rate limit
    except Exception as e:
        print(f"Error checking {h['hospital_name']}: {e}")

print(f"\nFinished AI Verification. Deleted {deleted} fake/404 hospitals.")
