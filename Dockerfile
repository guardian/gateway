FROM node:14.17-buster AS base
WORKDIR /app
COPY package.json yarn.lock ./

FROM base AS build
RUN yarn --audit
ADD . .
RUN yarn run build

FROM node:14.17-alpine
WORKDIR /app
COPY --from=build /app .
ENV PORT=8861
CMD ["yarn", "start"]
