import requests
from decouple import config
import json

def generate_social_content(business_name, industry, content_type, tone, target_audience, key_message):
    api_key = config('GEMINI_API_KEY', default='')
    if not api_key or 'your-gemini' in api_key:
        api_key = config('ANTHROPIC_API_KEY', default='')
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    prompt = f"""
    Please generate social media marketing content based on the following context:
    - Business Name: {business_name}
    - Industry/Niche: {industry}
    - Content Type: {content_type}
    - Tone: {tone}
    - Target Audience: {target_audience}
    - Key Message: {key_message}
    
    Return ONLY a valid JSON object with the following structure:
    {{
      "content": "The generated post text/caption",
      "hashtags": ["#tag1", "#tag2"],
      "best_time": "Suggested best posting time, e.g. Tuesday 6PM - 9PM",
      "engagement_score": 85,
      "tips": ["Tip 1", "Tip 2"]
    }}
    """
    
    try:
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000,
                "response_mime_type": "application/json"
            }
        }
        
        response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        
        result = response.json()
        text_output = result['candidates'][0]['content']['parts'][0]['text']
        
        return json.loads(text_output)
        
    except Exception as e:
        print(f"Agent error: {e}")
        return {
            "content": f"Check out {business_name}! We provide the best in {industry}. {key_message}",
            "hashtags": ["#SmallBusiness", f"#{industry.replace(' ', '')}"],
            "best_time": "Wednesday 12PM",
            "engagement_score": 75,
            "tips": ["Add a clear call to action.", "Use high-quality images."]
        }
