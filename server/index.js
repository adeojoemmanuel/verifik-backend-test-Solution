'use strict';
require('dotenv').config();
var restify = require('restify');
const cors = require('cors');
const corsMiddleware = require('restify-cors-middleware2');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const { randomHex32String } = require('./helpers');
const User = require('./models/user');
const base64url = require('base64url');
const {
	randomBase64URLBuffer,
	serverMakeCred,
	serverGetAssertion,
	verifyAuthenticatorAttestationResponse,
	verifyAuthenticatorAssertionResponse,
} = require('./helpers');


const app = restify.createServer({name: 'webauthn'});
var corss = corsMiddleware({
	preflightMaxAge: 5,
	origins: ['*'],
	allowHeaders:['X-App-Version'],
	exposeHeaders:[]
});
app.use(cors());
app.opts('*', (req, res) => res.send(204));
app.pre(corss.preflight);
app.use(corss.actual);
app.use(restify.plugins.jsonp());
app.use(restify.plugins.jsonp());
app.use(restify.plugins.bodyParser({requestBodyOnGet: true}));


app.use(
	cookieSession({
		name: 'seesion',
		keys: [randomHex32String()],
		maxAge: 24 * 60 * 60 * 1000,
	})
);

app.use(cookieParser());

// __dirname+
app.get('/*', restify.plugins.serveStatic({
	directory: './dist',
	default: 'index.html',
	appendRequestPath: false
}));



// app.get('/', (req, res) => {
// 	res.send('Restify server is up and running');
// });

app.post('/webauthn/register', async (req, res) => {
	const { email } = req.body;
	if (!email) return res.send(400, {message: 'Missing email field'});

	const findUser = await User.findOne({ email });

	if (findUser) return res.send(400, {message: 'User already exists'});
	else {
		const user = await User.create({
			id: randomBase64URLBuffer(8),
			name: email.split('@')[0],
			email,
		});
		user.save();

		let makeCredChallenge = serverMakeCred(user.id, user.email);
		makeCredChallenge.status = 'ok';

		req.session.challenge = makeCredChallenge.challenge;
		req.session.email = email;

		return res.json(makeCredChallenge);
	}
});

app.post('/webauthn/registerfail', async (req, res) => {
	const { email } = req.body;
	if (!email) return res.send(200, {message: 'Missing email field'});
	await User.deleteOne({ email });
	return res.send(200, {message:'Deleted'});
});

app.post('/webauthn/login', async (req, res) => {
	const { email } = req.body;

	if (!email) return res.send(400, {message:'Missing email field'});

	const user = await User.findOne({ email });

	if (!user) return res.send(400, {message:'User does not exist'});
	else {
		let getAssertion = serverGetAssertion(user.authenticators);
		getAssertion.status = 'ok';

		req.session.challenge = getAssertion.challenge;
		req.session.email = email;
		return res.json(getAssertion);
	}
});

app.post('/webauthn/response', async (req, res) => {
	if (
		!req.body ||
    !req.body.id ||
    !req.body.rawId ||
    !req.body.response ||
    !req.body.type ||
    req.body.type !== 'public-key'
	) {
		return res.json({
			status: 'failed',
			message:
        'Response missing one or more of id/rawId/response/type fields, or type is not public-key!',
		});
	}
	const { email } = req.session;
	const webAuthnResp = req.body;
	const clientData = JSON.parse(
		base64url.decode(webAuthnResp.response.clientDataJSON)
	);
	if (clientData.challenge !== req.session.challenge) {
		return res.json({
			status: 'failed',
			message: 'Challenges don\'t match!',
		});
	}
	let result;
	let user = await User.findOne({ email });
	if (webAuthnResp.response.attestationObject !== undefined) {
		/* This is create cred */
		result = await verifyAuthenticatorAttestationResponse(webAuthnResp);

		if (result.verified) {
			user.authenticators.push(result.authrInfo);
			user.registered = true;
			user.save();
		}
	} else if (webAuthnResp.response.authenticatorData !== undefined) {
		/* This is get assertion */
		result = await verifyAuthenticatorAssertionResponse(
			webAuthnResp,
			user.authenticators
		);
	} else {
		return res.json({
			status: 'failed',
			message: 'Can not determine type of response!',
		});
	}
	if (result.verified) {
		req.session.loggedIn = true;
		return res.json({ status: 'ok' });
	} else {
		return res.json({
			status: 'failed',
			message: 'Can not authenticate signature!',
		});
	}
});

app.get('/webauthn/profile', async (req, res) => {
	if (!req.session.loggedIn) return res.status(401).send('Denied!');

	const user = await User.findOne({ email: req.session.email });

	return res.json(user);
});

app.get('/webauthn/logout', (req, res) => {
	req.session = null;
	return res.send('Logged out');
});


const port = process.env.PORT || 8080;

app.listen(port, () => {
	console.log('Server listening on http://localhost:' + port);
});
