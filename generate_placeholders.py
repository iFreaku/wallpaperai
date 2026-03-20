import os
import requests
import json
from urllib.parse import quote_plus
import re, random

# Load presets data
with open('assets/presets.json', 'r') as f:
    presets_data = json.load(f)

# Base API URL
BASE_URL = "https://gen.pollinations.ai/image/"

# Parameters
WIDTH = 400
HEIGHT = 400
MODEL = "zimage"
SAFE_MODE = "true"
ENHANCE = "true"
NEGATIVE_PROMPT = "low quality, blurry, jpeg artifacts, overexposed, underexposed, watermark, logo, text, signature"

def sanitize_filename(name):
    """Remove invalid characters from filename"""
    # Replace spaces and special characters with underscores
    filename = re.sub(r'[^\w\-_\.]', '_', name)
    # Remove consecutive underscores
    filename = re.sub(r'_+', '_', filename)
    # Remove leading/trailing underscores
    filename = filename.strip('_')
    return filename.lower()



def generate_image(prompt, filename, api_key="pk_ebCkCGPi8nHcaQLZ"):
    """Generate image using Pollinations API and save it"""
    # Encode the prompt
    encoded_prompt = quote_plus(prompt)
    encoded_negative = quote_plus(NEGATIVE_PROMPT)
    
    # Build the URL
    url = f"{BASE_URL}{encoded_prompt}?model={MODEL}&width={WIDTH}&height={HEIGHT}&safe={SAFE_MODE}&enhance={ENHANCE}&seed={random.randint(0, 999999)}&negative_prompt={encoded_negative}&key={api_key}"
    
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            # Save the image
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"Saved: {filename}")
            return True
        else:
            print(f"Failed to generate {filename}: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"Error generating {filename}: {str(e)}")
        return False

# def main():
    # print("Starting placeholder image generation...")
    
    # # Process all subjects
    # print("\nProcessing all subjects...")
    # subjects_dir = "assets/presets/subjects"
    # os.makedirs(subjects_dir, exist_ok=True)
    
    # for subject in presets_data['presets']['subjects']:
    #     subject_name = subject['name'].replace(" ", "")
    #     prompt = f"{subject['name']}, wallpaper, photograph"
        
    #     # Sanitize filename
    #     safe_name = sanitize_filename(subject_name)
    #     filename = f"{subjects_dir}/{safe_name}.jpg"
    #     generate_image(prompt, filename)
    
    # Process all styles
    # print("\nProcessing all styles...")
    # styles_dir = "assets/presets/styles"
    # os.makedirs(styles_dir, exist_ok=True)
    
    # for style in presets_data['presets']['styles']:
    #     style_name = style['name'].replace(" ", "")
    #     prompt = f"{style['name']} style wallpaper, photograph"
        
    #     # Sanitize filename
    #     safe_name = sanitize_filename(style_name)
    #     filename = f"{styles_dir}/{safe_name}.jpg"
    #     generate_image(prompt, filename)
    
    # print("\nAll placeholder generation complete!")
    # 
    
# if __name__ == "__main__":



filename = f"assets/presets/styles/graphic.jpg"
generate_image("Flower reimagined as Vector Graphics Style, wallpaper", filename)
    