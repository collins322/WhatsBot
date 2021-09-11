//jshint esversion:8
const express = require('express');
const app = express();
const { Client, MessageMedia } = require('whatsapp-web.js');
const config = require('./config');
const fs = require("fs");

const availableCommands = new Set();

fs.readdir("./commands", (err, files) => {
    if (err) 
        return console.error(e);
    files.forEach(commandFile => {
        availableCommands.add(commandFile.replace(".js", ""));
    });
});

const client = new Client({ puppeteer: { headless: true, args: ['--no-sandbox'] }, session: config.session });

client.initialize();

client.on('auth_failure', msg => {
    console.error("There is a problem in authentication, Kindly set the env var again and restart the app");
});

client.on('ready', () => {
    console.log('Bot has been started');
});

client.on('message_create', async msg => {
    if(msg.fromMe && msg.body.startsWith('!')) {
        let args = msg.body.slice(1).trim().split(/ +/g);
        let command = args.shift().toLowerCase();

        if (availableCommands.has(command)) {
            require(`./commands/${command}`).run(client, msg, args);
        }

        else {
            client.sendMessage(msg.to,'No such command found');
        }
    }
});