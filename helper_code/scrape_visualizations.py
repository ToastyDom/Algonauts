import os
import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import requests
from tqdm import tqdm
import base64


"""
Codabench Visualization Scraper (from Claude)

This script automatically downloads and combines all visualizations from Codabench competition 
submission results pages. It handles the React-based interface and iframe-embedded content 
that standard web scraping tools cannot access.

WHAT IT DOES:
- Reads a leaderboard JSON file to get user IDs
- Uses Selenium to navigate to each user's detailed results page
- Switches into iframes to access the actual visualization content
- Downloads all charts/plots (images, SVGs, canvas elements) 
- Stacks them vertically into a single combined image per user
- Saves as username_visualization.jpg

REQUIREMENTS:
pip install selenium webdriver-manager pillow tqdm requests

SETUP:
1. Ensure you have Chrome browser installed
2. Update the session_id variable with your Codabench session cookie (check dev tools/storage/cookies tab)
3. Place your leaderboard.json file in the same directory
4. Run the script

The script will create a 'visualizations/' folder with combined images for each user.
Note: Set headless=False in setup_driver() to see the browser in action (useful for debugging).
"""

def setup_driver(headless=True):
    """Setup Chrome driver with appropriate options"""
    options = Options()
    if headless:
        options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    
    # Use webdriver-manager to automatically download and manage ChromeDriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

def login_to_codabench(driver, session_id):
    """Add session cookie to maintain authentication"""
    driver.get("https://www.codabench.org")
    driver.add_cookie({
        'name': 'sessionid',
        'value': session_id,
        'domain': '.codabench.org'
    })
    driver.refresh()

def inspect_page_structure(driver):
    """Inspect the page to find all possible image-related elements"""
    print("🔍 Inspecting page structure...")
    
    # Find all images
    all_imgs = driver.find_elements(By.TAG_NAME, "img")
    print(f"Found {len(all_imgs)} img tags")
    
    for idx, img in enumerate(all_imgs[:10]):  # Limit to first 10
        try:
            src = img.get_attribute("src")
            alt = img.get_attribute("alt") or "No alt"
            classes = img.get_attribute("class") or "No classes"
            print(f"  IMG {idx}: alt='{alt}', classes='{classes}', src='{src[:100] if src else 'No src'}...'")
        except:
            continue
    
    # Find all SVGs
    all_svgs = driver.find_elements(By.TAG_NAME, "svg")
    print(f"\nFound {len(all_svgs)} svg elements")
    
    for idx, svg in enumerate(all_svgs[:5]):  # Limit to first 5
        try:
            classes = svg.get_attribute("class") or "No classes"
            print(f"  SVG {idx}: classes='{classes}'")
        except:
            continue
    
    # Find all divs with common visualization-related words
    viz_keywords = ["viz", "visual", "chart", "graph", "plot", "figure", "score", "result"]
    
    for keyword in viz_keywords:
        elements = driver.find_elements(By.CSS_SELECTOR, f"*[class*='{keyword}']")
        if elements:
            print(f"\nFound {len(elements)} elements with '{keyword}' in class:")
            for idx, elem in enumerate(elements[:3]):  # Show first 3
                try:
                    tag = elem.tag_name
                    classes = elem.get_attribute("class") or "No classes"
                    print(f"  {tag.upper()} {idx}: classes='{classes}'")
                except:
                    continue

def extract_visualizations_selenium(driver, user_url, username):
    """Extract visualizations using Selenium"""
    print(f"Loading page: {user_url}")
    driver.get(user_url)
    
    # Wait for page to load and React to render
    try:
        # Wait for either visualization blocks or some other indicator that page is loaded
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Additional wait for React components to render
        time.sleep(5)
        
        # Check for iframes first!
        print("🔍 Looking for iframes...")
        iframes = driver.find_elements(By.TAG_NAME, "iframe")
        print(f"Found {len(iframes)} iframes")
        
        images_with_captions = []
        
        for iframe_idx, iframe in enumerate(iframes):
            try:
                iframe_src = iframe.get_attribute("src")
                print(f"📦 Processing iframe {iframe_idx}: {iframe_src}")
                
                # Switch to the iframe
                driver.switch_to.frame(iframe)
                
                # Wait for iframe content to load
                time.sleep(3)
                
                # Now look for visualizations inside the iframe
                print("🔍 Inspecting iframe content...")
                inspect_page_structure(driver)
                
                # Strategy 1: Find ALL images in iframe
                print("\n📸 Strategy 1: Checking all images in iframe...")
                all_imgs = driver.find_elements(By.TAG_NAME, "img")
                
                for idx, img_elem in enumerate(all_imgs):
                    try:
                        img_src = img_elem.get_attribute("src")
                        img_alt = img_elem.get_attribute("alt") or f"Iframe Image {idx + 1}"
                        
                        # Skip very small images (likely icons)
                        size = img_elem.size
                        if size['width'] < 100 or size['height'] < 100:
                            print(f"Skipping small image: {size['width']}x{size['height']}")
                            continue
                        
                        print(f"Processing iframe image {idx}: {img_alt}, size: {size['width']}x{size['height']}")
                        
                        image = None
                        if img_src and img_src.startswith("data:image"):
                            # Base64 encoded image
                            try:
                                img_data = base64.b64decode(img_src.split(",")[1])
                                image = Image.open(BytesIO(img_data)).convert("RGB")
                            except Exception as e:
                                print(f"Failed to decode base64 image: {e}")
                                continue
                        elif img_src:
                            # URL image - make it absolute if needed
                            if img_src.startswith("/"):
                                # Get the iframe's base URL
                                iframe_base = iframe_src.split("/detailed_results.html")[0] if "/detailed_results.html" in iframe_src else iframe_src.rsplit("/", 1)[0]
                                img_src = iframe_base + img_src
                            elif img_src.startswith("./"):
                                iframe_base = iframe_src.rsplit("/", 1)[0]
                                img_src = iframe_base + "/" + img_src[2:]
                            
                            print(f"Downloading image from: {img_src}")
                            try:
                                img_response = requests.get(img_src, timeout=10)
                                image = Image.open(BytesIO(img_response.content)).convert("RGB")
                            except Exception as e:
                                print(f"Failed to download image {img_src}: {e}")
                                continue
                        
                        if image:
                            # Try to find a meaningful caption nearby
                            caption = img_alt
                            
                            # Look for parent elements that might contain captions
                            try:
                                parent = img_elem.find_element(By.XPATH, "..")
                                parent_text = parent.text.strip()
                                if parent_text and len(parent_text) < 100:
                                    caption = parent_text
                                
                                # Also look for headers or titles near the image
                                nearby_headers = driver.find_elements(By.CSS_SELECTOR, "h1, h2, h3, h4, h5, h6, .title, [class*='title'], [class*='caption']")
                                for header in nearby_headers[:5]:  # Check first 5 headers
                                    header_text = header.text.strip()
                                    if header_text and len(header_text) < 100:
                                        # Use the first meaningful header as caption
                                        caption = header_text
                                        break
                            except:
                                pass
                            
                            images_with_captions.append((caption, image))
                            print(f"✅ Added iframe image: {caption}")
                            
                    except Exception as e:
                        print(f"Error processing iframe image {idx}: {e}")
                        continue
                
                # Strategy 2: Screenshot SVG elements in iframe
                print("\n🎨 Strategy 2: Checking SVG elements in iframe...")
                all_svgs = driver.find_elements(By.TAG_NAME, "svg")
                
                for idx, svg_elem in enumerate(all_svgs):
                    try:
                        size = svg_elem.size
                        if size['width'] < 100 or size['height'] < 100:
                            continue
                        
                        print(f"Processing iframe SVG {idx}, size: {size['width']}x{size['height']}")
                        
                        screenshot = svg_elem.screenshot_as_png
                        image = Image.open(BytesIO(screenshot)).convert("RGB")
                        
                        caption = f"SVG Visualization {idx + 1}"
                        
                        # Try to find caption in parent elements
                        try:
                            parent = svg_elem.find_element(By.XPATH, "..")
                            parent_text = parent.text.strip()
                            if parent_text and len(parent_text) < 100:
                                caption = parent_text
                        except:
                            pass
                        
                        images_with_captions.append((caption, image))
                        print(f"✅ Added iframe SVG: {caption}")
                        
                    except Exception as e:
                        print(f"Error processing iframe SVG {idx}: {e}")
                        continue
                
                # Strategy 3: Screenshot Canvas elements in iframe
                print("\n🖼️ Strategy 3: Checking Canvas elements in iframe...")
                all_canvas = driver.find_elements(By.TAG_NAME, "canvas")
                
                for idx, canvas_elem in enumerate(all_canvas):
                    try:
                        size = canvas_elem.size
                        if size['width'] < 100 or size['height'] < 100:
                            continue
                        
                        print(f"Processing iframe Canvas {idx}, size: {size['width']}x{size['height']}")
                        
                        screenshot = canvas_elem.screenshot_as_png
                        image = Image.open(BytesIO(screenshot)).convert("RGB")
                        
                        caption = f"Canvas Visualization {idx + 1}"
                        images_with_captions.append((caption, image))
                        print(f"✅ Added iframe Canvas: {caption}")
                        
                    except Exception as e:
                        print(f"Error processing iframe Canvas {idx}: {e}")
                        continue
                
                # Switch back to main content
                driver.switch_to.default_content()
                
            except Exception as e:
                print(f"Error processing iframe {iframe_idx}: {e}")
                # Make sure we switch back to main content even if there's an error
                try:
                    driver.switch_to.default_content()
                except:
                    pass
                continue
        
        # If no iframes found or no images in iframes, fall back to main page
        if not images_with_captions:
            print("\n🔍 No images found in iframes, checking main page...")
            inspect_page_structure(driver)
            
            # Strategy 1: Find ALL images and filter later
            print("\n📸 Strategy 1: Checking all images on main page...")
            all_imgs = driver.find_elements(By.TAG_NAME, "img")
            
            for idx, img_elem in enumerate(all_imgs):
                try:
                    img_src = img_elem.get_attribute("src")
                    img_alt = img_elem.get_attribute("alt") or f"Image {idx + 1}"
                    
                    # Skip small images (likely icons, logos, etc.)
                    size = img_elem.size
                    if size['width'] < 50 or size['height'] < 50:
                        continue
                    
                    print(f"Processing main page image {idx}: {img_alt}, size: {size['width']}x{size['height']}")
                    
                    image = None
                    if img_src.startswith("data:image"):
                        # Base64 encoded image
                        img_data = base64.b64decode(img_src.split(",")[1])
                        image = Image.open(BytesIO(img_data)).convert("RGB")
                    elif img_src:
                        # URL image
                        if img_src.startswith("/"):
                            img_src = "https://www.codabench.org" + img_src
                        
                        try:
                            img_response = requests.get(img_src, timeout=10)
                            image = Image.open(BytesIO(img_response.content)).convert("RGB")
                        except Exception as e:
                            print(f"Failed to download image {img_src}: {e}")
                            continue
                    
                    if image:
                        caption = img_alt
                        try:
                            parent = img_elem.find_element(By.XPATH, "..")
                            parent_text = parent.text.strip()
                            if parent_text and len(parent_text) < 100:
                                caption = parent_text
                        except:
                            pass
                        
                        images_with_captions.append((caption, image))
                        print(f"✅ Added main page image: {caption}")
                        
                except Exception as e:
                    print(f"Error processing main page image {idx}: {e}")
                    continue
        
        print(f"\n🎯 Total images found: {len(images_with_captions)}")
        return images_with_captions
        
    except TimeoutException:
        print(f"Timeout waiting for page to load: {user_url}")
        return []

def download_and_merge_visualizations_selenium(leaderboard_json, session_id, output_dir="visualizations"):
    """Main function using Selenium"""
    os.makedirs(output_dir, exist_ok=True)
    
    driver = setup_driver(headless=False)  # Set to True for headless mode
    
    try:
        # Login to Codabench
        login_to_codabench(driver, session_id)
        
        base_url = "https://www.codabench.org/competitions/4313/detailed_results/"
        
        for username in tqdm(leaderboard_json["Leaderboard - Phase 2: model selection(15305)"].keys()):
            user_id = username.split("-")[-1]
            user_url = f"{base_url}{user_id}/"
            
            print(f"\nScraping user {username} at {user_url}")
            
            images_with_captions = extract_visualizations_selenium(driver, user_url, username)
            
            if not images_with_captions:
                print(f"❌ No downloadable images found for user {username}")
                
                # Debug: Save page source to see what's actually there
                with open(f"debug_{username}.html", "w", encoding="utf-8") as f:
                    f.write(driver.page_source)
                print(f"Saved debug HTML to debug_{username}.html")
                continue
            
            # Stack images vertically (on top of each other)
            if images_with_captions:
                max_width = max(im.size[0] for _, im in images_with_captions)
                total_height = sum(im.size[1] for _, im in images_with_captions)
                
                final_image = Image.new("RGB", (max_width, total_height), color="white")
                
                y_offset = 0
                for caption, im in images_with_captions:
                    # Center the image horizontally if it's narrower than max_width
                    x_position = (max_width - im.size[0]) // 2
                    final_image.paste(im, (x_position, y_offset))
                    y_offset += im.size[1]
                
                output_path = os.path.join(output_dir, f"{username}.jpg")
                final_image.save(output_path)
                print(f"✅ Saved {output_path}")
    
    finally:
        driver.quit()

# Usage
if __name__ == "__main__":
    with open("leaderboard_p2.json", "r") as f:
        leaderboard_data = json.load(f)
    
    download_and_merge_visualizations_selenium(leaderboard_data ,session_id="your_session_id_here")