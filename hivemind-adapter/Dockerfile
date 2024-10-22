# Dockerfile
# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Development
FROM node:20-alpine AS development
WORKDIR /app
COPY --from=builder /app .
RUN npm install --only=development
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Stage 3: Production
FROM node:20-alpine AS production 
WORKDIR /app
COPY --from=builder /app .
COPY . .
RUN npm install --only=production --ignore-scripts
EXPOSE 3000
CMD ["node", "dist/main"]

# Stage 4: Testing
FROM node:20-alpine AS test
WORKDIR /app
COPY --from=builder /app .
RUN npm install --only=development
CMD [ "npx", "jest", "--coverage" ]
