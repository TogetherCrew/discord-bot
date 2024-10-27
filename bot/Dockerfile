# Stage 1: Base Stage
FROM node:20-alpine AS base
WORKDIR /app
COPY ./package.json /app
RUN npm install
COPY . .
RUN npm run build


# Stage 2: Development Stage
FROM base AS development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Test Stage
FROM base AS test
CMD [ "npx", "jest", "--coverage" ]



# Stage 5: Production Stage
FROM base  AS production
EXPOSE 3000
CMD ["npm", "run", "start"]