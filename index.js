'use strict';
//import {verify, decode} from "jsonwebtoken"
var jwt = require('jsonwebtoken');  
var jwkToPem = require('jwk-to-pem');

/*
TO DO:
copy values from CloudFormation outputs into USERPOOLID and JWKS variables
*/

var USERPOOLID = '###';
var JWKS = '###'
/*
verify values above
*/



var region = 'us-east-1';
var iss = 'https://cognito-idp.' + region + '.amazonaws.com/' + USERPOOLID;
var pems;

pems = {};
var keys = JSON.parse(JWKS).keys;
for(var i = 0; i < keys.length; i++) {
    //Convert each key to PEM
    var key_id = keys[i].kid;
    var modulus = keys[i].n;
    var exponent = keys[i].e;
    var key_type = keys[i].kty;
    var jwk = { kty: key_type, n: modulus, e: exponent};
    var pem = jwkToPem(jwk);
    pems[key_id] = pem;
}

const response401 = {
    status: '401',
    statusDescription: 'Unauthorized'
};

const response301 = {
      status: '301',
      statusDescription: 'Redirecting to index',
      headers: {
        location: [{
          key: 'Location',
          value: 'http://localhost:8080'
        }]
      }
    };

exports.handler = (event, context, callback) => {
    const cfrequest = event.Records[0].cf.request;
    const headers = cfrequest.headers;
    console.log('getting started');
    console.log('USERPOOLID=' + USERPOOLID);
    console.log('region=' + region);
    console.log('pems=' + pems);

    //Fail if no authorization header found
    if(!headers.authorization) {
        console.log("no auth header");
        callback(null, response301);
        return false;
    }

    //strip out "Bearer " to extract JWT token only
    var jwtToken = headers.authorization[0].value.slice(7);
    console.log('jwtToken=' + jwtToken);

    //Fail if the token is not jwt
    var decodedJwt = jwt.decode(jwtToken, {complete: true});
    if (!decodedJwt) {
        console.log("Not a valid JWT token");
        callback(null, response301);
        return false;
    }

    //Fail if token is not from your UserPool
    if (decodedJwt.payload.iss != iss) {
        console.log("invalid issuer");
        callback(null, response301);
        return false;
    }

    //Reject the jwt if it's not an 'Access Token'
    if (decodedJwt.payload.token_use != 'id') {
        console.log("Not an access token: ", decodedJwt.payload.token_use);
        callback(null, response301);
        return false;
    }

    //Get the kid from the token and retrieve corresponding PEM
    var kid = decodedJwt.header.kid;
    var pem = pems[kid];
    if (!pem) {
        console.log('Invalid access token');
        callback(null, response301);
        return false;
    }

    //Verify the signature of the JWT token to ensure it's really coming from your User Pool
    jwt.verify(jwtToken, pem, { issuer: iss }, function(err, payload) {
      if(err) {
        console.log('Token failed verification');
        callback(null, response301);
        return false;
      } else {
        //Valid token. 
        console.log('Successful verification');
        //remove authorization header
        delete cfrequest.headers.authorization;
        //CloudFront can proceed to fetch the content from origin
        callback(null, cfrequest);
        return true;
      }
    });
};