import Head from 'next/head'
import styles from '@/styles/Dash.module.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import Footer from '@/components/NDMVFooter.jsx'
import axios from 'axios';
import Image from 'next/image'
import anime, { set } from 'animejs'
import Cookies from 'js-cookie'

export default function Dash() {
    const router = useRouter();
    const [account, setAccount] = useState("");
    const [accountData, setAccountData] = useState({});
    const [adminView, setAdminView] = useState(false);
    const [step, setStep] = useState(0);
    const [currentOverlayType, setCurrentOverlayType] = useState("d");

    function switchView(view) {
        document.getElementById(view).scrollIntoView({ behavior: "smooth", block: "center" });
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
                document.getElementById("splashscreenIntro").play();
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

    useEffect(() => {
        if (account != "") {
            axios({
                method: "get",
                url: "http://localhost:8443/getAccount?uuid=" + account
            }).then((res) => {
                setAccountData(res.data);
                document.getElementById("acctName").innerHTML = res.data.name.split(" ")[0];
                if (res.data.role == "Admin") {
                    setAdminView(true);
                }
            }).catch((err) => {
                if (err.response.data == "Account not found.") {
                    Cookies.remove("account");
                    setAccount("");
                    push("/accounts?view=Sign+In")
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
            document.getElementById("splashscreenOutro").play();
            document.getElementById("splashscreenOutro").pause();
            setTimeout(() => {
                document.getElementById("splashscreenOutro").play();
                anime({
                    targets: '#splashscreenOutro',
                    opacity: 0,
                    duration: 500,
                    easing: 'easeInOutQuad',
                    complete: function (anim) {
                        document.getElementById("splashscreenOutro").style.display = "none";
                        document.body.style.overflowY = "auto"
                        if (router.query.view != undefined) {
                            if (router.query.view == "volunteer") {
                                openOverlay("v");
                            } else if (router.query.view == "donate") {
                                openOverlay("d");
                            }
                        }
                    }
                })
                anime({
                    targets: '#content',
                    opacity: 1,
                    duration: 500,
                    easing: 'easeInOutQuad'
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
            <main>
                <video id="splashscreenOutro" preload="auto" muted className="splashScreen"><source src="anim_ss_ndmv_outro.mp4" type="video/mp4" /></video>
                <video id="splashscreenIntro" muted className="splashScreen" style={{ display: "none", opacity: 0 }}><source src="anim_ss_ndmv_intro.mp4" type="video/mp4" /></video>
                <div id="content" style={{ opacity: 0, overflow: "hidden" }} className={styles.sidebarContent}>
                    <div style={{ padding: "15px", width: "100%" }}>
                        <div className={styles.sidebar}>
                            <div style={{ padding: "15px" }}>
                                <button className={styles.sidebarItem} onClick={() => document.getElementById("screens").scrollTo({ top: 0, behavior: 'smooth' })}>At a glance</button>
                                <button className={styles.sidebarItem} style={{ display: (adminView) ? "block" : "none" }}>Accounts</button>
                                <button className={styles.sidebarItem} onClick={() => switchView("blog")}>Blog</button>
                                <button className={styles.sidebarItem} onClick={() => switchView("events")}>Events</button>
                                <button className={styles.sidebarItem}>Donations</button>
                                <button className={styles.sidebarItem} style={{ display: (account == "") ? "none" : "block" }}>My Account</button>

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
                                            <p style={{ position: "absolute", bottom: 15, right: 15, margin: "0px" }}>582</p>
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
                                    <h4 className={styles.screensubheading}>Your Upcoming Events</h4>
                                    <div id="upcomingeventsl" style={{ margin: "20px" }}>
                                        <div className={styles.card}>
                                            <div className={styles.fullycenter} style={{ width: "100%" }}>
                                                <p className={styles.font} style={{ fontSize: "25px", textAlign: "center", color: "rgba(0, 0, 0, 0.300)", fontWeight: "bold" }}>You aren't apart of any events</p>
                                                <button className={[styles.minibutton, styles.hover].join(" ")} onClick={() => switchView("events")}>View Events</button>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className={styles.screensubheading}>Other Events</h4>
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
                        <div id="blog" className={styles.screen}>

                        </div>
                        <div id="events" className={styles.screen}>

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
                            <div id="v1d" className={styles.fullycenter} style={{ width: "80%", left: "150%", opacity: 0 }}>
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
                            <div id="v1v" className={styles.fullycenter} style={{ width: "60%", left: "150%", opacity: 0 }}>
                                <h1 className={styles.header}>NourishDMV Volunteer Application</h1>
                                <p className={styles.subheader}>Thank you for your interest in being a NourishDMV Volunteer! Please fill out this application and we'll get back to you as soon as possible.</p>
                                <div className={styles.doublegrid} style={{ gridGap: "15px", marginTop: "50px", gridTemplateColumns: "auto auto auto" }}>
                                    <input className={styles.input} type='text' placeholder="Name"></input>
                                    <input className={styles.input} type="tel" placeholder="Phone Number"></input>
                                    <input className={styles.input} type="text" placeholder="Email"></input>
                                </div>

                                <div className={styles.doublegrid} style={{gridTemplateColumns: "150px auto 150px", gridGap: "15px"}}>
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
            </main>
        </>
    );
}