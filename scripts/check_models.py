# check_models.py
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("Available Gemini Models:\n")
print("-" * 60)

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"\n✓ {model.name}")
        print(f"  Display Name: {model.display_name}")
        print(f"  Description: {model.description}")
        print(f"  Input Token Limit: {model.input_token_limit:,}")
        print(f"  Output Token Limit: {model.output_token_limit:,}")