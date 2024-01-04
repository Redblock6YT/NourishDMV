import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import anime from 'animejs';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      //once the page is fully loaded, play the splashscreen outro
      setTimeout(() => {
        document.getElementById("splashscreenOutro").play();
        anime({
          targets: '#splashscreenOutro',
          opacity: 0,
          duration: 600,
          delay: 100,
          easing: 'easeInOutQuad',
          complete: function (anim) {
            document.getElementById("splashscreenOutro").style.display = "none";
          }
        })
        anime({
          targets: '#content',
          opacity: 1,
          duration: 600,
          delay: 100,
          easing: 'easeInOutQuad'
        })
      }, 500)
    }
  }, [router.isReady])
  return (
    <>
      <Head>
        <title>Home | NourishDMV</title>
        <meta name="description" content="Copyright (c) 2024 Marcus Mauricio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div id="content" style={{ opacity: "0" }}>
          <div id="navbar" className={styles.navbar}>
            <Image style={{ marginLeft: "14px" }} src="logo.svg" alt="NourishDMV Logo" height={45} width={200} />
          </div>
          <div id="bodyContent" style={{ marginTop: "00px", padding: "10px" }}>
            <div id="herosContainer" style={{ position: "relative" }}>
              <img src="shelter.jpg" className={styles.blurredHero} />
              <div id="hero" className={styles.hero}>
                <img className={styles.fullycenter} src="shelter.jpg" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "25px" }} />
                <h1 style={{ width: "80%", textAlign: "center", fontSize: "60px", textShadow: "0 0 20px BLACK", color: "white" }} className={[styles.header, styles.fullycenter].join(" ")}>Food and shelter for all in the DMV</h1>
                <p className={styles.font} style={{position: "absolute", bottom: "10px", left: "10px", color: "#ffffffa6", margin: "0"}}>DLR Group "Exterior view of a section the Triumph with window covered facade illuminated at night with interior rooms visible" DLR Group, 2020, https://www.dlrgroup.com/work/the-triumph-ward-8/</p>
              </div>
            </div>

            <div id="innerContent" style={{ padding: "15px 0px" }}>
              <div id="currentEvents" style={{ marginTop: "15px" }}>
                <h3 className={styles.header} style={{ color: "black", marginLeft: "20px", marginBottom: "10px" }}>Current Events</h3>
                <div id="currentEventsList">
                  <div className={styles.item}>
                    <p style={{color: "rgba(0, 0, 0, 0.300)", margin: "0", width: "100%", textAlign: "center"}} className={styles.fullycenter}>No current events to show</p>
                  </div>
                </div>
              </div>
              <div className={styles.divider}></div>
              <h3>Why Us?</h3>
              <p>

              </p>
            </div>
          </div>
        </div>

        <video id="splashscreenOutro" muted className={styles.splashScreen}><source src="helpsoutro.mp4" type="video/mp4" /></video>
      </main>
    </>
  )
}
