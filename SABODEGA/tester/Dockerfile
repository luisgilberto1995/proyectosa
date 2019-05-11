FROM mysql:5.7 

# needed for intialization
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE bodegadb

COPY setup.sql /docker-entrypoint-initdb.d/