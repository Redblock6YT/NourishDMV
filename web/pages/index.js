import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import anime from 'animejs';
import Footer from '@/components/NDMVFooter.jsx'

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      //once the page is fully loaded, play the splashscreen outro
      window.scrollTo(0, 0);
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
              </div>
            </div>

            <div id="innerContent" style={{ padding: "15px 0px" }}>
              <div id="currentEvents" style={{ marginTop: "15px" }}>
                <h3 className={styles.header} style={{ color: "black", marginLeft: "20px", marginBottom: "10px" }}>Current Events</h3>
                <div id="currentEventsList">
                  <div className={styles.item}>
                    <p style={{ color: "rgba(0, 0, 0, 0.300)", margin: "0", width: "100%", textAlign: "center" }} className={styles.fullycenter}>No current events to show</p>
                  </div>
                </div>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.doublegrid} style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
                <div>
                  <h3 className={styles.header} style={{ color: "black", marginLeft: "20px", marginBottom: "10px" }}>Why Us?</h3>
                  <p className={styles.description} style={{ fontSize: "25px", padding: "0px 20px" }}>
                    Our mission is to save lives and create a thriving community by ensuring that everyone in the DMV has food and shelter. We believe in the power of addressing these basic needs comprehensively, as not only a means of survival but also as a building block to create healthier, happier lives. Join us to become a vital part of our movement and directly impact the community.
                  </p>
                </div>
                <div style={{ position: "relative" }}>
                  <img className={styles.blurredHero} alt="people laying on beds in a homeless shelter" src="shelterinside.jpg" style={{ objectFit: "cover", height: "100%", width: "100%", borderRadius: "25px" }}></img>
                  <img alt="people laying on beds in a homeless shelter" src="shelterinside.jpg" style={{ objectFit: "cover", height: "100%", width: "100%", borderRadius: "25px", zIndex: "20", position: 'relative' }}></img>
                </div>
              </div>
              <div className={styles.divider}></div>
              <h3 className={styles.header} style={{ color: "black", marginBottom: "20px", textAlign: "center" }}>Make a difference in <a style={{ backgroundColor: "#fbac29ff" }}>your community</a></h3>
              <div className={styles.doublegrid} style={{ margin: "auto" }}>
                <button className={styles.button} style={{ margin: "auto", height: "300px", width: "100%", backgroundColor: "#f66d4bff", marginBottom: "15px", fontSize: "40px", fontWeight: "bold" }}>Support our cause</button>
                <button className={styles.button} style={{ margin: "auto", height: "300px", width: '100%', backgroundColor: "#fbe85dff", marginBottom: "15px", fontSize: "40px", fontWeight: "bold" }}>Join our cause</button>
              </div>
              <div className={styles.divider}></div>
              <h3 className={styles.header} style={{ color: "black", marginBottom: "20px", textAlign: "center" }}>Get in touch</h3>
              <div className={styles.doublegrid}>
                <div className={styles.item} style={{ margin: "auto", marginRight: "0px" }}>

                </div>
                <div className={styles.item} style={{ margin: "auto", marginLeft: "0px" }}>

                </div>
                <div className={styles.item} style={{ margin: "auto", marginRight: "0px" }}>

                </div>
                <div className={styles.item} style={{ margin: "auto", marginLeft: '0px' }}>

                </div>
              </div>
            </div>
          </div>
          <Footer citations={[
            {
              name: "Image 1",
              citation: `DLR Group "Exterior view of a section the Triumph with window covered facade illuminated at night with interior rooms visible" DLR Group, 2020, https://www.dlrgroup.com/work/the-triumph-ward-8/`
            }, {
              name: "Image 2",
              citation: `NC 211 "people laying on beds in a homeless shelter" NC 211, 4 October 2022, https://nc211.org/shelters/`
            }
          ]} />
        </div>
        <video id="splashscreenOutro" muted className={styles.splashScreen}><source src="helpsoutro.mp4" type="video/mp4" /></video>
      </main>
    </>
  )
}
