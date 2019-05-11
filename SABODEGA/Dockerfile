#FROM node:8
# Create app directory
#WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#COPY package*.json ./
#RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
#COPY . .
#EXPOSE 8080
#CMD [ "npm", "start" ]

FROM basesa
# Set the working directory to /app
WORKDIR /app/
# Copy the current directory contents into the container at /app
ADD . /app
COPY hosts /etc/
EXPOSE 80
RUN chmod +x testing.sh

CMD [ "bash","testing.sh" ]