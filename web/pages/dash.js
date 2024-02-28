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
    //from https://designtechworld.medium.com/create-a-custom-debounce-hook-in-react-114f3f245260
    const useDebounce = (callback, delay) => {
        const timeoutRef = useRef(null);

        useEffect(() => {
            // Cleanup the previous timeout on re-render
            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }, []);

        const debouncedCallback = (...args) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        };

        return debouncedCallback;
    };

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

    const [selectedEvent, setSelectedEvent] = useState("");
    const [currentOverlayType, setCurrentOverlayType] = useState("d");

    //this uuid will identify the user's session, keeping track of which view they are in and staying anonymous
    const [trackerEnabled, setTrackerEnabled] = useState(false);
    const [trackerUUID, setTrackerUUID] = useState("");
    const [viewState, setViewState] = useState("aag")

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
        } else if (isRightSwipe) {
            showSidebar();
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
                url: "http://localhost:8443/track",
                data: {
                    uuid: trackerUUID,
                    page: "Dashboard",
                    view: viewState
                }
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
        document.getElementById(view).scrollIntoView({ behavior: "smooth", block: "center" });
        router.push("/dash", "/dash?view=" + view, { shallow: true });
        refresh(view);
        setViewState(view);
        if (window.innerWidth <= 600) {
            hideSidebar();
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
                url: "http://localhost:8443/track",
                data: {
                    uuid: trackerUUID,
                    page: "Inactive",
                    view: ""
                }
            })
        }

        router.events.on("routeChangeStart", exitFunction);
        return () => {
            router.events.off("routeChangeStart", exitFunction);
        }
    }, []);

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
                if (view == "accounts") {
                    axios({
                        method: "get",
                        url: "http://localhost:8443/getAccounts",
                    }).then((res) => {
                        const accounts = res.data;
                        var dc = 0;
                        var md = 0;
                        var va = 0;
                        setAccounts(accounts);
                        const accountslist = document.getElementById("accountslist");
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
                            accountItem.appendChild(accountName);
                            accountslist.appendChild(accountItem);
                        }
                        document.getElementById("dccount").innerHTML = dc;
                        document.getElementById("mdcount").innerHTML = md;
                        document.getElementById("vacount").innerHTML = va;
                        anime({
                            targets: accountsloading,
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                        anime({
                            targets: "#accountscontent",
                            filter: "blur(0px)",
                            duration: 500,
                            scale: 1,
                            easing: 'easeInOutQuad',
                        })
                    }).catch((err) => {
                        apiError(err);
                        anime({
                            targets: accountsloading,
                            opacity: 0,
                            duration: 300,
                            easing: 'linear',
                        })
                    })
                } else if (view == "events") {
                    axios({
                        method: "get",
                        url: "http://localhost:8443/getEvents"
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
                            icon.style.fontSize = "30px";
                            icon.innerHTML = "chevron_right"
                            icon.style.margin = "auto"
                            icon.style.marginRight = "0px"
                            eventItem.className = [styles.itemEvents, styles.doublegrid].join(" ");

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
                                } else if (eventStatus == "In Progress") {
                                    inprog++;
                                    eventItem.style.backgroundColor = "#fbac29ff"
                                    eventItem.style.animation = styles.pulse + " 3s infinite linear"
                                } else if (eventStatus == "Ended") {
                                    ended++;
                                    eventItem.style.backgroundColor = "#f66d4bff"
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
                        url: "http://localhost:8443/getDonations"
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
                            accountName.innerHTML = new Date(account.date).toLocaleString() + " - " + formatUSD(account.amount);
                            accountName.style.margin = "0px";
                            accountName.className = styles.font;
                            accountItem.style.cursor = "default";
                            accountItem.className = styles.item;
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
                            document.getElementById("tdonssub").innerHTML = "donation"
                        } else {
                            document.getElementById("donationssub").innerHTML = "donations"
                            document.getElementById("tdonssub").innerHTML = "donations"
                        }
                        document.getElementById("tdonsnum").innerHTML = donationsToday;
                        document.getElementById("donationsnumber").innerHTML = accounts.length;
                        document.getElementById("donationsamt").innerHTML = formatUSD(amount);
                        document.getElementById("aagdonsamt").innerHTML = formatUSD(amount);
                        document.getElementById("tdonsamt").innerHTML = formatUSD(amountToday);
                        document.getElementById("maagdonsamt").innerHTML = formatUSD(amountThisMonth);
                        document.getElementById("maagdonsnum").innerHTML = donationsThisMonth;
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
                    axios({
                        method: "get",
                        url: "http://localhost:8443/getTotalUsers"
                    }).then((res) => {
                        var users = res.data;
                        document.getElementById("totaluserstd").innerHTML = users.today;
                        document.getElementById("totalusersm").innerHTML = users.month;
                        document.getElementById("totalusers").innerHTML = users.all;
                    })
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
        eventsoverlay.style.display = "block";
        if (!mobileRef.current) {
            eventsoverlay.style.height = "65%"
        }
        anime({
            targets: eventsoverlay,
            scale: 1,
            opacity: 1,
            duration: 500,
            filter: "blur(0px)",
            easing: 'easeInOutQuad'
        })

        console.log(id)

        if (id) {
            setSelectedEvent(id);
            axios({
                method: "get",
                url: "http://localhost:8443/getEvent?id=" + id
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
                                push("/accounts?view=Sign+In")
                            } else {
                                axios({
                                    method: "post",
                                    url: "http://localhost:8443/registerEvent",
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
                            document.getElementById("eregistertbtn").onclick = () => push("/accounts?view=Sign+In&redirect=" + encodeURIComponent("/dash?view=events&eventid=" + id));
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
                                url: "http://localhost:8443/unregisterEvent",
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
            scale: 1.2,
            opacity: 0,
            filter: "blur(10px)",
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function (anim) {
                document.getElementById(overlayId).style.display = "none";
                document.getElementById("events").style.overflowY = "auto";
                if (!mobileRef.current) {
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

    useEffect(() => {
        anime({
            targets: "#v" + step + currentOverlayType,
            left: "50%",
            opacity: 1,
            easing: 'easeInOutQuad'
        })

        if (currentOverlayType == "d") {
            if (step == 2) {
                var amount = formatUSD(document.getElementById("v1damt").value);
                document.getElementById("v2dh").innerHTML = "Donate " + amount;
            } else if (step == 3) {
                // "process" the donation
                axios({
                    method: "post",
                    url: "http://localhost:8443/addDonation",
                    data: {
                        amount: parseFloat(document.getElementById("v1damt").value).toFixed(2),
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
                        document.getElementById("dscamttextval").innerHTML = formatUSD(document.getElementById("v1damt").value);
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
                    url: "http://localhost:8443/getEvent?id=" + selectedEvent
                }).then((res) => {
                    document.getElementById("v1rehead").innerHTML = "Pay $" + res.data.event.cost + " to register for " + res.data.event.title;
                }).catch((err) => {
                    apiError(err);
                })
            } else if (step == 2) {
                axios({
                    method: "post",
                    url: "http://localhost:8443/registerEvent",
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
        } else {
            anime({
                targets: "#v" + step + type,
                left: "-100%",
                opacity: 0,
                easing: 'easeInOutQuad',
            })
            setStep(step + 1);
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
        } else {
            document.getElementById("content").style.gridTemplateColumns = "300px auto";
        }
        document.getElementById("content").style.left = "50%";
        document.getElementById("errorCard").style.display = "none"

        setSidebarOpen(true);
    }

    function hideSidebar() {
        console.log(mobileRef.current)
        const parentWidth = document.getElementById("mainelem").clientWidth;
        var left = (parentWidth / 2) - 325;
        if (window.innerWidth <= 600) {
            document.getElementById("content").style.gridTemplateColumns = "245px 100%";
            left = (parentWidth / 2) - 270;
        } else {
            document.getElementById("content").style.gridTemplateColumns = "300px 100%";
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
                url: "http://localhost:8443/track",
                data: {
                    uuid: trackerUUID,
                    page: "Dashboard",
                    view: "donationFlow"
                }
            })
            volunteer.style.display = "none";
        } else if (type == "v") {
            volunteer.style.display = "block";
            axios({
                method: "post",
                url: "http://localhost:8443/track",
                data: {
                    uuid: trackerUUID,
                    page: "Dashboard",
                    view: "volunteerFlow"
                }
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
        if (mobile) {
            document.getElementById("differenceOverlay").style.display = "block";
            document.getElementById("closeZigZag").style.display = "none"
            document.getElementById("differenceOverlay").style.width = "115%";
            anime({
                targets: "#zigZag",
                left: "-10%",
                duration: 1000,
                easing: 'easeInOutQuad',
                complete: function (anim) {
                    nextStep(type);
                }
            })
        } else {
            document.getElementById("differenceOverlay").style.display = "grid";
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


    }

    function closeOverlay() {
        setStep(0);
        axios({
            method: "post",
            url: "http://localhost:8443/track",
            data: {
                uuid: trackerUUID,
                page: "Dashboard",
                view: viewState
            }
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
                document.getElementById("differenceOverlay").style.display = "none";
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
            document.getElementById("splashscreenIntro").style.display = "block";
            document.body.style.overflowY = "hidden"
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
                url: "http://localhost:8443/getAccount?uuid=" + account
            }).then((res) => {
                setAccountData(res.data);
                document.getElementById("acctName").innerHTML = res.data.name.split(" ")[0];
                if (res.data.role == "Admin") {
                    setAdminView(true);
                    setInterval(() => {
                        if (viewState == "aag") {
                            axios({
                                method: "get",
                                url: "http://localhost:8443/getTrackerStats"
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
                }
            }).catch((err) => {
                console.log(err);
                if (err.response) {
                    if (err.response.data == "Account not found.") {
                        Cookies.remove("account");
                        setAccount("");
                        push("/accounts?view=Sign+In")
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
            if (window.innerWidth <= 600) {
                setMobile(true);
                console.log("mobile")
                document.getElementById("splashscreenIntro").src = "anim_ss_ndmv_intro_mobile.mp4";
                document.getElementById("splashscreenOutro").src = "anim_ss_ndmv_outro_mobile.mp4";
                hideSidebar();
            }

            if (Cookies.get("account") != undefined) {
                setAccount(Cookies.get("account"));
            }

            refresh("accounts");
            refresh("events");
            refresh("donations");

            if (Cookies.get("trackerUUID") == undefined && trackerUUID == "") {
                setTrackerUUID(uuid());
            } else if (Cookies.get("trackerUUID") != undefined && trackerUUID == "") {
                setTrackerUUID(Cookies.get("trackerUUID"));
            }

            window.scrollTo(0, 0);
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
                        }
                    }
                })
                anime({
                    targets: '#content',
                    opacity: 1,
                    duration: 200,
                    easing: 'linear'
                })
            }, 500)
        }
    }, [router.isReady])

    return (
        <>
            <Head>
                <title>Dashboard | NourishDMV</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" />
            </Head>
            <main id="mainelem" style={{ overflow: 'hidden' }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                <video id="splashscreenOutro" playsInline preload="auto" muted className="splashScreen"><source src="anim_ss_ndmv_outro.mp4" type="video/mp4" /></video>
                <video id="splashscreenIntro" playsInline muted className="splashScreen" style={{ display: "none", opacity: 0 }}><source src="anim_ss_ndmv_intro.mp4" type="video/mp4" /></video>
                <div id="content" style={{ opacity: 0, overflow: "visible", transition: "all ease 0.5s" }} className={styles.sidebarContent}>
                    <div style={{ padding: "15px", width: "100%" }}>
                        <div className={styles.sidebar}>
                            <div style={{ padding: "15px" }}>
                                <div id="navbtns">
                                    <button id="aagbtn" className={styles.sidebarItem} onClick={() => switchView("aag")}>At a glance</button>
                                    <button id="accountsbtn" className={styles.sidebarItem} onClick={() => switchView("accounts")} style={{ display: (adminView) ? "block" : "none" }}>Accounts</button>
                                    <button id="blogbtn" className={styles.sidebarItem} style={{ display: "none" }} onClick={() => switchView("blog")}>Blog</button>
                                    <button id="eventsbtn" className={styles.sidebarItem} onClick={() => switchView("events")}>Events</button>
                                    <button id="donationsbtn" className={styles.sidebarItem} onClick={() => switchView("donations")}>Donations</button>
                                </div>
                                <button className={styles.sidebarItem} onClick={() => push("/accounts?view=Sign+In")} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 50, zIndex: "100", width: (mobileRef.current) ? "230px" : "280px", display: (account == "") ? "block" : "none" }}>Sign In</button>
                                <div className={styles.sidebarItem} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 50, zIndex: "100", width: "280px", display: (account != "") ? "block" : "none", backgroundColor: "rgba(255, 208, 128, 0.692)", border: "1px solid #e3ab4a", cursor: "initial" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "60px auto 50px", padding: "10px", height: "50px" }}>
                                        <div id="picture" style={{ backgroundColor: "#e3ab4a", width: "50px", height: "100%", borderRadius: "15px" }}>
                                        </div>
                                        <h3 style={{ margin: "auto", marginLeft: "0px", color: "#e3ab4a", textAlign: "left" }} id="acctName">Name</h3>
                                        <div id="logout" className={styles.hover} onClick={() => {
                                            Cookies.remove("account");
                                            setAccount("");
                                            push("/accounts?view=Sign+In")
                                        }} style={{ backgroundColor: "#e3ab4a", position: "relative", width: "40px", height: "40px", borderRadius: "15px", margin: "auto", marginRight: "0px" }}>
                                            <span className={["material-symbols-rounded", styles.fullycenter].join(" ")} style={{ fontSize: "30px", margin: "auto" }}>logout</span>
                                        </div>
                                    </div>
                                </div>
                                <Image style={{ bottom: 10, position: "absolute", left: "50%", transform: "translateX(-50%)" }} src="logo.svg" alt="NourishDMV Logo" height={45} width={200} />
                            </div>
                        </div>
                    </div>
                    <div id="screens" style={{ overflowX: "hidden", overflowY: "hidden", padding: "15px" }} onClick={() => {
                        if (mobile && sidebarOpen) {
                            hideSidebar();
                            setUserSidebarOpen(false);
                        }
                    }}>
                        <div id="aag" className={styles.screen} style={{ marginTop: "0px" }}>
                            <div style={{ padding: "20px" }}>
                                <div className={styles.doublegrid} style={{ width: "430px", gridTemplateColumns: (mobile) ? "auto" : "70px auto" }}>
                                    <button style={{ margin: (mobile) ? "0" : "auto" }} className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span style={{ fontSize: "30px", color: "rgb(227, 171, 74)" }} className="material-symbols-rounded">{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                    <h3 className={styles.screenheading}>At a glance</h3>
                                </div>
                                <div className={styles.divider}></div>
                                <div id="admin" style={{ display: (adminView) ? "block" : "none" }}>
                                    <h4 className={styles.screensubheading} style={{ fontSize: "40px" }}>Today</h4>
                                    <div style={{ margin: "20px" }}>
                                        <div className={styles.bentoboxShorter} style={{ float: "inline-start", width: "500px", height: "98px", border: "dashed 1px rgb(214, 164, 78)", backgroundColor: "rgba(255, 208, 128, 0.692)" }}>
                                            <div className={styles.fullycenter} style={{ width: "100%" }}>
                                                <p className={styles.font} style={{ fontSize: "30px", textAlign: "center", color: "rgba(0, 0, 0, 0.300)", fontWeight: "bold" }}>No event</p>
                                            </div>
                                        </div>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "250px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="tdonsnum">0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }} id="tdonssub">donations</p>
                                        </div>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "250px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="tdonsamt">$0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>donated</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="totaluserstd">0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>total users</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>new users</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>returning users</p>
                                        </div>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div style={{ position: "relative" }}>
                                        <h4 className={styles.screensubheading} style={{ fontSize: "40px" }}>Real-time User Activity Monitor</h4>
                                        <div style={{ margin: "20px" }}>
                                            <div className={styles.bentoboxShorter} style={{ float: "inline-start", backgroundColor: "#ff00008a", animation: styles.pulseLive2 + " 3s infinite linear" }}>
                                                <p style={{ margin: "0px", textAlign: "center" }} id="activeusersnum">0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>total active users</p>
                                            </div>
                                            <div className={styles.bentoboxShorter} style={{ width: "300px", height: "350px", float: "inline-start", backgroundColor: "#ff00008a", animation: styles.pulseLive2 + " 3s infinite linear" }}>
                                                <p style={{ margin: "0px", textAlign: "center" }}><a id="homepagenum">0</a> <a style={{ fontWeight: "normal", fontSize: "30px" }}>homepage</a></p>
                                                <div className={styles.divider} style={{ borderTop: "0.5px solid rgb(255 255 255 / 34%)", marginTop: "10px", marginBottom: "10px", borderBottom: "0.5px solid rgb(255 255 255 / 34%)" }}></div>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="heronum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Hero</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="goalgridnum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Statistics/Goal</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="howhelplistnum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>How we help</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="makedifferencenum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Difference Together</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="getintouchnum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Get In Touch</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="footernum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Footer</a></p>
                                            </div>
                                            <div className={styles.bentoboxShorter} style={{ width: "300px", height: "auto", float: "inline-start", backgroundColor: "#ff00008a", animation: styles.pulseLive2 + " 3s infinite linear" }}>
                                                <p style={{ margin: "0px", textAlign: "center" }}><a id="accountsnum">0</a> <a style={{ fontWeight: "normal", fontSize: "30px" }}>accounts</a></p>
                                                <div className={styles.divider} style={{ borderTop: "0.5px solid rgb(255 255 255 / 34%)", marginTop: "10px", marginBottom: "10px", borderBottom: "0.5px solid rgb(255 255 255 / 34%)" }}></div>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="landingnum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Landing</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="innum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Sign In</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="upnum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Sign Up</a></p>
                                            </div>
                                            <div className={styles.bentoboxShorter} style={{ width: "300px", height: "350px", backgroundColor: "#ff00008a", animation: styles.pulseLive2 + " 3s infinite linear" }}>
                                                <p style={{ margin: "0px", textAlign: "center" }}><a id="dashboardnum">0</a> <a style={{ fontWeight: "normal", fontSize: "30px" }}>dashboard</a></p>
                                                <div className={styles.divider} style={{ borderTop: "0.5px solid rgb(255 255 255 / 34%)", marginTop: "10px", marginBottom: "10px", borderBottom: "0.5px solid rgb(255 255 255 / 34%)" }}></div>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="aagnum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>At a glance</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="eventsnum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Events</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="eventdetailsnum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Event Details</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="donationsnum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Donations</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="donationflownum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Donation Flow</a></p>
                                                <p style={{ margin: "0px", fontSize: "35px", textAlign: "center" }}><a id="volunteerflownum">0</a> <a style={{ fontWeight: "normal", fontSize: "25px" }}>Volunteer Flow</a></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <h4 className={styles.screensubheading} style={{ fontSize: "40px" }}>{new Date().toLocaleString('default', { month: 'long' })}</h4>
                                    <div style={{ margin: "20px" }}>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "300px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="maagdonsamt">$0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>donated</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="maagdonsnum">0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>donations</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>{accounts.length}</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>new accounts</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>event attendees</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="totalusersm">0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>total users</p>
                                        </div>
                                    </div>
                                    <h4 className={styles.screensubheading}>Retention</h4>
                                    <div style={{ margin: "20px" }}>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "300px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>5,554</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>new users</p>
                                        </div>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "300px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>2,345</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>returning users</p>
                                        </div>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <h4 className={styles.screensubheading} style={{ fontSize: "40px" }}>All Time</h4>
                                    <div style={{ margin: "20px" }}>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "300px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="aagdonsamt">$0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>donated</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>volunteers</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>{accounts.length}</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>accounts</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="totalusers">0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>total users</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>homepage views</p>
                                        </div>
                                    </div>

                                    <h4 className={styles.screensubheading}>Demographics</h4>
                                    <div style={{ margin: "20px" }}>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "300px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="aagdonsamt">40%</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>from Maryland</p>
                                        </div>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "300px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="aagdonsamt">30%</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>from DC</p>
                                        </div>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "300px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="aagdonsamt">30%</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>from Virginia</p>
                                        </div>
                                        <br />
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "300px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="aagdonsamt">77%</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>using a mobile device</p>
                                        </div>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "300px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="aagdonsamt">23%</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>using a desktop device</p>
                                        </div>
                                    </div>
                                    <h4 className={styles.screensubheading}>Events</h4>
                                    <div style={{ margin: "20px" }}>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>{eventsLength}</p>
                                            <p style={{ margin: "0px", textAlign: "center", fontWeight: "normal", fontSize: "30px" }}>events</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p id="vacount" style={{ margin: "0px", textAlign: "center" }}>{eventAttendees}</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>event attendees</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="non-admin" style={{ display: (!adminView) ? "block" : "none" }}>
                                    <div id="youSection" style={{ display: (account == "") ? "none" : "block" }}>
                                        <h4 className={styles.screensubheading}>You</h4>
                                        <div style={{ margin: "20px" }}>
                                            <div className={styles.bentoboxShorter} style={{ width: "350px" }}>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>role</p>
                                                <p style={{ margin: "0px", textAlign: "center" }}>SUPPORTER</p>
                                            </div>
                                            <div className={styles.bentoboxShorter}>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>joined</p>
                                                <p style={{ margin: "0px", textAlign: "center" }}>2/23/24</p>
                                            </div>
                                            <div className={styles.bentoboxShorter}>
                                                <p style={{ margin: "0px", textAlign: "center" }}>$0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>donated</p>
                                            </div>
                                            <div className={styles.bentoboxShorter}>
                                                <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>volunteer hours</p>
                                            </div>
                                            <div className={styles.bentoboxShorter}>
                                                <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>events attended</p>
                                            </div>
                                        </div>
                                        <div className={styles.divider}></div>
                                    </div>

                                    <h3 className={styles.screensubheading} style={{ color: "black", marginBottom: "20px", marginTop: "10px", textAlign: "center" }}>Make a difference in <a style={{ backgroundColor: "#fbac29ff" }}>your community</a></h3>
                                    <div className={styles.doublegrid} style={{ width: (mobile) ? "100%" : "70%", margin: "auto", display: (mobile) ? "block" : "grid" }}>
                                        <button className={[styles.button, styles.hover].join(" ")} style={{ margin: "auto", backgroundColor: "#f66d4bff", marginBottom: "15px", fontSize: "40px", fontWeight: "bold", display: "block", width: "100%" }} onClick={() => openOverlay("d")}>Donate</button>
                                        <button className={[styles.button, styles.hover].join(" ")} style={{ margin: "auto", backgroundColor: "#fbe85dff", color: "black", marginBottom: "15px", fontSize: "40px", fontWeight: "bold", display: "block", width: "100%" }} onClick={() => openOverlay("v")}>Join our team</button>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div style={{ display: "none" }}>
                                        <h4 className={styles.screensubheading}>Your Upcoming Events</h4>
                                        <div id="upcomingeventsl" style={{ margin: "20px" }}>
                                            <div className={styles.card} style={{ height: "130px" }}>
                                                <div className={styles.fullycenter} style={{ width: "100%" }}>
                                                    <p className={styles.font} style={{ fontSize: "25px", textAlign: "center", color: "rgba(0, 0, 0, 0.300)", fontWeight: "bold" }}>You aren't apart of any events</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className={styles.screensubheading}>Recent Events</h4>
                                        <div id="othereventsl" style={{ margin: "20px", overflowX: "auto" }}>
                                            <div className={styles.card}>
                                                <div className={styles.fullycenter} style={{ width: "100%" }}>
                                                    <p className={styles.font} style={{ fontSize: "30px", textAlign: "center", color: "rgba(0, 0, 0, 0.300)", fontWeight: "bold" }}>No events to show</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div id="accounts" className={styles.screen} style={{ display: (adminView) ? "block" : "none" }}>
                            <div style={{ padding: "20px" }}>
                                <div className={styles.doublegrid} style={{ width: "300px", gridTemplateColumns: "70px auto 50px" }}>
                                    <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span style={{ fontSize: "30px", color: "rgb(227, 171, 74)" }} className="material-symbols-rounded">{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                    <h3 className={styles.screenheading}>Accounts</h3>
                                    <div className={styles.loading} id="accountsloading"></div>
                                </div>
                                <div id="accountscontent">
                                    <div style={{ margin: "20px" }}>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>{accounts.length}</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>accounts</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>volunteers</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>donators</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p id="dccount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>from DC</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p id="mdcount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", textAlign: "center", fontWeight: "normal", fontSize: "30px" }}>from Maryland</p>
                                        </div>
                                        <div className={styles.bentoboxShorter}>
                                            <p id="vacount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>from Virginia</p>
                                        </div>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div id="accountslist" style={{ width: "70%", margin: "auto" }}>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="blog" className={styles.screen} style={{ display: "none" }}>
                            <div style={{ padding: "20px" }}>
                                <div id="v1b">
                                    <div className={styles.doublegrid} style={{ width: "300px", gridTemplateColumns: "70px auto 50px" }}>
                                        <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span style={{ fontSize: "30px", color: "rgb(227, 171, 74)" }} className="material-symbols-rounded">{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                        <h3 className={styles.screenheading}>Blog</h3>
                                        <div className={styles.loading} id="blogloading"></div>
                                    </div>

                                    <div id="blogcontent">
                                        <div style={{ margin: "20px" }}>
                                            <div className={styles.bentoboxShorter}>
                                                <p id="blogpostsnum" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>posts</p>
                                            </div>
                                        </div>
                                        <div className={styles.divider}></div>
                                        <div style={{ width: "80%", margin: "auto" }}>
                                            <div id="eventsnavbar" style={{ gridTemplateColumns: (mobile) ? "60% auto" : "75% auto" }} className={styles.doublegrid}>
                                                <input className={styles.input} style={{ backgroundColor: "rgba(255, 208, 128, 0.692)" }} id="blogsearch" placeholder="Search with title"></input>
                                                <button style={{ width: "100%" }} className={styles.managebutton} onClick={() => openBlogPostViewer()}>New Post</button>
                                            </div>
                                            <div id="bloglist">

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="v2b" style={{ display: "none", transform: "scale(0.5)", opacity: 0, filter: "blur(50px)" }}>
                                    <div className={styles.doublegrid} style={{ width: "600px", gridTemplateColumns: "70px auto 50px" }}>
                                        <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => closeBlogPostViewer()} id="openCloseSidebarAcc"><span style={{ fontSize: "30px", color: "rgb(227, 171, 74)" }} className="material-symbols-rounded">arrow_back</span></button>
                                        <h3 className={styles.screenheading}>Blog Post Viewer</h3>
                                        <div className={styles.loading} id="blogpostloading"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="events" className={styles.screen} style={{ position: "relative" }}>
                            <div style={{ padding: "20px" }}>
                                <div id="affectbyeoverlay">
                                    <div className={styles.doublegrid} style={{ width: "300px", gridTemplateColumns: "70px auto 50px" }}>
                                        <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span style={{ fontSize: "30px", color: "rgb(227, 171, 74)" }} className="material-symbols-rounded">{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                        <h3 className={styles.screenheading}>Events</h3>
                                        <div className={styles.loading} id="eventsloading"></div>
                                    </div>
                                    <div id="eventscontent">
                                        <div style={{ margin: "20px" }}>
                                            <div className={styles.bentoboxShorter} style={{ display: (adminView) ? "inline-block" : "none" }}>
                                                <p id="attcount" style={{ margin: "0px", textAlign: "center" }}>{eventAttendees}</p>
                                                <p style={{ margin: "0px", textAlign: "center", fontWeight: "normal", fontSize: "30px" }}>total attendees</p>
                                            </div>
                                            <div className={styles.bentoboxShorter}>
                                                <p id="eventsamt" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>events</p>
                                            </div>
                                            <div className={styles.bentoboxShorter} style={{ backgroundColor: "#ffff0072", color: "black" }}>
                                                <p id="pendingcount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>pending</p>
                                            </div>
                                            <div className={styles.bentoboxShorter} style={{ backgroundColor: "#fbac29ff", animation: styles.pulse + " 3s infinite linear" }}>
                                                <p id="inprogcount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>in progress</p>
                                            </div>
                                            <div className={styles.bentoboxShorter} style={{ backgroundColor: "#f66d4bff" }}>
                                                <p id="endedcount" style={{ margin: "0px", textAlign: "center" }}>0</p>
                                                <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>ended</p>
                                            </div>
                                        </div>
                                        <div className={styles.divider}></div>
                                        <div id="eventsattend">
                                            <h3 className={styles.screenheading} style={{ fontSize: "40px", marginLeft: "5px" }}>Your Events</h3>
                                            <div id="eventsattendlist" style={{ width: "80%", margin: "auto", marginTop: "20px" }}></div>
                                            <div className={styles.divider}></div>
                                        </div>

                                        <div style={{ width: "80%", margin: "auto" }}>
                                            <div id="eventsnavbar" style={{ gridTemplateColumns: (mobile) ? "auto 200px" : "auto 230px", gridGap: "15px", display: (adminView) ? "grid" : "block" }} className={styles.doublegrid}>
                                                <input onInput={() => {
                                                    const children = document.getElementById("eventslist").children;
                                                    for (let i = 0; i < children.length; i++) {
                                                        if (children[i].getAttribute("name").toLowerCase().includes(document.getElementById("eventssearch").value.toLowerCase())) {
                                                            children[i].style.display = "grid";
                                                        } else {
                                                            children[i].style.display = "none";
                                                        }
                                                    }
                                                }} className={styles.inputScreen} type="search" style={{ backgroundColor: "rgba(255, 208, 128, 0.692)", color: "rgb(227, 171, 74)" }} id="eventssearch" placeholder="Search with title"></input>
                                                <button style={{ width: "100%", display: (adminView) ? "block" : "none" }} className={styles.managebutton} onClick={() => openEventOverlay("editeventsoverlay")}>New Event</button>
                                            </div>
                                            <div id="eventslist"></div>
                                        </div>
                                        <div id="non-adminview" style={{ display: (adminView) ? "none" : "block" }}>
                                            <div id="nonadmineventslist"></div>
                                        </div>
                                    </div>
                                </div>

                                <div id="vieweventsoverlay" style={{ transform: "translateX(-50%) translateY(-50%) scale(1.2)", filter: "blur(10px)", opacity: 0 }} className={[styles.fullycenter, styles.eventsoverlay].join(" ")}>
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

                                <div id="editeventsoverlay" style={{ transform: "translateX(-50%) translateY(-50%) scale(1.2)", marginTop: (mobile) ? "220px" : "0px", filter: "blur(10px)", opacity: 0 }} className={[styles.fullycenter, styles.eventsoverlay].join(" ")}>
                                    <button className={[styles.closebutton, styles.hover].join(" ")} onClick={() => closeEventOverlay("editeventsoverlay")}><span class="material-symbols-rounded" style={{ fontSize: "40px" }}>close</span></button>
                                    <div id="eestatusdiv" className={styles.font} style={{ backgroundColor: "#ffff0072", height: "300px", width: "100%", borderRadius: "25px", color: "black", position: "relative" }}>
                                        <div className={styles.fullycenter} style={{ width: "100%" }}>
                                            <p id="eestatusverbtop" style={{ textAlign: "center", fontSize: "30px", margin: "0px" }}>Event is</p>
                                            <h2 id="eestatus" style={{ margin: "0px", fontSize: "80px", textAlign: "center" }}>PENDING</h2>
                                            <p id="eestatusverb" style={{ textAlign: "center", fontSize: "30px", margin: "0px" }}>It will start in ??? days</p>
                                        </div>
                                    </div>
                                    <div>
                                        <input id="ename" className={styles.slickttt} style={{ marginTop: "20px" }} placeholder="Event Title"></input>
                                        <textarea id="edesc" onInput={() => {
                                            document.getElementById("edesc").style.height = "auto";
                                            document.getElementById("edesc").style.height = (document.getElementById("edesc").scrollHeight) + "px";
                                        }} className={styles.slickttt} style={{ fontSize: "30px", fontWeight: "normal", height: "100px" }} placeholder="Event Description"></textarea>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div id="admineanalytics" style={{ display: "none" }}>
                                        <div className={styles.doublegrid} style={{ gridTemplateColumns: "50px auto", marginBottom: "15px" }}>
                                            <span className="material-symbols-rounded" style={{ margin: "auto", fontSize: "40px" }}>visibility</span>
                                            <h3 id="eev" className={styles.font} style={{ fontSize: "30px", margin: "auto", marginLeft: "0px" }}>0 Views</h3>
                                        </div>
                                        <div className={styles.doublegrid} style={{ gridTemplateColumns: "50px auto", marginBottom: "15px" }}>
                                            <span className="material-symbols-rounded" style={{ margin: "auto", fontSize: "40px" }}>group</span>
                                            <h3 id="eea" className={styles.font} style={{ fontSize: "30px", margin: "auto", marginLeft: "0px" }}>0 Attendees</h3>
                                        </div>
                                        <div className={styles.divider}></div>
                                    </div>
                                    <div id="eldoublegrid" className={styles.doublegrid} style={{ gridTemplateColumns: "300px auto" }}>
                                        <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Event Location</h3>
                                        <input id="eloc" placeholder="Location" className={styles.input}></input>
                                    </div>
                                    <div id="evdoublegrid" className={styles.doublegrid} style={{ gridTemplateColumns: "150px auto" }}>
                                        <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Visibility</h3>
                                        <select id="evselect" className={styles.input}>
                                            <option>Visible</option>
                                            <option>Hidden</option>
                                        </select>
                                    </div>
                                    <div id="erdtdoublegrid" className={styles.doublegrid} style={{ display: (mobile) ? "block" : "grid", gridGap: "15px" }}>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Registration Start</h3>
                                            <input onInput={() => updateEventStatus("editeventsoverlay", document.getElementById("erst").value, (document.getElementById("eret") == "") ? document.getElementById("erst").value : document.getElementById("eret").value, document.getElementById("est").value, document.getElementById("eet").value)} id="erst" type="datetime-local" className={styles.input}></input>
                                        </div>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Registration End</h3>
                                            <input onInput={() => updateEventStatus("editeventsoverlay", document.getElementById("eret").value, (document.getElementById("erst") == "") ? document.getElementById("eret").value : document.getElementById("erst").value, document.getElementById("est").value, document.getElementById("eet").value)} id="eret" type="datetime-local" className={styles.input}></input>
                                        </div>
                                    </div>
                                    <div id="etdtdoublegrid" className={styles.doublegrid} style={{ display: (mobile) ? "block" : "grid", gridGap: "15px" }}>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Event Start</h3>
                                            <input onInput={() => updateEventStatus("editeventsoverlay", document.getElementById("eret").value, document.getElementById("erst").value, document.getElementById("est").value, (document.getElementById("eet").value == "") ? document.getElementById("est").value : document.getElementById("eet").value)} id="est" type="datetime-local" className={styles.input}></input>
                                        </div>
                                        <div>
                                            <h3 className={styles.font} style={{ fontSize: "30px", margin: "10px" }}>Event End</h3>
                                            <input onInput={() => updateEventStatus("editeventsoverlay", document.getElementById("eret").value, document.getElementById("erst").value, (document.getElementById("est").value == "") ? document.getElementById("eet").value : document.getElementById("est").value, document.getElementById("eet").value)} id="eet" type="datetime-local" className={styles.input}></input>
                                        </div>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div id="ecdgicon" className={styles.doublegrid} style={{ gridTemplateColumns: "50px auto", marginBottom: "15px" }}>
                                        <span className="material-symbols-rounded" style={{ margin: "auto", fontSize: "40px" }}>local_activity</span>
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
                                                    url: "http://localhost:8443/createEvent",
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
                                                    url: "http://localhost:8443/updateEvent?id=" + selectedEvent,
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
                                                url: "http://localhost:8443/deleteEvent?id=" + selectedEvent,
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
                        </div>
                        <div id="donations" className={styles.screen}>
                            <div style={{ padding: "20px" }}>
                                <div className={styles.doublegrid} style={{ width: "300px", gridTemplateColumns: "70px auto 50px" }}>
                                    <button className={[styles.sidebarbutton, styles.hover].join(" ")} onClick={() => toggleSidebar()} id="openCloseSidebarAcc"><span style={{ fontSize: "30px", color: "rgb(227, 171, 74)" }} className="material-symbols-rounded">{(sidebarOpen) ? "left_panel_close" : "left_panel_open"}</span></button>
                                    <h3 className={styles.screenheading}>Donations</h3>
                                    <div className={styles.loading} id="donationsloading"></div>
                                </div>

                                <div id="donationscontent">
                                    <div style={{ margin: "20px" }}>
                                        <div className={styles.bentoboxShorter}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="donationsnumber">0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }} id="donationssub">donations</p>
                                        </div>
                                        <div className={styles.bentoboxShorter} style={{ width: "auto", minWidth: "250px" }}>
                                            <p style={{ margin: "0px", textAlign: "center" }} id="donationsamt">$0</p>
                                            <p style={{ margin: "0px", fontWeight: "normal", fontSize: "30px", textAlign: "center" }}>raised</p>
                                        </div>
                                    </div>
                                    <div className={styles.divider}></div>
                                    <div style={{ width: (mobile) ? "100%" : "80%", margin: "auto" }}>
                                        <div id="donationsnavbar" style={{ gridTemplateColumns: (mobile) ? "auto 200px" : "auto 250px", }} className={styles.doublegrid}>
                                            <input className={styles.inputScreen} style={{ backgroundColor: "rgba(255, 208, 128, 0.692)" }} id="donatesearch" type="date" placeholder="Search with date"></input>
                                            <button style={{ width: "100%" }} className={styles.managebutton} onClick={() => openOverlay("d")}>New Donation</button>
                                        </div>
                                        <div id="donatelist">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                <div id="differenceOverlay" className={styles.doublegrid} style={{ gridTemplateColumns: "auto 85%", position: "absolute", zIndex: "100", width: "100%", height: "100%", display: "none" }}>
                    <div id="closeZigZag" style={{ position: "relative", opacity: "0" }}>
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
                            <div id="v1d" className={styles.fullycenter} style={{ width: "85%", left: "150%", opacity: 0 }}>
                                <h1 className={styles.header}>Select donation amount</h1>
                                <p className={styles.subheader}>Your donation contributes to our goal of ensuring everyone in the DMV has food and shelter.</p>
                                <div className={styles.doublegrid} style={{ width: "250px", margin: "auto", marginTop: "100px", marginBottom: "100px", gridTemplateColumns: "50px auto", gridGap: "0px" }}>
                                    <h3 className={styles.header}>$</h3>
                                    <input id="v1damt" type="number" placeholder="5" className={styles.biginput} onInput={() => {
                                        if (document.getElementById("v1damt").value == "" || document.getElementById("v1damt").value == 0) {
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
                                </div>
                                <button id="v1dcont" onClick={() => nextStep("d")} className={[styles.minibutton, styles.hover].join(" ")} style={{ backgroundColor: "rgba(0, 0, 0, 0.281)", opacity: 0, visibility: "hidden" }}>Continue</button>
                            </div>
                            <div id="v2d" className={styles.fullycenter} style={{ width: (mobile) ? "85%" : "50%", left: "150%", opacity: 0 }}>
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
                            <div id="v1v" className={styles.fullycenter} style={{ width: (mobile) ? "85%" : "60%", left: "150%", opacity: 0 }}>
                                <h1 className={styles.header}>NourishDMV Volunteer Application</h1>
                                <p className={styles.subheader}>Thank you for your interest in being a NourishDMV Volunteer! Please fill out this application and we'll get back to you as soon as possible.</p>
                                <div className={styles.doublegrid} style={{ gridGap: "15px", marginTop: "50px", gridTemplateColumns: "auto auto auto" }}>
                                    <input className={styles.input} type='text' placeholder="Name"></input>
                                    <input className={styles.input} type="tel" placeholder="Phone Number"></input>
                                    <input className={styles.input} type="text" placeholder="Email"></input>
                                </div>

                                <div className={styles.doublegrid} style={{ gridTemplateColumns: "150px auto 150px", gridGap: "15px" }}>
                                    <select className={styles.input} placeholder="Name">
                                        <option>Area</option>
                                        <option>D.C.</option>
                                        <option>Maryland</option>
                                        <option>Virginia</option>
                                    </select>
                                    <input className={styles.input} type='text' placeholder="Address"></input>
                                    <input className={styles.input} type='text' placeholder="City"></input>
                                </div>
                                <textarea rows="3" className={styles.textarea} placeholder="Tell us about yourself"></textarea>
                                <textarea className={styles.textarea} placeholder="Why do you want to volunteer with us?"></textarea>
                                <textarea className={styles.input} placeholder="What tasks are your favorite to complete?"></textarea>
                                <input className={styles.input} placeholder="How did you hear about us?"></input>
                                <button onClick={() => nextStep("v")} className={[styles.minibutton, styles.hover].join(" ")} style={{ width: "100%", marginTop: "5px", backgroundColor: "rgb(0 0 0 / 42%)" }}>Submit</button>
                            </div>
                            <div id="v2v" className={styles.fullycenter} style={{ width: (mobile) ? "85%" : "50%", left: "150%", opacity: 0 }}>
                                <h1 className={styles.header}>Thank you!</h1>
                                <p className={styles.subheader}>Your application has been processed, we'll be in touch soon! You can close this by clicking the close button on the left.</p>
                            </div>
                        </div>
                        <div id="registerEvent" style={{ position: "relative", height: "100%" }}>
                            <div id="v1re" className={styles.fullycenter} style={{ width: "50%", left: "150%", opacity: 0 }}>
                                <h1 id="v1rehead" className={styles.header}>Pay $0.00 to register for Event</h1>
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