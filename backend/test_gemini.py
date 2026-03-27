import requests  # type: ignore[import]  # pyre-ignore[21]
from decouple import config  # type: ignore[import]  # pyre-ignore[21]
import json

def test_gemini():
    api_key = config('GEMINI_API_KEY', default='')
    print(f"Testing with key starting with: {api_key[:10]}...")
    
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{"text": "Say 'Gemini is fully operational!' if you can hear me."}]
        }]
    }
    
    try:
        response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        result = response.json()
        text = result['candidates'][0]['content']['parts'][0]['text']
        print(f"Response: {text}")
        return True
    except requests.HTTPError as e:
        print(f"Gemini Test Failed (HTTP {e.response.status_code}): {e}")
        print(f"Response body: {e.response.text}")
        return False
    except Exception as e:
        print(f"Gemini Test Failed: {e}")
        return False

if __name__ == "__main__":
    test_gemini()
