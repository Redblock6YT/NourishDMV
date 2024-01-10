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
    return (
        <>
            <Head>
                <title>Accounts | NourishDMV</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" />
            </Head>
            <main>
                <div className={styles.fullycenter} style={{width: "90%", height: "85%"}}>
                    <div id="home" className={styles.buttonsgrid}>
                        <button className={styles.bigbutton}>
                            <div className={styles.blurredBehind}>
                                <span style={{ fontSize: "500px", color: "#00000047" }} class="material-symbols-rounded">person</span>
                            </div>

                            Sign In
                            <p style={{fontSize: "30px"}}>to your NourishDMV Account</p>
                        </button>
                        <button className={styles.bigbutton}>
                            <div className={styles.blurredBehind}>
                                <span style={{ fontSize: "500px", color: "#00000047" }} class="material-symbols-rounded">person_add</span>
                            </div>
                            Sign Up
                            <p style={{fontSize: "30px"}}>for a NourishDMV Account</p>
                        </button>
                    </div>
                </div>

                <div id="action">
                    <div className={styles.modal} id="modal">
                        <div className="loading"></div>
                        <div id="content">
                            <h1 id="modaltext" className={styles.text}>Sign In</h1>
                        </div>
                    </div>
                </div>
                <div style={{ position: "absolute", bottom: "5px", left: "50%", transform: "translateX(-50%)", display: "grid", gridTemplateColumns: "200px auto" }}>
                    <Image src="logo.svg" alt="NourishDMV Logo" height={43} width={200} />
                    <h3 className={styles.font} style={{ margin: "0px", fontSize: "30px", lineHeight: "normal", fontWeight: "lighter" }}> Accounts</h3>
                </div>
                <p style={{ margin: "auto", fontSize: "20px", color: "#00000047", position: "absolute", bottom: "10px", left: "10px", fontWeight: "bold" }} className={styles.font}>Copyright © {new Date().getFullYear()} NourishDMV</p>
            </main>
        </>
    );
}