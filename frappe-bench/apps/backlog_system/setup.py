from setuptools import setup, find_packages

setup(
    name='backlog_system',
    version='0.0.1',
    description='Student Backlog Management System',
    author='Admin',
    author_email='admin@example.com',
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=['frappe'],
)
