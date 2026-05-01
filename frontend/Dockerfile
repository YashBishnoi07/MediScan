FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose port for Vite
EXPOSE 5173

# Run Vite dev server, host 0.0.0.0 is needed for docker port mapping
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
