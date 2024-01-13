import Head from 'next/head'
import styles from '@/styles/Accounts.module.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Footer from '@/components/NDMVFooter.jsx';
import Cookies from 'js-cookie';
import anime from 'animejs';
import Image from 'next/image';

export default function Accounts() {
    const router = useRouter();
    const [view, setView] = useState('norm');
    const [actionType, setActionType] = useState("signin");

    function push(path) {
        if (router.isReady) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.getElementById("splashscreenIntro").style.display = "block";
            setTimeout(() => {
                document.getElementById("splashscreenIntro").playbackRate = 0.5;
                document.getElementById("splashscreenIntro").play();
                anime({
                    targets: '#splashscreenIntro',
                    opacity: 1,
                    duration: 500,
                    easing: 'easeInOutQuad',
                    complete: function (anim) {
                        setTimeout(() => {
                            router.push(path);
                        }, 1000);
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

    function animateBackground(type) {
        if (type == "in") {
            document.getElementById("smallervidoutro").style.display = "none"
            document.getElementById("smallervidintro").style.display = "block"
            document.getElementById("smallervidintro").style.height = "250vh";
            document.getElementById("smallervidintro").play();
            document.getElementById("smallervidintro").playbackRate = 0.8;
            anime({
                targets: "#smallervidintro",
                height: "90vh",
                easing: "easeInOutQuad",
                duration: 500,
            })
        } else if (type == "out") {
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

    function submit() {
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
                })
            }
        })
    }

    function switchView(type, arg) {
        if (type == "norm") {
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
            setActionType(arg);
            if (arg == "Sign In") {
                document.getElementById("phone").style.display = "none"
            } else if (arg == "Sign Up") {
                document.getElementById("phone").style.display = "block"
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
            window.scrollTo(0, 0);
            setTimeout(() => {
                document.getElementById("splashscreenOutro").play();
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
            }, 1000)
        }
    }, [router.isReady]);

    return (
        <>
            <Head>
                <title>Accounts | NourishDMV</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" />
            </Head>
            <main>
                <video id="splashscreenOutro" muted className={styles.splashScreen}><source src="anim_ss_ndmv_outro.mp4" type="video/mp4" /></video>
                <video id="splashscreenIntro" muted className={styles.splashScreen} style={{ display: "none", opacity: 0 }}><source src="anim_ss_ndmv_intro.mp4" type="video/mp4" /></video>
                <div id="maincontent" style={{opacity: 0}}>
                    <div onClick={() => push("/")} className={styles.doublegrid} style={{ color: "#a46900", fontSize: "25px", width: "210px", marginTop: "20px", marginLeft: "20px", cursor: "pointer", gridTemplateColumns: "50px auto", gridGap: "0px" }}>
                        <span class="material-symbols-rounded" style={{ fontSize: "40px" }}>arrow_circle_left</span>
                        <p className={styles.font} style={{ margin: "auto" }}>Back to Home</p>
                    </div>
                    <div className={styles.fullycenter} style={{ width: "90%", height: "85%" }}>
                        <div id="home" className={styles.buttonsgrid}>
                            <button className={styles.bigbutton} onClick={() => switchView("action", "Sign In")}>
                                <div className={styles.blurredBehind}>
                                    <span style={{ fontSize: "500px", color: "#00000017" }} class="material-symbols-rounded">person</span>
                                </div>

                                Sign In
                                <p style={{ fontSize: "35px", fontWeight: "normal" }}>to your NourishDMV Account</p>
                            </button>
                            <button className={styles.bigbutton} onClick={() => switchView("action", "Sign Up")}>
                                <div className={styles.blurredBehind}>
                                    <span style={{ fontSize: "500px", color: "#00000017" }} class="material-symbols-rounded">person_add</span>
                                </div>
                                Sign Up
                                <p style={{ fontSize: "35px", fontWeight: "normal" }}>for a NourishDMV Account</p>
                            </button>
                        </div>
                    </div>

                    <div id="action" style={{ display: "none" }}>
                        <video muted className={styles.bkgrndvideo} id="smallervidintro"><source src="accounts_animatedbackground_intro.mp4" type="video/mp4"></source></video>
                        <video muted className={styles.bkgrndvideo} style={{ display: "none" }} id="smallervidoutro"><source src="accounts_animatedbackground_outro.mp4" type="video/mp4"></source></video>
                        <div className={styles.modal} id="modal">
                            <div id="loading" className="loading"></div>
                            <div id="content">
                                <button className={styles.chipbutton} onClick={() => switchView("norm")}>Back</button>
                                <h1 id="modaltext" className={styles.text} style={{ margin: "auto", marginBottom: "10px" }}>{actionType}</h1>
                                <input required className={styles.input} type="email" id="email" placeholder="Email" />
                                <input required style={{ display: "none" }} className={styles.input} type="tel" id="phone" placeholder="Phone Number"></input>
                                <input required className={styles.input} type="password" id="password" placeholder="Password" />
                                <button id="submitbutton" className={styles.button} onClick={() => submit()}>Go</button>
                                <p className={styles.verbage}>By continuing, you agree to the <a onClick={() => push("privacy")} style={{ color: "#ffffffe0", cursor: "pointer" }}>NourishDMV Privacy Policy</a></p>
                            </div>
                        </div>
                    </div>
                    <div style={{ position: "absolute", bottom: "5px", left: "50%", transform: "translateX(-50%)", display: "grid", gridTemplateColumns: "200px auto" }}>
                        <Image src="logo.svg" alt="NourishDMV Logo" height={43} width={200} />
                        <h3 className={styles.font} style={{ margin: "0px", fontSize: "28px", lineHeight: "normal", fontWeight: "lighter" }}> Accounts</h3>
                    </div>
                    <p style={{ margin: "auto", fontSize: "20px", color: "#00000047", position: "absolute", bottom: "10px", left: "10px", fontWeight: "bold" }} className={styles.font}>Copyright © {new Date().getFullYear()} NourishDMV</p>
                </div>
            </main>
        </>
    );
}