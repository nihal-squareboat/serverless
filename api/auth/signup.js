'use strict';

var validator = require('validator');
const { v4: uuidv4 } = require('uuid');
var bcrypt = require('bcryptjs');

const mysql = require('serverless-mysql')({
  config: {
    host: process.env.ENDPOINT,
    database: process.env.DATABASE,
    user: process.env.USERNAME,
    password: process.env.PASSWORD
  }
})

module.exports.create = async (event, context) => {
  try {
    let request = JSON.parse(event.body);
    let response = validateFields(request, ["email", "first_name", "password", "username"]);
    if (response.success) {
      let result = await mysql.query(`SELECT count(*) as user from users where email = "${request.email}" or username = "${request.username}"`);
      if (result[0] && result[0].user) {
        return {
          statusCode: 409,
          body: JSON.stringify({
            message: "User already exist",
          },
            null,
            2
          ),
          success: false
        };
      }
      await mysql.query(`INSERT into users (uuid, first_name, last_name, email, username, password) values ("${uuidv4()}", "${request.first_name}", "${(request.last_name ? request.last_name : null)}", "${request.email}", "${request.username}", "${bcrypt.hashSync(request.password)}")`);
      await mysql.end();
    }
    return response;
  }
  catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify(
        {
          message: error.message,
        },
        null,
        2
      ),
      success: false
    };
  }
}

function validateFields(request, fields) {
  let error = false;
  let message = {};
  fields.map(field => {
    if (!((field in request) && request[field])) {
      error = true
      message[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")} is required.`;
    }
  });
  if (error)
    return {
      statusCode: 422,
      body: JSON.stringify({
        message: message,
      },
        null,
        2
      ),
      success: false
    };
  if (!validator.isEmail(request.email)) {
    return {
      statusCode: 422,
      body: JSON.stringify({
        message: `Please enter valid email.`,
      },
        null,
        2
      ),
      success: false
    }
  };
  if (request.password.length < 6) {
    return {
      statusCode: 422,
      body: JSON.stringify({
        message: `Password should have min 6 characters.`,
      },
        null,
        2
      ),
      success: false
    }
  };
  if (request.username.length < 4) {
    return {
      statusCode: 422,
      body: JSON.stringify({
        message: `Username should have min 4 characters.`,
      },
        null,
        2
      ),
      success: false
    }
  };
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "User created successfully",
    },
      null,
      2
    ),
    success: true
  };
}