#!/usr/bin/env bash
set -e
PROVIDER=$1
PROJECT_DIR=$2
case "$PROVIDER" in
  vercel)  vercel --prod --cwd "$PROJECT_DIR" --confirm ;;
  azure)   az webapp up --sku B1 --name "${PROJECT_DIR##*/}" --runtime "NODE:18-lts" --location "eastus" --resource-group rg-appgenie ;;
  *) echo "Unknown provider"; exit 1 ;;
esac