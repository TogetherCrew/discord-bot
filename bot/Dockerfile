FROM node:18-alpine AS base

# @pyroscope/nodejs issue: https://github.com/grafana/pyroscope-nodejs/issues/31
RUN apk add g++ make py3-pip 

WORKDIR /project
COPY . .
RUN npm ci

FROM base AS test
CMD [ "npx", "jest", "--coverage" ]

FROM base AS build
RUN npm run build

FROM build AS prod
RUN npm ci --omit=dev
CMD ["npm", "run", "start"]
EXPOSE 3000