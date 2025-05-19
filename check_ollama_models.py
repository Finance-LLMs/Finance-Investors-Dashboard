import requests
import json

try:
    # Try to get the list of available models from Ollama
    response = requests.get("http://localhost:11434/api/tags", timeout=5)
    
    if response.status_code == 200:
        data = response.json()
        print("Available models in Ollama:")
        for model in data.get('models', []):
            print(f" - {model.get('name')}")
        
        # Check if the model we need is available
        models = [model.get('name') for model in data.get('models', [])]
        if 'deepseek-r1' in models or any(name.startswith('deepseek-r1') for name in models):
            print("\nThe deepseek-r1 model is available.")
        else:
            print("\nThe deepseek-r1 model is NOT available.")
            print("You need to pull it using: ollama pull deepseek-r1")
    else:
        print(f"Error connecting to Ollama API: HTTP {response.status_code}")
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("Connection error: Ollama server is not running.")
    print("Please start Ollama by running 'ollama serve' in a terminal.")
except Exception as e:
    print(f"Error checking Ollama models: {str(e)}")
