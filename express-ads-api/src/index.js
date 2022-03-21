// ./src/index.js

// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const {startDatabase} = require('C:/Users/hadleyd/source/repos/Hadz369/express-ads-api/database/mongo');
const {insertAd, getAds, deleteAd, updateAd} = require('C:/Users/hadleyd/source/repos/Hadz369/express-ads-api/database/ads');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

// defining the Express app
const app = express();

// defining an array to work as the database (temporary solution)
const ads = [
  {title: 'Hello, world (again)!'}
];

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

// Validate a token supplied in the "Authorization: Bearer" header property
// with the auth0 service.
// This requires that an API has been created in auth0 where:
//   audience = <auth0 API identifier>
//   issuer = https://<auth0 tenant>.<auth0 region>.auth0.com/
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-9--ha733.us.auth0.com/.well-known/jwks.json'
  }),

  // Validate the audience and the issuer.
  audience: 'http://expressapidemo',
  issuer: 'https://dev-9--ha733.us.auth0.com/',
  algorithms: ['RS256']
});

// Defining the GET here prior to using the checkJwt function will not require authorisation
app.get('/', async (req, res) => {
  res.send(await getAds());
});

// If the app.use(checkJwt) line is uncommented, all API commands that appear after this will
// require an auth token to be validated using the checkJwt function, but I prefer to explicitly
// set the handler in each route...
//app.use(checkJwt);

app.delete('/:id', checkJwt,  async (req, res) => {
await deleteAd(req.params.id);
res.send({ message: 'Ad removed'});
});

app.post('/', checkJwt, async (req, res) => {
  const newAd = req.body;
  await insertAd(newAd);
  res.send({ message: 'New ad inserted' });
});

app.put('/:id', checkJwt, async (req, res) => {
  const body = req.body;
  await updateAd(req.params.id, body);
  res.send({ message: 'Ad updated'});
});

startDatabase().then(async () => {
    // await insertAd({title: 'Hello, now from the in-memory database!'});
    app.listen(3001, () => {
      console.log('listening on port 3001');
    });
});