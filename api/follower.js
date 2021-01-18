'use strict';

var validator = require('validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var userTransformer = require('../transformers/userTransformer.js');
const mysql = require('serverless-mysql')({
    config: {
        host: process.env.ENDPOINT,
        database: process.env.DATABASE,
        user: process.env.USERNAME,
        password: process.env.PASSWORD
    }
})

module.exports.toggle = async (event, context) => {
    try {
        let user_name = event.pathParameters.username;
        let headers = event.headers;
        let authorization = headers.Authorization;
        let response = {
            statusCode: 404,
            body: JSON.stringify(
                {
                    user: "User not found"
                },
                null,
                2
            ),
        };
        if (!authorization) {
            response = {
                statusCode: 401,
                body: JSON.stringify(
                    {
                        message: "Unauthorised"
                    },
                    null,
                    2
                ),
            };
        }
        else {
            let token = authorization.substr(7);
            try {
                var decoded = jwt.verify(token, process.env.JWT_KEY);
                let auth_user = await mysql.query(`SELECT * from users where id = "${decoded.id}" and email = "${decoded.email}"`);
                if (auth_user[0]) {
                    let user = await mysql.query(`SELECT * from users where username = "${user_name}"`);
                    if (user[0]) {
                        if(auth_user[0].id == user[0].id){
                            response = {
                                statusCode: 400,
                                body: JSON.stringify(
                                    {
                                        message: "Can not follow self"
                                    },
                                    null,
                                    2
                                ),
                            };
                        }
                        else {
                            let follow = await mysql.query(`SELECT * from followers where follower = "${auth_user[0].id}" and following = "${user[0].id}"`);
                            if(follow[0]){
                                await mysql.query(`DELETE from followers where follower = "${auth_user[0].id}" and following = "${user[0].id}"`);
                                response = {
                                    statusCode: 200,
                                    body: JSON.stringify(
                                        {
                                            message: "Successfully unfollowed"
                                        },
                                        null,
                                        2
                                        ),
                                    };
                                }
                                else {
                                await mysql.query(`INSERT into followers (follower, following) values ( "${auth_user[0].id}", "${user[0].id}")`);
                                response = {
                                    statusCode: 200,
                                    body: JSON.stringify(
                                        {
                                            message: "Successfully followed"
                                        },
                                        null,
                                        2
                                    ),
                                };
                            }
                        }
                        
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
                }
                else {
                    response = {
                        statusCode: 401,
                        body: JSON.stringify(
                            {
                                message: "Unauthorised"
                            },
                            null,
                            2
                        ),
                    };
                }
            }
            catch (err) {
                response = {
                    statusCode: 401,
                    body: JSON.stringify(
                        {
                            message: err.message
                        },
                        null,
                        2
                    ),
                };
            }
        }
        await mysql.end();
        return response;
    }
    catch (error) {
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