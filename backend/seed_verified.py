import os
import urllib.request
# pyrefly: ignore [missing-import]
from supabase import create_client
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

HOSPITALS = [
    ("Mayo Clinic", "https://www.mayoclinic.org/documents/charity-care-policy/doc-20079439"),
    ("Cleveland Clinic", "https://my.clevelandclinic.org/patients/billing-finance/financial-assistance"),
    ("Johns Hopkins Hospital", "https://www.hopkinsmedicine.org/patient-care/patients-visitors/billing-insurance/financial-assistance"),
    ("Stanford Health Care", "https://stanfordhealthcare.org/content/dam/SHC/patientsandvisitors/billing/docs/2024/shc-financial-assistance-plain-language-summary-7-2-2024-english.pdf"),
    ("Ucsf Medical Center", "https://www.ucsfbenioffchildrens.org/-/media/project/ucsf/ucsf-bch/pdf/financial-pdfs/financial_assistance_application.pdf")
]

print("Wiping old 404 policies...")
supabase.table("hospital_policies").delete().neq("hospital_name", "dummy").execute()

print("Inserting verified policies...")
for name, url in HOSPITALS:
    print(f"Scraping {name} from verified URL...")
    try:
        req = urllib.request.Request(f"https://r.jina.ai/{url}", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as response:
            text = response.read().decode('utf-8', errors='ignore')
            
        supabase.table("hospital_policies").insert({
            "hospital_name": name.lower(),
            "policy_text": text[:15000],
            "policy_url": url
        }).execute()
        print(f" -> Success: {name}")
    except Exception as e:
        print(f" -> Error: {e}")
