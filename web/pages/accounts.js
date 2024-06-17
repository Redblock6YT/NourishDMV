import Head from 'next/head'
import styles from '@/styles/Accounts.module.css'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie';
import anime from 'animejs';
import Image from 'next/image';
import axios from 'axios';
import crypto from 'crypto';
import { uuid } from 'uuidv4';

export default function Accounts() {
    const router = useRouter();
    const [view, setView] = useState('norm');
    const [mobile, setMobile] = useState(false);
    const [actionType, setActionType] = useState("Sign In");
    const fromRef = useRef(undefined);
    const [trackerUUID, setTrackerUUID] = useState("");

    useEffect(() => {
        if (router.isReady) {
            fromRef.current = router.query.from;
        }
    }, [router.isReady]);

    useEffect(() => {
        if (trackerUUID != "") {
            Cookies.set("trackerUUID", trackerUUID);
            axios({
                method: "post",
                url: "https://nourishapi.rygb.tech:8080/track",
                data: {
                    uuid: trackerUUID,
                    page: "Accounts",
                    view: (view == "norm") ? "Landing" : actionType,
                }
            }).catch((err) => {
                console.log(err)
                console.log("Tracking failed.")
            })
        }
    }, [view, trackerUUID]);

    function push(path) {
        if (router.isReady) {
            //window.scrollTo({ top: 0, behavior: 'smooth' });
            if (mobile) {
                anime({
                    targets: "#maincontent",
                    opacity: 0,
                    duration: 500,
                    easing: 'easeInOutQuad',
                    complete: function (anim) {
                        if (path != "") {
                            router.push(path);
                        }
                    }
                })
            } else {
                document.getElementById("splashscreenIntro").style.display = "block";
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
                            if (path != "") {
                                router.push(path);
                            }
                        }
                    })
                }, 100)
                anime({
                    targets: "#maincontent",
                    opacity: 0,
                    duration: 1000,
                    easing: 'easeInOutQuad'
                })
            }

        }
    }

    function animateBackground(type) {
        if (type == "in") {
            document.getElementById("smallervidintro").play();
            document.getElementById("smallervidintro").pause();
            document.getElementById("smallervidoutro").style.display = "none"
            document.getElementById("smallervidintro").style.display = "block"
            document.getElementById("smallervidintro").style.height = "250vh";
            document.getElementById("smallervidintro").play();
            document.getElementById("smallervidintro").playbackRate = 0.8;
            anime({
                targets: "#smallervidintro",
                height: (mobile) ? "80vh" : "90vh",
                easing: "easeInOutQuad",
                duration: 500,
            })
        } else if (type == "out") {
            document.getElementById("smallervidoutro").play();
            document.getElementById("smallervidoutro").pause();
            document.getElementById("smallervidintro").style.display = "none"
            document.getElementById("smallervidoutro").style.display = "block"
            document.getElementById("smallervidoutro").style.height = "90vh";
            document.getElementById("smallervidoutro").play();
            document.getElementById("smallervidoutro").playbackRate = 0.8;
            anime({
                targets: "#smallervidoutro",
                height: "250vh",
                easing: "easeInOutQuad",
                duration: 400,
            })
        }
    }

    function showContent(callback) {
        anime({
            targets: "#loading",
            opacity: 0,
            duration: 300,
            easing: 'linear',
            complete: function (anim) {
                document.getElementById("loading").style.display = "none";
                document.getElementById("content").style.visibility = "visible";
                anime({
                    targets: "#content",
                    opacity: 1,
                    duration: 300,
                    easing: 'linear',
                    complete: function (anim) {
                        callback();
                    }
                })
            }
        })
    }

    function clearErrors(arg) {
        if (!arg) {
            anime({
                targets: ["#email", "#password", "#phone", "#name"],
                backgroundColor: "rgb(88 88 88 / 12%)"
            })
            anime({
                targets: "#error",
                opacity: 0,
                marginTop: "-45px",
                easing: "easeOutQuad",
                complete: function (anim) {
                    document.getElementById("error").style.display = "none";
                }
            })
        } else if (arg == "email") {
            anime({
                targets: "#email",
                backgroundColor: "rgb(88 88 88 / 12%)"
            })
            if (document.getElementById("errorVerbage").innerHTML == "Account not found." || document.getElementById("errorVerbage").innerHTML == "Account with that email already exists.") {
                anime({
                    targets: "#error",
                    opacity: 0,
                    marginTop: "-45px",
                    easing: "easeOutQuad",
                    complete: function (anim) {
                        document.getElementById("error").style.display = "none";
                    }
                })
            }
        } else if (arg == "password") {
            anime({
                targets: "#password",
                backgroundColor: "rgb(88 88 88 / 12%)"
            })
            if (document.getElementById("errorVerbage").innerHTML == "Incorrect password.") {
                anime({
                    targets: "#error",
                    opacity: 0,
                    marginTop: "-45px",
                    easing: "easeOutQuad",
                    complete: function (anim) {
                        document.getElementById("error").style.display = "none";
                    }
                })
            }
        } else if (arg == "phone" || arg == "name") {
            anime({
                targets: "#" + arg,
                backgroundColor: "rgb(88 88 88 / 12%)"
            })
        }
        if (arg) {
            var accepted = 0;
            var goal = 0;
            const modal = document.getElementById("content");
            for (let i = 0; i < modal.children.length; i++) {
                if (modal.children[i].tagName == "INPUT") {
                    if (modal.children[i].value != "") {
                        accepted++;
                    }
                    goal++;
                } else if (modal.children[i].tagName == "DIV" && actionType == "Sign Up") {
                    const child = modal.children[i];
                    for (var i2 = 0; i2 < child.children.length; i2++) {
                        if (child.children[i2].tagName == "INPUT") {
                            if (child.children[i2].value != "") {
                                accepted++;
                            }
                            goal++;
                        }
                    }
                }
            }
            if (accepted == goal) {
                anime({
                    targets: "#error",
                    opacity: 0,
                    marginTop: "-45px",
                    easing: "easeOutQuad",
                    complete: function (anim) {
                        document.getElementById("error").style.display = "none";
                    }
                })
            }
        }

    }

    function submit() {
        const modal = document.getElementById("content");
        document.getElementById("loading").style.display = "block";
        var goal = 0;
        var accepted = 0;
        for (let i = 0; i < modal.children.length; i++) {
            if (modal.children[i].tagName == "INPUT") {
                if (modal.children[i].value == "") {
                    anime({
                        targets: modal.children[i],
                        keyframes: [
                            { scale: 1.1, duration: 1000 },
                            { scale: 1, duration: 1000 }
                        ],
                        backgroundColor: "rgb(239 54 0 / 73%)",
                    })
                } else {
                    accepted++;
                }
                goal++;
            } else if (modal.children[i].tagName == "DIV" && actionType == "Sign Up") {
                const child = modal.children[i];
                for (var i2 = 0; i2 < child.children.length; i2++) {
                    if (child.children[i2].tagName == "INPUT") {
                        if (child.children[i2].value == "") {
                            anime({
                                targets: child.children[i2],
                                keyframes: [
                                    { scale: 1.1, duration: 1000 },
                                    { scale: 1, duration: 1000 }
                                ],
                                backgroundColor: "rgb(239 54 0 / 73%)",
                            })
                        } else {
                            accepted++;
                        }
                        goal++;
                    }
                }
            }
        }

        if (accepted != goal) {
            document.getElementById("error").style.display = "block";
            document.getElementById("errorVerbage").innerHTML = "Some fields are empty";
            anime({
                targets: "#error",
                opacity: 1,
                marginTop: "0px",
                easing: "easeOutQuad"
            })
        } else {
            animateBackground("out");
            anime({
                targets: "#content",
                opacity: 0,
                duration: 300,
                easing: 'linear',
                complete: function (anim) {
                    document.getElementById("content").style.visibility = "hidden";
                    anime({
                        targets: "#loading",
                        opacity: 1,
                        duration: 300,
                        easing: 'linear',
                        complete: function (anim) {
                            if (actionType == "Sign In") {
                                const hashedpassword = crypto.createHash('sha256').update(document.getElementById("password").value).digest('hex');
                                axios({
                                    url: 'https://nourishapi.rygb.tech:8080/requestSignIn?email=' + document.getElementById("email").value + '&password=' + hashedpassword,
                                    method: 'get',
                                }).then((result) => {
                                    if (result.data.status == "Sign In approved.") {
                                        Cookies.set("account", result.data.uuid);
                                        if (router.query.redirect != undefined) {
                                            push(router.query.redirect);
                                        } else {
                                            push("/dash");
                                        }

                                    }
                                }).catch((err) => {
                                    console.log(err)
                                    if (err.response != undefined) {
                                        document.getElementById("error").style.display = "block";
                                        document.getElementById("errorVerbage").innerHTML = err.response.data;
                                        anime({
                                            targets: "#error",
                                            opacity: 1,
                                            marginTop: "0px",
                                            easing: "easeOutQuad"
                                        })
                                        if (err.response.data == "Account not found.") {
                                            animateBackground("in");
                                            //highlight email field
                                            showContent(function () {
                                                anime({
                                                    targets: "#email",
                                                    scale: 1.1,
                                                    backgroundColor: "rgb(239 54 0 / 73%)",
                                                    complete: function (anim) {
                                                        anime({
                                                            targets: "#email",
                                                            scale: 1,
                                                            backgroundColor: "rgb(239 54 0 / 73%)",
                                                        })
                                                    }
                                                })
                                            })
                                        } else if (err.response.data == "Incorrect password.") {
                                            animateBackground("in");
                                            //highlight password field
                                            showContent(function () {
                                                anime({
                                                    targets: "#password",
                                                    scale: 1.1,
                                                    backgroundColor: "rgb(239 54 0 / 73%)",
                                                    complete: function (anim) {
                                                        anime({
                                                            targets: "#password",
                                                            scale: 1,
                                                            backgroundColor: "rgb(239 54 0 / 73%)",
                                                        })
                                                    }
                                                })
                                            })
                                        } else {
                                            //other error
                                            animateBackground("in");
                                            //highlight both fields

                                            showContent(function () {
                                                anime({
                                                    targets: ["#email", "#password"],
                                                    scale: 1.1,
                                                    backgroundColor: "rgb(239 54 0 / 73%)",
                                                    complete: function (anim) {
                                                        anime({
                                                            targets: ["#email", "#password"],
                                                            scale: 1,
                                                            backgroundColor: "rgb(239 54 0 / 73%)",
                                                        })
                                                    }
                                                })
                                            })
                                        }
                                    } else {
                                        document.getElementById("error").style.display = "block";
                                        document.getElementById("errorVerbage").innerHTML = err.message;
                                        anime({
                                            targets: "#error",
                                            opacity: 1,
                                            marginTop: "0px",
                                            easing: "easeOutQuad"
                                        })
                                        animateBackground("in");
                                        showContent(function () { })
                                    }

                                });
                            } else if (actionType == "Sign Up") {
                                const hashedpassword = crypto.createHash('sha256').update(document.getElementById("password").value).digest('hex');
                                axios({
                                    url: "https://nourishapi.rygb.tech:8080/createAccount",
                                    method: 'post',
                                    data: {
                                        email: document.getElementById("email").value,
                                        name: document.getElementById("name").value,
                                        area: document.getElementById("area").value,
                                        password: hashedpassword,
                                        phone: document.getElementById("phone").value,
                                    }
                                }).then((res) => {
                                    if (res.data.status == "Account created.") {
                                        Cookies.set("account", res.data.uuid);
                                        if (router.query.redirect != undefined) {
                                            push(router.query.redirect);
                                        } else {
                                            push("/dash");
                                        }
                                    }
                                }).catch((err) => {
                                    animateBackground("in");
                                    console.log(err)
                                    document.getElementById("error").style.display = "block";
                                    document.getElementById("errorVerbage").innerHTML = err.response.data;
                                    anime({
                                        targets: "#error",
                                        opacity: 1,
                                        marginTop: "0px",
                                        easing: "easeOutQuad"
                                    })
                                    showContent(function () {
                                        if (err.response.data == "Account with that email already exists.") {
                                            anime({
                                                targets: "#email",
                                                scale: 1.1,
                                                backgroundColor: "rgb(239 54 0 / 73%)",
                                                complete: function (anim) {
                                                    anime({
                                                        targets: "#email",
                                                        scale: 1,
                                                        backgroundColor: "rgb(239 54 0 / 73%)",
                                                    })
                                                }
                                            })
                                        }
                                    })
                                })
                            }
                        }
                    })
                }
            })
        }

    }

    function switchView(type, arg) {
        clearErrors();
        if (type == "norm") {
            setView("norm")
            animateBackground("out");
            anime({
                targets: "#modal",
                opacity: 0,
                duration: 300,
                easing: 'linear',
            })
            anime({
                targets: "#home",
                scale: 1,
                opacity: 1,
                duration: 400,
                delay: 200,
                easing: 'easeInOutQuad',
                complete: function (anim) {
                    document.getElementById("action").style.display = "none";
                }
            })
        } else if (type == "action") {
            setView("action")
            setActionType(arg);
            if (arg == "Sign In") {
                document.getElementById("phone").style.display = "none"
                document.getElementById("name").style.display = "none"
            } else if (arg == "Sign Up") {
                document.getElementById("phone").style.display = "block"
                document.getElementById("name").style.display = "block"
            }
            animateBackground("in");
            document.getElementById("smallervidoutro").style.display = "none"
            document.getElementById("smallervidintro").style.display = "block"
            document.getElementById("action").style.display = "block";
            anime({
                targets: "#home",
                scale: 0,
                opacity: 0,
                easing: "linear",
                duration: 300,
                complete: function (anim) {
                    anime({
                        targets: "#modal",
                        opacity: 1,
                        duration: 300,
                        easing: 'linear',
                    })
                }
            })
        }
    }

    useEffect(() => {
        if (router.isReady) {
            //once the page is fully loaded, play the splashscreen outro
            if (Cookies.get("account")) {
                router.push("/dash")
            } else {
                window.scrollTo(0, 0);
                if (window.innerWidth <= 600) {
                    setMobile(true);
                    document.getElementById("smallervidintro").src = "accounts_animatedbackground_intro_mobile.mp4";
                    document.getElementById("smallervidoutro").src = "accounts_animatedbackground_outro_mobile.mp4";
                    document.getElementById("splashscreenOutro").style.display = "none"
                    setTimeout(() => {
                        if (router.query.view != undefined) {
                            switchView("action", router.query.view);
                        }
                        anime({
                            targets: '#maincontent',
                            opacity: 1,
                            duration: 500,
                            easing: 'easeInOutQuad'
                        })
                    }, 500)
                } else {
                    if (window.innerWidth <= 1450) {
                        document.getElementById("splashscreenIntro").src = "anim_ss_ndmv_intro_notext.mp4";
                        document.getElementById("splashscreenOutro").src = "anim_ss_ndmv_outro_notext.mp4";
                    }

                    document.getElementById("splashscreenOutro").play().catch((err) => {
                        console.log(err)
                    });
                    document.getElementById("splashscreenOutro").pause();
                    setTimeout(() => {
                        document.getElementById("splashscreenOutro").play().catch((err) => {
                            console.log(err)
                        });
                        if (router.query.view != undefined) {
                            switchView("action", router.query.view);
                        }
                        anime({
                            targets: '#splashscreenOutro',
                            opacity: 0,
                            duration: 500,
                            easing: 'easeInOutQuad',
                            complete: function (anim) {
                                document.getElementById("splashscreenOutro").style.display = "none";
                            }
                        })
                        anime({
                            targets: '#maincontent',
                            opacity: 1,
                            duration: 500,
                            easing: 'easeInOutQuad'
                        })
                    }, 500)
                }
            }

            if (Cookies.get("trackerUUID") == undefined && trackerUUID == "") {
                setTrackerUUID(uuid());
            } else if (Cookies.get("trackerUUID") != undefined && trackerUUID == "") {
                setTrackerUUID(Cookies.get("trackerUUID"));
            }
        }
    }, [router.isReady]);

    return (
        <>
            <Head>
                <title>Accounts | NourishDMV</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" />
            </Head>
            <main style={{ overflow: "hidden" }}>
                <video id="splashscreenOutro" playsInline preload="auto" muted className={styles.splashScreen}><source src="anim_ss_ndmv_outro.mp4" type="video/mp4" /></video>
                <video id="splashscreenIntro" playsInline muted className={styles.splashScreen} style={{ display: "none", opacity: 0 }}><source src="anim_ss_ndmv_intro.mp4" type="video/mp4" /></video>
                <div id="maincontent" style={{ opacity: 0 }}>
                    <div onClick={() => {
                        if (view == "norm") {
                            if (fromRef.current !== undefined) {
                                if (fromRef.current == "Dashboard") {
                                    push("/dash");
                                }
                            } else {
                               push("/"); 
                            }
                        } else {
                            switchView("norm");
                        }
                    }} className={styles.doublegrid} style={{ color: "#a46900", fontSize: "25px", width: "30%", marginTop: "20px", marginLeft: "20px", cursor: "pointer", gridTemplateColumns: "50px auto", gridGap: "0px", position: "relative", zIndex: "100" }}>
                        <span class="material-symbols-rounded" style={{ fontSize: "40px" }}>arrow_circle_left</span>
                        <p className={styles.font} style={{ margin: "auto", marginLeft: "0px", textAlign: "left", width: "100%" }}>Back {(view == "norm") ? (fromRef.current !== undefined) ? "to " + fromRef.current :  "to Home" : ""}</p>
                    </div>
                    <div className={styles.fullycenter} style={{ width: "90%", height: (mobile) ? "75%" : "83%" }}>
                        <div id="home" className={styles.buttonsgrid}>
                            <button className={styles.bigbutton} onClick={() => switchView("action", "Sign In")}>
                                <div className={styles.blurredBehind}>
                                    <span style={{ fontSize: (mobile) ? "350px" : "500px", color: "#00000017" }} class="material-symbols-rounded">person</span>
                                </div>

                                Sign In
                                <p style={{ fontSize: "35px", fontWeight: "normal", display: (mobile) ? "none" : "block" }}>to your NourishDMV Account</p>
                            </button>
                            <button className={styles.bigbutton} onClick={() => switchView("action", "Sign Up")}>
                                <div className={styles.blurredBehind}>
                                    <span style={{ fontSize: (mobile) ? "350px" : "500px", color: "#00000017" }} class="material-symbols-rounded">person_add</span>
                                </div>
                                Sign Up
                                <p style={{ fontSize: "35px", fontWeight: "normal", display: (mobile) ? "none" : "block" }}>for a NourishDMV Account</p>
                            </button>
                        </div>
                    </div>

                    <div id="action" style={{ display: "none" }}>
                        <video playsInline muted className={styles.bkgrndvideo} id="smallervidintro"><source src="accounts_animatedbackground_intro.mp4" type="video/mp4"></source></video>
                        <video playsInline muted className={styles.bkgrndvideo} style={{ display: "none" }} id="smallervidoutro"><source src="accounts_animatedbackground_outro.mp4" type="video/mp4"></source></video>
                        <div className={styles.modal} id="modal">
                            <div id="loading" className="loading"></div>
                            <div id="content">
                                <h1 id="modaltext" className={styles.text} style={{ margin: "auto", marginBottom: "10px" }}>{actionType}</h1>
                                <div className={styles.doublegrid} style={{ gridTemplateColumns: "60% auto", gridGap: "10px" }}>
                                    <input required style={{ display: "none" }} className={styles.input} type="text" onInput={() => clearErrors("name")} id="name" placeholder="Full Name"></input>
                                    <input required style={{ display: "none" }} className={styles.input} type="tel" onInput={() => clearErrors("phone")} id="phone" placeholder="Phone Number"></input>
                                </div>
                                <div className={styles.doublegrid} style={{ gridTemplateColumns: "75px auto", display: (actionType == "Sign Up") ? "grid" : "none" }}>
                                    <p style={{ fontSize: "25px", margin: "0px", marginTop: "5px", textAlign: "right" }}>Area</p>
                                    <select className={styles.input} id="area">
                                        <option>D.C.</option>
                                        <option>Maryland</option>
                                        <option>Virginia</option>
                                        <option>Other (Not from DMV)</option>
                                    </select>
                                </div>
                                <input required className={styles.input} onInput={() => clearErrors("email")} type="email" id="email" placeholder="Email" />
                                <input required className={styles.input} onInput={() => clearErrors("password")} type="password" id="password" placeholder="Password" />
                                <button id="submitbutton" className={styles.button} onClick={() => submit()}>Go</button>
                                <p className={styles.verbage}>By continuing, you agree to the <a onClick={() => push("privacy")} style={{ color: "#ffffffe0", cursor: "pointer" }}>NourishDMV Privacy Policy</a></p>
                                <div id="error" style={{ display: "none", opacity: 0, marginTop: "-45px" }}>
                                    <div className={styles.divider}></div>
                                    <p id="errorVerbage" className={styles.verbage} style={{ color: "rgb(239 54 0 / 73%)", fontWeight: 'bold', fontSize: "20px" }}>Error</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ position: "absolute", bottom: "5px", left: "50%", transform: "translateX(-50%)", display: "grid", gridTemplateColumns: "200px auto" }}>
                        <Image src="logo.svg" alt="NourishDMV Logo" height={43} width={200} />
                        <h3 className={styles.font} style={{ margin: "0px", marginTop: "2px", fontSize: "28px", lineHeight: "normal", fontWeight: "lighter" }}> Accounts</h3>
                    </div>
                    <p style={{ margin: "auto", display: (mobile) ? "none" : "block", width: "100%", fontSize: "20px", color: "#00000047", position: "absolute", bottom: "10px", left: "10px", fontWeight: "bold" }} className={styles.font}>Copyright © {new Date().getFullYear()} NourishDMV</p>
                </div>
            </main>
        </>
    );
}