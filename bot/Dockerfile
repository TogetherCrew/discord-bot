# Stage 1: Base Stage
FROM node:18-alpine AS base
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Stage 2: Development Stage
FROM base AS development
ENV NODE_ENV=development
# Install development dependencies
RUN npm install
# Expose port if necessary
EXPOSE 3000
# Start the development server
CMD ["npm", "run", "dev"]

# Stage 3: Test Stage
FROM base AS test
ENV NODE_ENV=test
# Install development dependencies
RUN npm install
# Run tests
CMD ["npm", "run", "test"]

# Stage 4: Build Stage
FROM base AS build
ENV NODE_ENV=production
# Build the application (TypeScript compilation)
RUN npm run build

# Stage 5: Production Stage
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# Copy only necessary files from the build stage
COPY --from=build /app/dist ./dist
COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production
# Expose port if necessary
EXPOSE 3000
# Start the application
CMD ["npm", "run", "start"]
