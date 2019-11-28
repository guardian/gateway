FROM node:12.13.1-alpine

WORKDIR /app

ADD . .

CMD ["node", "index.js"]
