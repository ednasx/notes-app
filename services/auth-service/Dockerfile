# --- Layer 1: base image ---
FROM node:22-alpine


# --- Layer 2: working directory inside the image ---
WORKDIR /app


# --- Layer 3 + 4: dependency manifests, then install ---
COPY package.json package-lock.json ./
RUN npm ci


# --- Layer 5: application source code ---
COPY . . 


# --- Metadata: document the port this service listens on --- 
EXPOSE 3001


# --- Runtime command: what runs when the container starts ---
CMD ["node", "src/index.js"]
