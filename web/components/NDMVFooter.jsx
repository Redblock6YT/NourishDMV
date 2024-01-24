import styles from '@/styles/Home.module.css'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import anime from 'animejs';

export default function Footer(props) {
    const [elements, setElements] = useState([]);
    const router = useRouter();
    console.log(props.citations)

    useEffect(() => {
        if (props.citations != null) {
            const newElements = props.citations.map(citation => (
                <div key={citation.name}>
                    <h3>{citation.name}</h3>
                    <p>{citation.citation}</p>
                </div>
            ));
            setElements(newElements);
        }
    }, [props.citations]);

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
                router.push(path);
              }
            })
          }, 100)
        }
      }


    return (
        <>
            <div className={[styles.footer, styles.font].join(" ")}>
                <div>
                    
                    <div style={{ color: "#00000047" }}>
                        <div className={styles.doublegrid} style={{display: "none"}}>
                            <div style={{ textAlign: "center", fontWeight: "normal",fontSize: "25px" }}>
                                <Image src="logo.svg" alt="NourishDMV Logo" height={60} width={300} style={{ margin: "auto", marginRight: "auto", display: "block" }} />
                                <p style={{ margin: "0px" }}>16701 Melford Blvd, Bowie, MD 20715</p>
                                <p style={{ margin: "0px" }}>(410) 123-4567</p>
                                <p style={{ margin: "0px" }}>contact@nourishdmv.com</p>
                                <p style={{ margin: "0px" }}>Social Media: @nourishdmv</p>
                            </div>
                            <div className={styles.footergrid}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} onClick={() => router.push("/#makeDifference")}>
                                    <button className={styles.cubebutton}><span style={{ fontSize: "50px", margin: "auto" }} class="material-symbols-rounded">food_bank</span></button>
                                    <p style={{ margin: "0px", fontSize: "20px", textAlign: "center" }}>Make a difference</p>
                                </div>
                                
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} onClick={() => push("/accounts")}>
                                    <button className={styles.cubebutton}><span style={{fontSize: "50px"}} class="material-symbols-rounded">account_circle</span></button>
                                    <p style={{ margin: "0px", fontSize: "20px", textAlign: "center" }}>Accounts</p>
                                </div>
                                
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} onClick={() => push("/events")}>
                                    <button className={styles.cubebutton}><span style={{fontSize: "50px"}} class="material-symbols-rounded">local_activity</span></button>
                                    <p style={{ margin: "0px", fontSize: "20px", textAlign: "center" }}>Events</p>
                                </div>
                                
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}  onClick={() => push("/blog")}>
                                    <button className={styles.cubebutton}><span style={{fontSize: "50px"}} class="material-symbols-rounded">hub</span></button>
                                    <p style={{ margin: "0px", fontSize: "20px", textAlign: "center" }}>Blog</p>
                                </div>
                                
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} onClick={() => push("/privacy")}>
                                    <button className={styles.cubebutton}><span style={{fontSize: "50px"}} class="material-symbols-rounded">policy</span></button>
                                    <p style={{ margin: "0px", fontSize: "20px", textAlign: "center" }}>Privacy Policy</p>
                                </div>
                                
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} onClick={() => push("/terms")}>
                                    <button className={styles.cubebutton}><span style={{fontSize: "50px"}} class="material-symbols-rounded">gavel</span></button>
                                    <p style={{ margin: "0px", fontSize: "20px", textAlign: "center" }}>Terms</p>
                                </div>
                            </div>
                        </div>


                        {(props.citations != null) ? (
                            <div id="citationsdiv" style={{textAlign: "left", margin: "0px 5%"}}>
                                <h1>Attributions</h1>
                                <div>

                                    {elements}
                                </div>
                            </div>
                        ) : () => { }
                        }
                        <div className={styles.divider} style={{ marginTop: "15px", marginBottom: "15px" }}></div>
                        <p style={{ margin: "auto", fontSize: "20px", textAlign: "center" }}>Copyright © {new Date().getFullYear()} NourishDMV</p>
                    </div>
                </div>
            </div>
        </>

    );
}