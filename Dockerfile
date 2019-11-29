FROM node:12.13.1-alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
ADD . .
RUN yarn run build
ENV PORT 8080
CMD ["yarn", "start"]
