import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect, useState, useMemo } from 'react'
import anime from 'animejs';
import Footer from '@/components/NDMVFooter.jsx';
import Cookies from 'js-cookie';
import axios from 'axios'
import { uuid } from 'uuidv4'

export default function Home() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [mobile, setMobile] = useState(false);
  const [loadContent, setLoadContent] = useState(false);

  const [trackerUUID, setTrackerUUID] = useState("");
  const [viewingContent, setViewingContent] = useState("hero");

  function openSidebar() {
    document.getElementById("mainelem").style.overflowY = "hidden"
    //document.body.style.overflowY = "hidden"
    anime({
      targets: "#sidebar",
      left: "50%",
      duration: 300,
      easing: 'easeInOutQuad',
    })
  }

  function closeSidebar() {
    document.getElementById("mainelem").style.overflowY = "auto"
    //document.body.style.overflowY = "hidden"
    anime({
      targets: "#sidebar",
      left: "-50%",
      duration: 300,
      easing: 'easeInOutQuad',
    })
  }

  //use this function instead of router.push() to play splashscreen
  function push(path) {
    if (router.isReady) {
      closeSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.style.overflowY = "hidden"
      if (mobile) {
        anime({
          targets: '#content',
          opacity: 0,
          filter: "blur(20px)",
          duration: 500,
          delay: 200,
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
          targets: '#content',
          opacity: 0,
          filter: "blur(20px)",
          duration: 1000,
          easing: 'easeInOutQuad'
        })
      }

    }
  }

  function calculateEventStatus(startDateTime, endDateTime) {
    if (Date.parse(startDateTime) > Date.now()) {
      return "Pending";
    } else if (Date.parse(startDateTime) < Date.now() && Date.parse(endDateTime) > Date.now()) {
      return "In Progress";
    } else if (Date.parse(endDateTime) < Date.now()) {
      return "Ended";
    }
  }

  var intervalIds = [];

  function refreshEvents() {
    console.log("refreshing events")
    console.log("clear events")

    for (var i = 0; i < intervalIds.length; i++) {
      clearInterval(intervalIds[i]);
      intervalIds.splice(intervalIds.indexOf(intervalIds[i]), 1);
    }

    axios({
      method: "get",
      url: "http://localhost:8080/getEvents"
    }).then((res) => {
      if (res.status == 200) {
        console.log("got events")
        const events = res.data;
        //sort the events array based on the event start date time
        events.sort((a, b) => {
          return Date.parse(a.event.startDateTime) - Date.parse(b.event.startDateTime);
        });

        //sort the events array based on the event's status
        events.sort((a, b) => {
          const aStatus = calculateEventStatus(a.event.startDateTime, a.event.endDateTime);
          const bStatus = calculateEventStatus(b.event.startDateTime, b.event.endDateTime);
          if (aStatus == "Pending" && bStatus == "Pending") {
            return 0;
          } else if (aStatus == "Pending" && bStatus == "In Progress") {
            return -1;
          } else if (aStatus == "Pending" && bStatus == "Ended") {
            return -1;
          } else if (aStatus == "In Progress" && bStatus == "Pending") {
            return 1;
          } else if (aStatus == "In Progress" && bStatus == "In Progress") {
            return 0;
          } else if (aStatus == "In Progress" && bStatus == "Ended") {
            return -1;
          } else if (aStatus == "Ended" && bStatus == "Pending") {
            return 1;
          } else if (aStatus == "Ended" && bStatus == "In Progress") {
            return 1;
          } else if (aStatus == "Ended" && bStatus == "Ended") {
            return 0;
          }
        });
        
        const currentEventsList = document.getElementById("currentEventsList");
        for (var i = 0; i < currentEventsList.children.length; i++) {
          currentEventsList.children[i].remove();
        }
        if (events.length == 0) {
          const noevents = document.createElement("div");
          noevents.id = "noevents";
          noevents.className = styles.item;
          noevents.style.cursor = "unset"
          const noeventstext = document.createElement("p");
          noeventstext.style.color = "rgba(0, 0, 0, 0.300)"
          noeventstext.style.margin = "0px"
          noeventstext.style.width = "100%"
          noeventstext.style.textAlign = "center"
          noeventstext.className = styles.fullycenter;
          noeventstext.innerHTML = "No events to show";
          noevents.appendChild(noeventstext);
          currentEventsList.appendChild(noevents);
        }

        for (var i = 0; i < 3; i++) {
          if (events[i] == undefined || events[i].event.visible == "Hidden") {
            continue;
          }
          const event = events[i].event;
          const eventid = events[i].id;
          const eventcard = document.createElement("div");
          const eventcontentcontainer = document.createElement("div");
          const eventdetailscontainer = document.createElement("div");
          eventcontentcontainer.style.display = "grid"
          eventcontentcontainer.style.gridTemplateColumns = "auto 30px";
          eventcontentcontainer.style.gridGap = "15px"
          eventcontentcontainer.style.width = "90%"
          eventcontentcontainer.style.margin = "auto";
          eventcontentcontainer.style.transform = "translate(-50%, -50%)"
          eventcontentcontainer.style.position = "absolute"
          eventcontentcontainer.style.top = "50%"
          eventcontentcontainer.style.left = "50%"
          eventcard.className = styles.itemEvents;
          eventcard.onclick = () => push("/dash?view=events&eventid=" + eventid);
          eventcard.style.borderRadius = "30px"
          eventcard.style.width = "570px"
          eventcard.style.marginBottom = "20px"
          const eventcountdownline = document.createElement("a");

          var eventStatus = calculateEventStatus(event.startDateTime, event.endDateTime);
          var registrationStatus = calculateEventStatus(event.registrationStartDateTime, event.registrationEndDateTime);
          console.log(eventStatus, registrationStatus)
          if (registrationStatus == "Pending") {
            eventcard.className = [styles.itemPending, styles.itemEvents].join(" ")
            const interval = setInterval(function () {
              var timeDifference = calculateTimeDifference(event.registrationStartDateTime);
              eventcountdownline.innerHTML = "Registration opens in " + timeDifference.value + " " + timeDifference.unit;
              if (timeDifference.value <= 1 && timeDifference.unit === 'seconds') {
                console.log("reg pending refresh events")
                clearInterval(interval);
                refreshEvents();

              }
            }, 1000)
            intervalIds.push(interval);
          } else if (registrationStatus == "In Progress") {
            eventcard.style.animation = styles.pulse2 + " 3s infinite linear"
            const interval = setInterval(function () {
              var timeDifference = calculateTimeDifference(event.registrationEndDateTime);
              eventcountdownline.innerHTML = "Registration closes in " + timeDifference.value + " " + timeDifference.unit;
              if (timeDifference.value <= 1 && timeDifference.unit === 'seconds') {
                console.log("reg inprogress refresh events")
                refreshEvents();
                clearInterval(interval);
              }
            }, 1000)
            intervalIds.push(interval);
          } else if (registrationStatus == "Ended") {
            if (eventStatus == "Ended") {
              eventcard.className = [styles.itemEnded, styles.itemEvents].join(" ")
              //show how many days ago the event ended, but if the time is less than 24 hours, show how many hours ago. if the time is less than 1 hour, show how many minutes ago. if the time is less than 1 minute, show how many seconds ago
              const interval = setInterval(function () {
                var timeDifference = calculateTimeAgoDifference(event.endDateTime);
                eventcountdownline.innerHTML = "Ended " + timeDifference.value + " " + timeDifference.unit;
                if (timeDifference.value <= 1 && timeDifference.unit === 'seconds') {
                  console.log("ended refresh events")
                  refreshEvents();
                  clearInterval(interval);
                }
              }, 1000)
              intervalIds.push(interval);
            } else if (eventStatus == "In Progress") {
              eventcard.className = [styles.itemOnGoing, styles.itemEvents].join(" ")
              //show how many hours left in the event, but if the time is longer than 24 hours, show how many days left. if the time is less than 1 hour, show how many minutes left. if the time is less than 1 minute, show how many seconds left
              const interval = setInterval(function () {
                var timeDifference = calculateTimeDifference(event.endDateTime);
                eventcountdownline.innerHTML = "Ends in " + timeDifference.value + " " + timeDifference.unit;
                if (timeDifference.value <= 1 && timeDifference.unit === 'seconds') {
                  console.log("inprogress refresh events")
                  refreshEvents();
                  clearInterval(interval);
                }
              }, 1000)
              intervalIds.push(interval);
            } else if (eventStatus == "Pending") {
              eventcard.className = [styles.itemPending, styles.itemEvents].join(" ")
              //show how many days left until the event starts, but if the time is less than 24 hours, show how many hours left
              //Pending means that the registration window has not begun yet
              const interval = setInterval(function () {
                var timeDifference = calculateTimeDifference(event.startDateTime);
                eventcountdownline.innerHTML = "Starts in " + timeDifference.value + " " + timeDifference.unit;
                if (timeDifference.value <= 1 && timeDifference.unit === 'seconds') {
                  console.log("pending refresh events")
                  refreshEvents();
                  clearInterval(interval);
                }
              }, 1000)
              intervalIds.push(interval);
            }
          }

          const eventcontent = document.createElement("div");
          const eventtitle = document.createElement("h3");
          eventtitle.innerHTML = event.title;
          eventtitle.style.margin = "0px"
          eventcontent.appendChild(eventcountdownline);
          eventcontent.appendChild(eventtitle);

          if (event.location != "") {
            const eventlocationdiv = document.createElement("div");
            const eventlocicon = document.createElement("span");
            const eventlocation = document.createElement("p");
            eventlocationdiv.className = styles.doublegrid;
            eventlocationdiv.style.gridTemplateColumns = "20px auto"
            eventlocationdiv.style.gridGap = "10px"
            eventlocicon.innerHTML = "pin_drop"
            eventlocicon.className = "material-symbols-rounded"
            eventlocation.innerHTML = event.location;
            eventlocation.style.margin = "0px"
            eventlocationdiv.appendChild(eventlocicon);
            eventlocationdiv.appendChild(eventlocation);
            eventcontent.appendChild(eventlocationdiv);
          }

          const eventdates = document.createElement("div");
          const eventdicon = document.createElement("span");
          const eventdatestext = document.createElement("p");
          eventdates.className = styles.doublegrid;
          eventdates.style.gridTemplateColumns = "20px auto"
          eventdates.style.gridGap = "10px"
          eventdatestext.style.margin = "0px"
          eventdicon.innerHTML = "schedule"
          eventdicon.style.margin = "auto"
          eventdicon.className = "material-symbols-rounded"

          eventdatestext.innerHTML = new Date(event.startDateTime).toLocaleDateString() + " - " + new Date(event.endDateTime).toLocaleDateString();

          eventdates.appendChild(eventdicon);
          eventdates.appendChild(eventdatestext);
          eventcontent.appendChild(eventdates);

          const icon = document.createElement("span");
          icon.className = "material-symbols-rounded";
          icon.innerHTML = "chevron_right"
          icon.style.fontSize = "30px"
          icon.style.margin = "auto"
          icon.style.marginRight = "0px"

          if (mobile) {
            /*
            eventcontentcontainer.style.gridTemplateColumns = "auto"
            eventdetailscontainer.style.gridTemplateColumns = "auto 30px"
            eventdetailscontainer.style.display = "grid"
            eventdetailscontainer.style.padding = "0px 20px"
            */
            eventcontentcontainer.appendChild(eventcontent);
            eventcontentcontainer.appendChild(icon);
            //eventcontentcontainer.appendChild(eventdetailscontainer);
          } else {
            eventcontentcontainer.appendChild(eventcontent);
            eventcontentcontainer.appendChild(icon);
          }

          eventcard.appendChild(eventcontentcontainer);
          currentEventsList.appendChild(eventcard);
        }

        const seeAllButton = document.createElement("div");
        seeAllButton.className = styles.expandItem;
        const icontext = document.createElement("div");
        icontext.style.display = "grid";
        icontext.style.gridTemplateColumns = "auto";
        const icon = document.createElement("span");
        icon.className = "material-symbols-rounded";
        icon.innerHTML = "open_in_new";
        icon.style.fontSize = "60px";
        icon.style.margin = "auto";

        const text = document.createElement("p");
        text.innerHTML = "View more"
        text.style.margin = "auto";
        text.style.fontSize = "40px";
        text.style.fontWeight = "bold";
        icontext.appendChild(icon);
        icontext.appendChild(text);
        icontext.style.position = "absolute";
        icontext.style.top = "50%";
        icontext.style.left = "50%";
        icontext.style.transform = "translate(-50%, -50%)";

        icontext.style.margin = "auto"
        seeAllButton.appendChild(icontext);
        seeAllButton.onclick = () => push("/dash?view=events");
        if (events.length > 3) {
          currentEventsList.appendChild(seeAllButton);
        }
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  function calculateTimeAgoDifference(endDateTime) {
    const timeDifference = Date.now() - Date.parse(endDateTime);
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      if (days == 1) {
        return { value: days, unit: 'day ago' };
      }
      return { value: days, unit: 'days ago' };
    } else if (hours >= 1) {
      if (hours == 1) {
        return { value: hours, unit: 'hour ago' };
      }
      return { value: hours, unit: 'hours ago' };
    } else if (minutes >= 1) {
      if (minutes == 1) {
        return { value: minutes, unit: 'minute ago' };
      }
      return { value: minutes, unit: 'minutes ago' };
    } else {
      if (seconds == 1) {
        return { value: seconds, unit: 'second ago' };
      }
      return { value: seconds, unit: 'seconds ago' };
    }
  }

  function calculateTimeDifference(endDateTime) {
    const timeDifference = Date.parse(endDateTime) - Date.now();
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      if (days == 1) {
        return { value: days, unit: 'day' };
      }
      return { value: days, unit: 'days' };
    } else if (hours >= 1) {
      if (hours == 1) {
        return { value: hours, unit: 'hour' };
      }
      return { value: hours, unit: 'hours' };
    } else if (minutes >= 1) {
      if (minutes == 1) {
        return { value: minutes, unit: 'minute' };
      }
      return { value: minutes, unit: 'minutes' };
    } else {
      if (seconds == 1) {
        return { value: seconds, unit: 'second' };
      }
      return { value: seconds, unit: 'seconds' };
    }
  }

  useEffect(() => {
    if (loadContent) {
      setLoadContent(true);
      refreshEvents();
    }
  }, [loadContent])

  useEffect(() => {
    if (trackerUUID != "") {
      Cookies.set("trackerUUID", trackerUUID);
      axios({
        method: "post",
        url: "http://localhost:8080/track",
        data: {
          uuid: trackerUUID,
          page: "Homepage",
          view: viewingContent,
        }
      }).catch((err) => {
        console.log(err);
        console.log("Failed to track.")
      });
    }
  }, [trackerUUID, viewingContent]);


  //from https://gist.github.com/jjmu15/8646226
  function isInViewport(ele) {
    try {
      const { top, bottom } = ele.getBoundingClientRect();
      const vHeight = (window.innerHeight || document.documentElement.clientHeight);

      return (
        (top > 0 || bottom > 0) &&
        top < vHeight
      );
    } catch (e) {
      console.log(e)

      return false;
    }

  }

  function handleScroll() {
    const footer = document.getElementById("footer");
    const getintouch = document.getElementById("getInTouch");
    const makeDifference = document.getElementById("makeDifference");
    const howhelp = document.getElementById("howhelplist");
    const goalgrid = document.getElementById("goalgrid");
    const hero = document.getElementById("hero");

    if (isInViewport(footer)) {
      setViewingContent("footer");
    } else if (isInViewport(getintouch)) {
      setViewingContent("getintouch");
    } else if (isInViewport(makeDifference)) {
      setViewingContent("makeDifference");
    } else if (isInViewport(howhelp)) {
      setViewingContent("howhelp");
    } else if (isInViewport(goalgrid)) {
      setViewingContent("goalgrid");
    } else if (isInViewport(hero)) {
      setViewingContent("hero");
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
  });

  useEffect(() => {
    if (router.isReady) {
      //once the page is fully loaded, play the splashscreen outro
      if (window.innerWidth <= 1300) {
        document.getElementById("eventsbtn").style.display = "none";
        document.getElementById("buttons").style.gridTemplateColumns = "200px 280px 170px"
      }

      if (window.innerWidth <= 1122) {
        document.getElementById("makediffbtn").style.display = "none"
        document.getElementById("buttons").style.gridTemplateColumns = "200px 170px"
      }

      if (window.innerWidth <= 900) {
        document.getElementById("eventsbtn").style.display = "none"
        document.getElementById("buttons").style.gridTemplateColumns = "200px"
      }

      if (window.innerWidth <= 800) {
        document.getElementById("buttons").style.display = "none"
        document.getElementById("eventsContainer").prepend(document.getElementById("eventsImage"));
      }

      if (window.innerWidth <= 600) {
        setMobile(true);
        document.getElementById("splashscreenOutro").style.display = "none"
        document.getElementById("menuicon").style.display = "block";
        document.getElementById("menulogogrid").style.display = "grid"
        document.getElementById("goalgrid").style.gridTemplateColumns = "auto";
        setTimeout(() => {
          anime({
            targets: '#content',
            opacity: 1,
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function (anim) {
              document.body.style.overflowY = "auto"
            }
          })
        }, 500)
      } else {
        if (window.innerWidth <= 1450) {
          document.getElementById("splashscreenIntro").src = "anim_ss_ndmv_intro_notext.mp4";
          document.getElementById("splashscreenOutro").src = "anim_ss_ndmv_outro_notext.mp4";
        }

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
      if (Cookies.get("account") != undefined) {
        setAccount(Cookies.get("account"));
      }

      setLoadContent(true);
      //window.scrollTo(0, 0);
      //playing the splashscreen is not essential, if it errors, just fade

      if (Cookies.get("trackerUUID") == undefined && trackerUUID == "") {
        setTrackerUUID(uuid());
      } else if (Cookies.get("trackerUUID") != undefined && trackerUUID == "") {
        setTrackerUUID(Cookies.get("trackerUUID"));
      }
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
          <div onClick={() => push("/dash")} style={{ margin: "auto", height: "100px", width: "100%", marginBottom: "10px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
            <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">space_dashboard</span>
            <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Dashboard</p>
          </div>
          <div onClick={() => push("/dash?view=events")} style={{ margin: "auto", height: "100px", width: "100%", marginBottom: "10px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
            <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">local_activity</span>
            <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Events</p>
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
            <div id="buttons" style={{ position: "absolute", right: "5px", top: "5px" }} className={styles.navbtngrid}>
              <div id="dashbtn" onClick={() => push("/dash")} style={{ margin: "auto", height: "35px", width: "100%", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
                <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">space_dashboard</span>
                <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Dashboard</p>
              </div>
              <div id="makediffbtn" onClick={() => router.push("/#makeDifference")} style={{ margin: "auto", height: "35px", width: "280px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
                <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">food_bank</span>
                <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Make a difference</p>
              </div>
              <div id="eventsbtn" onClick={() => push("/dash?view=events")} style={{ margin: "auto", height: "35px", width: "160px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
                <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">local_activity</span>
                <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Events</p>
              </div>
              <div id="acctsbtn" onClick={() => push("/accounts")} style={{ margin: "auto", height: "35px", width: "170px", gridTemplateColumns: "50px auto", backgroundColor: "#00000034", gridGap: "5px" }} className={[styles.button, styles.doublegrid].join(" ")}>
                <span style={{ fontSize: "30px", margin: "auto", display: "block" }} class="material-symbols-rounded">account_circle</span>
                <p style={{ margin: "0px", fontSize: "23px", textAlign: "left", marginRight: "10px", margin: "auto", color: "rgb(255 255 255 / 76%)" }} className={styles.font}>Accounts</p>
              </div>
            </div>
          </div>
          <div id="bodyContent" className={styles.bodyContent}>
            <div id="herosContainer" style={{ position: "relative" }}>
              <img src="shelter.jpg" className={styles.blurredHero} />
              <div id="hero" className={styles.hero}>
                <img className={styles.fullycenter} src="shelter.jpg" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.8)", borderRadius: "25px" }} />
                <h1 style={{ width: "80%", textAlign: "center", fontSize: (mobile) ? "50px" : "60px", textShadow: "0 0 20px BLACK", color: "white" }} className={[styles.header, styles.fullycenter].join(" ")}>Food and shelter for all in the DMV</h1>
              </div>
            </div>

            <div id="innerContent" style={{ padding: "15px 0px" }}>
              <div id="currentEvents" style={{ marginTop: "15px" }}>
                <h3 className={styles.header} style={{ color: "black", marginLeft: "20px", marginBottom: "15px" }}>Happening Now</h3>
                <div id="currentEventsList" className={styles.currentEventsList}>
                  <div id="noevents" className={styles.item} style={{ cursor: "unset" }}>
                    <p style={{ color: "rgba(0, 0, 0, 0.300)", margin: "0", width: "100%", textAlign: "center" }} className={styles.fullycenter}>No events to show</p>
                  </div>
                </div>
              </div>
              <div className={styles.divider} style={{ marginTop: "240px" }}></div>
              <h3 className={styles.header} style={{ color: "black", marginBottom: "20px", textAlign: "center" }}>Make a difference in <a style={{ backgroundColor: "#fbac29ff" }}>your community</a></h3>
              <div className={styles.doublegrid} style={{ margin: "auto" }}>
                <button className={styles.diffbutton} style={{ backgroundColor: "#f66d4bff" }} onClick={() => push("/dash?view=donate")}>Donate</button>
                <button className={styles.diffbutton} style={{ color: "black", backgroundColor: "#fbe85dff" }} onClick={() => push("/dash?view=volunteer")}>Join our team</button>
              </div>
              <div style={{ position: "relative" }}>
                <div className={styles.divider}></div>

                <h3 className={styles.header} style={{ color: "black", textAlign: "center", marginBottom: "40px" }}><a style={{ backgroundColor: "#fbac29ff" }}>21,808</a> homeless individiuals need your help</h3>

                <div className={styles.tripplegrid} style={{ textAlign: "center", marginTop: "100px" }}>
                  <div>
                    <div style={{ position: "relative" }}>
                      <div className={[styles.blurredCircle, styles.fullycenter].join(" ")} style={{ backgroundColor: "#f66d4bff", margin: "0", transform: "translateX(-50%) translateY(-10%)" }}></div>
                    </div>

                    <h1 className={styles.header} style={{ fontSize: "100px" }}>8,944</h1>
                    <h2 className={styles.description} style={{ fontSize: "30px" }}>in District of Columbia</h2>
                  </div>
                  <div>
                    <div style={{ position: "relative" }}>
                      <div className={[styles.blurredCircle, styles.fullycenter].join(" ")} style={{ backgroundColor: "rgb(247 168 18)", margin: "auto", transform: "translateX(-50%) translateY(-10%)" }}></div>
                    </div>

                    <h1 className={styles.header} style={{ fontSize: "100px" }}>6,337</h1>
                    <h2 className={styles.description} style={{ fontSize: "30px" }}>in Maryland</h2>
                  </div>
                  <div>
                    <div style={{ position: "relative" }}>
                      <div className={[styles.blurredCircle, styles.fullycenter].join(" ")} style={{ backgroundColor: "#fbe85dff", margin: "auto", transform: "translateX(-50%) translateY(-10%)" }}></div>
                    </div>
                    <h1 className={styles.header} style={{ fontSize: "100px" }}>6,527</h1>
                    <h2 className={styles.description} style={{ fontSize: "30px" }}>in Virginia</h2>
                  </div>
                </div>

                <div className={styles.divider} style={{ marginTop: "100px" }}></div>

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
              <h3 className={styles.header} style={{ color: "black", marginLeft: "20px", marginBottom: "10px" }}>How we help</h3>
              <p className={styles.description} style={{ fontSize: "25px", padding: "0px 20px" }}>
                See how NourishDMV makes an impact in commuinities across the DMV.
              </p>
              <div id="howhelplist">
                <div className={styles.doublegrid} style={{ gridGap: "100px", margin: "80px 0px" }}>
                  <div style={{ position: "relative" }}>
                    <img className={styles.blurredHero} alt="people laying on beds in a homeless shelter" src="sheltersandfoodbanks.png" style={{ objectFit: "cover", height: "100%", filter: "blur(40px)", width: "100%", borderRadius: "25px" }}></img>
                    <img alt="people laying on beds in a homeless shelter" src="sheltersandfoodbanks.png" style={{ objectFit: "cover", height: "100%", width: "100%", borderRadius: "25px", zIndex: "20", position: 'relative' }}></img>
                  </div>
                  <div>
                    <h3 className={styles.header} style={{ color: "black", marginBottom: "10px" }}>Homeless Shelters & Food Banks</h3>
                    <p className={styles.description} style={{ fontSize: "25px" }}>
                      NourishDMV and its partners founded shelters across the DMV to house those experiencing homelessness and provide them with food and water.
                    </p>
                    <div className={styles.doublegrid} style={{ marginTop: "10px" }}>
                      <button className={styles.minibutton} style={{ width: "100%" }}>Find a Homeless Shelter</button>
                      <button className={styles.minibutton} style={{ width: "100%" }}>Find a Food Bank</button>
                    </div>

                  </div>
                </div>
                <div id="eventsContainer" className={styles.doublegrid} style={{ gridGap: "100px", margin: "80px 0px" }}>
                  <div>
                    <h3 className={styles.header} style={{ color: "black", marginBottom: "10px" }}>Events</h3>
                    <p className={styles.description} style={{ fontSize: "25px" }}>
                      NourishDMV hosts events to raise money for it's mission, aswell as to raise awareness about homelessness and hunger in the DMV.
                    </p>
                    <button className={styles.minibutton} onClick={() => push("/dash?view=events")} style={{ width: "100%", marginTop: "10px" }}>View Events</button>
                  </div>
                  <div style={{ position: "relative" }} id="eventsImage">
                    <img className={styles.blurredHero} alt="people laying on beds in a homeless shelter" src="fundraisingevents.png" style={{ objectFit: "cover", height: "100%", width: "100%", borderRadius: "25px", filter: "blur(40px)", }}></img>
                    <img alt="people laying on beds in a homeless shelter" src="fundraisingevents.png" style={{ objectFit: "cover", height: "100%", width: "100%", borderRadius: "25px", zIndex: "20", position: 'relative' }}></img>
                  </div>
                </div>
                <div className={styles.doublegrid} style={{ gridGap: "100px", margin: "80px 0px" }}>
                  <div style={{ position: "relative", border: "10px solid black", borderRadius: "25px" }}>
                    <img alt="NourishDMV Logo" src="ndmv_ss_static.png" style={{ objectFit: "cover", height: "100%", width: "100%", position: "relative", zIndex: -1 }}></img>
                  </div>
                  <div>
                    <h3 className={styles.header} style={{ color: "black", marginBottom: "10px" }}>Spreading the word</h3>
                    <p className={styles.description} style={{ fontSize: "25px" }}>
                      We run advertisements and campaigns to raise awareness & encourage action about homelessness and hunger in the DMV.
                    </p>
                    <button className={styles.minibutton} onClick={() => push("/dash?view=volunteer")} style={{ width: "100%", marginTop: "10px" }}>Join our team</button>
                  </div>
                </div>
              </div>
              <div className={styles.divider} id="makeDifference"></div>
              <h3 className={styles.header} style={{ color: "black", marginBottom: "20px", textAlign: "center" }}>Let's make a difference <a style={{ backgroundColor: "#fbac29ff" }}>together</a></h3>
              <div className={styles.doublegrid} style={{ margin: "auto", gridGap: "0px" }}>
                <div style={{ borderRight: "1px solid rgba(0, 0, 0, 0.104)", padding: "20px" }}>
                  <h3 className={styles.header} style={{ color: "black", marginBottom: "20px" }}><a style={{ backgroundColor: "#fbac29ff", fontWeight: "bold" }}>Change Lives</a></h3>
                  <p className={styles.description} style={{ fontSize: "25px", color: "black" }}>You have the power to change the lives of 21,808 homeless individiuals by volunteering at our Homeless Shelters, Food Banks, or events to provide them with food, shelter, and hope.</p>
                  <h3 className={styles.header} style={{ color: "black", marginBottom: "20px" }}><a style={{ backgroundColor: "#fbac29ff", fontWeight: "bold" }}>Network</a></h3>
                  <p className={styles.description} style={{ fontSize: "25px", color: "black" }}>Network with other passionate and caring individuals who share a passion for volunteering.</p>
                  <h3 className={styles.header} style={{ color: "black", marginBottom: "20px" }}><a style={{ backgroundColor: "#fbac29ff", fontWeight: "bold" }}>Teamwork</a></h3>
                  <p className={styles.description} style={{ fontSize: "25px", color: "black" }}>Be a part of a team that works together to save lives and create a better DMV.</p>
                </div>
                <div className={styles.differenceButtons}>
                  <button className={styles.button} style={{ margin: "auto", height: "100%", width: "100%", backgroundColor: "#f66d4bff", marginBottom: "40px", fontSize: "40px", fontWeight: "bold" }} onClick={() => push("/dash?view=donate")}>Donate</button>
                  <button className={styles.button} style={{ margin: "auto", height: "100%", width: '100%', backgroundColor: "#fbe85dff", marginBottom: "0px", color: "black", fontSize: "40px", fontWeight: "bold" }} onClick={() => push("/dash?view=volunteer")}>Join our team</button>
                </div>
              </div>
              <div className={styles.divider}></div>
              <div style={{ position: "relative" }} id="getInTouch">
                <div className={styles.blurredCircle} style={{ position: "absolute", top: "-100%", left: "50%", height: "500px", width: "500px", zIndex: "-1", filter: "blur(150px)", transform: "translateX(-50%)", backgroundColor: "rgb(227, 171, 74)" }}></div>
                <h3 className={styles.header} style={{ color: "black", marginBottom: "40px", textAlign: "center" }}>Get in touch</h3>
                <div className={styles.contactgrid}>
                  <div className={styles.item} style={{ margin: "auto", marginRight: "0px", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => window.location.href = "tel:4104567890"}>
                    <p className={styles.header} style={{ margin: 0, fontSize: "30px" }}>
                      (410) 456-7890
                    </p>
                    <div style={{ zIndex: "5" }} className={styles.fullycenter}>
                      <span className={["material-symbols-rounded", styles.iconCircle].join(" ")} style={{ filter: "blur(5px)", fontSize: "130px", opacity: 0.2 }}>
                        call
                      </span>
                    </div>
                  </div>
                  <div className={styles.item} style={{ margin: "auto", marginLeft: "0px", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => window.location.href = "mailto:contact@nourishdmv.com"}>
                    <div style={{ zIndex: "5" }} className={styles.fullycenter}>
                      <span className={["material-symbols-rounded", styles.iconCircle].join(" ")} style={{ filter: "blur(5px)", fontSize: "130px", opacity: 0.2 }}>
                        email
                      </span>
                    </div>
                    <p className={styles.header} style={{ textAlign: "center", margin: "0", fontSize: "30px" }}>
                      contact@nourishdmv.com
                    </p>
                  </div>
                  <div className={styles.item} style={{ margin: "auto", marginRight: "0px", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => window.location.href = "https://www.google.com/maps/dir//16701+Melford+Blvd+%23421,+Bowie,+MD+20715/@38.9611344,-76.7158268,19z/data=!4m9!4m8!1m0!1m5!1m1!1s0x89b7ec1769408c5f:0x5e0035c97d3c3f24!2m2!1d-76.7146091!2d38.9611344!3e0?entry=ttu"}>
                    <div className={styles.header} style={{ textAlign: "center", margin: "0", fontSize: "25px" }}>
                      16701 Melford Blvd, Bowie, MD 20715
                      <h2 className={styles.subheader} style={{ fontSize: "20px" }}>headquarters</h2>
                    </div>
                    <div style={{ zIndex: "5" }} className={styles.fullycenter}>
                      <span className={["material-symbols-rounded", styles.iconCircle].join(" ")} style={{ filter: "blur(5px)", fontSize: "130px", opacity: 0.2 }}>
                        pin_drop
                      </span>
                    </div>
                  </div>
                  <div className={styles.item} style={{ margin: "auto", marginLeft: "0px", cursor: "default" }}>
                    <div className={styles.fullycenter} style={{ width: "100%" }}>
                      <div className={styles.header} style={{ textAlign: "center", margin: "auto", fontSize: "30px" }}>
                        <h2 className={styles.subheader} style={{ fontSize: "20px" }}>Social Media</h2>
                        @nourishdmv
                      </div>
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
              citation: `Stebbins, Samuel. “How the Homelessness Problem in Virginia Compares to Other States.” The Center Square, 25 Sept. 2023, www.thecentersquare.com/virginia/article_6f7fc690-aec1-5f54-b496-6f44ef67ccbf.html#:~:text=Rates%20of%20unsheltered%20homelessness%20%2D%2D,night%20in%20Virginia%20in%202022. `
            }, {
              name: "Image 2",
              citation: `NC 211 "people laying on beds in a homeless shelter" NC 211, 4 October 2022, https://nc211.org/shelters/`
            }, {
              name: "Haven Ministries Shelter",
              citation: `"Haven Ministries Shelter - Haven Ministries" https://www.google.com/url?sa=i&url=https%3A%2F%2Fhaven-ministries.org%2Fhaven-ministries-shelter%2F&psig=AOvVaw272pnXRRshV4CBChB8ibYh&ust=1708470305797000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCKiT9f3BuIQDFQAAAAAdAAAAABAE`
            }, {
              name: "Capital Area Food Bank",
              citation: `"Food Bank for the Washington, DC, Region | Capital Area Food Bank" https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.capitalareafoodbank.org%2F&psig=AOvVaw1oE-_zud0zvrdh5-GSlh9h&ust=1708470331792000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCICnsIrCuIQDFQAAAAAdAAAAABAE`
            }, {
              name: "Instrumentl Fundraising Event Image",
              citation: `team, Instrumentl. “How to Start a Successful Nonprofit Fundraising Event in 7 Steps.” Instrumentl, 3 Aug. 2022, www.instrumentl.com/blog/how-to-start-successful-nonprofit-fundraising-event. `
            }, {
              name: "Caritas of Austin Event Image",
              citation: `“4 Ways You Can Contribute to Nonprofit Events.” Caritas of Austin, 15 Aug. 2023, caritasofaustin.org/blog/4-ways-you-can-contribute-to-nonprofit-events/. `
            }
          ]} />
        </div>
        <video id="splashscreenOutro" muted playsInline className="splashScreen" preload="auto"><source src="anim_ss_ndmv_outro.mp4" type="video/mp4" /></video>
        <video id="splashscreenIntro" muted playsInline className="splashScreen" style={{ display: "none", opacity: 0 }}><source src="anim_ss_ndmv_intro.mp4" type="video/mp4" /></video>
      </main>
    </>
  )
}