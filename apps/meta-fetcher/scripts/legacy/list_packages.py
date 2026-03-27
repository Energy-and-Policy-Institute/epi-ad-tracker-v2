import subprocess

# List installed packages
installed_packages = subprocess.check_output(['pip3', 'freeze'])
print(installed_packages.decode('utf-8'))
