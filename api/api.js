require("dotenv").config();
const mongoose = require('mongoose');
const fs = require('fs');
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
var privateKey = fs.readFileSync("creds/cloudflare/rygb.tech.pem", "utf8");
var certificate = fs.readFileSync("creds/cloudflare/rygb.tech.crt", "utf8");
var credentials = { key: privateKey, cert: certificate };

const app = express();
var jsonParser = bodyParser.json();
const corsOptions = {
    origin: process.env.FRONTEND_HOST,
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

main().catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to mongo.");
    } catch (err) {
        console.log(err);
    }
}

//events attended array will be filled with event ids
const Account = mongoose.model("Account", {
    uuid: { type: String, default: "" },
    email: { type: String, default: "" },
    name: { type: String, default: "" },
    role: { type: String, default: "Supporter" },
    password: { type: String, default: "" },
    area: { type: String, default: "D.C." },
    phone: { type: Number, default: 1234567890 },
    dateJoined: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
    eventsAttended: { type: Array, default: [] },
    donations: { type: Array, default: [] },
})

const Donations = mongoose.model("Donations", {
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
})

const Tracker = mongoose.model("Tracker", {
    uuid: { type: String, default: "" },
    page: { type: String, default: "" },
    view: { type: String, default: "" },
    date: { type: Date, default: Date.now },
})

const Event = mongoose.model("Event", {
    id: { type: String, default: "" },
    event: { type: Object, default: {} },
    analytics: {
        type: Object, default: {
            views: 0,
            attendees: [],
            clicks: 0,
        }
    },
})

const BlogPost = mongoose.model("BlogPost", {
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    visible: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },
})

//A NourishDMV account is required to register for events
app.post("/registerEvent", jsonParser, async (req, res) => {
    Event.findOneAndUpdate(
        { id: req.body.eventId },
        { $push: { "analytics.attendees": req.body.uuid } }
    ).then((event) => {
        Account.findOneAndUpdate({ uuid: req.body.uuid }, { $push: { eventsAttended: req.body.eventId } }).then((account) => {
            if (account) {
                res.status(200).send({ uuid: account.uuid, status: "Account registered for event." });
            } else {
                res.status(400).send("Account not found.");
            }
        }).catch((err) => {
            res.status(400).send(err);
        })
    }).catch((err) => {
        res.status(400).send(err);
    })
})

app.post("/unregisterEvent", jsonParser, async (req, res) => {
    Event.findOneAndUpdate({ id: req.body.eventId }, { $pull: { "analytics.attendees": req.body.uuid } }).then((event) => {
        Account.findOneAndUpdate({ uuid: req.body.uuid }, { $pull: { eventsAttended: req.body.eventId } }).then((account) => {
            if (account) {
                res.status(200).send({ uuid: account.uuid, status: "Account unregistered for event." });
            } else {
                res.status(400).send("Account not found.");
            }
        }).catch((err) => {
            res.status(400).send(err);
        })
    }).catch((err) => {
        res.status(400).send(err);
    })
})

app.post("/signIn", jsonParser, async (req, res) => {
    Account.findOneAndUpdate({ uuid: req.body.uuid }, { lastLogin: Date.now() }).then((account) => {
        if (account) {
            res.status(200).send({ uuid: account.uuid, status: "Logged Sign In" });
        } else {
            res.status(400).send("Account not found.");
        }
    }).catch((err) => {
        console.log(err)
        res.status(400).send(err);
    })
})

app.get("/requestSignIn", async (req, res) => {
    Account.findOne({ email: req.query.email }).then((account) => {
        if (account) {
            //account with that email exists now check if the password matches
            if (account.password == req.query.password) {
                //update last login
                Account.findOneAndUpdate({ uuid: account.uuid }, { lastLogin: Date.now() }).then((account) => {
                    if (account) {
                        res.status(200).send({ uuid: account.uuid, status: "Sign In approved.", lastLogin: Date.now() });
                    } else {
                        res.status(400).send("Account not found.");
                    }
                }).catch((err) => {
                    console.log(err)
                    res.status(400).send(err);
                })
            } else {
                res.status(400).send("Incorrect password.");
            }
        } else {
            res.status(400).send("Account not found.");
        }
    }).catch((err) => {
        console.log(err)
        res.status(400).send(err);
    })
})

app.get("/getBlogPosts", async (req, res) => {
    try {
        BlogPost.find({}).then((posts) => {
            if (posts) {
                res.status(200).send(posts);
            } else {
                res.status(400).send("No posts found.");
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.post("/newPost", jsonParser, async (req, res) => {
    try {
        const post = new BlogPost({
            title: req.body.title,
            content: req.body.content,
            visible: req.body.visible,
        })
        await post.save();
        res.status(200).send(post);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.post("/createEvent", jsonParser, async (req, res) => {
    try {
        const eventobj = req.body.event;
        const event = new Event({
            id: uuidv4(),
            event: eventobj
        })
        await event.save();
        res.status(200).send(event);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.post("/updateEvent", jsonParser, async (req, res) => {
    try {
        const eventobj = req.body.event;
        Event.findOne({ id: req.query.id }).then((event) => {
            if (event) {
                event.event = eventobj;
                event.save();
                res.status(200).send(event);
            } else {
                res.status(400).send("Event not found.");
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.post("/deleteEvent", jsonParser, async (req, res) => {
    try {
        Event.findOneAndDelete({ id: req.query.id }).then((event) => {
            if (event) {
                res.status(200).send(event);
            } else {
                res.status(400).send("Event not found.");
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.get("/getEvents", async (req, res) => {
    try {
        Event.find({}).then((events) => {
            if (events) {
                res.status(200).send(events);
            } else {
                res.status(400).send("No events found.");
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.get("/getEvent", async (req, res) => {
    try {
        Event.findOne({ id: req.query.id }).then((event) => {
            if (event) {
                res.status(200).send(event);
            } else {
                res.status(400).send("Event not found.");
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.post("/createAccount", jsonParser, async (req, res) => {
    //password has already been hashed by frontend
    try {
        Account.findOne({ email: req.body.email }).then(async (account) => {
            if (account) {
                res.status(400).send("Account with that email already exists.");
            } else {
                const uuid = uuidv4();
                const account = new Account({
                    uuid: uuid,
                    email: req.body.email,
                    name: req.body.name,
                    password: req.body.password,
                    phone: req.body.phone,
                    area: req.body.area,
                    dateJoined: Date.now(),
                    lastLogin: Date.now(),
                })
                await account.save();
                res.status(200).send({ uuid: uuid, status: "Account created." });
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
});

app.get("/getAccounts", async (req, res) => {
    try {
        Account.find({}).then((accounts) => {
            if (accounts) {
                res.status(200).send(accounts);
            } else {
                res.status(400).send("No accounts found.");
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.get("/getAccount", async (req, res) => {
    try {
        Account.findOne({ uuid: req.query.uuid }).then((account) => {
            if (account) {
                res.status(200).send(account);
            } else {
                res.status(400).send("Account not found.");
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

//anonymously track which page the user is on, for analytics
app.post("/track", jsonParser, async (req, res) => {
    //find one and update tracker, but if it doesn't exist, create a new one
    if (req.body.page == "Inactive") {
        Tracker.findOneAndDelete({ uuid: req.body.uuid }).then((tracker) => {
            res.status(200).send("Tracked.");
        }).catch((err) => {
            console.log(err)
            res.status(400).send(err);
        })
    } else {
        Tracker.findOneAndUpdate({ uuid: req.body.uuid }, { page: req.body.page, view: req.body.view, date: Date.now() }, { upsert: true }).then((tracker) => {
            res.status(200).send("Tracked.");
        }).catch((err) => {
            console.log(err)
            res.status(400).send(err);
        })
    }
})

app.get("/getTotalUsers", async (req, res) => {
    Tracker.find({}).then((trackers) => {
        var response = { today: 0, month: 0, all: 0 };
        for (var i = 0; i < trackers.length; i++) {
            var trackerDate = new Date(trackers[i].date);   
            if (trackerDate.getDate() == new Date().getDate()) {
                response.today++;
            }
            if (trackerDate.getMonth() == new Date().getMonth()) {
                response.month++;
            }
            response.all++;
        }
        console.log(response);
        res.status(200).send(response);
    }).catch((err) => {
        console.log(err)
        res.status(400).send(err);
    })
})

app.post("/addDonation", jsonParser, async (req, res) => {
    const donation = new Donations({
        amount: req.body.amount,
        date: Date.now(),
    })
    donation.save().then((donation) => {
        res.status(200).send(donation);
    }).catch((err) => {
        console.log(err)
        res.status(400).send(err);
    })
})

app.get("/getDonations", async (req, res) => {
    Donations.find({}).then((donations) => {
        res.status(200).send(donations);
    }).catch((err) => {
        console.log(err)
        res.status(400).send(err);
    })
})

app.get("/getTrackerStats", async (req, res) => {
    var active = 0;
    var homepage = {};
    var accounts = {};
    var dashboard = {};
    Tracker.find({}).then((trackers) => {
        for (var i = 0; i < trackers.length; i++) {
            //if the date of the tracker is within the last 1 minute, it is considered active
            const tracker = trackers[i];
            if (Date.now() - tracker.date < 60000) {
                active++;
                if (tracker.page == "Homepage") {
                    if (!homepage[tracker.view]) {
                        homepage[tracker.view] = 1;
                    } else {
                        homepage[tracker.view]++;
                    }
                } else if (tracker.page == "Accounts") {
                    if (!accounts[tracker.view]) {
                        accounts[tracker.view] = 1;
                    } else {
                        accounts[tracker.view]++;
                    }
                } else if (tracker.page == "Dashboard") {
                    if (!dashboard[tracker.view]) {
                        dashboard[tracker.view] = 1;
                    } else {
                        dashboard[tracker.view]++;
                    }
                }
            }
        }
        res.status(200).send({ active: active, homepage: homepage, accounts: accounts, dashboard: dashboard });
    }).catch((err) => {
        console.log(err)
        res.status(400).send(err);
    })
})

/*
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(8443, () => {
    console.log("HTTPS Server listening");
})
*/

app.listen(8443, () => {
    console.log("Server listening on port 8443");
})