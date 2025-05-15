#!/bin/bash

# Run Jest tests with coverage
echo "Running tests with coverage..."
npm run test:cov

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
  
  # Open coverage report in default browser (if on a system with a browser)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open coverage/lcov-report/index.html
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open coverage/lcov-report/index.html
  elif [[ "$OSTYPE" == "msys" ]]; then
    start coverage/lcov-report/index.html
  fi
else
  echo "❌ Tests failed"
  exit 1
fi 