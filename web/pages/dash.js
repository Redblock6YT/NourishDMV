import Head from 'next/head'
import styles from '@/styles/Dash.module.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image'
import anime from 'animejs'
import Cookies from 'js-cookie'

export default function Dash() {
    const router = useRouter();
    const [account, setAccount] = useState("");
    const [accountData, setAccountData] = useState({});
    const [adminView, setAdminView] = useState(false);
    const [step, setStep] = useState(0);
    const [mobile, setMobile] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [currentOverlayType, setCurrentOverlayType] = useState("d");

    function switchView(view) {
        const navbtns = document.getElementById("navbtns");
        for (var i = 0; i < navbtns.children.length; i++) {
            navbtns.children[i].style.backgroundColor = "#e3ab4a"
            navbtns.children[i].style.marginLeft = "0px"
        }
        document.getElementById(view + "btn").style.backgroundColor = "rgb(209, 156, 64)";
        document.getElementById(view + "btn").style.marginLeft = "10px";
        document.getElementById(view).scrollIntoView({ behavior: "smooth", block: "center" });
        router.push("/dash", "/dash?view=" + view, { shallow: true });
        refresh(view);
    }

    function openBlogPostViewer() {
        hideSidebar();
        anime({
            targets: "#v1b",
            opacity: 0,
            scale: 0.5,
            filter: "blur(50px)",
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                document.getElementById("v1b").style.display = "none";
                document.getElementById("v2b").style.display = "block";
                anime({
                    targets: "#v2b",
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 500,
                    easing: 'easeInOutQuad',
                })
            }
        })
    }

    function closeBlogPostViewer() {
        showSidebar();
        anime({
            targets: "#v2b",
            opacity: 0,
            scale: 0.5,
            filter: "blur(50px)",
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                document.getElementById("v2b").style.display = "none";
                document.getElementById("v1b").style.display = "block";
                anime({
                    targets: "#v1b",
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 500,
                    easing: 'easeInOutQuad',
                })
            }
        })
    }

    function refresh(view) {
        anime({
            targets: '#' + view + 'loading',
            opacity: 1,
            easing: 'linear',
            duration: 300,
        })
        anime({
            targets: "#" + view + "content",
            filter: "blur(40px)",
            scale: 0.9,
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                if (view == "accounts") {
                    axios({
                        method: "get",
                        url: "http://localhost:8445/getAccounts",
                    }).then((res) => {
                        const accounts = res.data;
                        var dc = 0;
                        var md = 0;
                        var va = 0;
                        setAccounts(accounts);
                        const accountslist = document.getElementById("accountslist");
                        while (accountslist.firstChild) {
                            accountslist.removeChild(accountslist.firstChild);
                        }
                        for (var i = 0; i < accounts.length; i++) {
                            const account = accounts[i];
                            var accountItem = document.createElement("div");
                            var accountName = document.createElement("p");
                            accountName.innerHTML = account.name;
                            accountName.style.margin = "0px";
                            accountName.className = styles.font;
                            accountItem.className = styles.item;
                            if (account.area == "D.C.") {
                                dc++;
                            } else if (account.area == "Maryland") {
                                md++;
                            } else if (account.area == "Virginia") {
                                va++;
                            }
                            accountItem.appendChild(accountName);
                            accountslist.appendChild(accountItem);
                        }
                        document.getElementById("dccount").innerHTML = dc;
                        document.getElementById("mdcount").innerHTML = md;
                        document.getElementById("vacount").innerHTML = va;
                        anime({
                            targets: accountsloading,
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                        anime({
                            targets: "#accountscontent",
                            filter: "blur(0px)",
                            duration: 500,
                            scale: 1,
                            easing: 'easeInOutQuad',
                        })
                    }).catch((err) => {
                        apiError(err);
                        anime({
                            targets: accountsloading,
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                    })
                } else if (view == "blog") {
                    axios({
                        method: "get",
                        url: "http://localhost:8445/getBlogPosts"
                    }).then((res) => {
                        const posts = res.data;
                        for (var i = 0; i < posts.length; i++) {
                            const post = posts[i];
                            var postItem = document.createElement("div");
                            var postTitle = document.createElement("p");
                            postTitle.innerHTML = post.title;
                            postTitle.style.margin = "0px";
                            postTitle.className = styles.font;
                            postItem.className = styles.item;
                            postItem.appendChild(postTitle);
                            document.getElementById("bloglist").appendChild(postItem);
                        }
                        document.getElementById("blogpostsnum").innerHTML = posts.length;
                        anime({
                            targets: "#" + view + "loading",
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                        anime({
                            targets: "#" + view + "content",
                            filter: "blur(0px)",
                            duration: 500,
                            scale: 1,
                            easing: 'easeInOutQuad',
                        })
                    }).catch((err) => {
                        apiError(err);
                        anime({
                            targets: "#" + view + "loading",
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                    })
                } else if (view == "events") {
                    axios({
                        method: "get",
                        url: "http://localhost:8445/getEvents"
                    }).then((res) => {
                        const events = res.data;
                        const eventslist = document.getElementById("eventslist");
                        while (eventslist.firstChild) {
                            eventslist.removeChild(eventslist.firstChild);
                        }

                        var pending = 0;
                        var inprog = 0;
                        var ended = 0;
                        for (var i = 0; i < events.length; i++) {
                            const event = events[i].event;
                            var eventItem = document.createElement("div");
                            var eventName = document.createElement("p");
                            eventName.innerHTML = event.title;
                            eventName.style.margin = "0px";
                            eventName.className = styles.font;
                            var icon = document.createElement("span");
                            icon.className = "material-symbols-rounded";
                            icon.style.fontSize = "30px";
                            icon.innerHTML = "chevron_right"
                            icon.style.margin = "auto"
                            icon.style.marginRight = "0px"
                            eventItem.className = [styles.item, styles.doublegrid].join(" ");
                            if (event.status == "Pending") {
                                pending++;
                            } else if (event.status == "On-Going") {
                                inprog++;
                            } else if (event.status == "Ended") {
                                ended++;
                            } else if (event.status == "Cancelled") {
                                continue;
                            } else if (event.status == "Scheduled (Auto)") {
                                if (Date.parse(event.startDateTime) > Date.now()) {
                                    pending++;
                                } else if (Date.parse(event.startDateTime) < Date.now() && Date.parse(event.endDateTime) > Date.now()) {
                                    inprog++;
                                } else if (Date.parse(event.endDateTime) < Date.now()) {
                                    ended++;
                                }
                            }

                            (function (eventid) {
                                eventItem.onclick = function () {
                                    openEventOverlay(eventid);
                                }
                            })(events[i].id);

                            eventItem.appendChild(eventName);
                            eventItem.appendChild(icon);
                            eventslist.appendChild(eventItem);
                        }
                        document.getElementById("pendingcount").innerHTML = pending;
                        document.getElementById("inprogcount").innerHTML = inprog;
                        document.getElementById("endedcount").innerHTML = ended;
                        document.getElementById("eventsamt").innerHTML = events.length;
                        anime({
                            targets: "#eventsloading",
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                        anime({
                            targets: "#eventscontent",
                            filter: "blur(0px)",
                            scale: 1,
                            duration: 500,
                            easing: 'easeInOutQuad',
                        })
                    }).catch((err) => {
                        console.log(err);
                        apiError(err);
                        anime({
                            targets: "#eventsloading",
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                    })
                }
            }
        })
    }

    function openEventOverlay(id) {
        const eventsoverlay = document.getElementById("eventsoverlay");
        anime({
            targets: "#affectbyeoverlay",
            scale: 0.8,
            opacity: 0.5,
            duration: 500,
            filter: "blur(10px)",
            easing: 'easeInOutQuad'
        })
        eventsoverlay.style.display = "block";
        eventsoverlay.style.height = "65%"
        anime({
            targets: eventsoverlay,
            scale: 1,
            opacity: 1,
            duration: 500,
            filter: "blur(0px)",
            easing: 'easeInOutQuad'
        })

        console.log(id)

        if (id) {
            document.getElementById("esubmitbtn").innerHTML == "Save Event"
            setSelectedEvent(id);
            axios({
                method: "get",
                url: "http://localhost:8445/getEvent?id=" + id
            }).then((res) => {
                const event = res.data.event;
                document.getElementById("ename").value = event.title;
                document.getElementById("edesc").value = event.description;
                document.getElementById("eloc").value = event.location;
                document.getElementById("evselect").value = event.visible;
                if (event.cost == "Free") {
                    document.getElementById("ecselect").value = "Free"
                    document.getElementById("eusdamount").style.display = "none";
                    document.getElementById("ecdoublegrid").style.gridTemplateColumns = "200px auto";
                } else {
                    document.getElementById("ecselect").value = "Paid"
                    document.getElementById("eusdamount").value = event.cost;
                    document.getElementById("eusdamount").style.display = "block";
                    document.getElementById("ecdoublegrid").style.gridTemplateColumns = "200px auto 200px";
                }
                document.getElementById("erselect").value = event.registrationStatus;
                document.getElementById("erst").value = event.registrationStartDateTime;
                document.getElementById("eret").value = event.registrationEndDateTime;
                document.getElementById("etselect").value = event.status;
                document.getElementById("est").value = event.startDateTime;
                document.getElementById("eet").value = event.endDateTime;
            }).catch((err) => {
                apiError(err);
            })
            document.getElementById("esubmitbtn").innerHTML = "Save Event"
            document.getElementById("submitdelgrid").style.display = "grid"
            document.getElementById("edelbtn").style.display = "block"
        } else {
            document.getElementById("ename").value = "";
            document.getElementById("edesc").value = "";
            document.getElementById("eloc").value = "";
            document.getElementById("evselect").value = "Visible";
            document.getElementById("ecselect").value = "Free";
            document.getElementById("eusdamount").value = "";
            document.getElementById("erselect").value = "Scheduled (Auto)";
            document.getElementById("erst").value = "";
            document.getElementById("eret").value = "";
            document.getElementById("etselect").value = "Scheduled (Auto)";
            document.getElementById("est").value = "";
            document.getElementById("eet").value = "";
            document.getElementById("esubmitbtn").innerHTML = "Add Event"
            document.getElementById("submitdelgrid").style.display = "block"
            document.getElementById("edelbtn").style.display = "none"
        }
    }

    function closeEventOverlay(type) {
        anime({
            targets: "#affectbyeoverlay",
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 500,
            easing: 'easeInOutQuad'
        })
        if (type == "add") {
            document.getElementById("eventsoverlay").style.display = "block";
            anime({
                targets: "#eventsoverlay",
                height: "10%",
                scale: 0.5,
                opacity: 0,
                filter: "blur(10px)",
                easing: 'easeInOutQuad',
                complete: function (anim) {
                    document.getElementById("eventsoverlay").style.display = "none";
                }
            })
        } else {
            anime({
                targets: "#eventsoverlay",
                scale: 1.2,
                opacity: 0,
                filter: "blur(10px)",
                duration: 500,
                easing: 'easeInOutQuad',
                complete: function (anim) {
                    document.getElementById("eventsoverlay").style.display = "none";
                }
            })
        }
    }

    useEffect(() => {
        anime({
            targets: "#v" + step + currentOverlayType,
            left: "50%",
            opacity: 1,
            easing: 'easeInOutQuad'
        })

        if (currentOverlayType == "d") {
            if (step == 2) {
                var amount = parseFloat(document.getElementById("v1damt").value).toFixed(2);
                document.getElementById("v2dh").innerHTML = "Donate $" + amount;
            } else if (step == 3) {
                // "process" the donation
                setTimeout(() => {
                    nextStep("d");
                }, 2000)
            }
        }
    }, [step])

    function nextStep(type) {
        if (step == 0) {
            setStep(1);
        } else {
            anime({
                targets: "#v" + step + type,
                left: "-100%",
                opacity: 0,
                easing: 'easeInOutQuad',
            })
            setStep(step + 1);
        }
    }

    function toggleSidebar() {
        if (sidebarOpen) {
            hideSidebar();
        } else {
            showSidebar();
        }
    }

    function showSidebar() {
        document.getElementById("content").style.gridTemplateColumns = "300px auto";
        document.getElementById("content").style.left = "50%";
        setSidebarOpen(true);
    }

    function hideSidebar() {
        document.getElementById("content").style.gridTemplateColumns = "300px 100%";
        const parentWidth = document.getElementById("mainelem").clientWidth;
        var left = (parentWidth / 2) - 325;
        document.getElementById("content").style.left = left + "px";
        setSidebarOpen(false);
    }

    function openOverlay(type) {
        setStep(0);
        setCurrentOverlayType(type);
        const donate = document.getElementById("donate");
        const volunteer = document.getElementById("volunteer");
        for (var i = 0; i < donate.children.length; i++) {
            donate.children[i].style.left = "150%"
            donate.children[i].style.opacity = "0"
        }

        for (var i = 0; i < volunteer.children.length; i++) {
            volunteer.children[i].style.left = "150%"
            volunteer.children[i].style.opacity = "0"
        }

        if (type == "d") {
            donate.style.display = "block";
            volunteer.style.display = "none";
        } else {
            volunteer.style.display = "block";
            donate.style.display = "none";
        }

        anime({
            targets: "#content",
            opacity: 0,
            duration: 500,
            easing: 'easeInOutQuad',
        })
        anime({
            targets: "#closeZigZag",
            opacity: 1,
            duration: 1000,
            easing: 'easeInOutQuad',
        })
        document.getElementById("differenceOverlay").style.display = "grid";
        anime({
            targets: "#zigZag",
            left: "0%",
            duration: 1000,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                nextStep(type);
            }
        })
    }

    function closeOverlay() {
        setStep(0);
        anime({
            targets: "#closeZigZag",
            opacity: 0,
            duration: 1000,
            easing: 'easeInOutQuad',
        })
        anime({
            targets: "#zigZag",
            left: "100%",
            duration: 1000,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                document.getElementById("differenceOverlay").style.display = "none";
                anime({
                    targets: "#content",
                    opacity: 1,
                    duration: 1000,
                    easing: 'easeInOutQuad',
                })
            }
        })
    }

    function push(path) {
        if (router.isReady) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.getElementById("splashscreenIntro").style.display = "block";
            document.body.style.overflowY = "hidden"
            setTimeout(() => {
                document.getElementById("splashscreenIntro").playbackRate = 0.5;
                document.getElementById("splashscreenIntro").play().catch((err) => {
                    console.log(err)
                });
                anime({
                    targets: '#splashscreenIntro',
                    opacity: 1,
                    duration: 500,
                    easing: 'easeInOutQuad',
                    complete: function (anim) {
                        router.push(path);
                    }
                })
            }, 100)
            anime({
                targets: '#content',
                opacity: 0,
                filter: "blur(20px)",
                duration: 1000,
                easing: 'easeInOutQuad'
            })
        }
    }

    function apiError(err) {
        console.log(err);
        var message = "Network Error"
        if (err.response) {
            message = err.response.data
        }
        document.getElementById("errorMessage").innerHTML = message;
        anime({
            targets: "#errorCard",
            bottom: "10px",
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                anime({
                    targets: "#errorCard",
                    bottom: "-50%",
                    duration: 500,
                    easing: 'easeInOutQuad',
                    delay: 5000,
                })
            }
        })
    }


    useEffect(() => {
        if (account != "") {
            axios({
                method: "get",
                url: "http://localhost:8445/getAccount?uuid=" + account
            }).then((res) => {
                setAccountData(res.data);
                document.getElementById("acctName").innerHTML = res.data.name.split(" ")[0];
                if (res.data.role == "Admin") {
                    setAdminView(true);
                }
            }).catch((err) => {
                console.log(err);
                if (err.response) {
                    if (err.response.data == "Account not found.") {
                        Cookies.remove("account");
                        setAccount("");
                        push("/accounts?view=Sign+In")
                    }
                } else {
                    apiError(err.message)
                }

            })
        }
    }, [account])

    useEffect(() => {
        if (router.isReady) {
            //once the page is fully loaded, play the splashscreen outro
            if (window.innerWidth <= 600) {
                setMobile(true);
            }

            if (Cookies.get("account") != undefined) {
                setAccount(Cookies.get("account"));
            }

            window.scrollTo(0, 0);
            document.getElementById("splashscreenOutro").play().catch((err) => {
                console.log(err)
            });
            document.getElementById("splashscreenOutro").pause();
            setTimeout(() => {
                document.getElementById("splashscreenOutro").play().catch((err) => {
                    console.log(err)
                });
                anime({
                    targets: '#splashscreenOutro',
                    opacity: 0,
                    duration: 200,
                    easing: 'linear',
                    complete: function (anim) {
                        document.getElementById("splashscreenOutro").style.display = "none";
                        document.body.style.overflowY = "hidden"
                        if (router.query.view != undefined) {
                            if (router.query.view == "volunteer") {
                                openOverlay("v");
                            } else if (router.query.view == "donate") {
                                openOverlay("d");
                            } else {
                                switchView(router.query.view);
                            }
                        }
                    }
                })
                anime({
                    targets: '#content',
                    opacity: 1,
                    duration: 200,
                    easing: 'linear'
                })
            }, 500)
        }
    }, [router.isReady])

    return (
        <>
            <Head>
                <title>Dashboard | NourishDMV</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" />
            </Head>
            <main id="mainelem" style={{ overflow: 'hidden' }}>
                <video id="splashscreenOutro" playsInline preload="auto" muted className="splashScreen"><source src="anim_ss_ndmv_outro.mp4" type="video/mp4" /></video>
                <video id="splashscreenIntro" playsInline muted className="splashScreen" style={{ display: "none", opacity: 0 }}><source src="anim_ss_ndmv_intro.mp4" type="video/mp4" /></video>
                <div id="content" style={{ opacity: 0, overflow: "visible", transition: "all ease 0.5s" }} className={styles.sidebarContent}>
                    <div style={{ padding: "15px", width: "100%" }}>
                        <div className={styles.sidebar}>
                            <div style={{ padding: "15px" }}>
                                <div id="navbtns">
                                    <button id="aagbtn" className={styles.sidebarItem} onClick={() => switchView("aag")}>At a glance</button>
                                    <button id="accountsbtn" className={styles.sidebarItem} onClick={() => switchView("accounts")} style={{ display: (adminView) ? "block" : "none" }}>Accounts</button>
                                    <button id="blogbtn" className={styles.sidebarItem} onClick={() => switchView("blog")}>Blog</button>
                                    <button id="eventsbtn" className={styles.sidebarItem} onClick={() => switchView("events")}>Events</button>
                                    <button id="donationsbtn" className={styles.sidebarItem} onClick={() => switchView("donations")}>Donations</button>
                                    <button id="mebtn" className={styles.sidebarItem} onClick={() => switchView("me")} style={{ display: (account == "") ? "none" : "block" }}>Me</button>
                                </div>
                                <button className={styles.sidebarItem} onClick={() => push("/accounts?view=Sign+In")} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 50, zIndex: "100", width: "280px", display: (account == "") ? "block" : "none" }}>Sign In</button>
                                <div className={styles.sidebarItem} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 50, zIndex: "100", width: "280px", display: (account != "") ? "block" : "none", backgroundColor: "rgba(255, 208, 128, 0.692)", border: "1px solid #e3ab4a", cursor: "initial" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "60px auto 50px", padding: "10px", height: "50px" }}>
                                        <div id="picture" style={{ backgroundColor: "#e3ab4a", width: "50px", height: "100%", borderRadius: "15px" }}>
                                        </div>
                                        <h3 style={{ margin: "auto", marginLeft: "0px", color: "#e3ab4a", textAlign: "left" }} id="acctName">Name</h3>
                                        <div id="logout" className={styles.hover} onClick={() => {
                                            Cookies.remove("account");
                                            setAccount("");
                                            push("/accounts?view=Sign+In")
                                        }} style={{ backgroundColor: "#e3ab4a", position: "relative", width: "40px", height: "40px", borderRadius: "15px", margin: "auto", marginRight: "0px" }}>
                                            <span className={["material-symbols-rounded", styles.fullycenter].join(" ")} style={{ fontSize: "30px", margin: "auto" }}>logout</span>
                                        </div>
                                    </div>
                                </div>
                                <Image style={{ bottom: 10, position: "absolute", left: "50%", transform: "translateX(-50%)" }} src="logo.svg" alt="NourishDMV Logo" height={45} width={200} />
                            </div>
                        </div>
                    </div>
                    <div id="screens" style={{ overflowX: "hidden", overflowY: "hidden", padding: "15px" }}>
                        <div id="aag" className={styles.screen} style={{ marginTop: "0px" }}>
                            <div style={{ padding: "20px" }}>
                                <h3 className={styles.screenheading}>At a glance</h3>
                                <div className={styles.divider}></div>
                                <div id="admin" style={{ display: (adminView) ? "block" : "none" }}>
                                    <h4 className={styles.screensubheading}>All time statistics</h4>
                                    <div style={{ margin: "20px" }}>
                                        <div className={styles.bentobox}>
                                            <p style={{ position: "absolute", top: 15, left: 15, margin: "0px", fontWeight: "normal" }}>total donated</p>
                                            <p style={{ position: "absolute", bottom: 15, right: 15, margin: "0px" }}>$1.1M</p>
                                        </div>
                                        <div className={styles.bentobox}>
                                            <p style={{ position: "absolute", top: 15, left: 15, margin: "0px" }}>572</p>
                                            <p style={{ position: "absolute", bottom: 15, right: 15, margin: "0px", fontWeight: "normal", fontSize: "35px", textAlign: "right" }}>volunteers registered</p>
                                        </div>
                                        <div className={styles.bentobox}>
                                            <p style={{ position: "absolute", top: 15, left: 15, margin: "0px", fontWeight: "normal", fontSize: "35px", }}>accounts registered</p>
                                            <p style={{ position: "absolute", bottom: 15, right: 15, margin: "0px" }}>{accounts.length}</p>
                                        </div>
                                        <div className={styles.bentobox}>
                                            <p style={{ position: "absolute", top: 15, left: 15, margin: "0px" }}>5K</p>
                                            <p style={{ position: "absolute", bottom: 15, right: 15, margin: "0px", fontWeight: "normal", fontSize: "35px", textAlign: "right" }}>total page views</p>
                                        </div>
                                        <div className={styles.bentobox}>
                                            <p style={{ position: "absolute", top: 15, left: 15, margin: "0px", fontWeight: "normal", fontSize: "35px", }}>number of events</p>
                                            <p style={{ position: "absolute", bottom: 15, right: 15, margin: "0px" }}>0</p>
                                        </div>
                                        <div className={styles.bentobox}>
                                            <p style={{ position: "absolute", top: 15, left: 15, margin: "0px" }}>0</p>
                                            <p style={{ position: "absolute", bottom: 15, right: 15, margin: "0px", fontWeight: "normal", fontSize: "35px", textAlign: "right" }}>attendees at events</p>
                                        </div>
                                    </div>
                                    <h4 className={styles.screensubheading}>Recent Donation Activity</h4>
                                    <div id="recentactivity" className={styles.previewbento} style={{ margin: "20px" }}>
                                        <button className={styles.minilistitem}>Sauron Monet donated $955</button>
                                        <button className={styles.minilistitem}>Aurelia Gallia donated $162</button>
                                        <button className={styles.minilistitem}>Neela Abraham donated $20</button>
                                        <button className={styles.minilistitem}>Aadan De Ven donated $32</button>
                                        <h3 className={styles.font} style={{ position: "absolute", bottom: 0, zIndex: 100, left: "50%", transform: "translateX(-50%)", color: "white", fontSize: "30px", textShadow: "0px 0px 50px #000000" }}>View More</h3>
                                    </div>
                                </div>
                                <div id="non-admin" style={{ display: (!adminView) ? "block" : "none" }}>
                                    <h3 className={styles.screensubheading} style={{ color: "black", marginBottom: "20px", textAlign: "center" }}>Make a difference: <a style={{ backgroundColor: "#fbac29ff" }}>Hands On</a></h3>
                                    <button className={[styles.button, styles.hover].join(" ")} style={{ margin: "auto", backgroundColor: "#fbe85dff", marginBottom: "15px", fontSize: "40px", fontWeight: "bold", display: "block" }} onClick={() => openOverlay("v")}>Join our team</button>
                                    <div className={styles.divider}></div>
                                    <div style={{ display: (account == "") ? "none" : "block" }}>
                                        <h4 className={styles.screensubheading}>Your Upcoming Events</h4>
                                        <div id="upcomingeventsl" style={{ margin: "20px" }}>
                                            <div className={styles.card}>
                                                <div className={styles.fullycenter} style={{ width: "100%" }}>
                                                    <p className={styles.font} style={{ fontSize: "25px", textAlign: "center", color: "rgba(0, 0, 0, 0.300)", fontWeight: "bold" }}>You aren't apart of any events</p>
                                                    <button className={[styles.minibutton, styles.hover].join(" ")} onClick={() => switchView("events")}>View Events</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className={styles.screensubheading}>{(account == "") ? "Events Happening Now" : "Other Events"}</h4>
                                        <div id="othereventsl" style={{ margin: "20px" }}>
                                            <div className={styles.card}>
                                                <div className={styles.fullycenter} style={{ width: "100%" }}>
                                                    <p className={styles.font} style={{ fontSize: "30px", textAlign: "center", color: "rgba(0, 0, 0, 0.300)", fontWeight: "bold" }}>No events to show</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div id="accounts" className={styles.screen} style={{ display: (adminView) ? "block" : "none" }}>
                            <div style={{ padding: "20px" }}>
                                <div className={styles.doublegrid} style={{ width: "300px", gridTemplateColumns: "70px auto 50px" }}>
                                    <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span style={{ fontSize: "30px", color: "rgb(227, 171, 74)" }} className="material-symbols-rounded">{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                    <h3 className={styles.screenheading}>Accounts</h3>
                                    <div className={styles.loading} id="accountsloading"></div>
                                </div>
                                <div id="accountscontent">
                                    <div style={{ margin: "20px" }}>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>{accounts.length}</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>accounts</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>volunteers</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>donators</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p id="dccount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>from DC</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p id="mdcount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", textAlign: "center", fontWeight: "normal", fontSize: "30px" }}>from Maryland</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p id="vacount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>from Virginia</p>
                                        </div>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div id="accountslist" style={{ width: "70%", margin: "auto" }}>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="blog" className={styles.screen}>
                            <div style={{ padding: "20px" }}>
                                <div id="v1b">
                                    <div className={styles.doublegrid} style={{ width: "300px", gridTemplateColumns: "70px auto 50px" }}>
                                        <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span style={{ fontSize: "30px", color: "rgb(227, 171, 74)" }} className="material-symbols-rounded">{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                        <h3 className={styles.screenheading}>Blog</h3>
                                        <div className={styles.loading} id="blogloading"></div>
                                    </div>

                                    <div id="blogcontent">
                                        <div style={{ margin: "20px" }}>
                                            <div className={styles.bentoboxShorter}>
                                                <p id="blogpostsnum" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>posts</p>
                                            </div>
                                        </div>
                                        <div className={styles.divider}></div>
                                        <div style={{ width: "80%", margin: "auto" }}>
                                            <div id="eventsnavbar" style={{ gridTemplateColumns: "75% auto" }} className={styles.doublegrid}>
                                                <input className={styles.input} style={{ backgroundColor: "rgba(255, 208, 128, 0.692)" }} id="eventssearch" placeholder="Search with title"></input>
                                                <button style={{ width: "100%" }} className={styles.managebutton} onClick={() => openBlogPostViewer()}>New Post</button>
                                            </div>
                                            <div id="bloglist">

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="v2b" style={{ display: "none", transform: "scale(0.5)", opacity: 0, filter: "blur(50px)" }}>
                                    <div className={styles.doublegrid} style={{ width: "600px", gridTemplateColumns: "70px auto 50px" }}>
                                        <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => closeBlogPostViewer()} id="openCloseSidebarAcc"><span style={{ fontSize: "30px", color: "rgb(227, 171, 74)" }} className="material-symbols-rounded">arrow_back</span></button>
                                        <h3 className={styles.screenheading}>Blog Post Viewer</h3>
                                        <div className={styles.loading} id="blogpostloading"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="events" className={styles.screen} style={{ position: "relative" }}>
                            <div style={{ padding: "20px" }}>
                                <div id="affectbyeoverlay">
                                    <div className={styles.doublegrid} style={{ width: "300px", gridTemplateColumns: "70px auto 50px" }}>
                                        <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span style={{ fontSize: "30px", color: "rgb(227, 171, 74)" }} className="material-symbols-rounded">{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                        <h3 className={styles.screenheading}>Events</h3>
                                        <div className={styles.loading} id="eventsloading"></div>
                                    </div>
                                    <div id="eventscontent">
                                        <div style={{ margin: "20px" }}>
                                            <div className={styles.bentoboxShorter}>
                                                <p id="attcount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", textAlign: "center", fontWeight: "normal", fontSize: "30px" }}>total attendees</p>
                                            </div>
                                            <div className={styles.bentoboxShorter}>
                                                <p id="eventsamt" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>events</p>
                                            </div>
                                            <div className={styles.bentoboxShorter} style={{ backgroundColor: "#ffff0072", color: "black" }}>
                                                <p id="pendingcount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>pending</p>
                                            </div>
                                            <div className={styles.bentoboxShorter} style={{ backgroundColor: "#fbac29ff" }}>
                                                <p id="inprogcount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>in progress</p>
                                            </div>
                                            <div className={styles.bentoboxShorter} style={{ backgroundColor: "#f66d4bff" }}>
                                                <p id="endedcount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>ended</p>
                                            </div>
                                        </div>
                                        <div className={styles.divider}></div>
                                        <div id="adminview" style={{ display: (adminView) ? "block" : "none", width: "80%", margin: "auto" }}>
                                            <div id="eventsnavbar" style={{ gridTemplateColumns: "80% auto", gridGap: "15px" }} className={styles.doublegrid}>
                                                <input className={styles.input} style={{ backgroundColor: "rgba(255, 208, 128, 0.692)" }} id="eventssearch" placeholder="Search with name"></input>
                                                <button style={{ width: "100%" }} className={styles.managebutton} onClick={() => openEventOverlay()}>New Event</button>
                                            </div>
                                            <div id="eventslist"></div>
                                        </div>
                                        <div id="non-adminview" style={{ display: (adminView) ? "none" : "block" }}>
                                            <div id="nonadmineventslist"></div>
                                        </div>
                                    </div>
                                </div>

                                <div id="eventsoverlay" style={{ overflowY: "auto", overflowX: "visible", display: "none", width: "70%", padding: "10%", height: "65%", transform: "translateX(-50%) translateY(-50%) scale(1.2)", filter: "blur(10px)", opacity: 0 }} className={styles.fullycenter}>
                                    <button className={[styles.closebutton, styles.hover].join(" ")} onClick={() => closeEventOverlay()}><span class="material-symbols-rounded" style={{ fontSize: "40px" }}>close</span></button>
                                    <div style={{ backgroundColor: "rgb(227, 171, 74)", height: "300px", width: "100%", borderRadius: "25px", display: "none" }}></div>
                                    <div>
                                        <input id="ename" className={styles.slickttt} style={{ marginTop: "20px" }} placeholder="Event Title"></input>
                                        <textarea id="edesc" onInput={() => {
                                            document.getElementById("edesc").style.height = "auto";
                                            document.getElementById("edesc").style.height = (document.getElementById("edesc").scrollHeight) + "px";
                                        }} className={styles.slickttt} style={{ fontSize: "30px", fontWeight: "normal", height: "100px" }} placeholder="Event Description"></textarea>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div id="eldoublegrid" className={styles.doublegrid} style={{ gridTemplateColumns: "300px auto" }}>
                                        <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Event Location</h3>
                                        <input id="eloc" placeholder="Location" className={styles.input}></input>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div id="evdoublegrid" className={styles.doublegrid} style={{ gridTemplateColumns: "150px auto" }}>
                                        <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Visibility</h3>
                                        <select id="evselect" className={styles.input}>
                                            <option>Visible</option>
                                            <option>Hidden</option>
                                        </select>
                                    </div>
                                    <div id="ecdoublegrid" className={styles.doublegrid} style={{ gridTemplateColumns: "200px auto" }}>
                                        <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Event Cost</h3>
                                        <select id="ecselect" className={styles.input} onInput={() => {
                                            if (document.getElementById("ecselect").value == "Paid") {
                                                document.getElementById("eusdamount").style.display = "block";
                                                document.getElementById("ecdoublegrid").style.gridTemplateColumns = "200px auto 200px";
                                            } else {
                                                document.getElementById("eusdamount").style.display = "none";
                                                document.getElementById("ecdoublegrid").style.gridTemplateColumns = "200px auto";
                                            }
                                        }}>
                                            <option>Free</option>
                                            <option>Paid</option>
                                        </select>
                                        <input id="eusdamount" className={styles.input} style={{ display: "none" }} placeholder="USD Amount"></input>
                                    </div>
                                    <div id="erdoublegrid" className={styles.doublegrid} style={{ gridTemplateColumns: "300px auto" }}>
                                        <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Registration Status</h3>
                                        <select id="erselect" className={styles.input} onInput={() => {
                                            if (document.getElementById("erselect").value == "Scheduled (Auto)") {
                                                document.getElementById("erdtdoublegrid").style.display = "grid";
                                            } else {
                                                document.getElementById("erdtdoublegrid").style.display = "none";
                                            }
                                        }}>
                                            <option>Scheduled (Auto)</option>
                                            <option>Open</option>
                                            <option>Closed</option>
                                        </select>
                                    </div>
                                    <div id="erdtdoublegrid" className={styles.doublegrid} style={{ display: "grid", gridGap: "15px" }}>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Registration Start</h3>
                                            <input id="erst" type="datetime-local" className={styles.input}></input>
                                        </div>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Registration End</h3>
                                            <input id="eret" type="datetime-local" className={styles.input}></input>
                                        </div>
                                    </div>
                                    <div id="etdoublegrid" className={styles.doublegrid} style={{ gridTemplateColumns: "200px auto" }}>
                                        <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Event Status</h3>
                                        <select id="etselect" className={styles.input} onInput={() => {
                                            if (document.getElementById("etselect").value == "Scheduled (Auto)") {
                                                document.getElementById("etdtdoublegrid").style.display = "grid";
                                            } else {
                                                document.getElementById("etdtdoublegrid").style.display = "none";
                                            }
                                        }}>
                                            <option>Scheduled (Auto)</option>
                                            <option>Pending</option>
                                            <option>On-Going</option>
                                            <option>Ended</option>
                                        </select>
                                    </div>
                                    <div id="etdtdoublegrid" className={styles.doublegrid} style={{ gridGap: "15px" }}>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Event Start</h3>
                                            <input id="est" type="datetime-local" className={styles.input}></input>
                                        </div>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Event End</h3>
                                            <input id="eet" type="datetime-local" className={styles.input}></input>
                                        </div>
                                    </div>
                                    <div id="submitdelgrid" className={styles.doublegrid} style={{ gridTemplateColumns: "70% auto", gridGap: "15px" }}>
                                        <button id="esubmitbtn" className={styles.managebutton} onClick={() => {
                                            if (document.getElementById("esubmitbtn").innerHTML == "Add Event") {
                                                axios({
                                                    method: "post",
                                                    url: "http://localhost:8445/createEvent",
                                                    data: {
                                                        event: {
                                                            title: document.getElementById("ename").value,
                                                            description: document.getElementById("edesc").value,
                                                            location: document.getElementById("eloc").value,
                                                            visible: document.getElementById("evselect").value,
                                                            status: document.getElementById("etselect").value,
                                                            registrationStatus: document.getElementById("erselect").value,
                                                            registrationStartDateTime: document.getElementById("erst").value,
                                                            registrationEndDateTime: document.getElementById("eret").value,
                                                            startDateTime: document.getElementById("est").value,
                                                            endDateTime: document.getElementById("eet").value,
                                                            cost: (document.getElementById("eusdamount").value == "") ? "Free" : parseFloat(document.getElementById("eusdamount").value).toFixed(2),
                                                        }
                                                    }
                                                }).then((res) => {
                                                    closeEventOverlay("add");
                                                    refresh("events")
                                                }).catch((err) => {
                                                    apiError(err)
                                                })
                                            } else if (document.getElementById("esubmitbtn").innerHTML = "Save Event") {
                                                console.log(selectedEvent)
                                                axios({
                                                    method: "post",
                                                    url: "http://localhost:8445/updateEvent?id=" + selectedEvent,
                                                    data: {
                                                        event: {
                                                            title: document.getElementById("ename").value,
                                                            description: document.getElementById("edesc").value,
                                                            location: document.getElementById("eloc").value,
                                                            visible: document.getElementById("evselect").value,
                                                            status: document.getElementById("etselect").value,
                                                            registrationStatus: document.getElementById("erselect").value,
                                                            registrationStartDateTime: document.getElementById("erst").value,
                                                            registrationEndDateTime: document.getElementById("eret").value,
                                                            startDateTime: document.getElementById("est").value,
                                                            endDateTime: document.getElementById("eet").value,
                                                            cost: (document.getElementById("eusdamount").value == "") ? "Free" : parseFloat(document.getElementById("eusdamount").value).toFixed(2),

                                                        },
                                                    }
                                                }).then((res) => {
                                                    closeEventOverlay("add");
                                                    refresh("events")
                                                }).catch((err) => {
                                                    console.log(err)
                                                    apiError(err)
                                                })
                                            }
                                        }}>Add Event</button>
                                        <button onClick={() => {
                                            axios({
                                                method: "post",
                                                url: "http://localhost:8445/deleteEvent?id=" + selectedEvent,
                                            }).then((res) => {
                                                closeEventOverlay();
                                                refresh("events")
                                            }).catch((err) => {
                                                apiError(err)
                                                console.log(err)
                                            })
                                        }} style={{ backgroundColor: "#ef3600b9" }} id="edelbtn" className={styles.managebutton}>Delete Event</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div id="differenceOverlay" className={styles.doublegrid} style={{ gridTemplateColumns: "auto 85%", position: "absolute", zIndex: "100", width: "100%", height: "100%", display: "none" }}>
                    <div id="closeZigZag" style={{ position: "relative", opacity: "0" }}>
                        <div className={styles.fullycenter}>
                            <h1 style={{ margin: "auto", marginBottom: "100px", fontSize: "40px", color: "#ce8400ff" }} className={styles.font}>Close</h1>
                            <div style={{ position: "relative" }} className={styles.hover} onClick={() => closeOverlay()}>
                                <div className={[styles.blurredCircle, styles.fullycenter].join(" ")}></div>
                                <span className={[styles.fullycenter, "material-symbols-rounded"].join(" ")} style={{ fontSize: "70px", color: "white" }}>close</span>
                            </div>
                        </div>
                    </div>
                    <div id="zigZag" className={styles.zigZag} style={{ '--lighterColor': "#ffe7bf", backgroundColor: "#ce8400ff", height: "100%", left: "100%" }}>
                        <div id="donate" style={{ position: "relative", height: "100%" }}>
                            <div id="v1d" className={styles.fullycenter} style={{ width: "85%", left: "150%", opacity: 0 }}>
                                <h1 className={styles.header}>Select donation amount</h1>
                                <p className={styles.subheader}>Your donation contributes to our goal of ensuring everyone in the DMV has food and shelter.</p>
                                <div className={styles.doublegrid} style={{ width: "250px", margin: "auto", marginTop: "100px", marginBottom: "100px", gridTemplateColumns: "50px auto", gridGap: "0px" }}>
                                    <h3 className={styles.header}>$</h3>
                                    <input id="v1damt" type="number" placeholder="5" className={styles.biginput} onInput={() => {
                                        if (document.getElementById("v1damt").value == "" || document.getElementById("v1damt").value == 0) {
                                            document.getElementById("v1dcont").style.visibility = "hidden";
                                            anime({
                                                targets: "#v1dcont",
                                                opacity: 0,
                                                duration: 300,
                                                easing: 'linear',
                                            })
                                        } else {
                                            document.getElementById("v1dcont").style.visibility = "visible";
                                            anime({
                                                targets: "#v1dcont",
                                                opacity: 1,
                                                duration: 300,
                                                easing: 'linear',
                                            })
                                        }
                                    }}></input>
                                </div>
                                <button id="v1dcont" onClick={() => nextStep("d")} className={[styles.minibutton, styles.hover].join(" ")} style={{ backgroundColor: "rgba(0, 0, 0, 0.281)", opacity: 0, visibility: "hidden" }}>Continue</button>
                            </div>
                            <div id="v2d" className={styles.fullycenter} style={{ width: "50%", left: "150%", opacity: 0 }}>
                                <h1 id="v2dh" className={styles.header}>Donate $0.00</h1>
                                <div className={styles.doublegrid} style={{ gridGap: "15px", marginTop: "50px" }}>
                                    <input className={styles.input} type='text' placeholder="Name"></input>
                                    <input className={styles.input} type="tel" placeholder="Phone Number"></input>
                                </div>

                                <input className={styles.input} type='text' placeholder="Email"></input>

                                <input className={styles.input} type="number" placeholder="Card Number"></input>
                                <div className={styles.doublegrid} style={{ gridGap: "15px" }}>
                                    <input className={styles.input} type="" placeholder="CVV"></input>
                                    <input className={styles.input} placeholder="Exp Date"></input>
                                </div>
                                <div className={styles.doublegrid} style={{ gridGap: "15px" }}>
                                    <select className={styles.input} placeholder="Name">
                                        <option>United States</option>
                                    </select>
                                    <input className={styles.input} placeholder="Zip Code"></input>
                                </div>
                                <button onClick={() => nextStep("d")} className={[styles.minibutton, styles.hover].join(" ")} style={{ width: "100%", marginTop: "5px", backgroundColor: "rgb(0 0 0 / 42%)" }}>Donate</button>
                            </div>
                            <div id="v3d" className={styles.fullycenter} style={{ width: "50%", left: "150%", opacity: 0 }}>
                                <div class="loading" style={{ display: "block", opacity: "1" }}></div>
                            </div>
                            <div id="v4d" className={styles.fullycenter} style={{ width: "50%", left: "150%", opacity: 0 }}>
                                <h1 className={styles.header}>Thank you!</h1>
                                <p className={styles.subheader}>Your donation has been processed. You can close this by clicking the close button on the left.</p>
                            </div>
                        </div>
                        <div id="volunteer" style={{ position: "relative", height: "100%" }}>
                            <div id="v1v" className={styles.fullycenter} style={{ width: "65%", left: "150%", opacity: 0 }}>
                                <h1 className={styles.header}>NourishDMV Volunteer Application</h1>
                                <p className={styles.subheader}>Thank you for your interest in being a NourishDMV Volunteer! Please fill out this application and we'll get back to you as soon as possible.</p>
                                <div className={styles.doublegrid} style={{ gridGap: "15px", marginTop: "50px", gridTemplateColumns: "auto auto auto" }}>
                                    <input className={styles.input} type='text' placeholder="Name"></input>
                                    <input className={styles.input} type="tel" placeholder="Phone Number"></input>
                                    <input className={styles.input} type="text" placeholder="Email"></input>
                                </div>

                                <div className={styles.doublegrid} style={{ gridTemplateColumns: "150px auto 150px", gridGap: "15px" }}>
                                    <select className={styles.input} placeholder="Name">
                                        <option>Area</option>
                                        <option>D.C.</option>
                                        <option>Maryland</option>
                                        <option>Virginia</option>
                                    </select>
                                    <input className={styles.input} type='text' placeholder="Address"></input>
                                    <input className={styles.input} type='text' placeholder="City"></input>
                                </div>
                                <textarea rows="3" className={styles.textarea} placeholder="Tell us about yourself"></textarea>
                                <textarea className={styles.textarea} placeholder="Why do you want to volunteer with us?"></textarea>
                                <textarea className={styles.input} placeholder="What tasks are your favorite to complete?"></textarea>
                                <input className={styles.input} placeholder="How did you hear about us?"></input>
                                <button onClick={() => nextStep("v")} className={[styles.minibutton, styles.hover].join(" ")} style={{ width: "100%", marginTop: "5px", backgroundColor: "rgb(0 0 0 / 42%)" }}>Submit</button>
                            </div>
                            <div id="v2v" className={styles.fullycenter} style={{ width: "50%", left: "150%", opacity: 0 }}>
                                <h1 className={styles.header}>Thank you!</h1>
                                <p className={styles.subheader}>Your application has been processed, we'll be in touch soon! You can close this by clicking the close button on the left.</p>
                            </div>
                        </div>
                    </div>

                </div>
                <div id="errorCard" className={styles.errorCard}>
                    <h2>Error</h2>
                    <p id="errorMessage">Error Message</p>
                </div>
            </main>
        </>
    );
}