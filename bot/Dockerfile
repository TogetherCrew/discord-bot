# Stage 1: Base Stage
FROM node:18 AS base
WORKDIR /bot
COPY /bot/package.json .
RUN npm install
COPY /bot .
RUN npm run build


# Stage 2: Development Stage
FROM base AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Test Stage
FROM base AS test
ENV NODE_ENV=test
CMD ["npm", "run", "test"]

# # Stage 5: Production Stage
# FROM node:18-alpine AS production
# WORKDIR /bot
# ENV NODE_ENV=production
# COPY --from=build /bot/dist ./dist
# RUN npm ci --only=production
# EXPOSE 3000
# CMD ["npm", "run", "start"]
