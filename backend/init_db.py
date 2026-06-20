import os
# pyrefly: ignore [missing-import]
import psycopg2
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.environ.get("SUPABASE_DB_URL")

if not DB_URL:
    print("Error: SUPABASE_DB_URL is not set.")
    exit(1)

HOSPITALS = [
    {
        "name": "johns hopkins",
        "text": "Johns Hopkins Medicine Financial Assistance Policy: Patients with household income at or below 200% of the Federal Poverty Level (FPL) are eligible for 100% charity care (full write-off). Patients with income between 201% and 300% FPL may qualify for sliding scale discounts. Assets are also reviewed.",
        "url": "https://www.hopkinsmedicine.org/patient_care/patients-visitors/billing-insurance/financial-assistance"
    },
    {
        "name": "mayo clinic",
        "text": "Mayo Clinic Financial Assistance Policy: Mayo Clinic provides full charity care for patients whose household income is at or below 200% of the Federal Poverty Level (FPL). Partial financial assistance (discounts) may be available for patients with incomes between 201% and 400% of the FPL.",
        "url": "https://www.mayoclinic.org/patient-visitor-guide/billing-insurance/financial-assistance"
    }
]

def init_db():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    # Create table
    print("Creating hospital_policies table...")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS hospital_policies (
            id SERIAL PRIMARY KEY,
            hospital_name TEXT UNIQUE NOT NULL,
            policy_text TEXT NOT NULL,
            policy_url TEXT NOT NULL
        );
    """)
    
    # Insert data
    print("Inserting data...")
    for h in HOSPITALS:
        cur.execute("""
            INSERT INTO hospital_policies (hospital_name, policy_text, policy_url)
            VALUES (%s, %s, %s)
            ON CONFLICT (hospital_name) DO UPDATE 
            SET policy_text = EXCLUDED.policy_text, policy_url = EXCLUDED.policy_url;
        """, (h['name'].lower(), h['text'], h['url']))
        
    conn.commit()
    cur.close()
    conn.close()
    print("Database initialization complete.")

if __name__ == "__main__":
    init_db()
