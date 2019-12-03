FROM node:12.13.1-buster AS base
WORKDIR /app
COPY package.json yarn.lock ./

FROM base AS build
RUN yarn
ADD . .
RUN yarn run build

FROM node:12.13.1-alpine
WORKDIR /app
COPY --from=build /app .
ENV PORT 8080
CMD ["yarn", "start"]
