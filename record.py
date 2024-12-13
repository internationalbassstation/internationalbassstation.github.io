import requests
import time
import os
from datetime import datetime

STREAM_URL = "http://northumberland.serverroom.net:8850/"
RECORD_DURATION = 4444  # Duration in seconds
CHUNK_SIZE = 8192

current_date = datetime.now().strftime("%Y-%m-%d")
OUTPUT_FILE = f"bass_station_{current_date}.mp3"

def record_stream(url, duration, output_file):
    response = requests.get(url, stream=True)
    start_time = time.time()
    
    print(f"Recording to {output_file}...")
    
    with open(output_file, "wb") as f:
        for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
            if chunk:
                f.write(chunk)
            if time.time() - start_time > duration:
                break

    print("Recording finished.")

def main():
    try:
        record_stream(STREAM_URL, RECORD_DURATION, OUTPUT_FILE)
        print(f"Audio saved to {OUTPUT_FILE}")
        
        file_size = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)  # Size in MB
        print(f"File size: {file_size:.2f} MB")
        
        bitrate = (file_size * 8192) / RECORD_DURATION  # in kbps
        print(f"Approximate bitrate: {bitrate:.2f} kbps")
        
    except requests.RequestException as e:
        print(f"Error occurred while streaming: {e}")
    except IOError as e:
        print(f"Error occurred while writing to file: {e}")

if __name__ == "__main__":
    main()