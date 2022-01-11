const path = require('path');
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const app = express();
const memoryStore = new session.MemoryStore();

app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, '/view'));
app.use(express.static('static'));
app.use(session({
    secret: 'KWhjV<T=-*VW<;cC5Y6U-{F.ppK+])Ub',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));

const keycloak = new Keycloak({
    store: memoryStore,
});

app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/',
}));

app.get('/', (req, res) => res.redirect('/home'));

const parseToken = raw => {
    if (!raw || typeof raw !== 'string') return null;

    try {
        raw = JSON.parse(raw);
        const token = raw.id_token ? raw.id_token : raw.access_token;
        const content = token.split('.')[1];
        return JSON.parse(Buffer.from(content, 'base64').toString('utf-8'));
    } catch (e) {
        console.error('Error while parsing token: ', e);
    }
};

app.get('/home', keycloak.protect(), (req, res, next) => {
    const details = parseToken(req.session['keycloak-token']);
    const embedded_params = {};


    if (details) {
        embedded_params.name = details.name;
        embedded_params.email = details.email;
    }


    res.render('home', {
        username: embedded_params.name,
    });
});

app.get('/login', keycloak.protect(), (req, res) => {
    return res.redirect('home');
});


app.get('/UE1', keycloak.enforcer(['UE1:read-note'], {
    resource_server_id: 'my-note-application'
}), (req, res) => {
    return res.status(200).end('success');
});

app.get('/UE2', keycloak.enforcer(['UE2:read-note'], {
    resource_server_id: 'my-note-application'
}), (req, res) => {
    return res.json({
        "TP" : 20,
        "TD" : 15
    })
});

app.get('/UE3', keycloak.enforcer(['UE3:read-note'], {
    resource_server_id: 'my-note-application'
}), (req, res) => {
    return res.json({
        "TP": 20,
        "TD": 15
    });
});

app.get('/UE1/write', keycloak.enforcer(['UE1:write-note'], {
    resource_server_id: 'my-note-application'
}), (req, res) => {
    return res.json({key:"You can write notes in UE1"});
});

app.get('/UE2/write', keycloak.enforcer(['UE2:write-note'], {
    resource_server_id: 'my-note-application'
}), (req, res) => {
    return res.json({key:"You can write notes in UE2"});
});

app.get('/UE3/write', keycloak.enforcer(['UE3:write-note'], {
    resource_server_id: 'my-note-application'
}), (req, res) => {
    return res.json({key:"You can write notes in UE3"});
});

app.get('/UE1/validate', keycloak.enforcer(['UE1:valider-note'], {
    resource_server_id: 'my-note-application'
}), (req, res) => {
    return res.status(200).end('success');
});

app.get('/UE2/validate', keycloak.enforcer(['UE2:valider-note'], {
    resource_server_id: 'my-note-application'
}), (req, res) => {
    return res.status(200).end('success');
});

app.get('/UE3/validate', keycloak.enforcer(['UE3:valider-note'], {
    resource_server_id: 'my-note-application'
}), (req, res) => {
    return res.status(200).end('success');
});

app.use((req, res, next) => {
    return res.status(404).end('Not Found');
});

app.use((err, req, res, next) => {
    return res.status(req.errorCode ? req.errorCode : 500).end(req.error ? req.error.toString() : 'Internal Server Error');
});

const server = app.listen(3000, '127.0.0.1', () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log('Application running at http://%s:%s', host, port);
});
