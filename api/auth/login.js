'use strict';

var validator = require('validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var userTransformer = require('../../transformers/userTransformer.js');

const mysql = require('serverless-mysql')({
  config: {
    host     : process.env.ENDPOINT,
    database : process.env.DATABASE,
    user     : process.env.USERNAME,
    password : process.env.PASSWORD
  }
})

module.exports.login = async (event, context) => {
  try{
    let request = JSON.parse(event.body);
    let response = validateFields(request, ["email", "password"]);
    if(response.success){
      let user = await mysql.query(`SELECT * from users where email = "${request.email}"`);
      if(user[0]){
        bcrypt.compare(request.password, user[0].password, function(err, result) {
          if(result){
            let token = jwt.sign(JSON.parse(JSON.stringify(user[0])), process.env.JWT_KEY)
            response = {
              statusCode: 200,
              body: JSON.stringify(
                {
                  user: userTransformer.user(user[0], token)
                },
                null,
                2
              ),
            };
          }
          else{
            response = {
              statusCode: 401,
              body: JSON.stringify(
                {
                  message: "Incorrect credentials"
                },
                null,
                2
              ),
            };
          }
        });
      }
      else {
        response = {
          statusCode: 404,
          body: JSON.stringify(
            {
              message: "User does not exist"
            },
            null,
            2
          ),
        };
      }
      await mysql.end();
    }
    return response;
      }
      catch(error){
        return {
          statusCode: 401,
          body: JSON.stringify(
            {
              message: error.message
            },
            null,
            2
          ),
        };
      }
  }

  function validateFields(request, fields) {
    let error = false;
    let message = {};
    fields.map(field => {
      if(!((field in request) && request[field])){
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
    return {
      success : true
    };
  }