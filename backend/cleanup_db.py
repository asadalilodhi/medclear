import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

res = supabase.table("hospital_policies").select("id, hospital_name, policy_text").execute()
hospitals = res.data

deleted = 0
for h in hospitals:
    text_len = len(h["policy_text"])
    if text_len < 2500:
        print(f"Deleting bad hospital (too short: {text_len} chars): {h['hospital_name']}")
        supabase.table("hospital_policies").delete().eq("id", h["id"]).execute()
        deleted += 1

print(f"Deleted {deleted} fake/404/stub hospitals from the DB.")
