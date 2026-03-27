import requests
import json

def list_models():
    api_key = "AIzaSyDrOcqdwb0lzxb72gGoCELnFSpzO36N0o4"
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        models = response.json()
        with open('models_output.json', 'w') as f:
            json.dump(models, f, indent=2)
        print("Models saved to models_output.json")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_models()
