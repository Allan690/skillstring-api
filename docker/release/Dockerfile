FROM node:latest

LABEL application="pdf-highlight-api"

ENV TERM=xterm-256color NODE_ENV=$NODE_ENV

RUN mkdir -p /usr/app
WORKDIR /usr/app

RUN npm install -g yarn@1.19.x typescript && rm -rf package-lock.json
COPY package.json yarn.lock /usr/app/


RUN yarn install
