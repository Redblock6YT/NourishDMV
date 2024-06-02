import Head from 'next/head'
import styles from '@/styles/Dash.module.css'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image'
import anime from 'animejs'
import Cookies from 'js-cookie'
import { uuid } from 'uuidv4'

export default function Dash() {
    const router = useRouter();
    const [account, setAccount] = useState("");
    const accountRef = useRef(account);
    const [eventsLength, setEventsLength] = useState(0);
    const [eventAttendees, setEventAttendees] = useState(0);
    const [accountData, setAccountData] = useState({});
    const [adminView, setAdminView] = useState(false);
    const adminViewRef = useRef(adminView);
    const [step, setStep] = useState(0);
    const [mobile, setMobile] = useState(false);
    const mobileRef = useRef(mobile);
    const [accounts, setAccounts] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userSidebarOpen, setUserSidebarOpen] = useState(true);
    const [contentReady, setContentReady] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [currentOverlayType, setCurrentOverlayType] = useState("d");

    //this uuid will identify the user's session, keeping track of which view they are in and staying anonymous
    const [trackerEnabled, setTrackerEnabled] = useState(false);
    const [trackerUUID, setTrackerUUID] = useState("");
    const [viewState, setViewState] = useState("aag")

    useEffect(() => {
        if (contentReady) {
            if (account == "") {
                /*
                try {
                    document.getElementById("admin").remove();
                } catch (err) {
                    console.log("admin view not removed, but the account doesn't have acces to admin")
                }
                */
            }
        }
    }, [contentReady])

    //from https://stackoverflow.com/questions/70612769/how-do-i-recognize-swipe-events-in-react
    //used to detect a swipe on mobile for showing and hiding the sidebar
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)

    // the required distance between touchStart and touchEnd to be detected as a swipe
    const minSwipeDistance = 50

    const onTouchStart = (e) => {
        setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance
        if (isLeftSwipe || isRightSwipe) console.log('swipe', isLeftSwipe ? 'left' : 'right')
        if (isLeftSwipe) {
            hideSidebar();
            setUserSidebarOpen(false);
        } else if (isRightSwipe && viewState != "eventDetails") {
            showSidebar();
            setUserSidebarOpen(true);
        }
        // add your conditional logic here
    }

    useEffect(() => {
        mobileRef.current = mobile;
    }, [mobile])

    useEffect(() => {
        adminViewRef.current = adminView;
    }, [adminView])

    useEffect(() => {
        accountRef.current = account;
    }, [account])

    useEffect(() => {
        if (trackerUUID != "") {
            Cookies.set("trackerUUID", trackerUUID);
            axios({
                method: "post",
                url: "http://192.168.1.158:8080/track",
                data: {
                    uuid: trackerUUID,
                    page: "Dashboard",
                    view: viewState
                }
            }).catch((err) => {
                console.log(err);
                console.log("Tracking issue")
            })
        }
    }, [viewState, trackerUUID]);

    function switchView(view) {
        const navbtns = document.getElementById("navbtns");
        for (var i = 0; i < navbtns.children.length; i++) {
            navbtns.children[i].style.backgroundColor = "#e3ab4a"
            navbtns.children[i].style.marginLeft = "0px"
        }
        document.getElementById(view + "btn").style.backgroundColor = "rgb(209, 156, 64)";
        document.getElementById(view + "btn").style.marginLeft = "10px";
        if (window.innerWidth <= 600) {
            hideSidebar(view);
        }
        document.getElementById(view).scrollIntoView({ behavior: "smooth", block: "center" });
        router.push("/dash", "/dash?view=" + view, { shallow: true });
        refresh(view);
        setViewState(view);

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

    function calculateTimeDifference(dateTime) {
        const timeDifference = Date.parse(dateTime) - Date.now();
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

    /*
    function openBlogPostViewer() {
        hideSidebar();
        anime({
            targets: "#v1b",
            opacity: 0,
            scale: 0.5,
            filter: "blur(50px)",
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                document.getElementById("v1b").style.display = "none";
                document.getElementById("v2b").style.display = "block";
                anime({
                    targets: "#v2b",
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 500,
                    easing: 'easeInOutQuad',
                })
            }
        })
    }

    function closeBlogPostViewer() {
        showSidebar();
        anime({
            targets: "#v2b",
            opacity: 0,
            scale: 0.5,
            filter: "blur(50px)",
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                document.getElementById("v2b").style.display = "none";
                document.getElementById("v1b").style.display = "block";
                anime({
                    targets: "#v1b",
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 500,
                    easing: 'easeInOutQuad',
                })
            }
        })
    }
    */

    useEffect(() => {
        const exitFunction = () => {
            axios({
                method: "post",
                url: "http://192.168.1.158:8080/track",
                data: {
                    uuid: trackerUUID,
                    page: "Inactive",
                    view: ""
                }
            }).catch((err) => {
                console.log(err);
                console.log("Tracking error")
            })
        }

        router.events.on("routeChangeStart", exitFunction);
        return () => {
            router.events.off("routeChangeStart", exitFunction);
        }
    }, []);

    function inspectPerson(obj) {
        anime({
            targets: "#peoplecontent",
            gridTemplateColumns: "0.7fr 1.3fr",
            easing: 'easeInOutQuad',
            duration: 300,
        })

        anime({
            targets: "#peopleinspector",
            border: "1px solid #E3AB4A",
            duration: 300,
            easing: 'easeInOutQuad',
        })

        anime({
            targets: "#pinotselected",
            opacity: 1,
            easing: 'linear',
            duration: 300,
            complete: function (anim) {
                document.getElementById("pinotselected").style.display = "none"
            }
        })

        document.getElementById("piselected").style.display = "block"
        anime({
            targets: "#piselected",
            opacity: 1,
            easing: 'linear',
            duration: 300,
        })

        hideSidebar();
    }

    function refresh(view) {
        anime({
            targets: '#' + view + 'loading',
            opacity: 1,
            easing: 'linear',
            duration: 300,
        })
        anime({
            targets: "#" + view + "content",
            filter: "blur(80px)",
            scale: 0.9,
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                if (view == "people") {
                    axios({
                        method: "get",
                        url: "http://192.168.1.158:8080/getAccounts",
                    }).then((res) => {
                        const accounts = res.data;
                        var dc = 0;
                        var md = 0;
                        var va = 0;
                        setAccounts(accounts);
                        const accountslist = document.getElementById("peoplelist");
                        while (accountslist.firstChild) {
                            accountslist.removeChild(accountslist.firstChild);
                        }
                        for (var i = 0; i < accounts.length; i++) {
                            const account = accounts[i];
                            var accountItem = document.createElement("div");
                            var accountName = document.createElement("p");
                            accountName.innerHTML = account.name;
                            accountName.style.margin = "0px";
                            accountName.className = styles.font;
                            accountItem.className = styles.item;
                            accountItem.style.cursor = "default";
                            if (account.area == "D.C.") {
                                dc++;
                            } else if (account.area == "Maryland") {
                                md++;
                            } else if (account.area == "Virginia") {
                                va++;
                            }
                            accountItem.onclick = function () {
                                inspectPerson(account);
                            }
                            accountItem.appendChild(accountName);
                            accountslist.appendChild(accountItem);
                        }
                        document.getElementById("dccount").innerHTML = dc;
                        document.getElementById("mdcount").innerHTML = md;
                        document.getElementById("vacount").innerHTML = va;
                        anime({
                            targets: "#peopleloading",
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                        anime({
                            targets: "#peoplecontent",
                            filter: "blur(0px)",
                            duration: 500,
                            scale: 1,
                            easing: 'easeInOutQuad',
                        })
                    }).catch((err) => {
                        apiError(err);
                        anime({
                            targets: "#peopleloading",
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                    })
                } else if (view == "events") {
                    axios({
                        method: "get",
                        url: "http://192.168.1.158:8080/getEvents"
                    }).then((res) => {
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
                        setEventsLength(events.length);
                        const eventslist = document.getElementById("eventslist");
                        const eventsattendlist = document.getElementById("eventsattendlist");
                        document.getElementById("eventsattend").style.display = "none"
                        while (eventslist.firstChild) {
                            eventslist.removeChild(eventslist.firstChild);
                        }

                        while (eventsattendlist.firstChild) {
                            eventsattendlist.removeChild(eventsattendlist.firstChild);
                        }

                        var pending = 0;
                        var inprog = 0;
                        var ended = 0;
                        var attendees = 0;
                        var displayEventInAAG = null;
                        for (var i = 0; i < events.length; i++) {
                            const event = events[i].event;
                            attendees += events[i].analytics.attendees.length;
                            console.log(events[i].analytics.attendees);
                            document.getElementById("eea").innerHTML = events[i].analytics.attendees.length + " Attendees";
                            document.getElementById("eev").innerHTML = events[i].analytics.views + " Views";
                            var eventItem = document.createElement("div");
                            var eventName = document.createElement("p");
                            eventName.innerHTML = event.title;
                            eventName.style.margin = "0px";
                            eventName.className = styles.font;
                            eventItem.setAttribute("name", event.title)
                            var icon = document.createElement("span");
                            icon.className = "material-symbols-rounded";
                            icon.innerHTML = "chevron_right"
                            icon.style.margin = "auto"
                            icon.style.marginRight = "0px"
                            eventItem.className = [styles.itemEvents, styles.doublegrid].join(" ");
                            eventItem.style.gridTemplateColumns = "auto 50px";

                            var registrationStatus = calculateEventStatus(event.registrationStartDateTime, event.registrationEndDateTime);
                            if (registrationStatus == "Pending") {
                                eventItem.style.color = "black"
                                pending++;
                                eventItem.style.backgroundColor = "#ffff0072"
                            } else if (registrationStatus == "In Progress") {
                                eventItem.style.color = "black"
                                pending++;
                                eventItem.style.backgroundColor = "#fbac29ff"
                                eventItem.style.animation = styles.pulseRegistration + " 3s infinite linear"
                            } else if (registrationStatus == "Ended") {
                                var eventStatus = calculateEventStatus(event.startDateTime, event.endDateTime);
                                if (eventStatus == "Pending") {
                                    pending++;
                                    eventItem.style.color = "black"
                                    eventItem.style.backgroundColor = "#ffff0072"
                                    if (new Date().toDateString() == new Date(event.startDateTime).toDateString() || new Date().toDateString() == new Date(event.endDateTime).toDateString()) {
                                        displayEventInAAG = events[i];
                                    }
                                } else if (eventStatus == "In Progress") {
                                    inprog++;
                                    eventItem.style.backgroundColor = "#fbac29ff"
                                    eventItem.style.animation = styles.pulse + " 3s infinite linear"
                                    displayEventInAAG = events[i];
                                } else if (eventStatus == "Ended") {
                                    ended++;
                                    eventItem.style.backgroundColor = "#f66d4bff"
                                    if (new Date().toDateString() == new Date(event.endDateTime).toDateString()) {
                                        displayEventInAAG = events[i];
                                    }
                                }
                            }




                            if (adminViewRef.current) {
                                console.log("admin");
                                (function (eventid) {
                                    eventItem.onclick = function () {
                                        openEventOverlay("editeventsoverlay", eventid);
                                    }

                                })(events[i].id);
                            } else {
                                console.log("not admin");
                                (function (eventid) {
                                    eventItem.onclick = function () {
                                        openEventOverlay("vieweventsoverlay", eventid);
                                    }
                                })(events[i].id);
                            }
                            eventItem.appendChild(eventName);
                            eventItem.appendChild(icon);
                            if (events[i].analytics.attendees.includes(accountRef.current)) {
                                eventsattendlist.appendChild(eventItem);
                                document.getElementById("eventsattend").style.display = "block"
                            } else {
                                eventslist.appendChild(eventItem);
                            }
                        }

                        if (displayEventInAAG != null) {
                            const eventsTodayBento = document.getElementById("eventsTodayBento");
                            const event = displayEventInAAG.event;
                            const id = displayEventInAAG.id;
                            const status = calculateEventStatus(event.startDateTime, event.endDateTime);
                            const countdownline = document.createElement("a");

                            eventsTodayBento.innerHTML = ""
                            /*
                            eventsTodayBento.style.border = "none"
                            eventsTodayBento.style.cursor = "pointer"
                            eventsTodayBento.style.fontSize = "20px"
                            eventsTodayBento.style.height = "120px";
                            eventsTodayBento.style.padding = "10px 20px";
                            eventsTodayBento.style.display = "table";
                            */

                            if (status == "Pending") {
                                eventsTodayBento.style.backgroundColor = "#ffff0072"
                                eventsTodayBento.style.color = "black"
                                var timeDiff = calculateTimeDifference(event.startDateTime);
                                countdownline.innerHTML = "Starts in " + timeDiff.value + " " + timeDiff.unit;
                            } else if (status == "In Progress") {
                                eventsTodayBento.style.backgroundColor = "#fbac29ff"
                                eventsTodayBento.style.animation = styles.pulse + " 3s infinite linear"
                                eventsTodayBento.style.color = "#ffe5b9"
                                var timeDiff = calculateTimeDifference(event.endDateTime);
                                countdownline.innerHTML = "Ends in " + timeDiff.value + " " + timeDiff.unit;
                            } else if (status == "Ended") {
                                eventsTodayBento.style.backgroundColor = "#f66d4bff"
                                eventsTodayBento.style.color = "rgba(0,0,0,.504)"
                                var timeDiff = calculateTimeDifference(event.endDateTime);
                                countdownline.innerHTML = "Ended " + timeDiff.value + " " + timeDiff.unit + " ago";
                            }

                            const eventContents = document.createElement("div");
                            eventContents.style.verticalAlign = "middle";
                            eventContents.style.display = "table-cell";
                            const eventTitle = document.createElement("h3");
                            eventTitle.innerHTML = event.title;
                            eventTitle.style.margin = "0px";

                            eventContents.appendChild(countdownline);
                            eventContents.appendChild(eventTitle);
                            const eventExtras = document.createElement("div");

                            if (event.location != "") {
                                const eventLocationEls = document.createElement("div")
                                const eventLocation = document.createElement("p");
                                const eventLocationIcon = document.createElement("span");
                                eventLocationIcon.className = "material-symbols-rounded";
                                eventLocationIcon.innerHTML = "pin_drop"
                                eventLocation.innerHTML = event.location;
                                eventLocation.style.margin = "0px"
                                eventLocationEls.className = styles.doublegrid;
                                eventLocationEls.style.gridTemplateColumns = "20px auto";
                                eventLocationEls.style.gridGap = "10px";
                                eventLocationEls.appendChild(eventLocationIcon);
                                eventLocationEls.appendChild(eventLocation);
                                eventExtras.appendChild(eventLocationEls);
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

                            eventExtras.appendChild(eventdates);
                            eventExtras.id = "bentoEventExtras"
                            if (window.innerWidth <= 1500) {
                                eventExtras.style.display = "none";
                            }
                            eventContents.appendChild(eventExtras);

                            eventsTodayBento.appendChild(eventContents);
                            eventsTodayBento.className = [styles.eventsTodayBentoFilled, styles.hover].join(" ");
                            console.log(displayEventInAAG)
                            eventsTodayBento.onclick = () => { switchView("events"); openEventOverlay("vieweventsoverlay", id) };
                        }

                        setEventAttendees(attendees);
                        document.getElementById("pendingcount").innerHTML = pending;
                        document.getElementById("inprogcount").innerHTML = inprog;
                        document.getElementById("endedcount").innerHTML = ended;
                        document.getElementById("eventsamt").innerHTML = events.length;
                        anime({
                            targets: "#eventsloading",
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                        anime({
                            targets: "#eventscontent",
                            filter: "blur(0px)",
                            scale: 1,
                            duration: 500,
                            easing: 'easeInOutQuad',
                        })
                    }).catch((err) => {
                        console.log(err);
                        apiError(err);
                        anime({
                            targets: "#eventsloading",
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                    })
                } else if (view == "donations") {
                    axios({
                        method: "get",
                        url: "http://192.168.1.158:8080/getDonations"
                    }).then((res) => {
                        const accounts = res.data.reverse();
                        var amount = 0;
                        const accountslist = document.getElementById("donatelist");
                        while (accountslist.firstChild) {
                            accountslist.removeChild(accountslist.firstChild);
                        }
                        var donationsToday = 0;
                        var donationsThisMonth = 0;
                        var amountToday = 0;
                        var amountThisMonth = 0;
                        for (var i = 0; i < accounts.length; i++) {
                            const account = accounts[i];
                            var accountItem = document.createElement("div");
                            var accountName = document.createElement("p");
                            if (window.innerWidth <= 800) {
                                // set the accountname innerHTML to the date and amount of the donation, the date should not include the time
                                accountName.innerHTML = new Date(account.date).toLocaleDateString() + " - " + formatUSD(account.amount);
                            } else {
                                accountName.innerHTML = new Date(account.date).toLocaleString() + " - " + formatUSD(account.amount);
                            }

                            accountName.style.margin = "0px";
                            accountName.className = styles.font;
                            accountItem.style.cursor = "default";
                            accountItem.className = styles.item;
                            accountItem.setAttribute("name", account.date);
                            if (new Date(account.date).toDateString() == new Date().toDateString()) {
                                donationsToday++;
                                amountToday += account.amount;
                            }
                            if (new Date(account.date).getMonth() == new Date().getMonth()) {
                                donationsThisMonth++;
                                amountThisMonth += account.amount;
                            }

                            amount += account.amount;
                            accountItem.appendChild(accountName);
                            accountslist.appendChild(accountItem);
                        }
                        if (accounts.length == 1) {
                            document.getElementById("donationssub").innerHTML = "donation"
                            //tdonssub is the subtext for an analytic of the admin view, so if it's undefined, it means the user doesn't have access to the view, and it shouldn't be updated
                            try {
                                document.getElementById("tdonssub").innerHTML = "donation"
                            } catch (ignored) { }
                        } else {
                            document.getElementById("donationssub").innerHTML = "donations"
                            try {
                                document.getElementById("tdonssub").innerHTML = "donations"
                            } catch (ignored) { }
                        }
                        try {
                            document.getElementById("tdonsnum").innerHTML = donationsToday;
                            document.getElementById("tdonsamt").innerHTML = formatUSD(amountToday);
                            document.getElementById("aagdonsamt").innerHTML = formatUSD(amount);
                            document.getElementById("maagdonsamt").innerHTML = formatUSD(amountThisMonth);
                            document.getElementById("maagdonsnum").innerHTML = donationsThisMonth;
                        } catch (ignored) { }

                        document.getElementById("donationsnumber").innerHTML = accounts.length;
                        document.getElementById("donationsamt").innerHTML = formatUSD(amount);

                        anime({
                            targets: "#donationsloading",
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                        anime({
                            targets: "#donationscontent",
                            filter: "blur(0px)",
                            scale: 1,
                            duration: 500,
                            easing: 'easeInOutQuad',
                        })
                    }).catch((err) => {
                        apiError(err);
                        anime({
                            targets: "#donationsloading",
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                    })
                } else if (view == "aag") {
                    refresh("events");
                    refresh("donations");
                    if (adminViewRef.current) {
                        refresh("people");
                        axios({
                            method: "get",
                            url: "http://192.168.1.158:8080/getTotalUsers"
                        }).then((res) => {
                            var users = res.data;
                            document.getElementById("totaluserstd").innerHTML = users.today;
                            document.getElementById("totalusersm").innerHTML = users.month;
                            document.getElementById("totalusers").innerHTML = users.all;
                        })
                        document.getElementById("nonAdminAAG").style.display = "none"
                    } else {
                        var adminElems = document.getElementsByClassName("adminAAG");
                        for (var i = 0; i < adminElems.length; i++) {
                            console.log("removed")
                            console.log(adminElems[i]);
                            adminElems[i].style.display = "none";
                        }
                    }
                }
            }
        })
    }

    function openEventOverlay(overlayid, id) {
        hideSidebar();
        setViewState("eventDetails");
        document.getElementById("events").style.overflowY = "hidden";
        const eventsoverlay = document.getElementById(overlayid);
        anime({
            targets: "#affectbyeoverlay",
            scale: 0.8,
            opacity: 0.5,
            duration: 500,
            filter: "blur(40px)",
            easing: 'easeInOutQuad'
        })

        //document.getElementById(viewState).transform = "none"

        eventsoverlay.style.display = "block";
        if (!mobileRef.current) {
            eventsoverlay.style.height = "65%"
        }
        eventsoverlay.scrollTop = 0;
        anime({
            targets: eventsoverlay,
            opacity: 1,
            zoom: 1,
            duration: 500,
            filter: "blur(0px)",
            easing: 'easeInOutQuad'
        })

        console.log(id)

        if (id) {
            setSelectedEvent(id);
            axios({
                method: "get",
                url: "http://192.168.1.158:8080/getEvent?id=" + id
            }).then((res) => {
                const event = res.data.event;
                const analytics = res.data.analytics;
                if (overlayid == "vieweventsoverlay") {
                    document.getElementById("vename").innerHTML = event.title;
                    document.getElementById("vedesc").innerHTML = event.description;
                    document.getElementById("veloc").innerHTML = event.location;
                    document.getElementById("veregstart").innerHTML = new Date(event.registrationStartDateTime).toLocaleString();
                    document.getElementById("veregend").innerHTML = new Date(event.registrationEndDateTime).toLocaleString();
                    document.getElementById("vestart").innerHTML = new Date(event.startDateTime).toLocaleString();
                    document.getElementById("veend").innerHTML = new Date(event.endDateTime).toLocaleString();

                    if (event.cost == "Free") {
                        document.getElementById("vecost").innerHTML = "Free Registration";
                        document.getElementById("eregistertbtn").onclick = function () {
                            if (account == "") {
                                push("/accounts?from=Dashboard&view=Sign+In")
                            } else {
                                axios({
                                    method: "post",
                                    url: "http://192.168.1.158:8080/registerEvent",
                                    data: {
                                        uuid: accountRef.current,
                                        eventId: id
                                    }
                                }).then((res) => {
                                    if (res.data.status == "Account registered for event.") {
                                        closeEventOverlay("vieweventsoverlay");
                                        refresh("events");
                                    }
                                }).catch((err) => {
                                    apiError(err);
                                    anime({
                                        targets: "#v2re",
                                        left: "150%",
                                        opacity: 0,
                                        easing: 'easeInOutQuad',
                                    })
                                    setStep(1);
                                })
                            }
                        }
                    } else {
                        document.getElementById("eregistertbtn").onclick = () => openOverlay("re");
                        document.getElementById("vecost").innerHTML = "$" + event.cost + " Registration";
                    }

                    console.log(analytics)
                    if (!analytics.attendees.includes(accountRef.current)) {
                        if (accountRef.current == "") {
                            document.getElementById("eregistertbtn").innerHTML = "Sign In to Register"
                            document.getElementById("eregistertbtn").onclick = () => push("/accounts?from=Dashboard&view=Sign+In&redirect=" + encodeURIComponent("/dash?view=events&eventid=" + id));
                        } else {
                            document.getElementById("eregistertbtn").innerHTML = "Register"
                        }
                        document.getElementById("eregistertbtn").style.backgroundColor = "#ffbe4aff"
                    } else {
                        document.getElementById("eregistertbtn").innerHTML = "Unregister"
                        document.getElementById("eregistertbtn").style.backgroundColor = "rgb(246, 109, 75)"
                        document.getElementById("eregistertbtn").onclick = function () {
                            axios({
                                method: "post",
                                url: "http://192.168.1.158:8080/unregisterEvent",
                                data: {
                                    uuid: accountRef.current,
                                    eventId: id
                                }
                            }).then((res) => {
                                if (res.data.status == "Account unregistered for event.") {
                                    closeEventOverlay("vieweventsoverlay");
                                    refresh("events");
                                }
                            }).catch((err) => {
                                apiError(err);
                            })
                        }
                    }

                    updateEventStatus("vieweventsoverlay", event.registrationStartDateTime, event.registrationEndDateTime, event.startDateTime, event.endDateTime);
                } else {
                    document.getElementById("esubmitbtn").innerHTML == "Save Event"
                    document.getElementById("ename").value = event.title;
                    document.getElementById("edesc").value = event.description;
                    document.getElementById("edesc").style.height = "auto";
                    document.getElementById("edesc").style.height = (document.getElementById("edesc").scrollHeight) + "px";
                    document.getElementById("eloc").value = event.location;
                    document.getElementById("evselect").value = event.visible;
                    if (event.cost == "Free") {
                        document.getElementById("ecselect").value = "Free"
                        document.getElementById("eusdamount").style.display = "none";
                        document.getElementById("ecdoublegrid").style.gridTemplateColumns = "auto";
                    } else {
                        document.getElementById("ecselect").value = "Paid"
                        document.getElementById("eusdamount").value = event.cost;
                        document.getElementById("eusdamount").style.display = "block";
                        document.getElementById("ecdoublegrid").style.gridTemplateColumns = "auto 200px";
                    }
                    document.getElementById("erst").value = event.registrationStartDateTime;
                    document.getElementById("eret").value = event.registrationEndDateTime;
                    document.getElementById("est").value = event.startDateTime;
                    document.getElementById("eet").value = event.endDateTime;
                    document.getElementById("admineanalytics").style.display = "block";
                    document.getElementById("esubmitbtn").innerHTML = "Save Event"
                    document.getElementById("submitdelgrid").style.display = "grid"
                    document.getElementById("edelbtn").style.display = "block"

                    updateEventStatus("editeventsoverlay", event.registrationStartDateTime, event.registrationEndDateTime, event.startDateTime, event.endDateTime);
                }
            }).catch((err) => {
                apiError(err);
            })
        } else {
            document.getElementById("admineanalytics").style.display = "none";
            document.getElementById("ename").value = "";
            document.getElementById("edesc").value = "";
            document.getElementById("eloc").value = "";
            document.getElementById("evselect").value = "Visible";
            document.getElementById("ecselect").value = "Free";
            document.getElementById("eusdamount").value = "";
            document.getElementById("eusdamount").style.display = "none";
            document.getElementById("ecdoublegrid").style.gridTemplateColumns = "auto";
            document.getElementById("erst").value = "";
            document.getElementById("eret").value = "";
            document.getElementById("est").value = "";
            document.getElementById("eet").value = "";
            document.getElementById("esubmitbtn").innerHTML = "Add Event"
            document.getElementById("submitdelgrid").style.display = "block"
            document.getElementById("edelbtn").style.display = "none"

            document.getElementById("eestatusverb").innerHTML = "It will start in ??? days"
            document.getElementById("eestatus").innerHTML = "PENDING";
            document.getElementById("eestatusverbtop").innerHTML = "Event is";
            document.getElementById("vestatusdiv").style.color = "black";
        }
    }

    function closeEventOverlay(overlayId, type) {
        setViewState("events");
        anime({
            targets: "#affectbyeoverlay",
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 500,
            easing: 'easeInOutQuad'
        })

        anime({
            targets: "#" + overlayId,
            opacity: 0,
            zoom: 1.2,
            filter: "blur(10px)",
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                document.getElementById(overlayId).style.display = "none";
                document.getElementById("events").style.overflowY = "auto";
                if (!mobileRef.current && userSidebarOpen) {
                    showSidebar();
                }
            }
        })
    }

    function randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function formatUSD(amount) {
        //format the amount with commas and two decimal places
        return "$" + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    function formatNumber(amount) {
        return parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    //modified, but originally from https://stackoverflow.com/a/54534797
    //for creating a input where you input a dollar amount and it automatically formats it
    function onFocus(e) {
        var value = e.target.value;
        e.target.value = value ? value.replace(/[$,]/g, "") : ''
    }

    function onBlur(e) {
        var value = e.target.value

        //replace just in case the user types in a dollar sign or comma
        e.target.value = (value == "") ? "" : formatUSD(value.replace(/[$,]/g, ""))
    }

    function collapse(element, collapseHeight, altCollapseHeight, icon, force) {
        var usingCollapseHeight = collapseHeight;
        if (window.innerWidth <= 800) {
            usingCollapseHeight = altCollapseHeight;
        }
        if (force != undefined) {
            if (!force) {
                //expand
                document.getElementById(element).style.height = "auto";
                document.getElementById(icon).innerHTML = "expand_circle_up";
                document.getElementById(element).style.overflow = "auto";
            } else {
                document.getElementById(element).style.height = usingCollapseHeight + "px";
                document.getElementById(icon).innerHTML = "expand_circle_down";
                document.getElementById(element).style.overflow = "hidden";
            }
        } else {
            if (document.getElementById(element).style.height == usingCollapseHeight + "px") {
                //expand
                document.getElementById(element).style.height = "auto";
                document.getElementById(icon).innerHTML = "expand_circle_up";
                document.getElementById(element).style.overflow = "auto";
            } else {
                //collapse
                document.getElementById(element).style.height = usingCollapseHeight + "px";
                document.getElementById(icon).innerHTML = "expand_circle_down";
                document.getElementById(element).style.overflow = "hidden";
            }
        }


    }

    useEffect(() => {
        anime({
            targets: "#v" + step + currentOverlayType,
            left: "50%",
            opacity: 1,
            duration: 800,
            easing: 'easeInOutQuad'
        })

        if (currentOverlayType == "d") {
            if (step == 2) {
                var amount = document.getElementById("v1damt").value;
                document.getElementById("v2dh").innerHTML = "Donate " + amount;
            } else if (step == 3) {
                // "process" the donation
                axios({
                    method: "post",
                    url: "http://192.168.1.158:8080/addDonation",
                    data: {
                        amount: parseFloat(document.getElementById("v1damt").value.replace(/[$,]/g, "")).toFixed(2),
                    }
                })
                setTimeout(() => {
                    closeOverlay();
                    setTimeout(() => {
                        const donationSuccessful = document.getElementById("donationSuccessful");
                        donationSuccessful.style.display = "block";
                        for (var i = 1; i < 4; i++) {
                            document.getElementById("dsc" + i).style.transform = "translate(" + (-50 - randomNumber(-30, 30)) + "%, " + (-50 - randomNumber(-30, 30)) + "%)"
                        }
                        document.getElementById("dscamttextval").innerHTML = document.getElementById("v1damt").value;
                        switchView("donations");
                        anime({
                            targets: donationSuccessful,
                            opacity: 1,
                            duration: 1000,
                            easing: 'easeInOutQuad',
                            complete: function (anim) {
                                anime({
                                    targets: ["#dsc1", "#dsc2", "#dsc3"],
                                    opacity: 1,
                                    width: "500px",
                                    height: "500px",
                                    duration: 3000,
                                    filter: "blur(200px)",
                                    easing: 'easeInOutQuad',
                                })

                                document.getElementById("dscamttext").style.opacity = 0;
                                document.getElementById("dscamttext2").style.opacity = 0;
                                anime({
                                    targets: "#dscamttext",
                                    opacity: 1,
                                    duration: 1000,
                                    easing: 'easeInOutQuad',
                                    delay: 1500,
                                    complete: function (anim) {
                                        anime({
                                            targets: "#dscamttext2",
                                            opacity: 1,
                                            easing: 'easeInOutQuad',
                                            complete: function (anim) {
                                                setTimeout(() => {
                                                    refresh("donations");
                                                    anime({
                                                        targets: donationSuccessful,
                                                        scale: 1.5,
                                                        filter: "blur(20px)",
                                                        opacity: 0,
                                                        duration: 500,
                                                        easing: 'easeInOutQuad',
                                                        complete: function (anim) {
                                                            donationSuccessful.style.display = "none";
                                                            donationSuccessful.style.filter = "blur(0px)";
                                                            donationSuccessful.style.transform = "translateX(-50%) translateY(-50%)";
                                                            document.getElementById("dscamttext").style.opacity = 0;
                                                            document.getElementById("dscamttext2").style.opacity = 0;
                                                            for (var i = 1; i < 4; i++) {
                                                                document.getElementById("dsc" + i).style.transform = "translate(" + (-50 - randomNumber(-30, 30)) + "%, " + (-50 - randomNumber(-30, 30)) + "%)"
                                                                document.getElementById("dsc" + i).style.width = "0px";
                                                                document.getElementById("dsc" + i).style.height = "0px";
                                                            }
                                                        }
                                                    })
                                                }, 2000);
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }, 2000);
                }, 1000)
            }
        } else if (currentOverlayType == "re") {
            if (step == 1) {
                axios({
                    method: "get",
                    url: "http://192.168.1.158:8080/getEvent?id=" + selectedEvent
                }).then((res) => {
                    document.getElementById("v1rehead").innerHTML = "Pay $" + res.data.event.cost;
                    document.getElementById("v1resubhead").innerHTML = "to register for " + res.data.event.title;
                }).catch((err) => {
                    apiError(err);
                })
            } else if (step == 2) {
                axios({
                    method: "post",
                    url: "http://192.168.1.158:8080/registerEvent",
                    data: {
                        uuid: accountRef.current,
                        eventId: selectedEvent
                    }
                }).then((res) => {
                    if (res.data.status == "Account registered for event.") {
                        closeOverlay();
                        setTimeout(() => {
                            closeEventOverlay("vieweventsoverlay");
                            refresh("events");
                        }, 2000)
                    }
                }).catch((err) => {
                    apiError(err);
                    anime({
                        targets: "#v2re",
                        left: "150%",
                        opacity: 0,
                        easing: 'easeInOutQuad',
                    })
                    setStep(1);
                })
            }
        }
    }, [step])

    function nextStep(type) {
        if (step == 0) {
            setStep(1);
            document.getElementById("v1" + type).style.display = "block";
        } else {
            anime({
                targets: "#v" + step + type,
                left: "-100%",
                opacity: 0,
                duration: 800,
                easing: 'easeInOutQuad',
                complete: function (anim) {
                    document.getElementById("v" + step + type).style.display = "none";
                    document.getElementById("v" + (step + 1) + type).style.display = "block";
                    setStep(step + 1);
                }
            })


        }
    }

    function toggleSidebar() {
        if (sidebarOpen) {
            hideSidebar();
            setUserSidebarOpen(false);
        } else {
            showSidebar();
            setUserSidebarOpen(true);
        }
    }

    function showSidebar() {
        if (window.innerWidth <= 600) {
            //mobile
            document.getElementById("content").style.gridTemplateColumns = "245px 100%";
            anime({
                targets: document.getElementsByClassName(styles.screen),
                border: "1px solid rgb(227, 171, 74)",
                borderRadius: "25px",
                duration: 300,
                easing: 'easeInOutQuad',
            })

            for (var i = 0; i < document.getElementsByClassName(styles.screen).length; i++) {
                document.getElementsByClassName(styles.screen)[i].style.overflowY = "hidden"
            }

            anime({
                targets: "#screens",
                padding: "0px",
                duration: 300,
                easing: 'easeInOutQuad',
            })

            anime({
                targets: "#" + viewState,
                scale: 0.95,
                opacity: 0.8,
                duration: 300,
                easing: 'easeInOutQuad',
            })
        } else {
            document.getElementById("content").style.gridTemplateColumns = "280px auto";
            anime({
                targets: "#showSidebar",
                opacity: 0,
                duration: 100,
                easing: "linear",
                complete: function () {
                    document.getElementById("showSidebar").style.display = "none"
                }
            })

            anime({
                targets: "#sidebarInteractions",
                opacity: 1,
                duration: 300,
                easing: "linear"
            })
        }
        document.getElementById("content").style.left = "50%";
        document.getElementById("errorCard").style.display = "none"



        setSidebarOpen(true);
    }

    function hideSidebar(view) {
        console.log(mobileRef.current)
        const parentWidth = document.getElementById("mainelem").clientWidth;
        var left = (parentWidth / 2) - 250;
        if (window.innerWidth <= 600) {
            document.getElementById("content").style.gridTemplateColumns = "245px 100%";
            anime({
                targets: document.getElementsByClassName(styles.screen),
                border: "0px solid rgb(227, 171, 74)",
                borderRadius: "0px",
                duration: 300,
                easing: 'easeInOutQuad',
            })

            anime({
                targets: "#screens",
                padding: "0px",
                duration: 300,
                easing: 'easeInOutQuad',
            })

            anime({
                targets: "#" + viewState,
                scale: 1,
                opacity: 1,
                duration: 300,
                complete: function (anim) {
                    for (var i = 0; i < document.getElementsByClassName(styles.screen).length; i++) {
                        document.getElementsByClassName(styles.screen)[i].style.overflowY = "auto"
                        document.getElementsByClassName(styles.screen)[i].style.transform = "none"
                    }

                    if (view) {
                        document.getElementById(view).scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                },
                easing: 'easeInOutQuad',
            })

            left = (parentWidth / 2) - 270;
        } else {
            document.getElementById("showSidebar").style.display = "block"
            anime({
                targets: "#showSidebar",
                opacity: 1,
                duration: 300,
                easing: "linear"
            })

            anime({
                targets: "#sidebarInteractions",
                opacity: 0,
                duration: 300,
                easing: "linear"
            })
            document.getElementById("content").style.gridTemplateColumns = "280px calc(100% - 55px)";
        }



        document.getElementById("content").style.left = left + "px";
        setSidebarOpen(false);
    }

    function openOverlay(type) {
        setStep(0);
        setCurrentOverlayType(type);
        const donate = document.getElementById("donate");
        const volunteer = document.getElementById("volunteer");
        const registerEvent = document.getElementById("registerEvent");
        for (var i = 0; i < donate.children.length; i++) {
            donate.children[i].style.left = "150%"
            donate.children[i].style.opacity = "0"
        }

        for (var i = 0; i < volunteer.children.length; i++) {
            volunteer.children[i].style.left = "150%"
            volunteer.children[i].style.opacity = "0"
        }

        for (var i = 0; i < registerEvent.children.length; i++) {
            registerEvent.children[i].style.left = "150%"
            registerEvent.children[i].style.opacity = "0"
        }

        if (type == "d") {
            donate.style.display = "block";
            axios({
                method: "post",
                url: "http://192.168.1.158:8080/track",
                data: {
                    uuid: trackerUUID,
                    page: "Dashboard",
                    view: "donationFlow"
                }
            }).catch((err) => {
                console.log(err);
                console.log("Tracking error")
            })
            volunteer.style.display = "none";
        } else if (type == "v") {
            volunteer.style.display = "block";
            axios({
                method: "post",
                url: "http://192.168.1.158:8080/track",
                data: {
                    uuid: trackerUUID,
                    page: "Dashboard",
                    view: "volunteerFlow"
                }
            }).catch((err) => {
                console.log(err);
                console.log("Tracking error")
            })
            donate.style.display = "none";
        } else if (type == "re") {
            registerEvent.style.display = "block";
            volunteer.style.display = "none";
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

        document.getElementById("diffOverlayWrapper").style.display = "block"

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
        axios({
            method: "post",
            url: "http://192.168.1.158:8080/track",
            data: {
                uuid: trackerUUID,
                page: "Dashboard",
                view: viewState
            }
        }).catch((err) => {
            console.log(err);
            console.log("Tracking error")
        })
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
                document.getElementById("diffOverlayWrapper").style.display = "none";
                anime({
                    targets: "#content",
                    opacity: 1,
                    duration: 300,
                    easing: 'easeInOutQuad',
                })
            }
        })
    }

    function push(path) {
        if (router.isReady) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.style.overflowY = "hidden"
            if (mobile) {
                anime({
                    targets: '#content',
                    opacity: 0,
                    filter: "blur(20px)",
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
                    targets: '#content',
                    opacity: 0,
                    filter: "blur(20px)",
                    duration: 1000,
                    easing: 'easeInOutQuad'
                })
            }


        }
    }

    function apiError(err) {
        console.log(err);
        var message = "Network Error"
        if (err.response) {
            message = err.response.data
        }
        document.getElementById("errorMessage").innerHTML = message;
        document.getElementById("errorCard").style.display = "block";
        anime({
            targets: "#errorCard",
            bottom: "5%",
            easing: 'easeInOutQuad',
            complete: function (anim) {
                anime({
                    targets: "#errorCard",
                    bottom: "-100%",
                    easing: 'easeInOutQuad',
                    delay: 5000,
                    complete: function (anim) {
                        document.getElementById("errorCard").style.display = "none";
                    }
                })
            }
        })
    }


    useEffect(() => {
        if (account != "") {
            axios({
                method: "get",
                url: "http://192.168.1.158:8080/getAccount?uuid=" + account
            }).then((res) => {
                setAccountData(res.data);
                document.getElementById("acctName").innerHTML = res.data.name.split(" ")[0];
                if (res.data.role == "Admin") {
                    setAdminView(true);
                    setInterval(() => {
                        if (viewState == "aag") {
                            axios({
                                method: "get",
                                url: "http://192.168.1.158:8080/getTrackerStats"
                            }).then((res) => {
                                const stats = res.data;
                                console.log(stats);
                                document.getElementById("activeusersnum").innerHTML = stats.active;

                                const homepage = stats.homepage;
                                var homepagenum = 0;
                                document.getElementById("footernum").innerHTML = "0";
                                document.getElementById("getintouchnum").innerHTML = "0";
                                document.getElementById("makedifferencenum").innerHTML = "0";
                                document.getElementById("howhelplistnum").innerHTML = "0";
                                document.getElementById("goalgridnum").innerHTML = "0";
                                document.getElementById("heronum").innerHTML = "0";
                                for (const [key, value] of Object.entries(homepage)) {
                                    if (key == "footer") {
                                        document.getElementById("footernum").innerHTML = value;
                                        homepagenum += value;
                                    } else if (key == "getintouch") {
                                        document.getElementById("getintouchnum").innerHTML = value;
                                        homepagenum += value;
                                    } else if (key == "makeDifference") {
                                        document.getElementById("makedifferencenum").innerHTML = value;
                                        homepagenum += value;
                                    } else if (key == "howhelp") {
                                        document.getElementById("howhelplistnum").innerHTML = value;
                                        homepagenum += value;
                                    } else if (key == "goalgrid") {
                                        document.getElementById("goalgridnum").innerHTML = value;
                                        homepagenum += value;
                                    } else if (key == "hero") {
                                        document.getElementById("heronum").innerHTML = value;
                                        homepagenum += value;
                                    }
                                }
                                document.getElementById("homepagenum").innerHTML = homepagenum;

                                const dashboard = stats.dashboard;
                                var dashboardnum = 0;
                                document.getElementById("aagnum").innerHTML = "0";
                                document.getElementById("eventsnum").innerHTML = "0";
                                document.getElementById("eventdetailsnum").innerHTML = "0";
                                document.getElementById("donationsnum").innerHTML = "0";
                                document.getElementById("donationflownum").innerHTML = "0";
                                document.getElementById("volunteerflownum").innerHTML = "0";
                                for (const [key, value] of Object.entries(dashboard)) {
                                    if (key == "aag") {
                                        document.getElementById("aagnum").innerHTML = value;
                                        dashboardnum += value;
                                    } else if (key == "events") {
                                        document.getElementById("eventsnum").innerHTML = value;
                                        dashboardnum += value;
                                    } else if (key == "eventDetails") {
                                        document.getElementById("eventdetailsnum").innerHTML = value;
                                        dashboardnum += value;
                                    } else if (key == "donations") {
                                        document.getElementById("donationsnum").innerHTML = value;
                                        dashboardnum += value;
                                    } else if (key == "donationFlow") {
                                        document.getElementById("donationflownum").innerHTML = value;
                                        dashboardnum += value;
                                    } else if (key == "volunteerFlow") {
                                        document.getElementById("volunteerflownum").innerHTML = value;
                                        dashboardnum += value;
                                    }
                                }
                                document.getElementById("dashboardnum").innerHTML = dashboardnum;

                                const accounts = stats.accounts;
                                var accountsnum = 0;
                                document.getElementById("landingnum").innerHTML = "0";
                                document.getElementById("innum").innerHTML = "0";
                                document.getElementById("upnum").innerHTML = "0";
                                for (const [key, value] of Object.entries(accounts)) {
                                    if (key == "Landing") {
                                        document.getElementById("landingnum").innerHTML = value;
                                        accountsnum += value;
                                    } else if (key == "Sign In") {
                                        document.getElementById("innum").innerHTML = value;
                                        accountsnum += value;
                                    } else if (key == "Sign Up") {
                                        document.getElementById("upnum").innerHTML = value;
                                        accountsnum += value;
                                    }
                                }
                                document.getElementById("accountsnum").innerHTML = accountsnum;
                            })
                        }
                    }, 1000)
                } else {
                    console.log("not admin")
                    //prevent access to admin view by setting admin display to block (discovered 3/5/24)
                    /*
                    try {
                        document.getElementById("admin").remove();
                    } catch (err) {
                        console.log("admin view not removed, but the account doesn't have acces to admin")
                    }
                    */
                }
            }).catch((err) => {
                console.log(err);
                if (err.response) {
                    if (err.response.data == "Account not found.") {
                        Cookies.remove("account");
                        setAccount("");
                        push("/accounts?from=Dashboard&view=Sign+In")
                    }
                } else {
                    apiError(err.message)
                }

            })
        }
    }, [account])

    function updateEventStatus(view, registrationStartDateTime, registrationEndDateTime, startDateTime, endDateTime) {
        if (view == "vieweventsoverlay") {
            var registrationStatus = calculateEventStatus(registrationStartDateTime, registrationEndDateTime);
            if (registrationStatus == "Pending") {
                document.getElementById("vestatusdiv").style.backgroundColor = "#ffff0072"
                document.getElementById("vestatusdiv").style.animation = "none"
                document.getElementById("eregistertbtn").style.display = "none"
                document.getElementById("vestatusdiv").style.color = "black"
                document.getElementById("vestatusverbtop").innerHTML = "Event registration"
                document.getElementById("vestatus").innerHTML = "CLOSED"
                var timeDifference = calculateTimeDifference(registrationStartDateTime);
                document.getElementById("vestatusverb").innerHTML = "It will open in " + timeDifference.value + " " + timeDifference.unit;
            } else if (registrationStatus == "In Progress") {
                document.getElementById("vestatusdiv").style.color = "black"
                document.getElementById("eregistertbtn").style.display = "block"
                document.getElementById("vestatusdiv").style.animation = styles.pulseRegistration + " 3s infinite linear"
                document.getElementById("vestatusverbtop").innerHTML = "Event registration"
                document.getElementById("vestatus").innerHTML = "OPEN"
                var timeDifference = calculateTimeDifference(registrationEndDateTime);
                document.getElementById("vestatusverb").innerHTML = "It will close in " + timeDifference.value + " " + timeDifference.unit;
            } else if (registrationStatus == "Ended") {
                document.getElementById("eregistertbtn").style.display = "none"
                var eventStatus = calculateEventStatus(startDateTime, endDateTime);
                if (eventStatus == "Pending") {
                    document.getElementById("vestatusdiv").style.backgroundColor = "#ffff0072"
                    document.getElementById("vestatusdiv").style.color = "black"
                    document.getElementById("vestatusverbtop").innerHTML = "Event"
                    document.getElementById("vestatusdiv").style.animation = "none"
                    document.getElementById("vestatus").innerHTML = "PENDING"
                    var timeDifference = calculateTimeDifference(startDateTime);
                    document.getElementById("vestatusverb").innerHTML = "It will start in " + timeDifference.value + " " + timeDifference.unit;
                } else if (eventStatus == "In Progress") {
                    document.getElementById("vestatusdiv").style.backgroundColor = "#fbac29ff"
                    document.getElementById("vestatusdiv").style.animation = styles.pulse + " 3s infinite linear"
                    document.getElementById("vestatusdiv").style.color = "#ffe5b9"
                    document.getElementById("vestatusverbtop").innerHTML = "Event"
                    document.getElementById("vestatus").innerHTML = "IN PROGRESS"
                    var timeDifference = calculateTimeDifference(endDateTime);
                    document.getElementById("vestatusverb").innerHTML = "It will end in " + timeDifference.value + " " + timeDifference.unit;
                } else if (eventStatus == "Ended") {
                    document.getElementById("vestatusdiv").style.animation = "none"
                    document.getElementById("vestatusdiv").style.backgroundColor = "#f66d4bff"
                    document.getElementById("vestatusdiv").style.color = "#ffedf0"
                    document.getElementById("vestatusverbtop").innerHTML = "Event has"
                    document.getElementById("vestatus").innerHTML = "ENDED"
                    document.getElementById("vestatusverb").innerHTML = "It ended " + new Date(endDateTime).toLocaleString();
                }
            }
        } else {
            var registrationStatus = calculateEventStatus(registrationStartDateTime, registrationEndDateTime);
            if (registrationStatus == "Pending") {
                document.getElementById("eestatusdiv").style.animation = "none"
                document.getElementById("eestatusdiv").style.color = "black"
                document.getElementById("eestatusverbtop").innerHTML = "Event registration"
                document.getElementById("eestatus").innerHTML = "CLOSED"
                var timeDifference = calculateTimeDifference(registrationStartDateTime);
                document.getElementById("eestatusverb").innerHTML = "It will open in " + timeDifference.value + " " + timeDifference.unit;
            } else if (registrationStatus == "In Progress") {
                document.getElementById("eestatusdiv").style.animation = styles.pulseRegistration + " 3s infinite linear"
                document.getElementById("eestatusverbtop").innerHTML = "Event registration"
                document.getElementById("eestatus").innerHTML = "OPEN"
                document.getElementById("eestatusdiv").style.color = "black"
                var timeDifference = calculateTimeDifference(registrationEndDateTime);
                document.getElementById("eestatusverb").innerHTML = "It will close in " + timeDifference.value + " " + timeDifference.unit;
            } else if (registrationStatus == "Ended") {
                var eventStatus = calculateEventStatus(startDateTime, endDateTime);
                if (eventStatus == "Pending") {
                    document.getElementById("eestatusdiv").style.backgroundColor = "#ffff0072"
                    document.getElementById("eestatusdiv").style.color = "black"
                    document.getElementById("eestatusverbtop").innerHTML = "Event"
                    document.getElementById("eestatusdiv").style.animation = "none"
                    document.getElementById("eestatus").innerHTML = "PENDING"
                    var timeDifference = calculateTimeDifference(startDateTime);
                    document.getElementById("eestatusverb").innerHTML = "It will start in " + timeDifference.value + " " + timeDifference.unit;
                } else if (eventStatus == "In Progress") {
                    document.getElementById("eestatusdiv").style.backgroundColor = "#fbac29ff"
                    document.getElementById("eestatusdiv").style.animation = styles.pulse + " 3s infinite linear"
                    document.getElementById("eestatusdiv").style.color = "#ffe5b9"
                    document.getElementById("eestatusverbtop").innerHTML = "Event"
                    document.getElementById("eestatus").innerHTML = "IN PROGRESS"
                    var timeDifference = calculateTimeDifference(endDateTime);
                    document.getElementById("eestatusverb").innerHTML = "It will end in " + timeDifference.value + " " + timeDifference.unit;
                } else if (eventStatus == "Ended") {
                    document.getElementById("eestatusdiv").style.animation = "none"
                    document.getElementById("eestatusdiv").style.backgroundColor = "#f66d4bff"
                    document.getElementById("eestatusdiv").style.color = "#ffedf0"
                    document.getElementById("eestatusverbtop").innerHTML = "Event has"
                    document.getElementById("eestatus").innerHTML = "ENDED"
                    document.getElementById("eestatusverb").innerHTML = "It ended " + new Date(endDateTime).toLocaleString();
                }
            }
        }
    }

    useEffect(() => {
        if (router.isReady) {
            //once the page is fully loaded, play the splashscreen outro
            if (Cookies.get("account") != undefined) {
                setAccount(Cookies.get("account"));
            }

            if (window.innerWidth <= 1060) {
                hideSidebar();
                try {
                    collapse("dashboarduam", 53, 38, "dashuamico", true);
                    collapse("accountsuam", 53, 38, "accuamcico", true);
                    collapse("homepageuam", 53, 38, "hpuamcico", true);
                } catch (ignored) { }
            } else {
                showSidebar();
                try {
                    collapse("dashboarduam", 53, 38, "dashuamico", false);
                    collapse("accountsuam", 53, 38, "accuamcico", false);
                    collapse("homepageuam", 53, 38, "hpuamcico", false);
                } catch (ignored) { }
            }

            document.getElementById("v1damt").addEventListener("focus", onFocus);
            document.getElementById("v1damt").addEventListener("blur", onBlur);

            window.addEventListener("resize", () => {
                try {
                    if (window.innerWidth <= 1500) {
                        document.getElementById("bentoEventExtras").style.display = "none";
                    } else {
                        document.getElementById("bentoEventExtras").style.display = "block";
                    }
                } catch (ignored) { }


                if (window.innerWidth <= 1060) {
                    hideSidebar();
                    try {
                        collapse("dashboarduam", 53, 38, "dashuamico", true);
                        collapse("accountsuam", 53, 38, "accuamcico", true);
                        collapse("homepageuam", 53, 38, "hpuamcico", true);

                    } catch (ignored) { }
                } else {
                    showSidebar();
                    try {

                        collapse("dashboarduam", 53, 38, "dashuamico", false);
                        collapse("accountsuam", 53, 38, "accuamcico", false);
                        collapse("homepageuam", 53, 38, "hpuamcico", false);

                    } catch (ignored) { }
                }
            });

            //switchView("aag");

            if (Cookies.get("trackerUUID") == undefined && trackerUUID == "") {
                setTrackerUUID(uuid());
            } else if (Cookies.get("trackerUUID") != undefined && trackerUUID == "") {
                setTrackerUUID(Cookies.get("trackerUUID"));
            }

            window.scrollTo(0, 0);
            if (window.innerWidth <= 600) {
                setMobile(true);
                console.log("mobile")
                document.getElementById("splashscreenOutro").style.display = "none";
                setTimeout(() => {
                    document.body.style.overflowY = "hidden"
                    if (router.query.view != undefined) {
                        if (router.query.view == "volunteer") {
                            openOverlay("v");
                        } else if (router.query.view == "donate") {
                            openOverlay("d");
                        } else {
                            if (router.query.eventid != undefined) {
                                openEventOverlay("vieweventsoverlay", router.query.eventid);
                            }
                            switchView(router.query.view);
                        }
                    } else {
                        switchView("aag");
                    }
                    anime({
                        targets: '#content',
                        opacity: 1,
                        duration: 200,
                        delay: 500,
                        easing: 'linear',
                        complete: function (anim) {
                            setContentReady(true);
                        }
                    })
                }, 500);
            } else {
                document.getElementById("splashscreenOutro").style.display = "block";
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
                    anime({
                        targets: '#splashscreenOutro',
                        opacity: 0,
                        duration: 200,
                        easing: 'linear',
                        complete: function (anim) {
                            document.getElementById("splashscreenOutro").style.display = "none";
                            document.body.style.overflowY = "hidden"
                            console.log(router.query)
                            if (router.query.view != undefined) {
                                if (router.query.view == "volunteer") {
                                    openOverlay("v");
                                } else if (router.query.view == "donate") {
                                    openOverlay("d");
                                } else {
                                    if (router.query.eventid != undefined) {
                                        openEventOverlay("vieweventsoverlay", router.query.eventid);
                                    }
                                    switchView(router.query.view);
                                }
                            } else {
                                switchView("aag");
                            }
                        }
                    })
                    anime({
                        targets: '#content',
                        opacity: 1,
                        duration: 200,
                        easing: 'linear',
                        complete: function (anim) {
                            setContentReady(true);
                        }
                    })
                }, 500)
            }
        }
    }, [router.isReady])

    return (
        <>
            <Head>
                <title>Dashboard | NourishDMV</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" />
            </Head>
            <main id="mainelem" style={{ overflow: 'hidden' }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                <video id="splashscreenOutro" playsInline preload="auto" muted className="splashScreen" style={{ display: "none" }}><source src="anim_ss_ndmv_outro.mp4" type="video/mp4" /></video>
                <video id="splashscreenIntro" playsInline muted className="splashScreen" style={{ display: "none", opacity: 0 }}><source src="anim_ss_ndmv_intro.mp4" type="video/mp4" /></video>
                <div id="content" style={{ opacity: 0, overflow: "visible", transition: "all ease 0.5s" }} className={styles.sidebarContent}>
                    <div className={styles.sidebarContainer}>
                        <div className={styles.sidebar}>
                            <div id="sidebarInteractions">
                                <div style={{ display: "flex", margin: "auto", marginTop: "5px", alignItems: "center", width: "calc(100% - 15px)" }}>
                                    <button className={[styles.sidebarbutton, styles.hover].join(" ")} style={{ width: "60px", height: "40px", borderRadius: "20px", marginLeft: "10px", marginRight: '5px' }} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span className={["material-symbols-rounded", styles.sidebarButtonIcon].join(" ")} style={{ fontSize: "20px" }}>{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                    <Image src="logo.svg" alt="NourishDMV Logo" height={35} width={(mobile) ? 190 : 190} />
                                </div>
                                <div className={styles.divider} style={{ marginTop: "5px", marginBottom: "0px" }}></div>
                                <div className={styles.innerSidebar}>
                                    <div id="navbtns">
                                        <button id="aagbtn" className={styles.sidebarItem} onClick={() => switchView("aag")}>
                                            <div className={styles.doublegrid} style={{ gridTemplateColumns: "40px auto", gridGap: '10px' }}><div><span className="material-symbols-rounded" style={{ display: "block", fontSize: "40px" }}>bar_chart_4_bars</span></div><div>At a glance</div></div>
                                        </button>
                                        <button id="peoplebtn" className={styles.sidebarItem} onClick={() => switchView("people")} style={{ display: (adminView) ? "block" : "none" }}><div className={styles.doublegrid} style={{ gridTemplateColumns: "40px auto", gridGap: '10px' }}><div><span className="material-symbols-rounded" style={{ display: "block", fontSize: "40px" }}>group</span></div><div>People</div></div></button>
                                        <button id="blogbtn" className={styles.sidebarItem} style={{ display: "none" }} onClick={() => switchView("blog")}>Blog</button>
                                        <button id="eventsbtn" className={styles.sidebarItem} onClick={() => switchView("events")}><div className={styles.doublegrid} style={{ gridTemplateColumns: "40px auto", gridGap: '10px' }}><div><span className="material-symbols-rounded" style={{ display: "block", fontSize: "40px" }}>local_activity</span></div><div>Events</div></div></button>
                                        <button id="donationsbtn" className={styles.sidebarItem} onClick={() => switchView("donations")}><div className={styles.doublegrid} style={{ gridTemplateColumns: "40px auto", gridGap: '10px' }}><div><span className="material-symbols-rounded" style={{ display: "block", fontSize: "40px" }}>volunteer_activism</span></div><div>Donations</div></div></button>
                                    </div>
                                    <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 0, zIndex: 100, width: "90%" }}>
                                        <button className={styles.sidebarItem} onClick={() => push("/accounts?from=Dashboard&view=Sign+In")} style={{ display: (account == "") ? "block" : "none" }}>Sign In</button>
                                        <div className={styles.sidebarItem} style={{ width: "100%", zIndex: "100", display: (account != "") ? "block" : "none", borderRadius: "25px", height: "70px", backgroundColor: "rgba(255, 208, 128, 0.692)", border: "1px solid #e3ab4a", cursor: "initial", padding: "0px" }}>
                                            <div className={styles.sbAcctInnerDiv}>
                                                <h3 style={{ margin: "auto", marginLeft: "0px", color: "#e3ab4a", textAlign: "left" }} id="acctName">Name</h3>
                                                <div id="logout" className={styles.hover} onClick={() => {
                                                    Cookies.remove("account");
                                                    setAccount("");
                                                    push("/accounts?from=Dashboard&view=Sign+In")
                                                }} style={{ backgroundColor: "#e3ab4a", position: "relative", width: "60px", height: "60px", borderRadius: "20px", margin: "auto 0px auto auto" }}>
                                                    <span className={["material-symbols-rounded", styles.fullycenter].join(" ")} style={{ fontSize: "30px", margin: "auto" }}>logout</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className={[styles.sidebarbutton, styles.hover].join(" ")} style={{ width: "35px", height: "calc(100% - 10px)", borderRadius: "20px", marginLeft: "10px", marginRight: '5px', position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", borderRadius: "0px 30px 30px 0px" }} onClick={() => toggleSidebar()} id="showSidebar"><span className={["material-symbols-rounded", styles.sidebarButtonIcon].join(" ")} style={{ fontSize: "20px" }}>{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                        </div>
                    </div>
                    <div id="screens" className={styles.screensContainer} onClick={() => {
                        if (mobile && sidebarOpen) {
                            hideSidebar();
                            setUserSidebarOpen(false);
                        }
                    }}>
                        <div id="aag" className={styles.screen} style={{ marginTop: "0px" }}>
                            <div className={styles.screenNavbar}>
                                <div className={styles.sidebarbuttonGrid} style={{ width: "430px" }}>
                                    <button className={[styles.sidebarbutton, styles.hover, styles.viewtogglesidebar].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span className={["material-symbols-rounded", styles.sidebarButtonIcon].join(" ")}>{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                    <h3 className={styles.screenheading}>At a glance</h3>
                                </div>
                                <div className={styles.divider} style={{ marginTop: "5px", marginBottom: "-5px" }}></div>
                            </div>
                            <div className={styles.screenInner}>
                                <div id="youSection" style={{ display: (account != "" && !adminView) ? "block" : "none" }}>
                                    <h4 className={styles.screensubheading}>You</h4>
                                    <div className={styles.bentoboxCont}>
                                        <div className={styles.viewbentobox} style={{ minWidth: "350px" }}>
                                            <p style={{ fontWeight: "normal", fontSize: "30px" }}>role</p>
                                            <p>SUPPORTER</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p style={{ fontWeight: "normal", fontSize: "30px" }}>joined</p>
                                            <p>2/23/24</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p>$0</p>
                                            <p style={{ fontWeight: "normal", fontSize: "30px" }}>donated</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p>0</p>
                                            <p style={{ fontWeight: "normal", fontSize: "30px" }}>volunteer hours</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p>0</p>
                                            <p style={{ fontWeight: "normal", fontSize: "30px" }}>events attended</p>
                                        </div>
                                    </div>
                                    <h4 className={styles.screensubheading} style={{ fontWeight: "normal" }}>Your Upcoming Events</h4>
                                    <div id="upcomingeventsl" style={{ margin: "20px" }}>
                                        <div className={styles.card} style={{ height: "130px" }}>
                                            <div className={styles.fullycenter} style={{ width: "100%" }}>
                                                <p className={styles.font} style={{ fontSize: "25px", textAlign: "center", color: "rgba(0, 0, 0, 0.300)", fontWeight: "bold" }}>You aren't apart of any events</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.divider}></div>
                                </div>
                                <div id="admin" style={{ display: "block" }}>
                                    <div id="nonAdminAAG">
                                        <h3 className={styles.screensubheading} style={{ color: "black", marginBottom: "20px", marginTop: "10px", textAlign: "center" }}>Make a difference in <a style={{ backgroundColor: "#fbac29ff" }}>your community</a></h3>
                                        <div className={styles.makeDifferenceCont}>
                                            <button
                                                className={[styles.button, styles.hover, styles.makeDifferenceBtn].join(" ")}
                                                style={{
                                                    backgroundColor: "#f66d4bff",
                                                }}
                                                onClick={() => openOverlay("d")}
                                            >
                                                Donate
                                            </button>
                                            <button
                                                className={[styles.button, styles.hover, styles.makeDifferenceBtn].join(" ")}
                                                style={{
                                                    backgroundColor: "#fbe85dff",
                                                    color: "black",
                                                }}
                                                onClick={() => openOverlay("v")}
                                            >
                                                Join our team
                                            </button>
                                        </div>
                                        <div className={styles.divider}></div>
                                    </div>
                                    <h4 className={styles.screensubheading}>Today <a style={{ fontWeight: "normal" }}>{new Date().toLocaleDateString()}</a></h4>
                                    <div className={styles.bentoboxCont}>
                                        <div className={styles.eventsTodayBento} id="eventsTodayBento">
                                            <div className={styles.fullycenter} style={{ width: "100%" }}>
                                                <p className={styles.font} style={{ textAlign: "center", color: "rgba(0, 0, 0, 0.300)", fontWeight: "bold" }}>No event</p>
                                            </div>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p id="tdonsnum">0</p>
                                            <p className={styles.viewbentoboxSub} id="tdonssub">donations</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p id="tdonsamt">$0</p>
                                            <p className={styles.viewbentoboxSub}>donated</p>
                                        </div>
                                        <div className={[styles.viewbentobox, "adminAAG"].join(" ")}>
                                            <p id="totaluserstd">0</p>
                                            <p className={styles.viewbentoboxSub}>total users</p>
                                        </div>
                                        <div className={[styles.viewbentobox, "adminAAG"].join(" ")}>
                                            <p>0</p>
                                            <p className={styles.viewbentoboxSub}>new users</p>
                                        </div>
                                        <div className={[styles.viewbentobox, "adminAAG"].join(" ")}>
                                            <p>0</p>
                                            <p className={styles.viewbentoboxSub}>returning users</p>
                                        </div>
                                    </div>
                                    <div className={"adminAAG"} style={{ position: "relative" }}>
                                        <div className={styles.divider}></div>
                                        <h3 className={styles.screensubheading} style={{ fontSize: "25px", color: "rgb(183 137 58)" }}>REAL-TIME</h3>
                                        <h4 className={styles.screensubheading}>User Activity Monitor</h4>
                                        <div className={styles.bentoboxCont}>
                                            <div className={styles.viewbentobox} style={{ float: "inline-start", backgroundColor: "#ff00008a", animation: styles.pulseLive2 + " 3s infinite linear" }}>
                                                <p id="activeusersnum">0</p>
                                                <p className={styles.viewbentoboxSub}>total active users</p>
                                            </div>
                                            <div id="homepageuam" className={styles.bentoboxLive}>
                                                <div style={{ display: "grid", gridTemplateColumns: "auto 50px" }}>
                                                    <p style={{ margin: "0px", textAlign: "center" }}><a id="homepagenum">0</a> <a style={{ fontWeight: "normal", fontSize: "30px" }}>homepage</a></p>
                                                    <div className={styles.collapse} onClick={() => collapse("homepageuam", 53, 38, "hpuamcico")} style={{ cursor: "pointer" }}>
                                                        <span className='material-symbols-rounded' id="hpuamcico" style={{ fontSize: "40px" }}>expand_circle_up</span>
                                                    </div>
                                                </div>

                                                <div className={[styles.divider, styles.bbldivider].join(" ")}></div>
                                                <div style={{ padding: "0px 25px" }}>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="heronum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Hero</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="goalgridnum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Statistics/Goal</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="howhelplistnum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>How we help</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="makedifferencenum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Difference Together</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="getintouchnum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Get In Touch</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="footernum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Footer</a></p>
                                                </div>
                                            </div>
                                            <div id="accountsuam" className={styles.bentoboxLive} style={{ width: "230px" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "auto 50px" }}>
                                                    <p style={{ margin: "0px", textAlign: "center" }}><a id="accountsnum">0</a> <a style={{ fontWeight: "normal", fontSize: "30px" }}>accounts</a></p>
                                                    <div className={styles.collapse} onClick={() => collapse("accountsuam", 53, 38, "accuamcico")} style={{ cursor: "pointer" }}>
                                                        <span className='material-symbols-rounded' id="accuamcico" style={{ fontSize: "40px" }}>expand_circle_up</span>
                                                    </div>
                                                </div>
                                                <div className={styles.divider} style={{ borderTop: "0.5px solid rgb(255 255 255 / 34%)", marginTop: "10px", marginBottom: "10px", borderBottom: "0.5px solid rgb(255 255 255 / 34%)" }}></div>
                                                <div style={{ padding: "0px 15px" }}>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="landingnum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Landing</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="innum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Sign In</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="upnum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Sign Up</a></p>
                                                </div>
                                            </div>
                                            <div className={styles.bentoboxLive} id="dashboarduam" style={{ width: "250px", height: "350px", float: "none" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "auto 50px" }}>
                                                    <p style={{ margin: "0px", textAlign: "center" }}><a id="dashboardnum">0</a> <a style={{ fontWeight: "normal", fontSize: "30px" }}>dashboard</a></p>
                                                    <div className={styles.collapse} onClick={() => collapse("dashboarduam", 53, 38, "dashuamico")} style={{ cursor: "pointer" }}>
                                                        <span className='material-symbols-rounded' id="dashuamico" style={{ fontSize: "40px" }}>expand_circle_up</span>
                                                    </div>
                                                </div>

                                                <div className={styles.divider} style={{ borderTop: "0.5px solid rgb(255 255 255 / 34%)", marginTop: "10px", marginBottom: "10px", borderBottom: "0.5px solid rgb(255 255 255 / 34%)" }}></div>
                                                <div style={{ padding: "0px 10px" }}>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="aagnum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>At a glance</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="eventsnum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Events</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="eventdetailsnum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Event Details</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="donationsnum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Donations</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="donationflownum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Donation Flow</a></p>
                                                    <p style={{ margin: "0px", fontSize: "30px" }}><a id="volunteerflownum">0</a> <a style={{ fontWeight: "normal", fontSize: "23px" }}>Volunteer Flow</a></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <h4 className={styles.screensubheading}>{new Date().toLocaleString('default', { month: 'long' })}</h4>
                                    <div className={styles.bentoboxCont}>
                                        <div className={styles.viewbentobox}>
                                            <p id="maagdonsamt">$0</p>
                                            <p className={styles.viewbentoboxSub}>donated</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p id="maagdonsnum">0</p>
                                            <p className={styles.viewbentoboxSub}>donations</p>
                                        </div>
                                        <div className={[styles.viewbentobox, "adminAAG"].join(" ")}>
                                            <p>{accounts.length}</p>
                                            <p className={styles.viewbentoboxSub}>new accounts</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p>0</p>
                                            <p className={styles.viewbentoboxSub}>event attendees</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p id="totalusersm">0</p>
                                            <p className={styles.viewbentoboxSub}>total users</p>
                                        </div>
                                    </div>
                                    <div className="adminAAG">
                                        <h4 className={styles.screensubheading} style={{ fontWeight: "normal" }}>Retention</h4>
                                        <div className={styles.bentoboxCont}>
                                            <div className={styles.viewbentobox}>
                                                <p>5,554</p>
                                                <p className={styles.viewbentoboxSub}>new users</p>
                                            </div>
                                            <div className={styles.viewbentobox}>
                                                <p>2,345</p>
                                                <p className={styles.viewbentoboxSub}>returning users</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.divider}></div>
                                    <h4 className={styles.screensubheading}>All Time</h4>
                                    <div className={styles.bentoboxCont}>
                                        <div className={styles.viewbentobox}>
                                            <p id="aagdonsamt">$0</p>
                                            <p className={styles.viewbentoboxSub}>donated</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p>0</p>
                                            <p className={styles.viewbentoboxSub}>volunteers</p>
                                        </div>
                                        <div className={[styles.viewbentobox, "adminAAG"].join(" ")}>
                                            <p>{accounts.length}</p>
                                            <p className={styles.viewbentoboxSub}>accounts</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p id="totalusers">0</p>
                                            <p className={styles.viewbentoboxSub}>total users</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p>0</p>
                                            <p className={styles.viewbentoboxSub}>homepage views</p>
                                        </div>
                                    </div>
                                    <div className="adminAAG">
                                        <h4 className={styles.screensubheading} style={{ fontWeight: "normal" }}>Demographics</h4>
                                        <div className={styles.bentoboxCont}>
                                            <div className={styles.viewbentobox}>
                                                <p>40%</p>
                                                <p className={styles.viewbentoboxSub}>from Maryland</p>
                                            </div>
                                            <div className={styles.viewbentobox}>
                                                <p>30%</p>
                                                <p className={styles.viewbentoboxSub}>from DC</p>
                                            </div>
                                            <div className={styles.viewbentobox}>
                                                <p>30%</p>
                                                <p className={styles.viewbentoboxSub}>from Virginia</p>
                                            </div>
                                            <br />
                                            <div className={styles.viewbentobox}>
                                                <p>77%</p>
                                                <p className={styles.viewbentoboxSub}>using a mobile device</p>
                                            </div>
                                            <div className={styles.viewbentobox}>
                                                <p>23%</p>
                                                <p className={styles.viewbentoboxSub}>using a desktop device</p>
                                            </div>
                                        </div>
                                    </div>

                                    <h4 className={styles.screensubheading} style={{ fontWeight: "normal" }}>Events</h4>
                                    <div className={styles.bentoboxCont}>
                                        <div className={styles.viewbentobox}>
                                            <p>{eventsLength}</p>
                                            <p className={styles.viewbentoboxSub}>events</p>
                                        </div>
                                        <div className={styles.viewbentobox}>
                                            <p id="vacount">{eventAttendees}</p>
                                            <p className={styles.viewbentoboxSub}>event attendees</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="non-admin" style={{ display: "none" }}>
                                    <h3 className={styles.screensubheading} style={{ color: "black", marginBottom: "20px", marginTop: "10px", textAlign: "center" }}>Make a difference in <a style={{ backgroundColor: "#fbac29ff" }}>your community</a></h3>
                                    <div className={styles.makeDifferenceCont}>
                                        <button
                                            className={[styles.button, styles.hover, styles.makeDifferenceBtn].join(" ")}
                                            style={{
                                                backgroundColor: "#f66d4bff",
                                            }}
                                            onClick={() => openOverlay("d")}
                                        >
                                            Donate
                                        </button>
                                        <button
                                            className={[styles.button, styles.hover, styles.makeDifferenceBtn].join(" ")}
                                            style={{
                                                backgroundColor: "#fbe85dff",
                                                color: "black",
                                            }}
                                            onClick={() => openOverlay("v")}
                                        >
                                            Join our team
                                        </button>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <h4 className={styles.screensubheading}>Today</h4>
                                    <div>
                                        <h4 className={styles.screensubheading}>Recent Events</h4>
                                        <div id="othereventsl" className={styles.bentoboxCont} style={{ overflowX: "auto" }}>
                                            <div id="reaagetb" className={styles.eventsTodayBento} style={{ marginBottom: "0px" }}>
                                                <div className={styles.fullycenter} style={{ width: "100%" }}>
                                                    <p className={styles.font} style={{ textAlign: "center", color: "rgba(0, 0, 0, 0.300)", fontWeight: "bold" }}>No events to show</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div id="people" className={styles.screen} style={{ display: (adminView) ? "block" : "none" }}>
                            <div className={styles.screenNavbar} style={{ position: "initial" }}>
                                <div className={styles.doublegrid} style={{ display: "flex", overflowX: "auto", paddingRight: "10px" }}>
                                    <div className={styles.sidebarbuttonGrid} style={{ width: "200px" }}>
                                        <button className={[styles.sidebarbutton, styles.hover, styles.viewtogglesidebar].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span className={["material-symbols-rounded", styles.sidebarButtonIcon].join(" ")}>{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                        <h3 className={styles.screenheading}>People</h3>
                                        <div className={styles.loading} id="peopleloading"></div>
                                    </div>
                                    <div className={styles.bentoboxCont} style={{ display: "flex", margin: "0", flexWrap: "nowrap", alignItems: "stretch" }}>
                                        <div className={styles.sviewbentobox}>
                                            <p>{accounts.length}</p>
                                            <p className={styles.sviewbentoboxSub}>accounts</p>
                                        </div>
                                        <div className={styles.sviewbentobox}>
                                            <p>0</p>
                                            <p className={styles.sviewbentoboxSub}>volunteers</p>
                                        </div>
                                        <div className={styles.sviewbentobox}>
                                            <p>0</p>
                                            <p className={styles.sviewbentoboxSub}>donators</p>
                                        </div>
                                        <div className={styles.sviewbentobox}>
                                            <p id="dccount">0</p>
                                            <p className={styles.sviewbentoboxSub}>from DC</p>
                                        </div>
                                        <div className={styles.sviewbentobox}>
                                            <p id="mdcount">0</p>
                                            <p className={styles.sviewbentoboxSub}>from Maryland</p>
                                        </div>
                                        <div className={styles.sviewbentobox}>
                                            <p id="vacount">0</p>
                                            <p className={styles.sviewbentoboxSub}>from Virginia</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.divider} style={{ marginTop: "5px", marginBottom: "0px" }}></div>
                            </div>
                            <div className={styles.innerSidebar} style={{ height: "calc(100% - 95px)" }}>
                                <div id="peoplecontent" className={styles.doublegrid} style={{ willChange: "transform", height: "100%", gridTemplateColumns: "1.2fr 0.8fr" }}>
                                    <div>
                                        <div id="peoplenavbar" className={styles.viewnavbar} style={{ gridTemplateColumns: "auto 100px", }}><input onInput={() => {
                                            const children = document.getElementById("eventslist").children;
                                            for (let i = 0; i < children.length; i++) {
                                                if (children[i].getAttribute("name").toLowerCase().includes(document.getElementById("eventssearch").value.toLowerCase())) {
                                                    children[i].style.display = "grid";
                                                } else {
                                                    children[i].style.display = "none";
                                                }
                                            }
                                        }} className={styles.inputScreen} type="search" style={{ backgroundColor: "rgba(255, 208, 128, 0.692)", marginBottom: "5px", color: "rgb(227, 171, 74)" }} id="eventssearch" placeholder="Search with title"></input>
                                            <button style={{ width: "100%", marginBottom: "5px", display: (adminView) ? "block" : "none" }} className={styles.managebutton} onClick={() => openEventOverlay("editeventsoverlay")}><span className="material-symbols-rounded" style={{ display: "block" }}>add_circle</span></button></div>
                                        <div id="peoplelist" className={styles.viewlist} style={{ width: "100%", overflowX: "visible", overflowY: "scroll", margin: "0px" }}>

                                        </div>
                                    </div>
                                    <div id="peopleinspector" className={styles.peopleinspector}>
                                        <div id="pinotselected" className={[styles.fullycenter, styles.font].join(" ")} style={{ color: "#E3AB4A", fontWeight: "normal", textAlign: "center", width: "100%" }}>
                                            <span className="material-symbols-rounded" style={{ fontSize: "180px" }}>data_loss_prevention</span>
                                            <p style={{ fontSize: "30px", margin: "0px" }}>Select a person to inspect</p>
                                        </div>
                                        <div id="piselected" style={{ display: "none" }}>
                                            <div className={styles.screenNavbar} style={{ borderRadius: "25px 25px 0px 0px" }}>
                                                <div className={styles.sidebarbuttonGrid} style={{ width: "430px" }}>
                                                    <button className={[styles.sidebarbutton, styles.hover, styles.viewtogglesidebar].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span className={["material-symbols-rounded", styles.sidebarButtonIcon].join(" ")}>{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                                    <h3 className={styles.screenheading}>Person</h3>
                                                </div>
                                                <div className={styles.divider} style={{ marginTop: "5px", marginBottom: "5px" }}></div>

                                            </div>
                                            <div id="pisinner" style={{ padding: "0px 5px" }}>
                                                <div className={styles.bentoboxCont}>
                                                    <div className={styles.viewbentobox}>
                                                        <p>{accounts.length}</p>
                                                        <p className={styles.sviewbentoboxSub}>accounts</p>
                                                    </div>
                                                    <div className={styles.viewbentobox}>
                                                        <p>0</p>
                                                        <p className={styles.sviewbentoboxSub}>volunteers</p>
                                                    </div>
                                                    <div className={styles.viewbentobox}>
                                                        <p>0</p>
                                                        <p className={styles.sviewbentoboxSub}>donators</p>
                                                    </div>
                                                    <div className={styles.viewbentobox}>
                                                        <p id="dccount">0</p>
                                                        <p className={styles.sviewbentoboxSub}>from DC</p>
                                                    </div>
                                                    <div className={styles.viewbentobox}>
                                                        <p id="mdcount">0</p>
                                                        <p className={styles.sviewbentoboxSub}>from Maryland</p>
                                                    </div>
                                                    <div className={styles.viewbentobox}>
                                                        <p id="vacount">0</p>
                                                        <p className={styles.sviewbentoboxSub}>from Virginia</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="events" className={styles.screen} style={{ position: "relative" }}>
                            <div className={styles.screenInner}>
                                <div id="affectbyeoverlay">
                                    <div className={styles.sidebarbuttonGrid} style={{ width: "300px" }}>
                                        <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span className={["material-symbols-rounded", styles.sidebarButtonIcon].join(" ")}>{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                        <h3 className={styles.screenheading}>Events</h3>
                                        <div className={styles.loading} id="eventsloading"></div>
                                    </div>
                                    <div id="eventscontent">
                                        <div className={styles.bentoboxCont}>
                                            <div className={styles.viewbentobox}>
                                                <p id="eventsamt">0</p>
                                                <p className={styles.viewbentoboxSub}>events</p>
                                            </div>
                                            <div className={styles.viewbentobox} style={{ display: (adminView) ? "inline-block" : "none" }}>
                                                <p id="attcount">{eventAttendees}</p>
                                                <p className={styles.viewbentoboxSub}>total attendees</p>
                                            </div>
                                            <div className={styles.viewbentobox} style={{ backgroundColor: "#ffff0072", color: "black" }}>
                                                <p id="pendingcount">0</p>
                                                <p className={styles.viewbentoboxSub}>pending</p>
                                            </div>
                                            <div className={styles.viewbentobox} style={{ backgroundColor: "#fbac29ff", animation: styles.pulse + " 3s infinite linear" }}>
                                                <p id="inprogcount">0</p>
                                                <p className={styles.viewbentoboxSub}>in progress</p>
                                            </div>
                                            <div className={styles.viewbentobox} style={{ backgroundColor: "#f66d4bff" }}>
                                                <p id="endedcount">0</p>
                                                <p className={styles.viewbentoboxSub}>ended</p>
                                            </div>
                                        </div>
                                        <div className={styles.divider}></div>
                                        <div id="eventsattend">
                                            <h3 className={styles.screensubheading} style={{ marginLeft: "5px" }}>Your Events</h3>
                                            <div id="eventsattendlist" className={styles.viewlist} style={{ marginTop: "10px" }}></div>
                                            <div className={styles.divider}></div>
                                        </div>

                                        <div className={styles.viewlist}>
                                            <div id="eventsnavbar" style={{ gridTemplateColumns: "auto 100px", display: (adminView) ? "grid" : "block" }} className={styles.viewnavbar}>
                                                <input onInput={() => {
                                                    const children = document.getElementById("eventslist").children;
                                                    for (let i = 0; i < children.length; i++) {
                                                        if (children[i].getAttribute("name").toLowerCase().includes(document.getElementById("eventssearch").value.toLowerCase())) {
                                                            children[i].style.display = "grid";
                                                        } else {
                                                            children[i].style.display = "none";
                                                        }
                                                    }
                                                }} className={styles.inputScreen} type="search" style={{ backgroundColor: "rgba(255, 208, 128, 0.692)", marginBottom: "5px", color: "rgb(227, 171, 74)" }} id="eventssearch" placeholder="Search with title"></input>
                                                <button style={{ width: "100%", marginBottom: "5px", display: (adminView) ? "block" : "none" }} className={styles.managebutton} onClick={() => openEventOverlay("editeventsoverlay")}><span className="material-symbols-rounded" style={{ display: "block" }}>add_circle</span></button>
                                            </div>
                                            <div id="eventslist"></div>
                                        </div>
                                        <div id="non-adminview" style={{ display: (adminView) ? "none" : "block" }}>
                                            <div id="nonadmineventslist"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="vieweventsoverlay" className={styles.eventsoverlay}>
                                <button className={[styles.closebutton, styles.hover].join(" ")} onClick={() => closeEventOverlay("vieweventsoverlay")}><span class="material-symbols-rounded" style={{ fontSize: "40px" }}>close</span></button>
                                <div id="vestatusdiv" className={styles.font} style={{ backgroundColor: "#ffff0072", height: "300px", width: "100%", borderRadius: "25px", color: "black", position: "relative" }}>
                                    <div className={styles.fullycenter} style={{ width: "100%" }}>
                                        <p id="vestatusverbtop" style={{ textAlign: "center", fontSize: "30px", margin: "0px" }}>Event is</p>
                                        <h2 id="vestatus" style={{ margin: "0px", fontSize: "80px", textAlign: "center" }}>PENDING</h2>
                                        <p id="vestatusverb" style={{ textAlign: "center", fontSize: "30px", margin: "0px" }}>It will start in 0 days</p>
                                    </div>
                                </div>
                                <div>
                                    <h1 id="vename" className={styles.screenheading} style={{ marginTop: "20px", marginLeft: "20px", marginBottom: "0px" }}>Event Title</h1>
                                    <p id="vedesc" className={styles.font} style={{ fontSize: "30px", marginTop: "10px", fontWeight: "normal", marginLeft: "20px" }}>Event Description</p>
                                </div>
                                <div className={styles.divider}></div>
                                <div className={styles.doublegrid} style={{ gridTemplateColumns: "55px auto", marginBottom: "20px" }}>
                                    <span className="material-symbols-rounded" style={{ margin: "auto", fontSize: "40px" }}>pin_drop</span>
                                    <div>
                                        <h3 className={styles.font} style={{ fontSize: "23px", margin: "auto" }}>Event Location:</h3>
                                        <p id="veloc" className={styles.font} style={{ margin: "auto", marginLeft: "0px", fontSize: "25px" }}>Location</p>
                                    </div>
                                </div>

                                <div id="regdef" style={{ display: (mobile) ? "block" : "grid", marginBottom: "20px" }} className={styles.doublegrid}>
                                    <div className={styles.doublegrid} style={{ gridTemplateColumns: "55px auto", marginBottom: "10px" }}>
                                        <span className="material-symbols-rounded" style={{ margin: "auto", fontSize: "40px" }}>event_available</span>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "23px", margin: "auto" }}>Registration Start:</h3>
                                            <p id="veregstart" className={styles.font} style={{ margin: "auto", marginLeft: "0px", fontSize: "25px" }}>Date Time</p>
                                        </div>
                                    </div>
                                    <div className={styles.doublegrid} style={{ gridTemplateColumns: "55px auto", marginBottom: "10px" }}>
                                        <span className="material-symbols-rounded" style={{ margin: "auto", fontSize: "40px" }}>event_busy</span>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "23px", margin: "auto" }}>Registration End:</h3>
                                            <p id="veregend" className={styles.font} style={{ margin: "auto", marginLeft: "0px", fontSize: "25px" }}>Date Time</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.doublegrid} style={{ display: (mobile) ? "block" : "grid" }}>
                                    <div className={styles.doublegrid} style={{ gridTemplateColumns: "55px auto", marginBottom: "10px" }}>
                                        <span className="material-symbols-rounded" style={{ margin: "auto", fontSize: "40px" }}>event</span>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "23px", margin: "auto" }}>Event Start:</h3>
                                            <p id="vestart" className={styles.font} style={{ margin: "auto", marginLeft: "0px", fontSize: "25px" }}>Date Time</p>
                                        </div>
                                    </div>
                                    <div className={styles.doublegrid} style={{ gridTemplateColumns: "55px auto", marginBottom: "10px" }}>
                                        <span className="material-symbols-rounded" style={{ margin: "auto", fontSize: "40px" }}>event</span>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "23px", margin: "auto" }}>Event End:</h3>
                                            <p id="veend" className={styles.font} style={{ margin: "auto", marginLeft: "0px", fontSize: "25px" }}>Date Time</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.divider}></div>
                                <div className={styles.doublegrid} style={{ gridTemplateColumns: "50px auto", marginBottom: "15px" }}>
                                    <span className="material-symbols-rounded" style={{ margin: "auto", fontSize: "40px" }}>local_activity</span>
                                    <h3 id="vecost" className={styles.font} style={{ fontSize: "30px", margin: "auto", marginLeft: "0px" }}>Free Registration</h3>
                                </div>
                                <button id="eregistertbtn" className={styles.managebutton}>Register</button>
                            </div>

                            <div id="editeventsoverlay" className={styles.eventsoverlay}>
                                <button className={[styles.closebutton, styles.hover].join(" ")} onClick={() => closeEventOverlay("editeventsoverlay")}><span class="material-symbols-rounded" style={{ fontSize: "40px" }}>close</span></button>
                                <div id="eestatusdiv" className={[styles.font, styles.evstatusdiv].join(" ")} style={{ backgroundColor: "#ffff0072", color: "black" }}>
                                    <div className={styles.fullycenter} style={{ width: "100%" }}>
                                        <p id="eestatusverbtop" className={styles.evstatusverb}>Event is</p>
                                        <h2 id="eestatus" className={styles.evstatus}>PENDING</h2>
                                        <p id="eestatusverb" className={styles.evstatusverb}>It will start in ??? days</p>
                                    </div>
                                </div>
                                <div>
                                    <input id="ename" className={styles.slickttt} style={{ marginTop: "20px" }} placeholder="Event Title"></input>
                                    <textarea id="edesc" onInput={() => {
                                        document.getElementById("edesc").style.height = "auto";
                                        document.getElementById("edesc").style.height = (document.getElementById("edesc").scrollHeight) + "px";
                                    }} className={[styles.slickttt, styles.subslickttt].join(" ")} style={{ fontWeight: "normal", height: "100px" }} placeholder="Event Description"></textarea>
                                </div>
                                <div className={styles.divider}></div>
                                <div id="admineanalytics" style={{ display: "none" }}>
                                    <div className={styles.evlabelgrid}>
                                        <span className={["material-symbols-rounded", styles.evlabelicon].join(" ")}>visibility</span>
                                        <h3 id="eev" className={[styles.font, styles.evlabeltext].join(" ")}>0 Views</h3>
                                    </div>
                                    <div className={styles.evlabelgrid}>
                                        <span className={["material-symbols-rounded", styles.evlabelicon].join(" ")}>group</span>
                                        <h3 id="eea" className={[styles.font, styles.evlabeltext].join(" ")}>0 Attendees</h3>
                                    </div>
                                    <div className={styles.divider}></div>
                                </div>
                                <div id="eldoublegrid" className={styles.doublegrid} style={{ display: (mobile) ? "block" : "grid", gridTemplateColumns: "250px auto" }}>
                                    <h3 className={[styles.font, styles.evlabeltext].join(" ")} style={{ margin: "10px" }}>Event Location</h3>
                                    <input id="eloc" placeholder="Location" className={[styles.input, styles.evDGItem].join(" ")}></input>
                                </div>
                                <div id="evdoublegrid" className={styles.doublegrid} style={{ display: (mobile) ? "block" : "grid", gridTemplateColumns: "150px auto" }}>
                                    <h3 className={[styles.font, styles.evlabeltext].join(" ")} style={{ margin: "10px" }}>Visibility</h3>
                                    <select id="evselect" className={styles.input}>
                                        <option>Visible</option>
                                        <option>Hidden</option>
                                    </select>
                                </div>
                                <div id="erdtdoublegrid" className={styles.doublegrid} style={{ display: (mobile) ? "block" : "grid", gridGap: "15px" }}>
                                    <div>
                                        <h3 className={[styles.font, styles.evlabeltext].join(" ")} style={{ margin: "10px" }}>Registration Start</h3>
                                        <input onInput={() => updateEventStatus("editeventsoverlay", document.getElementById("erst").value, (document.getElementById("eret") == "") ? document.getElementById("erst").value : document.getElementById("eret").value, document.getElementById("est").value, document.getElementById("eet").value)} id="erst" type="datetime-local" className={styles.input}></input>
                                    </div>
                                    <div>
                                        <h3 className={[styles.font, styles.evlabeltext].join(" ")} style={{ margin: "10px" }}>Registration End</h3>
                                        <input onInput={() => updateEventStatus("editeventsoverlay", document.getElementById("eret").value, (document.getElementById("erst") == "") ? document.getElementById("eret").value : document.getElementById("erst").value, document.getElementById("est").value, document.getElementById("eet").value)} id="eret" type="datetime-local" className={styles.input}></input>
                                    </div>
                                </div>
                                <div id="etdtdoublegrid" className={styles.doublegrid} style={{ display: (mobile) ? "block" : "grid", gridGap: "15px" }}>
                                    <div>
                                        <h3 className={[styles.font, styles.evlabeltext].join(" ")} style={{ margin: "10px" }}>Event Start</h3>
                                        <input onInput={() => updateEventStatus("editeventsoverlay", document.getElementById("eret").value, document.getElementById("erst").value, document.getElementById("est").value, (document.getElementById("eet").value == "") ? document.getElementById("est").value : document.getElementById("eet").value)} id="est" type="datetime-local" className={styles.input}></input>
                                    </div>
                                    <div>
                                        <h3 className={[styles.font, styles.evlabeltext].join(" ")} style={{ margin: "10px" }}>Event End</h3>
                                        <input onInput={() => updateEventStatus("editeventsoverlay", document.getElementById("eret").value, document.getElementById("erst").value, (document.getElementById("est").value == "") ? document.getElementById("eet").value : document.getElementById("est").value, document.getElementById("eet").value)} id="eet" type="datetime-local" className={styles.input}></input>
                                    </div>
                                </div>
                                <div className={styles.divider}></div>
                                <div id="ecdgicon" className={styles.evlabelgrid}>
                                    <span className={["material-symbols-rounded", styles.evlabelicon].join(" ")}>local_activity</span>
                                    <div id="ecdoublegrid" className={styles.doublegrid} style={{ gridTemplateColumns: "auto" }}>
                                        <select id="ecselect" className={styles.input} onInput={() => {
                                            if (document.getElementById("ecselect").value == "Paid") {
                                                document.getElementById("eusdamount").style.display = "block";
                                                document.getElementById("ecdoublegrid").style.gridTemplateColumns = "auto 200px";
                                            } else {
                                                document.getElementById("eusdamount").style.display = "none";
                                                document.getElementById("ecdoublegrid").style.gridTemplateColumns = "auto";
                                            }
                                        }}>
                                            <option value="Free">Free Registration</option>
                                            <option value="Paid">Paid Registration</option>
                                        </select>
                                        <input id="eusdamount" className={styles.input} style={{ display: "none" }} placeholder="USD Amount"></input>
                                    </div>
                                </div>

                                <div className={styles.divider}></div>

                                <div id="submitdelgrid" className={styles.doublegrid} style={{ gridTemplateColumns: (mobile) ? "60% auto" : "70% auto", gridGap: "15px" }}>
                                    <button id="esubmitbtn" className={styles.managebutton} onClick={() => {
                                        if (document.getElementById("esubmitbtn").innerHTML == "Add Event") {
                                            axios({
                                                method: "post",
                                                url: "http://192.168.1.158:8080/createEvent",
                                                data: {
                                                    event: {
                                                        title: document.getElementById("ename").value,
                                                        description: document.getElementById("edesc").value,
                                                        location: document.getElementById("eloc").value,
                                                        visible: document.getElementById("evselect").value,
                                                        registrationStartDateTime: document.getElementById("erst").value,
                                                        registrationEndDateTime: document.getElementById("eret").value,
                                                        startDateTime: document.getElementById("est").value,
                                                        endDateTime: document.getElementById("eet").value,
                                                        cost: (document.getElementById("eusdamount").value == "") ? "Free" : parseFloat(document.getElementById("eusdamount").value).toFixed(2),
                                                    }
                                                }
                                            }).then((res) => {
                                                closeEventOverlay("editeventsoverlay", "add");
                                                refresh("events")
                                            }).catch((err) => {
                                                apiError(err)
                                            })
                                        } else if (document.getElementById("esubmitbtn").innerHTML = "Save Event") {
                                            console.log(selectedEvent)
                                            axios({
                                                method: "post",
                                                url: "http://192.168.1.158:8080/updateEvent?id=" + selectedEvent,
                                                data: {
                                                    event: {
                                                        title: document.getElementById("ename").value,
                                                        description: document.getElementById("edesc").value,
                                                        location: document.getElementById("eloc").value,
                                                        visible: document.getElementById("evselect").value,
                                                        registrationStartDateTime: document.getElementById("erst").value,
                                                        registrationEndDateTime: document.getElementById("eret").value,
                                                        startDateTime: document.getElementById("est").value,
                                                        endDateTime: document.getElementById("eet").value,
                                                        cost: (document.getElementById("eusdamount").value == "") ? "Free" : parseFloat(document.getElementById("eusdamount").value).toFixed(2),
                                                    },
                                                }
                                            }).then((res) => {
                                                closeEventOverlay("editeventsoverlay", "add");
                                                refresh("events")
                                            }).catch((err) => {
                                                console.log(err)
                                                apiError(err)
                                            })
                                        }
                                    }}>Add Event</button>
                                    <button onClick={() => {
                                        axios({
                                            method: "post",
                                            url: "http://192.168.1.158:8080/deleteEvent?id=" + selectedEvent,
                                        }).then((res) => {
                                            closeEventOverlay("editeventsoverlay");
                                            refresh("events")
                                        }).catch((err) => {
                                            apiError(err)
                                            console.log(err)
                                        })
                                    }} style={{ backgroundColor: "#ef3600b9" }} id="edelbtn" className={styles.managebutton}>Delete Event</button>
                                </div>
                            </div>

                        </div>
                        <div id="donations" className={styles.screen}>
                            <div className={styles.screenInner}>
                                <div className={styles.sidebarbuttonGrid} style={{ width: "300px" }}>
                                    <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span className={["material-symbols-rounded", styles.sidebarButtonIcon].join(" ")}>{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                    <h3 className={styles.screenheading}>Donations</h3>
                                    <div className={styles.loading} id="donationsloading"></div>
                                </div>

                                <div id="donationscontent">
                                    <div className={styles.bentoboxCont}>
                                        <div className={styles.viewbentobox}>
                                            <p id="donationsnumber">0</p>
                                            <p className={styles.viewbentoboxSub} id="donationssub">donations</p>
                                        </div>
                                        <div className={styles.viewbentobox} style={{ minWidth: "250px" }}>
                                            <p id="donationsamt">$0</p>
                                            <p className={styles.viewbentoboxSub}>raised</p>
                                        </div>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div className={styles.viewlist}>
                                        <div id="donationsnavbar" style={{ display: "grid", gridTemplateColumns: "auto 150px", gridGap: "10px" }}>
                                            <input className={styles.inputScreen} onInput={() => {
                                                const donatelist = document.getElementById("donatelist").children;
                                                for (let i = 0; i < donatelist.length; i++) {
                                                    if (donatelist[i].getAttribute("name").toLowerCase().includes(document.getElementById("donatesearch").value.toLowerCase())) {
                                                        donatelist[i].style.display = "block";
                                                    } else {
                                                        donatelist[i].style.display = "none";
                                                    }
                                                }
                                            }} style={{ backgroundColor: "rgba(255, 208, 128, 0.692)", marginBottom: "5px", WebkitMinLogicalWidth: "calc(100% - 16px)" }} id="donatesearch" type="date" placeholder="Search with date"></input>
                                            <button style={{ width: "100%", marginBottom: "5px" }} className={styles.managebutton} onClick={() => openOverlay("d")}>Donate</button>
                                        </div>
                                        <div id="donatelist">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="diffOverlayWrapper" className={styles.overlayGridWrapper}>
                    <div id="differenceOverlay" className={styles.overlayGrid}>
                        <div id="closeZigZag" className={styles.closeZigZag}>
                            <div className={styles.fullycenter}>
                                <h1 style={{ margin: "auto", marginBottom: "100px", fontSize: "40px", color: "#ce8400ff" }} className={styles.font}>Close</h1>
                                <div style={{ position: "relative" }} className={styles.hover} onClick={() => closeOverlay()}>
                                    <div className={[styles.blurredCircle, styles.fullycenter].join(" ")}></div>
                                    <span className={[styles.fullycenter, "material-symbols-rounded"].join(" ")} style={{ fontSize: "70px", color: "white" }}>close</span>
                                </div>
                            </div>
                        </div>
                        <div id="zigZag" className={styles.zigZag} style={{ '--lighterColor': "#ffe7bf", backgroundColor: "#ce8400ff", height: "100%", left: "100%", overflowY: "auto" }}>
                            <button className={[styles.closebutton, styles.hover].join(" ")} onClick={() => closeOverlay()} style={{ margin: "auto", marginTop: "10px", display: (mobile) ? "block" : "none" }}><span class="material-symbols-rounded" style={{ fontSize: "40px" }}>close</span></button>
                            <div id="donate" style={{ position: "relative", height: "100%" }}>
                                <div id="v1d" className={styles.zigZagView} style={{ "--maxWidth": "85%" }}>
                                    <h1 className={styles.header}>Select donation amount</h1>
                                    <p className={styles.subheader}>Your donation contributes to our goal of ensuring everyone in the DMV has food and shelter.</p>
                                    <input id="v1damt" type="currency" pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$" placeholder="5" className={styles.biginput} onInput={() => {
                                        //replace all non-numeric characters
                                        var actvalue = document.getElementById("v1damt").value.replace(/[^0-9.]/g, "");

                                        if (actvalue == "" || parseFloat(actvalue) == 0) {
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

                                    <button id="v1dcont" onClick={() => nextStep("d")} className={[styles.minibutton, styles.hover].join(" ")} style={{ backgroundColor: "rgba(0, 0, 0, 0.281)", opacity: 0, visibility: "hidden" }}>Continue</button>
                                </div>
                                <div id="v2d" className={styles.zigZagView} style={{ "--maxWidth": "55%" }}>
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
                                <div id="v4d" className={styles.fullycenter} style={{ width: (mobile) ? "85%" : "50%", left: "150%", opacity: 0 }}>
                                    <h1 className={styles.header}>Thank you!</h1>
                                    <p className={styles.subheader}>Your donation has been processed. You can close this by clicking the close button on the left.</p>
                                </div>
                            </div>
                            <div id="volunteer" style={{ position: "relative", height: "100%" }}>
                                <div id="v1v" className={styles.zigZagView} style={{ "--maxWidth": "60%" }}>
                                    <h1 className={styles.header}>Volunteer with Us</h1>
                                    <p className={styles.subheader}>Thank you for your interest in being a NourishDMV Volunteer! Please fill out this application and we'll get back to you as soon as possible.</p>
                                    <div className={styles.doublegrid} style={{ gridGap: "15px", marginTop: "50px", gridTemplateColumns: "auto auto auto" }}>
                                        <input className={styles.input} type='text' placeholder="Name"></input>
                                        <input className={styles.input} type="tel" placeholder="Phone Number"></input>
                                        <input className={styles.input} type="text" placeholder="Email"></input>
                                    </div>

                                    <select className={styles.input} placeholder="Name">
                                        <option>Area</option>
                                        <option>D.C.</option>
                                        <option>Maryland</option>
                                        <option>Virginia</option>
                                    </select>
                                    <div className={styles.doublegrid} style={{ gridTemplateColumns: "auto 150px", gridGap: "15px" }}>
                                        <input className={styles.input} type='text' placeholder="Address"></input>
                                        <input className={styles.input} type='text' placeholder="City"></input>
                                    </div>
                                    <textarea rows="3" className={styles.textarea} placeholder="Tell us about yourself"></textarea>
                                    <textarea className={styles.textarea} placeholder="Why do you want to volunteer with us?"></textarea>
                                    <textarea className={styles.input} placeholder="What tasks are your favorite to complete?"></textarea>
                                    <input className={styles.input} placeholder="How did you hear about us?"></input>
                                    <button onClick={() => nextStep("v")} className={[styles.minibutton, styles.hover].join(" ")} style={{ width: "100%", marginTop: "5px", marginBottom: "20px", backgroundColor: "rgb(0 0 0 / 42%)" }}>Submit</button>
                                </div>
                                <div id="v2v" className={styles.zigZagView} style={{ "--maxWidth": "85%" }}>
                                    <h1 className={styles.header}>Thank you!</h1>
                                    <p className={styles.subheader}>Your application has been processed, we'll be in touch soon! You can close this by clicking the close button {(mobile) ? "at the top" : "on the left"}.</p>
                                </div>
                            </div>
                            <div id="registerEvent" style={{ position: "relative", height: "100%", display: "none" }}>
                                <div id="v1re" className={styles.zigZagView} style={{ "--maxWidth": "50%" }}>
                                    <h1 id="v1rehead" className={styles.header}>Pay $0.00</h1>
                                    <h1 id="v1resubhead" className={styles.subheader}>to register for Event</h1>

                                    <input className={styles.input} type="number" style={{ marginTop: "50px" }} placeholder="Card Number"></input>
                                    <div className={styles.doublegrid} style={{ gridGap: "15px" }}>
                                        <input className={styles.input} type="" placeholder="CVV"></input>
                                        <input className={styles.input} placeholder="Exp Date"></input>
                                    </div>
                                    <div className={styles.doublegrid} style={{ gridGap: "15px" }}>
                                        <select className={styles.input} placeholder="Name" disabed>
                                            <option>United States</option>
                                        </select>
                                        <input className={styles.input} placeholder="Zip Code"></input>
                                    </div>
                                    <button onClick={() => nextStep("re")} className={[styles.minibutton, styles.hover].join(" ")} style={{ width: "100%", marginTop: "5px", backgroundColor: "rgb(0 0 0 / 42%)" }}>Register</button>
                                </div>
                                <div id="v2re" className={styles.fullycenter} style={{ width: "50%", left: "150%", opacity: 0 }}>
                                    <div class="loading" style={{ display: "block", opacity: "1" }}></div>
                                </div>
                                <div id="v3re" className={styles.fullycenter} style={{ width: "50%", left: "150%", opacity: 0 }}>
                                    <h1 className={styles.header}>You're all set.</h1>
                                    <p className={styles.subheader}>Your payment has been received and you have succesfully registered for the event.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="donationSuccessful" style={{ position: "absolute", width: "100vw", height: "100vh", backgroundColor: "#000000b8", opacity: "0", display: "none", left: "50%", top: "50%", transform: "translateX(-50%) translateY(-50%)" }}>
                    <div id="dsc1" className={styles.blurredCircle} style={{ position: "absolute", top: "50%", left: "50%", width: "0px", height: "0px", transform: "translateX(-50%) translateY(-50%)" }}></div>
                    <div id="dsc2" className={styles.blurredCircle} style={{ position: "absolute", top: "50%", left: "50%", width: "0px", height: "0px", transform: "translateX(-50%) translateY(-50%)" }}></div>
                    <div id="dsc3" className={styles.blurredCircle} style={{ position: "absolute", top: "50%", left: "50%", width: "0px", height: "0px", transform: "translateX(-50%) translateY(-50%)" }}></div>
                    <h1 id="dscamttext" className={styles.font} style={{ position: "absolute", margin: "0px", fontSize: "15vw", color: "white", top: "50%", left: "50%", opacity: "0", transform: "translateX(-50%) translateY(-50%)" }}><a id='dscamttextval'>0</a><a id="dscamttext2" style={{ fontSize: "5vw", opacity: 0, display: "block", textAlign: "center" }}>Thank you!</a></h1>
                </div>
                <div id="errorCard" className={styles.errorCard}>
                    <h2>Error</h2>
                    <p id="errorMessage">Error Message</p>
                </div>
            </main>
        </>
    );
}