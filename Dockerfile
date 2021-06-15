FROM node:10 AS builder

# Create app directory, this is in our container/in our image
WORKDIR /usr/src/backend-app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
COPY dockerdb.json ./ormconfig.json

RUN npm run build

EXPOSE 3000
#CMD [ "node", "dist/main" ]

#FROM node:10-alpine
#COPY --from=builder /usr/src/backend-app .
CMD ["npm", "run", "start:prod"]