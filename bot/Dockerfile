# Stage 1: Base Stage
FROM node:20-alpine AS base
WORKDIR /app
# COPY ./package-lock.json /app
COPY ./package.json /app
RUN npm install
COPY . .
RUN npm run build


# Stage 2: Development Stage
FROM base AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Test Stage
FROM base AS test
CMD [ "npx", "jest", "--coverage" ]

# # Stage 4: Build Stage
# FROM base AS build
# ENV NODE_ENV=production
# RUN npm run build

# # Stage 5: Production Stage
# FROM node:18-alpine AS production
# WORKDIR /bot
# ENV NODE_ENV=production
# COPY --from=build /bot/dist ./dist
# RUN npm ci --only=production
# EXPOSE 3000
# CMD ["npm", "run", "start"]