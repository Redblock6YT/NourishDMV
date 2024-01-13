require("dotenv").config();
const mongoose = require('mongoose');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to mongo.");
    }
  });
}

//events attended array will be filled with event ids
const Account = mongoose.model("Account", {
    uuid: {type: String, default: ""},
    email: {type: String, default: ""},
    role: {type: String, default: "Supporter"},
    password: {type: String, default: ""},
    phone: {type: Number, default: 1234567890},
    dateJoined: {type: Date, default: Date.now},
    lastLogin: {type: Date, default: Date.now},
    eventsAttended: {type: Array, default: []},
    donations: {type: Array, default: []},
})

const Event = mongoose.model("Event", {
    title: {type: String, default: ""},
    description: {type: String, default: ""},
    visible: {type: Boolean, default: true},
    status: {type: String, default: "pending"},
    registrationOpen: {type: Boolean, default: false},
    registrationStartDateTime: {type: Date, default: Date.now},
    registrationEndDateTime: {type: Date, default: Date.now},
    startDateTime: {type: Date, default: Date.now},
    endDateTime: {type: Date, default: Date.now},
    cost: {type: Number, default: 0},
})

const BlogPost = mongoose.model("BlogPost", {
    title: {type: String, default: ""},
    content: {type: String, default: ""},
    visible: {type: Boolean, default: true},
    date: {type: Date, default: Date.now},
})

app.post("/signIn", async (req, res) => {
    Account.findOneAndUpdate({uuid: req.body.uuid}, { lastLogin: Date.now() }, function(err, account) {
        if (err) {
            res.status(400).send(err);
        } else {
            if (account) {
                res.status(200).send({uuid: account.uuid, status: "Logged Sign In"});
            } else {
                res.status(400).send("Account not found.");
            }
        }
    })
})

app.post("/requestSignIn", async (req, res) => {
    Account.findOne({email: req.body.email}, function(err, account) {
        if (err) {
            res.status(400).send(err);
        } else {
            if (account) {
                //account with that email exists now check if the password matches
                if (account.password == req.body.password) {
                    res.status(200).send({uuid: account.uuid, status: "Sign In approved."});
                } else {
                    res.status(400).send("Incorrect password.");
                }
            } else {
                res.status(400).send("Account not found.");
            }
        }
    })
})

app.post("/newPost", async (req, res) => {
    try {
        const post = new BlogPost({
            title: req.body.title,
            content: req.body.content,
            visible: req.body.visible,
        })
        await post.save();
        res.status(200).send(post);
    } catch (err) {
        res.status(400).send(err);
    }
})

app.post("/createEvent", async (req, res) => {
    try {
        const event = new Event({
            title: req.body.title,
            description: req.body.description,
            visible: req.body.visible,
            status: req.body.status,
            registrationOpen: req.body.registrationOpen,
            registrationStartDateTime: req.body.registrationStartDateTime,
            registrationEndDateTime: req.body.registrationEndDateTime,
            startDateTime: req.body.startDateTime,
            endDateTime: req.body.endDateTime,
            cost: req.body.cost,
        })
        await event.save();
        res.status(200).send(event);
    } catch (err) {
        res.status(400).send(err);
    }
})

app.post("/createAccount", async (req, res) => {
    //password is hashed by frontend
    try {
        const uuid = uuidv4();
        const account = new Account({
            uuid: uuid,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            dateJoined: Date.now(),
            lastLogin: Date.now(),
        })
        await account.save();
        res.status(200).send(uuid);
    } catch (err) {
        res.status(400).send(err);
    }
});