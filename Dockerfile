FROM node:12.13.1-alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN npm install
ADD . .

CMD ["yarn", "run", "build"]
