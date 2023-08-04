FROM node:18-buster-slim AS base
RUN apt-get update && apt-get install wait-for-it git -y
WORKDIR /project
COPY . .
RUN npm ci

FROM base AS test
COPY docker-entrypoint.sh .
# Make Entrypoint executable
RUN chmod +x docker-entrypoint.sh
# Run the app when the container launches
CMD ["./docker-entrypoint.sh"]

FROM base AS build
RUN npm run build

FROM build AS prod
RUN npm ci --omit=dev
CMD ["npm", "run", "start"]
EXPOSE 3000