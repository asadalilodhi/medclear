import os
import json
import time
import urllib.request
import urllib.parse
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    print("Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

from openai import OpenAI

aiml_api_key = os.environ.get("AIML_API_KEY")
client = OpenAI(api_key=aiml_api_key, base_url="https://api.aimlapi.com/v1")

TOP_HOSPITALS = [
    "Mayo Clinic",
    "Cleveland Clinic",
    "Johns Hopkins Hospital",
    "Stanford Health Care",
    "UCSF Medical Center"
]

def scrape_hospital(hospital_name: str):
    print(f"\nScraping: {hospital_name}")
    try:
        # Check if already exists
        existing = supabase.table("hospital_policies").select("id").ilike("hospital_name", f"%{hospital_name.lower()}%").execute()
        if existing.data:
            print(f" -> Already in database. Skipping.")
            return

        res = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=[{"role": "user", "content": f"Return ONLY the exact URL for the official financial assistance policy of {hospital_name}. Do not include any other text. Start with https://"}],
            temperature=0.0
        )
        url = res.choices[0].message.content.strip()
        print(f" -> Found URL: {url}")
        if not url.startswith("http"):
            return

        req = urllib.request.Request(f"https://r.jina.ai/{url}", headers={"User-Agent": "Mozilla/5.0"})
        
        with urllib.request.urlopen(req) as response:
            markdown_text = response.read().decode()
            
        if not markdown_text:
            print(" -> Empty content.")
            return
            
        print(f" -> Success! Inserted {len(markdown_text)} bytes")
        
        supabase.table("hospital_policies").insert({
            "hospital_name": hospital_name.lower(),
            "policy_text": markdown_text[:15000],
            "policy_url": url
        }).execute()
        
    except Exception as e:
        print(f" -> Error: {e}")

if __name__ == "__main__":
    print("Starting Bulk Scraper...")
    for hospital in TOP_HOSPITALS:
        scrape_hospital(hospital)
        time.sleep(2)
    print("\nBulk Scrape Complete!")
