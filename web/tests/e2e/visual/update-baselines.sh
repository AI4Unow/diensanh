#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "=== Updating Visual Baselines ==="

# Capture new baselines
bash "$(dirname $0)/capture-baselines.sh"

echo "Baselines updated. Commit changes to lock new baselines."