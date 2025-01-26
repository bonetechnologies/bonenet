#!/bin/bash

# Install dependencies
npm install

# Install additional dev dependencies
npm install --save-dev \
  @types/react \
  @types/react-dom \
  @types/styled-components \
  @types/node \
  typescript \
  vite \
  @vitejs/plugin-react

# Create build script
echo '{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}' >> package.json 