import requests
from decouple import config
import json

def suggest_post_time(platform, industry, target_audience):
    api_key = config('GEMINI_API_KEY', default='')
    if not api_key or 'your-gemini' in api_key:
        api_key = config('ANTHROPIC_API_KEY', default='')
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    prompt = f"""
    You are an expert social media data analyst. Based on current trends and the following context:
    - Platform: {platform}
    - Industry: {industry}
    - Target Audience: {target_audience}
    
    Suggest the most optimal posting times and predict the engagement score (0-100).
    
    Return ONLY a valid JSON object with the following structure:
    {{
      "suggested_times": ["Monday 9AM", "Wednesday 6PM"],
      "predicted_engagement": 78,
      "reasoning": "Reason here..."
    }}
    """
    
    try:
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.4,
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
            "suggested_times": ["Tuesday 10AM", "Thursday 4PM"],
            "predicted_engagement": 65,
            "reasoning": "Fallback reasoning: This is generally a good time across industries."
        }
