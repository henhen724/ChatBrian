require("dotenv").config()

const tmi = require("tmi.js");

const twitchOpts = {
    identity: {
        username: process.env.TWITCHUSERNAME,
        password: process.env.TWITCHPASSWORD
    },
    channels: [
        "HaroldHamburgler"
    ]
};

const twitchClient = new tmi.client(twitchOpts);

const AWS = require("aws-sdk");

AWS.config.update({ region: 'us-east-2' })

const polly = new AWS.Polly({ apiVersion: '2016-06-10' });

//Setup page serving
const app = require('express')()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/brain.html");
})

io.on('connection', client => {
    console.log("Browser connected.")
    client.on('disconnect', () => {
        console.error("OBS browser sourse disconnected.");
    })
})

server.listen(5692)

twitchClient.on('message', (target, ctx, msg, self) => {
    if (self) return;

    polly.synthesizeSpeech({ VoiceId: "Brian", Text: msg, OutputFormat: "mp3" }, (err, data) => {
        if (err)
            console.error(err);
        else {
            // console.log("Got brain speech back");
            io.emit("broadcast", data);
        }
    });
});

twitchClient.connect();