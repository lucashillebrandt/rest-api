# rest-api

This API will help you to separate the code that insert in the database from the code. 

## Requirements: 

- Node JS, npm
- MongoDB 4.0.0 or higher
- Nginx

## Cloning the repository

Please, go ahead to `/var/www` and create a folder for your api. For this example I will use `api.example.com` so: 


```
cd /var/www/
mkdir api.example.com
cd api.example.com

git clone <this repository>
```

## Setting up NGINX 

```
cd /etc/nginx/sites-enabled/
vim api.example.com
```

Example file:(please, replace api.example.com for your API name)

```
upstream nodejs {
    server localhost:3000;
}

server {
    listen 80;

    access_log /var/log/nginx/api.example.com.access.log;
    server_name api.example.com www.api.example.com;
    root /var/www/api.example.com;

    rewrite ^(.*[^/])$ $1/ permanent;

    location / {
        proxy_pass http://nodejs;
    }
}
```

After that you will need to restart nginx.
```
nginx -t
sudo service nginx restart
```

To have access for the API you will need to add DNS record pointing to the server, or add the ip to your hosts file.

## Installing Dependencies

Then we go back to the api folder and install npm dependencies
```
cd /var/www/api.example.com
npm install
```

###### Setting up MongoDB

Now let's start setup the Mongo

If you need to install MongoDB please follow this [article](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

```
mongo
use apiexamplecomdb
db.createUser( { user: "apiexamplecom", pwd: "your_pass", roles: [ { role: "readWrite", db: "apiexamplecomdb" } ] } )
```

Save the User and Pass, it will be used in the next steps. 

## Setup credentials file

The API needs the credentials from MongoDB to communicate. 

```
cp sdks/credentials-sample.json sdks/credentials.json
vim sdks/credentials.json
```
Update the options with the required data: 

User: Mongo User
Pass: Mongo Pass
db: Mongo database name

Example:

```
    "mongo": {
        "url": "mongodb://localhost:27017",
        "user": "apiexamplecom",
        "password": "your_pass",
        "database": "apiexamplecomdb"
    },
```

After this is setup, it's time to get the API up and running. 

```
node app.js &
```

WIP:

- How to setup endpoints
- How to create users with roles
- How to reset password
- How to create public endpoints.
- Example requests
