const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = require('./firebase-config.json'); 

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;