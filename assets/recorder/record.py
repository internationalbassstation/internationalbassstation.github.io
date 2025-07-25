# to run script:
# install python
# open command prompt
# use cd to navigate to directory
# install remaining dependency using:
# "python -m pip install requests"
# if all is well, run:
# "python record.py"
# 5400 seconds is 90 minutes

import requests
import time
import os
from datetime import datetime

# station to record - find new one in developer console, search for "src" and find audio
STREAM_URL = "http://northumberland.serverroom.net:8850/"
# (in seconds)
RECORD_DURATION = 5400
# bytes read from stream at a time
CHUNK_SIZE = 8192

# get date info
current_date = datetime.now().strftime("%Y-%m-%d")
# name output file using date
OUTPUT_FILE = f"bass_station_{current_date}.mp3"

# function to record and output stream as file
def record_stream(url, duration, output_file):
    try:
# request to get stream content
        response = requests.get(url, stream=True)
# check if stream was accessed successfully
        if response.status_code != 200:
# if not, print message indicating stream access error
            print(f"Error: Failed to access stream. Status code: {response.status_code}")
            return
# note the recording start time
        start_time = time.time()
# print message indicating recording has started
        print(f"Recording to {output_file}...")
# write-binary to store the stream data
        with open(output_file, "wb") as f:
# loop over chunks of audio data
            for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
# if chunk is not empty
                if chunk:
# write chunk data to output file
                    f.write(chunk)
# check if recording duration has reached the limit
                if time.time() - start_time > duration:
# stop the loop (and therefore the recording) if limit is reached
                    break
# print message indicating recording is complete
        print("Recording finished.")
    except requests.RequestException as e:
# print message indicating errors related to network issues
        print(f"Error: Request failed while streaming. Details: {e}")
    except IOError as e:
# print message indicating errors related to file permission or storage
        print(f"Error: Failed to write to file. Details: {e}") 
    except Exception as e:
# print message indicating any other unexpected exceptions
        print(f"Unexpected error occurred: {e}")
# main function to manage order and process
def main():
    try:
# call the "record_stream" function to start recording
        record_stream(STREAM_URL, RECORD_DURATION, OUTPUT_FILE)
# print message indicating confirmation of output file and location
        print(f"Audio saved to {OUTPUT_FILE}") 
# calculate file size in megabytes
        file_size = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
# print message indicating file size, two decimal places
        print(f"File size: {file_size:.2f} MB")  
# calculate approximate bitrate in kbps
        bitrate = (file_size * 8192) / RECORD_DURATION
# print message indicating bitrate, two decimal places
        print(f"Approximate bitrate: {bitrate:.2f} kbps")   
# error handling related to HTTP request
    except requests.RequestException as e:
# print message indicating streaming error
        print(f"Error occurred while streaming: {e}")
# allow for early exit from program via keyboard (Ctrl+C)
    except KeyboardInterrupt:
# print message indicating user interruption
        print("\nRecording interrupted by user.")
# error handling related to unexpected issues in main function
    except Exception as e:
# print message indicating unexpected error in main function
        print(f"Unexpected error in main function: {e}")
# ensure main function is executed when script runs
if __name__ == "__main__":
    main()
# needs to be updated with:
# attempts to retry errors, with timeout
# File Overwriting Prevention
# Stream Buffering
# Handling Stream End or Failures