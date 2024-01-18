import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import anime from 'animejs';
import Footer from '@/components/NDMVFooter.jsx';
import Cookies from 'js-cookie';
import axios from 'axios'

export default function Home() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [mobile, setMobile] = useState(false);

  function openSidebar() {
    document.getElementById("mainelem").style.overflowY = "hidden"
    document.body.style.overflowY = "hidden"
    anime({
      targets: "#sidebar",
      left: "50%",
      duration: 500,
      easing: 'easeInOutQuad',
    })
  }

  function closeSidebar() {
    document.getElementById("mainelem").style.overflowY = "auto"
    document.body.style.overflowY = "hidden"
    anime({
      targets: "#sidebar",
      left: "-50%",
      duration: 500,
      easing: 'easeInOutQuad',
    })
  }

  //use this function instead of router.push() to play splashscreen
  function push(path) {
    if (router.isReady) {
      closeSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.getElementById("splashscreenIntro").style.display = "block";
      document.body.style.overflowY = "hidden"
      setTimeout(() => {
        document.getElementById("splashscreenIntro").playbackRate = 0.5;
        document.getElementById("splashscreenIntro").play().catch((e) => {
          console.log(e)
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

  useEffect(() => {
    if (router.isReady) {
      //once the page is fully loaded, play the splashscreen outro
      if (window.innerWidth <= 600) {
        setMobile(true);
        document.getElementById("splashscreenIntro").src = "anim_ss_ndmv_intro_mobile.mp4";
        document.getElementById("splashscreenOutro").src = "anim_ss_ndmv_outro_mobile.mp4";
        document.getElementById("menuicon").style.display = "block";
        document.getElementById("menulogogrid").style.display = "grid"
        document.getElementById("makeadifferencebtn").style.display = "none"
        document.getElementById("goalgrid").style.gridTemplateColumns = "auto";
      }

      if (window.innerWidth <= 1300) {
        document.getElementById("acctsbtn").style.display = "none";
        document.getElementById("buttons").style.gridTemplateColumns = "280px 160px 130px"
      }

      if (window.innerWidth <= 1122) {
        document.getElementById("blogbtn").style.display = "none"
        document.getElementById("buttons").style.gridTemplateColumns = "280px 160px"
      }

      if (window.innerWidth <= 900) {
        document.getElementById("eventsbtn").style.display = "none"
        document.getElementById("buttons").style.gridTemplateColumns = "280px"
      }

      if (window.innerWidth <= 800) {
        document.getElementById("makediffbtn").style.display = "none"
        document.getElementById("buttons").style.display = "none"
      }

      if (Cookies.get("account") != undefined) {
        setAccount(Cookies.get("account"));
      }

      axios({
        method: "get",
        url: "http://localhost:3000/getEvents"
      }).then((res) => {
        if (res.status == 200) {
          const events = res.data;
          for (var i = 0; i < events.length; i++) {

          }
        }
      }).catch((err) => {

      });

      window.scrollTo(0, 0);
      //playing the splashscreen is not essential, if it errors, just fade

      document.getElementById("splashscreenOutro").play().catch((e) => {
        console.log(e)
      });
      document.getElementById("splashscreenOutro").pause();
      setTimeout(() => {
        document.getElementById("splashscreenOutro").play().catch((e) => {
          console.log(e)
        });

        anime({
          targets: '#splashscreenOutro',
          opacity: 0,
          duration: 500,
          easing: 'easeInOutQuad',
          complete: function (anim) {
            document.getElementById("splashscreenOutro").style.display = "none";
            document.body.style.overflowY = "auto"
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
        <title>Home | NourishDMV</title>
        <meta name="description" content="Copyright (c) 2024 Marcus Mauricio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" />
      </Head>
      <main id="mainelem" style={{ overflowX: "hidden" }}>
        <div id="sidebar" className={styles.sidenavbar}>
          <Image style={{ marginLeft: "5px", position: "absolute" }} src="logo_white.svg" alt="NourishDMV Logo" height={80} width={250} />
          <button className={styles.closebutton} onClick={() => closeSidebar()}><span class="material-symbols-rounded" style={{ fontSize: "40px" }}>close</span></button>
          <div onClick={() => router.push("/#makeDifference")} style={{ margin: "auto", height: "100px", width: "100%", marginBottom: "10px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
            <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">food_bank</span>
            <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Make a difference</p>
          </div>
          <div onClick={() => push("/dash?view=events")} style={{ margin: "auto", height: "100px", width: "100%", marginBottom: "10px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
            <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">local_activity</span>
            <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Events</p>
          </div>
          <div onClick={() => push("/dash?view=blog")} style={{ margin: "auto", height: "100px", width: "100%", marginBottom: "10px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
            <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">hub</span>
            <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Blog</p>
          </div>
          <div onClick={() => push("/accounts")} style={{ margin: "auto", height: "100px", width: "100%", marginBottom: "10px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
            <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">account_circle</span>
            <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Accounts</p>
          </div>
        </div>
        <div id="content" style={{ opacity: "0" }}>
          <div id="navbar" className={styles.navbar}>
            <div id="menulogogrid" className={styles.doublegrid} style={{ width: "210px", gridTemplateColumns: "10px auto", marginLeft: "14px", display: "block" }}>
              <span id="menuicon" class="material-symbols-rounded" style={{ fontSize: "30px", margin: "auto", cursor: "pointer", display: "none" }} onClick={() => openSidebar()}>menu</span>
              <Image style={{ marginLeft: "5px" }} src="logo.svg" alt="NourishDMV Logo" height={45} width={200} />
            </div>
            <div id="buttons" className={[styles.fullycenter, styles.navbtngrid].join(" ")}>
              <div id="makediffbtn" onClick={() => router.push("/#makeDifference")} style={{ margin: "auto", height: "35px", width: "280px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
                <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">food_bank</span>
                <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Make a difference</p>
              </div>
              <div id="eventsbtn" onClick={() => push("/dash?view=events")} style={{ margin: "auto", height: "35px", width: "160px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
                <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">local_activity</span>
                <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Events</p>
              </div>
              <div id="blogbtn" onClick={() => push("/dash?view=blog")} style={{ margin: "auto", height: "35px", width: "130px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
                <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">hub</span>
                <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Blog</p>
              </div>
              <div id="acctsbtn" onClick={() => push("/accounts")} style={{ margin: "auto", height: "35px", width: "170px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
                <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">account_circle</span>
                <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Accounts</p>
              </div>
            </div>
            <div style={{ position: "absolute", right: "5px", top: "5px" }}>
              <button id="makeadifferencebtn" className={styles.button} onClick={() => push("/accounts?view=Sign+Up")} style={{ height: "35px", marginBottom: "0px", width: "250px", backgroundColor: "rgb(251 172 41 / 58%)", display: (account != "") ? "none" : "block" }}>Sign Up</button>
              <button className={styles.button} style={{ display: (account != "") ? "block" : "none", height: "35px", marginBottom: "0px", width: "150px", backgroundColor: "rgb(251 172 41 / 58%)" }} onClick={() => push("dash")}>Dashboard</button>
            </div>
          </div>
          <div id="bodyContent" style={{ marginTop: "00px", padding: "10px 5%" }}>
            <div id="herosContainer" style={{ position: "relative" }}>
              <img src="shelter.jpg" className={styles.blurredHero} />
              <div id="hero" className={styles.hero}>
                <img className={styles.fullycenter} src="shelter.jpg" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.8)", borderRadius: "25px" }} />
                <h1 style={{ width: "80%", textAlign: "center", fontSize: (mobile) ? "50px" : "60px", textShadow: "0 0 20px BLACK", color: "white" }} className={[styles.header, styles.fullycenter].join(" ")}>Food and shelter for all in the DMV</h1>
              </div>
            </div>

            <div id="innerContent" style={{ padding: "15px 0px" }}>
              <div id="currentEvents" style={{ marginTop: "15px" }}>
                <h3 className={styles.header} style={{ color: "black", marginLeft: "20px", marginBottom: "10px" }}>Happening Now</h3>
                <div id="currentEventsList" style={{ overflowX: "auto" }}>
                  <div className={styles.item} style={{ cursor: "unset" }}>
                    <p style={{ color: "rgba(0, 0, 0, 0.300)", margin: "0", width: "100%", textAlign: "center" }} className={styles.fullycenter}>No events to show</p>
                  </div>
                </div>
              </div>
              <div id="makeDifference" className={styles.divider}></div>
              <h3 className={styles.header} style={{ color: "black", marginBottom: "20px", textAlign: "center" }}>Make a difference in <a style={{ backgroundColor: "#fbac29ff" }}>your community</a></h3>
              <div className={styles.doublegrid} style={{ margin: "auto" }}>
                <button className={styles.button} style={{ margin: "auto", height: "300px", width: "100%", backgroundColor: "#f66d4bff", marginBottom: "15px", fontSize: "40px", fontWeight: "bold" }} onClick={() => push("/dash?view=donate")}>Support our cause</button>
                <button className={styles.button} style={{ margin: "auto", height: "300px", width: '100%', backgroundColor: "#fbe85dff", marginBottom: "15px", fontSize: "40px", fontWeight: "bold" }} onClick={() => push("/dash?view=volunteer")}>Join our team</button>
              </div>
              <div style={{ position: "relative" }}>
                <div className={styles.divider}></div>
                <div className={styles.blurredCircle} style={{ position: "absolute", top: "-5%", backgroundColor: "#f66d4bff" }}></div>

                <h3 className={styles.header} style={{ color: "black", textAlign: "center", marginBottom: "40px" }}><a style={{ backgroundColor: "#fbac29ff" }}>21,808</a> people need your help</h3>
                <div className={styles.tripplegrid}>
                  <div className={styles.card} style={{ margin: "auto", textAlign: "center" }}>
                    <h1 className={styles.header} style={{ color: "rgba(0, 0, 0, 0.504)" }}>District of Columbia</h1>
                    <p className={styles.description}>According to Homelessness in Metropolitan: Results and Analysis from the Annual Point-in-Time (PIT) Count of Persons Experiencing Homelessness, 8,944 total people in the District of Columbia (DC) are homeless.</p>
                    <div className={styles.fullycenter} style={{ top: "initial", bottom: "0px", width: "100%", zIndex: "10" }}>
                      <h3 className={styles.header}><a style={{ backgroundColor: "#fbac29ff", color: "black" }}>8,944</a></h3>
                      <h4 style={{ margin: "0px", color: "rgba(0, 0, 0, 0.504)" }}>total homeless count</h4>
                    </div>
                  </div>
                  <div className={styles.card} style={{ margin: "auto", textAlign: "center" }}>
                    <h1 className={styles.header} style={{ color: "rgba(0, 0, 0, 0.504)" }}>Maryland</h1>
                    <p className={styles.description}>According to 2020/2021 Report on Homelessness - The Maryland Interagency Council on Homelessness: 6,337 people are experiencing homelessness across the state of Maryland.</p>
                    <div className={styles.fullycenter} style={{ top: "initial", bottom: "0px", width: "100%", zIndex: "10" }}>
                      <h3 className={styles.header}><a style={{ backgroundColor: "#fbac29ff", color: "black" }}>6,337</a></h3>
                      <h4 style={{ margin: "0px", color: "rgba(0, 0, 0, 0.504)" }}>total homeless count</h4>
                    </div>
                  </div>

                  <div className={styles.card} style={{ margin: "auto", textAlign: "center" }}>
                    <h1 className={styles.header} style={{ color: "rgba(0, 0, 0, 0.504)" }}>Virginia</h1>
                    <p className={styles.description}>According to The Center Square | Virginia: 6,527 people in the state of Virginia are currently experiencing homelessness (September 25th, 2023)</p>
                    <div className={styles.fullycenter} style={{ top: "initial", bottom: "0px", width: "100%", zIndex: "10" }}>
                      <h3 className={styles.header}><a style={{ backgroundColor: "#fbac29ff", color: "black" }}>6,527</a></h3>
                      <h4 style={{ margin: "0px", color: "rgba(0, 0, 0, 0.504)" }}>total homeless count</h4>
                    </div>
                  </div>
                </div>
                <div className={styles.divider} style={{ marginTop: "100px" }}></div>
                <div className={styles.blurredCircle} style={{ position: "absolute", bottom: "-5%", right: "0", backgroundColor: "#fbe85dff", zIndex: "-1" }}></div>
              </div>
              <div id="goalgrid" className={styles.doublegrid} style={{ gridTemplateColumns: "1.2fr 0.8fr", gridGap: "100px" }}>
                <div>
                  <h3 className={styles.header} style={{ color: "black", marginLeft: "20px", marginBottom: "10px" }}>Our goal</h3>
                  <p className={styles.description} style={{ fontSize: "25px", padding: "0px 20px" }}>
                    Save lives and create a thriving community by ensuring that everyone in the DMV has food and shelter. We believe in the power of addressing these basic needs comprehensively, as not only a means of survival but also as a building block to create healthier, happier lives. Join us to become a vital part of our movement and directly impact the community.
                  </p>
                </div>
                <div style={{ position: "relative" }}>
                  <img className={styles.blurredHero} alt="people laying on beds in a homeless shelter" src="shelterinside.jpg" style={{ objectFit: "cover", height: "100%", width: "100%", borderRadius: "25px" }}></img>
                  <img alt="people laying on beds in a homeless shelter" src="shelterinside.jpg" style={{ objectFit: "cover", height: "100%", width: "100%", borderRadius: "25px", zIndex: "20", position: 'relative' }}></img>
                </div>
              </div>
              <div className={styles.divider}></div>
              <h3 className={styles.header} style={{ color: "black", marginLeft: "20px" }}>See how we've been <a style={{ backgroundColor: "rgb(251, 172, 41)" }}>impacting our community</a></h3>
              <h4 className={styles.subheader} style={{ marginLeft: "20px", marginBottom: "20px" }}>Our blog</h4>
              <div>
                <div className={styles.redirectcard} onClick={() => push("/dash?view=blog")}>
                  <div className={styles.fullycenter}>
                    <div style={{ position: "relative" }}>
                      <div className={[styles.blurredCircle, styles.fullycenter].join(" ")} style={{ left: "50%", width: "140px", height: "140px", filter: "blur(20px)", transform: "translateY(-50%) translateX(-50%)", backgroundColor: "rgb(227, 171, 74)", zIndex: "1" }}></div>
                      <div style={{ zIndex: "5" }} className={styles.fullycenter}>
                        <span style={{ fontSize: "50px" }} className={["material-symbols-rounded", styles.iconCircle].join(" ")}>
                          open_in_new
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: "auto", fontSize: "50px", width: "100%", textAlign: "center", marginTop: "50px" }}>See All</p>
                  </div>

                </div>
              </div>
              <div className={styles.divider}></div>
              <h3 className={styles.header} style={{ color: "black", marginBottom: "20px", textAlign: "center" }}>Get in touch</h3>
              <div className={styles.contactgrid}>
                <div className={[styles.item, styles.doublegrid].join(" ")} style={{ margin: "auto", marginRight: "0px", gridTemplateColumns: "auto 30%", display: "grid" }} onClick={() => window.location.href = "tel:4101234567"}>
                  <div className={styles.header} style={{ textAlign: "center", margin: "auto" }}>
                    (410) 123-4567
                  </div>
                  <div style={{ position: "relative" }}>
                    <div className={[styles.blurredCircle, styles.fullycenter].join(" ")} style={{ left: "0", width: "120px", height: "120px", filter: "blur(20px)", transform: "translateY(-50%)", backgroundColor: "rgb(227, 171, 74)", zIndex: "1" }}></div>
                    <div style={{ zIndex: "5" }} className={styles.fullycenter}>
                      <span className={["material-symbols-rounded", styles.iconCircle].join(" ")}>
                        call
                      </span>
                    </div>
                  </div>
                </div>
                <div className={[styles.item, styles.doublegrid].join(" ")} style={{ margin: "auto", marginLeft: "0px", gridTemplateColumns: "30% auto", display: "grid" }} onClick={() => window.location.href = "mailto:contact@nourishdmv.com"}>
                  <div style={{ position: "relative" }}>
                    <div className={[styles.blurredCircle, styles.fullycenter].join(" ")} style={{ left: "0", width: "120px", height: "120px", filter: "blur(20px)", transform: "translateY(-50%)", backgroundColor: "rgb(227, 171, 74)", zIndex: "1" }}></div>
                    <div style={{ zIndex: "5" }} className={styles.fullycenter}>
                      <span className={["material-symbols-rounded", styles.iconCircle].join(" ")}>
                        email
                      </span>
                    </div>

                  </div>
                  <div className={styles.header} style={{ textAlign: "center", margin: "auto", fontSize: "30px" }}>
                    contact<br />@nourishdmv.com
                  </div>
                </div>
                <div className={[styles.item, styles.doublegrid].join(" ")} style={{ margin: "auto", marginRight: "0px", gridTemplateColumns: "auto 30%", display: "grid" }} onClick={() => window.location.href = "https://www.google.com/maps/dir//16701+Melford+Blvd+%23421,+Bowie,+MD+20715/@38.9611344,-76.7158268,19z/data=!4m9!4m8!1m0!1m5!1m1!1s0x89b7ec1769408c5f:0x5e0035c97d3c3f24!2m2!1d-76.7146091!2d38.9611344!3e0?entry=ttu"}>
                  <div className={styles.header} style={{ textAlign: "center", margin: "auto", fontSize: "25px" }}>
                    16701 Melford Blvd, Bowie, MD 20715
                    <h2 className={styles.subheader} style={{ fontSize: "20px" }}>headquarters</h2>
                  </div>
                  <div style={{ position: "relative" }}>
                    <div className={[styles.blurredCircle, styles.fullycenter].join(" ")} style={{ left: "0", width: "120px", height: "120px", filter: "blur(20px)", transform: "translateY(-50%)", backgroundColor: "rgb(227, 171, 74)", zIndex: "1" }}></div>
                    <div style={{ zIndex: "5" }} className={styles.fullycenter}>
                      <span className={["material-symbols-rounded", styles.iconCircle].join(" ")}>
                        pin_drop
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.item} style={{ margin: "auto", marginLeft: "0px", cursor: "default" }}>
                  <div style={{ position: "relative", height: "100%", filter: "blur(20px)" }}>
                    <div style={{ position: "absolute" }} className={styles.fullycenter}>
                      <div className={[styles.blurredCircle, styles.fullycenter].join(" ")} style={{ left: "50%", width: "120px", height: "120px", filter: "blur(20px)", transform: "translateX(-50%) translateY(-50%)", backgroundColor: "rgb(227, 171, 74)", zIndex: "1" }}></div>
                      <div style={{ zIndex: "5" }} className={styles.fullycenter}>
                        <span className={["material-symbols-rounded", styles.iconCircle].join(" ")}>
                          alternate_email
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.fullycenter} style={{ width: "100%" }}>
                    <div className={styles.header} style={{ textAlign: "center", margin: "auto" }}>
                      <h2 className={styles.subheader} style={{ fontSize: "20px" }}>Social Media</h2>
                      @nourishdmv
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
          <Footer citations={[
            {
              name: "Image 1",
              citation: `DLR Group "Exterior view of a section the Triumph with window covered facade illuminated at night with interior rooms visible" DLR Group, 2020, https://www.dlrgroup.com/work/the-triumph-ward-8/`
            }, {
              name: "Homeless count for District of Columbia",
              citation: `Metropolitan Washington Council of Governments "Homelessness in Metropolitan Washington: Results and Analysis from the Annual Point-in-Time (PIT) Count of Persons Experiencing Homelessness" Metropolitan Washington Council of Governments, May, 2023, https://www.mwcog.org/file.aspx?D=cNIoGencJPm463aX0VC4iezyhJddJ%2b0CHWJv0gBajVw%3d&A=krOIQIAuqaJwMnUiVaD2nsIwN67PN6dmrf2qwXkiNWc%3d`
            }, {
              name: "Homeless count for Maryland",
              citation: `The Maryland Interagency Council on Homelessness "2020/2021 report on Homelessness" The Maryland Interagency Council on Homelessness, 2021, https://dhcd.maryland.gov/HomelessServices/Documents/2021AnnualReport.pdf`
            }, {
              name: "Homeless count for Virginia",
              citation: ``
            }, {
              name: "Image 2",
              citation: `NC 211 "people laying on beds in a homeless shelter" NC 211, 4 October 2022, https://nc211.org/shelters/`
            }
          ]} />
        </div>
        <video id="splashscreenOutro" muted playsInline className="splashScreen" preload="auto"><source src="anim_ss_ndmv_outro.mp4" type="video/mp4" /></video>
        <video id="splashscreenIntro" muted playsInline className="splashScreen" style={{ display: "none", opacity: 0 }}><source src="anim_ss_ndmv_intro.mp4" type="video/mp4" /></video>
      </main>
    </>
  )
}
