# pyrefly: ignore [missing-import]
import os
# pyrefly: ignore [missing-import]
import time
# pyrefly: ignore [missing-import]
import urllib.request
# pyrefly: ignore [missing-import]
import httpx
# pyrefly: ignore [missing-import]
from openai import OpenAI
# pyrefly: ignore [missing-import]
from supabase import create_client
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
client = OpenAI(api_key=os.environ.get("AIML_API_KEY"), base_url="https://api.aimlapi.com/v1", timeout=60.0)
CHAT_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo"

def get_hospitals_batch(offset):
    prompt = f"List {50} major US hospital systems or medical centers (batch starting at index {offset}). Return ONLY a python list of strings, e.g. ['Hospital A', 'Hospital B']."
    try:
        res = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        content = res.choices[0].message.content.strip()
        # Parse list safely
        start = content.find('[')
        end = content.rfind(']') + 1
        if start != -1 and end != -1:
            return eval(content[start:end])
        return []
    except Exception as e:
        print(f"Error getting batch: {e}")
        return []

def scrape_hospital_smart(hospital_name: str):
    print(f"\\nScraping: {hospital_name}")
    
    # Check if already exists
    existing = supabase.table("hospital_policies").select("id").eq("hospital_name", hospital_name.lower()).execute()
    if existing.data:
        print(" -> Already in DB, skipping.")
        return True
        
    previous_urls = []
    
    for attempt in range(3):
        try:
            from duckduckgo_search import DDGS
            results = DDGS().text(f"{hospital_name} financial assistance policy", max_results=3)
            if not results:
                print("  -> Search returned no results.")
                break
            
            # Find the first valid new URL
            url = None
            for r in results:
                href = r.get('href', '')
                if href not in previous_urls and href.startswith("http"):
                    url = href
                    break
            
            if not url:
                print("  -> Search returned no new/valid URLs.")
                break
                
            print(f"  [Attempt {attempt+1}] Found URL via DDGS Search: {url}")
            
            if not url.startswith("http"):
                continue
                
            print(f"  [Attempt {attempt+1}] Checking URL: {url}")
            headers = {"User-Agent": "Mozilla/5.0"}
            try:
                with httpx.Client(timeout=httpx.Timeout(30.0)) as h_client:
                    response = h_client.get(f"https://r.jina.ai/{url}", headers=headers, follow_redirects=True)
                    markdown_text = response.text
            except httpx.TimeoutException:
                print("  -> httpx Timeout!")
                previous_urls.append(url)
                continue
            except httpx.RequestError as e:
                print(f"  -> httpx Error: {e}")
                previous_urls.append(url)
                continue
                
            lower_text = markdown_text[:1000].lower()
            bad_phrases = ["page not found", "error 404", "404 error", "doesn't exist", "does not exist", "can't be reached", "cannot be reached", "access denied", "whoops", "ooops"]
            if any(p in lower_text for p in bad_phrases) or ("404" in lower_text and "not found" in lower_text):
                print("  -> Soft 404 or Error Page detected.")
                previous_urls.append(url)
                continue
                
            if "financial" not in markdown_text.lower() and "assistance" not in markdown_text.lower() and "charity" not in markdown_text.lower():
                print("  -> Lacks financial assistance content.")
                previous_urls.append(url)
                continue
                
            if len(markdown_text) < 2000:
                print(f"  -> Page content too short ({len(markdown_text)} chars). Likely a 404 stub or blocked page.")
                previous_urls.append(url)
                continue

            print("  -> Running AI Verification...")
            verify_prompt = f"You are an AI auditor. Read the following markdown scraped from a hospital website.\\nIs this actually a Financial Assistance Policy, or is it an Error/404/Page Not Found/Stub page?\\nIf it is a valid policy or contains valid policy information, reply exactly 'YES_VALID'.\\nIf it is an error page, 404, 'page not found', 'unavailable', or lacks any actual policy details, reply exactly 'NO_INVALID'.\\n\\nTEXT:\\n{markdown_text[:2500]}"
            v_res = client.chat.completions.create(model=CHAT_MODEL, messages=[{"role": "user", "content": verify_prompt}], temperature=0.0)
            if "NO_INVALID" in v_res.choices[0].message.content.upper():
                print("  -> AI rejected this page as a stub/error.")
                previous_urls.append(url)
                continue

            print("  -> URL verified! Inserting into DB.")
            supabase.table("hospital_policies").insert({
                "hospital_name": hospital_name.lower(),
                "policy_text": markdown_text[:15000],
                "policy_url": url
            }).execute()
            return True
            
        except Exception as e:
            print(f"  -> Error: {e}")
            previous_urls.append(url)
            time.sleep(2) # rate limit protection
            
    print(" -> Failed after 3 attempts.")
    return False

def run_bulk_scraper():
    print("Starting Massive 500-Hospital Background Scraper...")
    total_scraped = 0
    target = 500
    
    for offset in range(0, target, 50):
        hospitals = get_hospitals_batch(offset)
        print(f"\\n=== Fetched Batch {offset} to {offset+50} ===")
        
        for h in hospitals:
            success = scrape_hospital_smart(h)
            if success:
                total_scraped += 1
            time.sleep(1) # delay between hospitals to avoid LLM rate limits
            
    print(f"\nFinished! Successfully scraped {total_scraped} hospitals out of {target}.")

if __name__ == "__main__":
    while True:
        try:
            print("Starting/Restarting Bulk Scraper...")
            run_bulk_scraper()
            print("Finished successfully!")
            break
        except Exception as e:
            print(f"Scraper crashed with error: {e}")
            print("Sleeping for 5 seconds and restarting...")
            import time
            time.sleep(5)
