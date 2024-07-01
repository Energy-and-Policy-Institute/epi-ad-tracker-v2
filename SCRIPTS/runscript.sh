#!/bin/bash
# Source the user's profile to load environment variables
source /home/ec2-user/.bash_profile
source /home/ec2-user/.bashrc

# Ensure the PATH includes the location of the python and pip binaries
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/home/ec2-user/.local/bin:$PATH"

# pull git
git pull

# convert the notebook to python
jupyter nbconvert --to script /home/ec2-user/epi-ad-tracker-v2/SCRIPTS/fetch-facebook-ads-checkpoint.ipynb

# Run the Python script
python3 /home/ec2-user/epi-ad-tracker-v2/SCRIPTS/fetch-facebook-ads-checkpoint.py > /home/ec2-user/epi-ad-tracker-v2/log1.txt 2>&1
