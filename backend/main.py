import os
import json
import base64
import re
import urllib.request
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

VISION_MODEL = "Qwen/Qwen2.5-VL-72B-Instruct"
CHAT_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

def scrape_hospital_policy(hospital_name: str):
    print(f"Scraping official policy for {hospital_name} using Smart Self-Healing Scraper...")
    
    previous_urls = []
    
    for attempt in range(3): # Max 3 LLM attempts
        try:
            prompt = f"Return ONLY the exact URL for the official financial assistance policy of {hospital_name}. Do not include any other text, markdown, or explanation. Start with https://"
            if previous_urls:
                prompt += f"\\n\\nWARNING: The following URLs are 404 dead links or do not contain financial assistance data. Do NOT return these:\\n" + "\\n".join(previous_urls)
                
            res = client.chat.completions.create(
                model=CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3 + (attempt * 0.2) # Increase temp slightly on retries to force different URLs
            )
            url = res.choices[0].message.content.strip()
            
            if not url.startswith("http"):
                continue
                
            print(f" [Attempt {attempt+1}] AI proposed URL: {url}")
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            req = urllib.request.Request(f"https://r.jina.ai/{url}", headers=headers)
            with urllib.request.urlopen(req) as response:
                markdown_text = response.read().decode()
                
            # Verify it's not a soft 404
            lower_text = markdown_text[:1000].lower()
            if "404" in lower_text and "not found" in lower_text:
                print(" -> Soft 404 detected. Forcing AI retry.")
                previous_urls.append(url)
                continue
                
            # Verify it actually contains hospital/financial terms
            if "financial" not in markdown_text.lower() and "assistance" not in markdown_text.lower():
                print(" -> Page lacks financial assistance content. Forcing AI retry.")
                previous_urls.append(url)
                continue
                
            print(" -> URL verified successfully!")
                
            # Save to Supabase
            supabase.table("hospital_policies").insert({
                "hospital_name": hospital_name.lower(),
                "policy_text": markdown_text[:15000],
                "policy_url": url
            }).execute()
            
            return {
                "hospital_name": hospital_name.lower(),
                "policy_text": markdown_text[:15000],
                "policy_url": url
            }
        except Exception as e:
            print(f" -> Error checking URL: {e}")
            previous_urls.append(url)
            
    print(f"Failed to securely scrape policy for {hospital_name} after 3 attempts.")
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
    - exact_quote (string): An EXACT, word-for-word substring from the policy text that proves this determination. Do not alter a single character.
    - determination (string): A compassionate explanation of what they qualify for.
    """
    
    try:
        res = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        result = json.loads(res.choices[0].message.content)
        
        # 4. STRUCTURAL HALLUCINATION CHECK
        quote = result.get("exact_quote", "")
        # Remove whitespace for a more robust check, but strictly check presence
        # For strictness as requested, we do a pure substring check.
        if quote and quote not in policy['policy_text']:
            print(f"HALLUCINATION BLOCKED: Quote '{quote}' not found in policy.")
            return {
                "error": True,
                "message": "SECURITY ALERT: The AI generated a response that could not be structurally verified against the official policy text. To ensure your safety and prevent hallucination, this evaluation was blocked.",
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
def chat_endpoint(req: ChatRequest):
    system_prompt = """You are MedClear, a compassionate, highly secure medical financial navigator. 
Your goal is to gather the following from the user in a gentle, conversational way:
1. Hospital Name
2. Annual Gross Income
3. Household Size
4. Any edge cases (disability, retirement, dependents)

Only ask 1 or 2 questions at a time. Keep it conversational and supportive.
If the user uploads a bill, the system will inject the extracted data. Acknowledge it.

AT THE END OF EVERY SINGLE MESSAGE, you MUST append a JSON block tracking the current state of variables you know. Use null if unknown. Format EXACTLY like this:
<STATE>{"hospital": "Mayo", "income": 35000, "household": null}</STATE>

Once you have ALL pieces of information gathered, instead of <STATE>, you MUST append a JSON block EXACTLY like this (and nothing else after it):
<EVALUATE>{"hospital": "Mayo Clinic", "income": 35000, "household": 1}</EVALUATE>
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
                reply = reply.replace(trigger_match.group(0), "").strip()
                evaluation_result = run_rag_evaluation(params.get('hospital', ''), params.get('income', 0), params.get('household', 1))
                current_state = {"hospital": params.get('hospital'), "income": params.get('income'), "household": params.get('household')}
            except Exception as e:
                print(f"Trigger parse error: {e}")
        elif state_match:
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


@app.post("/api/extract-bill")
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
def get_policies():
    try:
        res = supabase.table("hospital_policies").select("id, hospital_name, policy_url").execute()
        return {"policies": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
