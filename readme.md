# Introduction

`Ziggy` is a software development tool that is meant to be a tool to store and retrieve bits of code and other references that may need to be quickly accessed.

## GraphQL API Server Setup

This project is the `GraphQL API Server`, which is reponsible for managing the persistent data for the `Ziggy` application. Here are the steps to setup this project:

1.  Clone the project to your deployment or development target
2.  Copy the `.env.template` file and change the name to `.env`
3.  Change the values of the `.env` file, specifically the values pertaining to the database host, username, password, and other values.
4.  Install the project dependencies by running `npm install`
5.  Test the project by running `npm run serve` and visiting `http://localhost:4000`

Note: If you get an error of `ER_NOT_SUPPORTED_AUTH_MODE` when running a query in the GraphQL Sandbox then open a MySQL CLI and run the following command:

```
ALTER USER '<USER>'@'localhost' IDENTIFIED WITH mysql_native_password BY '<PASSWORD>'
```

where `<USER>` and `<PASSWORD>` are the username and password you use with your database connection.

## Author

Zach DeGeorge

zdegeorge@biggby.com

https://github.com/zdegeorge
