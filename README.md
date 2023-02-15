# lambda-edge-function
Authorization@Edge: cómo utilizar tokens web Lambda@Edge y JSON para mejorar la seguridad de las aplicaciones web

# Copiar valores de USERPOOLID y JWKS
  <code>var USERPOOLID = '####';
  var JWKS = '####';</code>

Donde encuentro el JWKS????
-  Download and store the corresponding public JSON Web Key (JWK) for your user pool. It is available as part of a JSON Web Key Set (JWKS). You can locate it by   constructing the following URL for your environment:
-  https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json
  
  + info: https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
  
# Instalacion
 - npm install
 - comprimir en zip
 - Desde la funcion lambda de aws, cargar zip
