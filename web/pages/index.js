import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      //once the page is fully loaded, play the splashscreen outro
      document.getElementById("splashscreenOutro").play();
      
    }
  }, [router.isReady])
  return (
    <>
      <Head>
        <title>Helps | RYGB</title>
        <meta name="description" content="Copyright (c) Marcus Mauricio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div id="navbar" className={styles.navbar}>
          <img style={{ marginRight: "20px" }} src="logo.svg" alt="RYGB Helps" height={45} />
        </div>
        <div id="content">
          <div id="hero" className={styles.hero}>
            <div id="herocontent" style={{ position: "absolute", left: "50%", top: "50%", transform: "translateX(-50%) translateY(-50%)", textAlign: "center" }}>
              <img src="logorygbcentered.svg" height={75} alt="RYGB Helps" />
              <h1 className={styles.header}>Empowering communities through compassionate food provision for the homeless.</h1>
            </div>
          </div>
        </div>

        <video id="splashscreenOutro"><source src="helpsoutro.mp4" type="video/mp4" /></video>
      </main>
    </>
  )
}
