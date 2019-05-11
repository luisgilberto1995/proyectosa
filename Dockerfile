#FROM basesa
FROM node
# Set the working directory to /app
WORKDIR /app/
# Copy the current directory contents into the container at /app
ADD . /app
COPY hosts /etc/
EXPOSE 80
RUN chmod +x testing.sh

CMD [ "bash","testing.sh" ]