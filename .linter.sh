#!/bin/bash
cd /home/kavia/workspace/code-generation/noteease-18403-d7c506eb/noteease
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

