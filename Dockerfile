FROM node:16

#create running directory
WORKDIR /usr/src/app

#copy & install app dependencies

COPY package*.json ./
COPY index.html ./
RUN npm install

#for production mode:
#RUN npm ci --only=production 

#bundle app source:
COPY . .
EXPOSE 8080

#run the node.js file

CMD ["node","server.js"]


