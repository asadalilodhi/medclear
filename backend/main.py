# pyrefly: ignore [missing-import]
import os
# pyrefly: ignore [missing-import]
import json
# pyrefly: ignore [missing-import]
import base64
# pyrefly: ignore [missing-import]
import re
# pyrefly: ignore [missing-import]
import urllib.request
# pyrefly: ignore [missing-import]
import urllib.parse
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
# pyrefly: ignore [missing-import]
from typing import Optional, List
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from openai import OpenAI
# pyrefly: ignore [missing-import]
from supabase import create_client, Client

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

aiml_api_key = os.getenv("AIML_API_KEY")
client = OpenAI(
    api_key=aiml_api_key,
    base_url="https://api.aimlapi.com/v1",
    timeout=180.0
)

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise RuntimeError("Supabase keys not found in .env")

supabase: Client = create_client(supabase_url, supabase_key)

VISION_MODEL = "gpt-4o-mini"
CHAT_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

def scrape_hospital_policy(hospital_name: str):
    print(f"Scraping official policy for {hospital_name} using DuckDuckGo + Jina + LLM...")
    
    try:
        import urllib.request
        import urllib.parse
        
        # 1. Search DDG via Jina
        query = urllib.parse.quote(f"{hospital_name} official financial assistance policy")
        req = urllib.request.Request(f"https://r.jina.ai/https://html.duckduckgo.com/html/?q={query}", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as response:
            ddg_markdown = response.read().decode()
            
        # 2. Extract best URL using LLM
        prompt = f"Here are the search results for the financial assistance policy of '{hospital_name}'.\n\n{ddg_markdown[:8000]}\n\nExtract the single most likely official hospital URL that contains the actual financial assistance policy. Look for the raw domain name in the markdown like [www.hospital.org/...] and output ONLY that valid https URL (e.g. https://www.hospital.org/path). Do NOT output a duckduckgo redirect link. If no relevant hospital link is found, output 'NOT_FOUND'."
        
        res = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        url = res.choices[0].message.content.strip()
        
        if not url.startswith("http"):
            print("LLM failed to find a valid URL.")
            return None
            
        print(f"Extracted target URL: {url}")
        
        # 3. Scrape target URL via Jina
        req2 = urllib.request.Request(f"https://r.jina.ai/{url}", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req2) as response2:
            policy_markdown = response2.read().decode()
            
        if "financial" not in policy_markdown.lower() and "assistance" not in policy_markdown.lower():
            print("Page lacks financial assistance content.")
            return None
            
        print("URL verified successfully!")
        
        supabase.table("hospital_policies").insert({
            "hospital_name": hospital_name.lower(),
            "policy_text": policy_markdown[:15000],
            "policy_url": url
        }).execute()
        
        return {
            "hospital_name": hospital_name.lower(),
            "policy_text": policy_markdown[:15000],
            "policy_url": url
        }
    except Exception as e:
        print(f"Error checking URL: {e}")
        return None

def run_rag_evaluation(hospital: str, income: float, household: int):
    # 1. Fetch from true Supabase DB
    response = supabase.table("hospital_policies").select("*").ilike("hospital_name", f"%{hospital.lower()}%").execute()
    data = response.data
    
    policy = None
    if not data:
        # Hospital not found, trigger autonomous scrape!
        policy = scrape_hospital_policy(hospital)
        if not policy:
            return {"error": True, "message": f"I couldn't find or automatically scrape the official policy for '{hospital}'. Please verify the hospital name."}
    else:
        policy = data[0]
    
    # 2. Calculate FPL
    base_fpl = 15960
    per_person = 5680
    fpl_100 = base_fpl + (per_person * (household - 1))
    fpl_percentage = (income / fpl_100) * 100
    
    # 3. Prompt RAG model requiring exact quote
    prompt = f"""
    You are a strict, mathematically precise financial assistance evaluator.
    Hospital Policy Context: {policy['policy_text']}
    Patient FPL Percentage: {fpl_percentage}%
    
    You MUST output a JSON object with:
    - eligible (boolean)
    - exact_quote (string): An EXACT, word-for-word substring from the policy text that proves this determination. If the policy text appears to be a spam site, 404 page, or irrelevant, output an empty string "".
    - determination (string): A compassionate, extremely user-friendly explanation of what they qualify for. Write this as if you are a warm human talking to a friend. Use an 8th-grade reading level. Avoid dense, bureaucratic, or overly formal language. Be direct and comforting. (If the policy text is irrelevant, explain that we couldn't find the official rules).
    """
    
    try:
        res = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        raw_content = res.choices[0].message.content.strip()
        if raw_content.startswith("```json"):
            raw_content = raw_content[7:]
        elif raw_content.startswith("```"):
            raw_content = raw_content[3:]
        if raw_content.endswith("```"):
            raw_content = raw_content[:-3]
            
        try:
            result = json.loads(raw_content.strip())
        except Exception as e:
            print(f"JSON Parse Error: {e} | Raw Content: {raw_content}")
            return {"error": True, "message": "The system encountered an error parsing the official policy evaluation. Please restart the session and try again."}
        
        # 4. STRUCTURAL HALLUCINATION CHECK
        quote = result.get("exact_quote", "")
        
        if quote:
            # Normalize whitespace and punctuation for a robust substring check
            import re
            def normalize(t):
                # Replace whitespace clusters with single space, remove punctuation, lower case
                t = re.sub(r'\s+', ' ', t)
                t = re.sub(r'[^\w\s]', '', t)
                return t.lower().strip()
                
            norm_quote = normalize(quote)
            norm_policy = normalize(policy['policy_text'])
            
            if norm_quote not in norm_policy:
                print(f"HALLUCINATION BLOCKED: Quote '{quote}' not found in policy.")
                return {
                    "error": True,
                    "message": f"SECURITY ALERT: The AI generated a response that could not be structurally verified against the official policy text. To ensure your safety and prevent hallucination, this evaluation was blocked.\n\n**Diagnostics:**\n- **Hospital:** {hospital}\n- **Policy URL:** {policy['policy_url']}\n- **Attempted Quote:** \"{quote}\"",
                    "url": policy['policy_url']
                }
            
        return {
            "error": False,
            "eligible": result.get("eligible"),
            "determination": result.get("determination"),
            "quote": quote,
            "fpl": round(fpl_percentage, 1),
            "url": policy['policy_url']
        }
    except Exception as e:
        print(f"Eval Error: {e}")
        return {"error": True, "message": "Evaluation processing failed."}


@app.post("/api/chat")
@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    system_prompt = """You are MedClear, a compassionate, highly secure medical financial navigator. 
Your goal is to gather the following from the user in a gentle, conversational way:
1. Hospital Name
2. Total Medical Bill Balance
3. Annual Gross Income
4. Household Size
4. Any edge cases (disability, retirement, dependents)

Only ask 1 or 2 questions at a time. Keep it conversational and supportive.
If the user uploads a bill, the system will inject the extracted data. Acknowledge it.

AT THE END OF EVERY SINGLE MESSAGE, you MUST append a JSON block tracking the current state of variables you know. Use null if unknown. Format EXACTLY like this:
<STATE>{"hospital": "Mayo", "balance": 1500, "income": 35000, "household": null}</STATE>

Once you have ALL pieces of information gathered, instead of <STATE>, you MUST append a JSON block EXACTLY like this (and nothing else after it):
<EVALUATE>{"hospital": "Mayo Clinic", "income": 35000, "household": 1}</EVALUATE>
CRITICAL: Do NOT output <EVALUATE> if income or household are null, 'unknown', or missing. You MUST wait until you have actual numerical values.
"""
    
    msgs = [{"role": "system", "content": system_prompt}]
    for m in req.messages:
        msgs.append({"role": m.role, "content": m.content})
        
    try:
        res = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=msgs,
            temperature=0.4
        )
        reply = res.choices[0].message.content
        
        # Check for EVALUATE trigger
        trigger_match = re.search(r'<EVALUATE>(.*?)</EVALUATE>', reply, re.DOTALL)
        
        # Check for STATE tracking
        state_match = re.search(r'<STATE>(.*?)</STATE>', reply, re.DOTALL)
        
        evaluation_result = None
        current_state = {}
        
        if trigger_match:
            try:
                params = json.loads(trigger_match.group(1))
                income = params.get('income')
                household = params.get('household')
                hospital = params.get('hospital', '')
                
                # If LLM prematurely triggers EVALUATE without valid numbers, downgrade it to a STATE update
                if income is None or household is None or str(income).lower() == 'unknown' or str(household).lower() == 'unknown':
                    current_state = {"hospital": hospital, "balance": params.get('balance'), "income": income, "household": household}
                    reply = reply.replace(trigger_match.group(0), "").strip()
                    trigger_match = None # Nullify trigger so it doesn't evaluate
                else:
                    reply = reply.replace(trigger_match.group(0), "").strip()
                    current_state = {"hospital": hospital, "balance": params.get('balance'), "income": income, "household": household}
                    
                    # Check if hospital is in DB
                    db_check = supabase.table("hospital_policies").select("id").ilike("hospital_name", f"%{hospital.lower()}%").execute()
                    
                    try:
                        clean_income = float(income)
                        clean_household = int(household)
                        
                        if not db_check.data:
                            # Not in DB -> notify frontend to trigger scrape
                            return {
                                "reply": reply,
                                "state": current_state,
                                "trigger_scrape": True,
                                "eval_params": {
                                    "hospital": hospital,
                                    "income": clean_income,
                                    "household": clean_household
                                }
                            }
                        else:
                            # In DB -> evaluate immediately
                            evaluation_result = run_rag_evaluation(hospital, clean_income, clean_household)
                    except (ValueError, TypeError):
                        evaluation_result = {"error": True, "message": "Invalid numerical values provided for income or household size."}
            except Exception as e:
                print(f"Trigger parse error: {e}")
        
        if not trigger_match and state_match:
            try:
                current_state = json.loads(state_match.group(1))
                reply = reply.replace(state_match.group(0), "").strip()
            except Exception as e:
                print(f"State parse error: {e}")
                
        return {
            "reply": reply,
            "evaluation": evaluation_result,
            "state": current_state
        }
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to communicate with AI agent.")


class EvaluateRequest(BaseModel):
    hospital: str
    income: float
    household: int

@app.post("/api/evaluate")
@app.post("/evaluate")
def evaluate_endpoint(req: EvaluateRequest):
    try:
        result = run_rag_evaluation(req.hospital, req.income, req.household)
        return {"evaluation": result}
    except Exception as e:
        print(f"Eval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate")


@app.post("/api/extract-bill")
@app.post("/extract-bill")
async def extract_bill(file: UploadFile = File(...)):
    messages = [
        {
            "role": "system",
            "content": "You extract medical billing info. Return ONLY JSON with keys: hospitalName, totalAmount. If missing, set null."
        }
    ]
    
    try:
        file_bytes = await file.read()
        base64_image = base64.b64encode(file_bytes).decode('utf-8')
        mime_type = file.content_type
        
        messages.append({
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime_type};base64,{base64_image}"
                    }
                }
            ]
        })

        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.0
        )
        
        extracted = json.loads(response.choices[0].message.content)
        return {"extracted_data": extracted}
    except Exception as e:
        print(f"Extraction error: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract data via Vision API")

@app.get("/api/policies")
@app.get("/policies")
def get_policies():
    try:
        res = supabase.table("hospital_policies").select("id, hospital_name, policy_url").execute()
        return {"policies": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
