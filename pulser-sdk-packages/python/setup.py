"""
Pulser SDK - Enterprise AI Agent Orchestration Platform
"""
from setuptools import setup, find_packages
import os

# Read the README file
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Read requirements
with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="pulser-sdk",
    version="4.0.0",
    author="TBWA Data Collective",
    author_email="tech@tbwa.com",
    description="Enterprise AI Agent Orchestration Platform for Creative Intelligence",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/jgtolentino/pulser-sdk",
    project_urls={
        "Bug Tracker": "https://github.com/jgtolentino/pulser-sdk/issues",
        "Documentation": "https://pulser-sdk.readthedocs.io",
        "Source Code": "https://github.com/jgtolentino/pulser-sdk",
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
    ],
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.0",
            "pytest-cov>=4.0",
            "pytest-asyncio>=0.20",
            "black>=22.0",
            "flake8>=5.0",
            "mypy>=1.0",
            "sphinx>=5.0",
        ],
        "ml": [
            "transformers>=4.30",
            "torch>=2.0",
            "scikit-learn>=1.0",
        ],
        "cloud": [
            "azure-storage-blob>=12.0",
            "google-cloud-storage>=2.0",
            "boto3>=1.26",
        ],
    },
    entry_points={
        "console_scripts": [
            "pulser=pulser_sdk.cli:main",
        ],
    },
    include_package_data=True,
    package_data={
        "pulser_sdk": ["templates/*.yaml", "configs/*.json"],
    },
)