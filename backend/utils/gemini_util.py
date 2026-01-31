import google.generativeai as genai
import os
import json
import requests
import base64
import logging

logger = logging.getLogger(__name__)

# 1. PRESERVED YOUR API KEY NAME
genai.configure(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))

def verify_document_with_gemini(file_url: str, template_requirements: str):
    """
    Analyzes a document (Image or PDF) and returns a structured classification result.
    Downloads the file from the URL and converts to Base64 for Gemini.
    """
    
    # 2. PRESERVED YOUR MODEL NAME
    # Note: If this errors with "404 Not Found", it means Google hasn't released 
    # 'gemini-2.5-pro' to your account yet. You might need 'gemini-1.5-pro' instead.
    model = genai.GenerativeModel('gemini-2.5-pro') 

    try:
        logger.info(f"🤖 AI Analysis starting for: {file_url}")

        # --- LOGIC FIX START ---
        
        # 3. DOWNLOAD THE FILE (Crucial Step)
        # Gemini cannot visit the URL itself. Python must fetch the file first.
        doc_response = requests.get(file_url)
        if doc_response.status_code != 200:
            return {
                "ai_prediction_label": 0, 
                "ai_confidence_score": 0.0, 
                "reason": f"Failed to download file (Status {doc_response.status_code})"
            }
            
        # 4. DETECT MIME TYPE AUTOMATICALLY
        # We need to tell Gemini if it's reading a PDF or an Image.
        content_type = doc_response.headers.get('Content-Type', '').lower()
        
        if 'pdf' in content_type:
            mime_type = "application/pdf"
        elif 'png' in content_type:
            mime_type = "image/png"
        elif 'jpeg' in content_type or 'jpg' in content_type:
            mime_type = "image/jpeg"
        else:
            # Fallback based on extension if headers fail
            if file_url.lower().endswith(".pdf"):
                mime_type = "application/pdf"
            else:
                mime_type = "image/jpeg"

        logger.info(f"📂 Detected MIME Type: {mime_type}")

        # 5. CONVERT TO BASE64
        # This fixes the "400 Unable to process input" error.
        doc_data = base64.b64encode(doc_response.content).decode('utf-8')
        
        # --- LOGIC FIX END ---

        # STRICT PROMPT
        prompt = f"""
        Act as a strict Document Verification Officer. Compare the User Document against this requirement: "{template_requirements}".

        STEP 1: ANALYZE VISUAL EVIDENCE.
        - Check for specific headers, logos, and text clarity.
        - Check for signs of forgery or wrong document type.

        STEP 2: CALCULATE CONFIDENCE SCORE (0.0 to 1.0).
        - 0.90 - 1.00: Perfect Match. Clear text, correct headers.
        - 0.70 - 0.89: Good Match. Minor blur but legible.
        - 0.40 - 0.69: Ambiguous. Hard to read or missing some headers.
        - 0.00 - 0.39: Reject. Wrong document, blank, or completely unreadable.

        STEP 3: DETERMINE FINAL LABEL.
        - If Score >= 0.70 -> 1 (Verified)
        - If Score < 0.70  -> 0 (Rejected)

        RETURN JSON ONLY:
        {{
            "ai_prediction_label": 0 or 1,
            "ai_confidence_score": float,
            "reason": "Short explanation for the admin."
        }}
        """

        # 6. SEND REQUEST WITH BASE64 DATA
        response = model.generate_content([
            prompt, 
            {"mime_type": mime_type, "data": doc_data}
        ])
        
        # Clean response
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(clean_text)
        
        return result
        
    except Exception as e:
        logger.error(f"Gemini Error: {e}")
        return {"ai_prediction_label": 0, "ai_confidence_score": 0.0, "reason": f"AI Error: {str(e)}"}