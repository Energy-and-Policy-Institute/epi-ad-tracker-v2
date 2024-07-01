#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import sys
# uncomment if you do not have these installed. DO NOT COMMIT UNCOMMENTED!!
# !{sys.executable} -m pip install boto3
# !{sys.executable} -m pip install botocore
# !{sys.executable} -m pip install selenium
# !{sys.executable} -m pip install pandas
# !{sys.executable} -m pip install numpy
# !{sys.executable} -m pip install python-dotenv

# In[32]:


### import libraries
import argparse
import json 
import requests
from collections import defaultdict
import pandas as pd
import selenium

from decimal import Decimal

import numpy as np
import boto3
import os
from botocore.exceptions import NoCredentialsError
from botocore.exceptions import ClientError
from selenium import webdriver
from dotenv import load_dotenv

# In[24]:


load_dotenv()

ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
AWS_SECRET_ACCESS_KEY=os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_ACCESS_KEY_ID=os.getenv("AWS_ACCESS_KEY_ID")

# In[40]:


### functions
def convert_to_json_serializable(value):
    if isinstance(value, pd.Int32Dtype().type):
        return int(value)  # Convert int32 to int
    return value
def calculate_impressions_midpoint(data):
    """Calculate impressions midpoint"""
    # Convert from a string of characters into an integer
    upper_bound = int(data["impressions"]["upper_bound"])
    lower_bound = int(data["impressions"]["lower_bound"])

    return round((upper_bound + lower_bound) / 2)

def calculate_impressions_by_region(data, impressions):
    """Calculate impressions by regions"""
    # Create a new dict to contain the results
    result = {}

    # Loop through each region and calculate the impressions
    for chunk in data["delivery_by_region"]:
        result[chunk["region"]] = round(impressions * float(chunk["percentage"]))

    return result

def calculate_impressions_by_gender(data, impressions):
    """Calculates impressions by gender"""
    # Create a new dict to contain the results. The categories are pre-populated with 0s.
    results = {"male": 0, "female": 0, "unknown": 0}

    # Loop through demographic data
    for d in data["demographic_distribution"]:
        # Let's break this expression down:
        # 1. result[d["gender"]] looks for the key in the result dict that matches d["gender"]
        # 2. += is a short hand operator for addition and assignment. e.g. foo +=1 is the same
        #    as foo = foo + 1
        # 3. float(d["percentage"]) converts the JSON data into a decimal number (programmers
        #    call those floats because the decimal can move around).
        # 4. round(impressions * float(d["percentage"])) multiplies the percentage by the
        #    impressions and rounds up to the nearest integer
        results[d["gender"]] += round(impressions * float(d["percentage"]))

    return results

def calculate_impressions_by_age(data, impressions):
    """Calculate impressions by age"""
    # Create a new default dict to contain the results. The default dict makes any new element
    # default to a value specified by the user. In our case we're defaulting to an integer 0.
    # int is actually a function that retuns 0 when called with no arguments
    results = defaultdict(int)

    # Loop through the demographic data and add up the impressions
    for d in data["demographic_distribution"]:
        # Let's break this expression down:
        # 1. result[d["age"]] looks for the key in the result dict that matches d["age"]. If
        #    there is no key that matches d["age"] the default dict will make one with the value
        #    of int(), which is always 0.
        # 2. += is a short hand operator for addition and assignment. e.g. foo +=1 is the same
        #    as foo = foo + 1
        # 3. float(d["percentage"]) converts the JSON data into a decimal number (programmers
        #    call those floats because the decimal can move around).
        # 4. round(impressions * float(d["percentage"])) multiplies the percentage by the
        #    impressions and rounds up to the nearest integer
        results[d["age"]] += round(impressions * float(d["percentage"]))

    return results

def upload_to_s3(local_file, bucket, s3_file):
    """
    Upload a file to an S3 bucket

    :param local_file: File to upload
    :param bucket: Bucket to upload to
    :param s3_file: S3 object name. If not specified then local_file name is used
    :return: True if file was uploaded, else False
    """

    # Create an S3 client
    s3 = boto3.client('s3',     
                    aws_access_key_id=AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
    
    # Specify the ContentType
    extra_args = {'ContentType': 'image/png'}

    try: 
        # Upload the file
        s3.upload_file(local_file, bucket, s3_file, ExtraArgs=extra_args)
        print(f"File {local_file} uploaded to {bucket} as {s3_file}")
        return True
    except FileNotFoundError:
        print("The file was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False
    
def file_exists_in_s3(bucket, filename):
    """
    Check if a file exists in S3

    :param bucket: Bucket to check
    :param filename: Filename to check
    :return: True if the file exists, else False
    """

    # Create an S3 client
    s3 = boto3.client('s3',     
                    aws_access_key_id=AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=AWS_SECRET_ACCESS_KEY)

    try:
        # Check if the file exists
        s3.head_object(Bucket=bucket, Key=filename)
        print(f"File {filename} exists in {bucket}")
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            print(f"File {filename} does not exist in {bucket}")
            return False
        else:
            raise

    
def take_screenshot(url, filename):
    # Set options for the WebDriver (optional)
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Run Chrome in headless mode
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    # Initialize the WebDriver
    #driver = webdriver.Chrome(executable_path=driver_path, options=options)
    driver = webdriver.Chrome(options=options)

    # Open a webpage
    driver.get(url)

    # Take a screenshot and save it
    driver.save_screenshot(filename)

    # Close the WebDriver
    driver.quit()

    print(f"Screenshot saved as {filename}.")

def delete_file(filename):
    # deletes file with filename
    os.remove(filename)
    


# In[ ]:


# take_screenshot("https://www.google.com/", "screenshot.png")
# upload_to_s3("screenshot.png", "epi-ad-screenshot", "screenshot.png")
# delete_file("screenshot.png")

# In[27]:


#  ### list of page IDs
# idList = ['106039214814684', # 1
# # '102281724942742', # 2
# # '738063612887865', # 3
# # '341751646428117', # 4
# # '591566840920364', # 5
# # '105502284969626', # 6
# # '49560242814',   # 7
# # '101691091213750',  # 8
# # # '113891694102', removed Energy Citizens 
# # '292970844058835', # 9
# # '100801038449520',  # 10
# # '108095672108380',  # 11
# # '111394533709201',  # 12
# # '107500120800840',  # 13
# # '101242238726088',    # 14
# # '237209147160346',  # 15
# # '110124925319299',  # 16
# '396341921119746',  # 17
# '108203188195224',  # 18
# '106656845034469',  # 19
# #'47710973068', # 20
# #'482100658584410'  # 21
# ]

idList = ['106039214814684', #affordable energy coalition
'102281724942742',
'738063612887865',
'341751646428117',
'591566840920364',
'105502284969626',
'49560242814', # not showing up???
'101691091213750',
# '113891694102', removed Energy Citizens
'292970844058835',
'100801038449520',
'108095672108380',
'111394533709201',
'107500120800840',
'101242238726088',
'237209147160346',
'110124925319299',
'396341921119746',
'108203188195224',
'106656845034469',
'47710973068',
'482100658584410']

# In[36]:


"""Entrypoint of the program"""

# Store the paginated data in here
data = []

# create dataframe
df = pd.DataFrame()

# for each item in the list, store their data in the pandas dataframe

# This might work for our request
for i in idList:
    print(i)
    response = requests.get("https://graph.facebook.com/v5.0/ads_archive", params={
        "access_token": ACCESS_TOKEN,
        "ad_type": "POLITICAL_AND_ISSUE_ADS",
        "ad_active_status": "ALL",
        "search_page_ids": i,
        "ad_reached_countries": ["US"],
        "ad_delivery_date_min": "2018-05-07",
        "ad_delivery_date_max": "2024-06-14",
        "fields": "id, ad_delivery_start_time, ad_delivery_stop_time, ad_snapshot_url, bylines, delivery_by_region, demographic_distribution, impressions, publisher_platforms, spend, ad_creative_bodies, ad_creative_link_captions, ad_creative_link_descriptions, ad_creative_link_titles, page_name, page_id"
    })
    # Get the json document and pull out the next link and the data
    jsonResponse = response.json()
    
    try:
        next_link = jsonResponse['paging']['next']
        data = data + jsonResponse['data']
    except KeyError:
        continue

    while next_link:
      print('.', end='')
      response = requests.get(next_link)
      jsonResponse = response.json()
      if 'paging' not in jsonResponse:
        break
      next_link = jsonResponse['paging']['next']
      data = data + jsonResponse['data']
    print('\n')

    # append data to dataframe
    res = pd.json_normalize(data)
    df = pd.concat([df, res], ignore_index=True)


# ### Clean & Export Data

# ### For Summary Table

# In[58]:


# drop duplicate ads (based on id)
df = df.drop_duplicates(subset="id")

# fill NaNs
df = df.replace({np.nan: None})

# create 'ad start month' and 'ad start year' column
df['ad_start_month'] = df['ad_delivery_start_time'].str.split('-').str[1].astype(int)
df['ad_start_year'] = df['ad_delivery_start_time'].str.split('-').str[0].astype(int)

# convert string to integer
df['spend.lower_bound'] = df['spend.lower_bound'].astype('int')
df['spend.upper_bound'] = df['spend.upper_bound'].astype('int').round(-2)

# title case for bylines column
df['bylines'] = df['bylines'].str.title()

# replace page_name: 'Natural Gas: Limitless Opportunity' with 'Save Our Stoves' and 'Cooperative Action Network' with 'Voices for Cooperative Power'

df['page_name'] = df['page_name'].replace({'Natural Gas: Limitless Opportunity':'Save Our Stoves', 'Cooperative Action Network':'Voices for Cooperative Power'})

resjson = df[['page_name', 'id', 'spend.lower_bound', 'spend.upper_bound']].groupby('page_name').agg({'id':'count', 'spend.lower_bound': 'sum', 'spend.upper_bound': 'sum'}).reset_index().rename(columns={'page_name':'name', 'id':'ads', 'spend.lower_bound': 'lowerAmount', 'spend.upper_bound':'upperAmount'}).sort_values(by="upperAmount", ascending=False).reset_index(drop=True)

# 

# In[59]:


# get the ten most expensive ads for each page, put ids in a list
topTen = df.groupby('page_name').apply(lambda x: x.nlargest(10, 'spend.upper_bound')).reset_index(drop=True)[['page_name', 'id']].groupby('page_name')['id'].apply(list).reset_index().rename(columns={'page_name':'name', 'id':'topTenAds'})
topTenIds = sum(topTen['topTenAds'], [])

# In[60]:


items = df.values.tolist()
### get list of page_names and the number of ads for each and print the page names and the number of ads for each
page_names = df['page_name'].value_counts().reset_index().rename(columns={'index':'name', 'page_name':'ads'}).sort_values(by="ads", ascending=False).reset_index(drop=True)
page_names = page_names.to_dict(orient='records')
print(json.dumps(page_names, indent=2))


# In[65]:


# export raw data
# print(res)
url = "https://epi-ad-tracker-v2-epi.vercel.app/api/addads"

items = df.values.tolist()
print(len(items))
# items = items[80:83]
# print(items)


# Define the batch size
batch_size = 200  # Adjust this number based on your requirements

for i in range(0, len(items), batch_size):
    print(f"processing batch {i // batch_size} of {len(items)//batch_size}")
    batch = items[i:i + batch_size]
    batch_data = []
    
    for item in batch:
        obj = {
          "id":convert_to_json_serializable(  item[0] ),
          "ad_delivery_start_time":convert_to_json_serializable(  item[1] ),
          "ad_delivery_stop_time":convert_to_json_serializable(  item[2] ),
          "ad_snapshot_url":convert_to_json_serializable(  item[3] ),
          "bylines":convert_to_json_serializable(  item[4] ),
          "delivery_by_region":convert_to_json_serializable(  item[5] ),
          "demographic_distribution":convert_to_json_serializable(  item[6] ),
          "publisher_platforms":convert_to_json_serializable(  item[7] ),
          "ad_creative_bodies":convert_to_json_serializable(  item[8] ),
          "ad_creative_link_captions":convert_to_json_serializable(  item[9] ),
          "ad_creative_link_descriptions":convert_to_json_serializable(  item[10] ),
          "ad_creative_link_titles":convert_to_json_serializable(  item[11] ),
          "page_name":convert_to_json_serializable(  item[12] ),
          "page_id":convert_to_json_serializable(  item[13] ),
          "impressions_lower_bound":convert_to_json_serializable(  item[14] ),
          "impressions_upper_bound":convert_to_json_serializable(  item[15] ),
          "spend_lower_bound":convert_to_json_serializable(  item[16] ),
          "spend_upper_bound":convert_to_json_serializable(  item[17] ),
          "ad_start_month":convert_to_json_serializable(  item[18] ),
          "ad_start_year":convert_to_json_serializable(  item[19] ),
        }


        if item[0] in topTenIds:
            if not file_exists_in_s3("epi-ad-screenshot", f"{item[0]}.png"):
                take_screenshot(item[3], f"{item[0]}.png")
                result = upload_to_s3(f"{item[0]}.png", "epi-ad-screenshot", f"{item[0]}.png")
                delete_file(f"{item[0]}.png")
                
            screenshot_url = f"https://epi-ad-screenshot.s3.us-east-2.amazonaws.com/{item[0]}.png"
            obj = {**obj, "ad_screenshot_url": screenshot_url}
            print(screenshot_url)


        batch_data.append(obj)
        
    json_object = json.dumps(batch_data, indent=2)

    try:
        response1 = requests.post(url, data=json_object, headers={'Content-Type': 'application/json'})
        response1.raise_for_status()
        if response1.status_code == 200:
            print("success")
        else:
            print("Request failed with status code:", response1.status_code)
            print(response1.text)
    except requests.exceptions.RequestException as e:
     # Handle request exceptions (e.g., connection error)
        print(f"Error: {e} \n\n {json_object}")

#res.to_csv("../all-front-group-ads-070723.csv")
