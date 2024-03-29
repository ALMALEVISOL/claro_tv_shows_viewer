import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";
import BG from "./assests/naruto_bg.jpg";

const CHANNELS_QTY = 200;
const EVENT_WIDTH = 300;
const DAY_WIDTH = 7200;
const DAY_HEIGHT = CHANNELS_QTY * 30;
const DAYS = 2;
var moveBarIntervalId = null;

const App = React.memo(() => {
  const [channels, setChannels] = useState(null);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const handleClose = () => {
    setShow(false);
    clearInterval(moveBarIntervalId);
    moveBarIntervalId = null;
  };
  const handleShow = () => {
    setIsLoading(true);
    fetchData();
    setShow(true);
  };

  const fetchData = async () => {
    try {
      const fetchD = await fetch(
        "https://mfwkweb-api.clarovideo.net/services/epg/channel?device_id=web&device_category=web&device_model=web&device_type=web&device_so=Chrome&format=json&device_manufacturer=generic&authpn=webclient&authpt=tfg1h3j4k6fd7&api_version=v5.93&region=guatemala&HKS=web61144bb49d549&user_id=54343080&date_from=20210812200256&date_to=20210813200256&quantity=" +
          CHANNELS_QTY
      );
      const fetchRes = await fetchD.json();
      setChannels(fetchRes.response.channels);
    } catch (error) {
      //Message to Log service
      console.error("Fetch error:::: ", error);
      setIsLoading(false);
    }
  };

  const moveNowBarJob = () => {
    const nowBar = document.getElementById("now-bar");
    if (!nowBar) return;
    const nowTime = new Date();
    const hours = nowTime.getHours();
    const minutes = nowTime.getMinutes();
    nowBar.style.left = hours * EVENT_WIDTH + minutes * 5 + "px";
    nowBar.style.backgroundColor = "lightblue";
  };

  const mouseScrollListener = () => {
    const scrollableDiv = document.getElementById("events");
    const scrollableChannelsDiv = document.getElementById("channels");
    const timeLineEvents = document.getElementById("timeline-hours");
    let isDown = false;
    let startX;
    let startY;
    let scrollLeft;
    let scrollTop;
    let currentHeaderTimeLineTop;
    if (!scrollableDiv) return;
    scrollableDiv.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - scrollableDiv.offsetLeft;
      startY = e.pageY - scrollableDiv.offsetTop;
      scrollLeft = scrollableDiv.scrollLeft;
      scrollTop = scrollableDiv.scrollTop;
      currentHeaderTimeLineTop = parseInt(timeLineEvents.style.top);
    });
    scrollableDiv.addEventListener("mouseup", () => {
      isDown = false;
    });
    scrollableDiv.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollableDiv.offsetLeft;
      const walk = (x - startX) * 2;
      scrollableDiv.scrollLeft = scrollLeft - walk;
      const y = e.pageY - scrollableDiv.offsetTop;
      const walkY = (y - startY) * 2;
      scrollableDiv.scrollTop = scrollTop - walkY;
      scrollableChannelsDiv.scrollTop = scrollTop - walkY;
      if (walkY < 0 && currentHeaderTimeLineTop === 0) {
        timeLineEvents.style.top = walkY * -1 + "px";
        //timeLineEvents.style.background = "blue";
      }
      //if the walk is negative, but the original header has moved and be in another position,
      //we have to add the walking to the current position
      if (walkY < 0 && currentHeaderTimeLineTop > 0) {
        timeLineEvents.style.top = walkY * -1 + currentHeaderTimeLineTop + "px";
        //timeLineEvents.style.background = "red";
      }
      if (walkY > 0 && currentHeaderTimeLineTop > 0) {
        timeLineEvents.style.top = currentHeaderTimeLineTop - walkY + "px";
        //timeLineEvents.style.background = "pink";
      }
    });
  };

  const observerCallback = (mutations) => {
    if (moveBarIntervalId && show) return;
    for (let mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        debugger;
        if (mutation.addedNodes[0].getAttribute("role") === "dialog") {
          if (
            mutation.addedNodes[0].firstChild.getAttribute("id") ===
            "content-modal"
          ) {
            if (!moveBarIntervalId && show) {
              console.log("ObserverTouched::::::::::::::: ");
              mouseScrollListener();
              moveNowBarJob();
              const nowTime = new Date();
              const hours = nowTime.getHours();
              const scrollableDiv = document.getElementById("events");
              if (scrollableDiv)
                scrollableDiv.scrollLeft = (hours - 1) * EVENT_WIDTH;
              moveBarIntervalId = setInterval(() => {
                moveNowBarJob();
              }, 60000);
              console.log(
                "moveBarIntervalId::::::::::::::::: ",
                moveBarIntervalId
              );
            }
          }
        }
      }
    }
  };
  let observer = new MutationObserver(observerCallback);
  const bodyElement = document.getElementsByTagName("body");
  if (bodyElement)
    observer.observe(bodyElement[0], {
      childList: true,
      //subtree: true,
    });

  useEffect(() => {
    if (channels && channels.length > 0) {
      setIsLoading(false);
    }
  }, [channels]);

  const getTestMinutes = (time) => {
    if (!time) return;
    const hours = Math.floor(Math.random() * 10);
    const minutes = Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);
    return hours + minutes + seconds;
  };

  const setEventPosition = (beginDate) => {
    const nowTime = new Date(beginDate);
    const hours = nowTime.getHours();
    const minutes = nowTime.getMinutes();
    return hours * EVENT_WIDTH + minutes * 5 + "px";
  };

  const getMinutes = (time) => {
    if (!time) return;
    const all = time.split(":");
    const hours = Math.floor(parseInt(all[0] * 60));
    const minutes = Math.floor(parseInt(all[1]));
    const seconds = Math.floor(parseInt(all[2]));
    //60 - EVENT_WIDTH
    //30 - ( sum * EVENT_WIDTH / 60 )
    return ((hours + minutes + seconds) * EVENT_WIDTH) / 60;
  };

  const hoursTimeLine = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];

  const tempA = [];
  for (let x = 0; x < DAYS; x++) {
    tempA.push(...hoursTimeLine);
  }

  if (isLoading) {
    return (
      <Modal
        id="loading-modal"
        show={true}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        onHide={handleClose}
      >
        <Modal.Header>
          <Modal.Title>
            No te vayas, estamos cargando tus programas favoritos...
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ display: "flex", justifyContent: "center", padding: 15 }}
        >
          <Spinner animation="border" variant="primary" />
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Mostrar EPG
      </Button>

      <Modal id="content-modal" show={show} onHide={handleClose}>
        <Modal.Body>
          <main>
            <section
              id="event-details"
              style={{
                width: "100%",
                height: "50vh",
                backgroundImage: "url(" + BG + ")",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                alignContent: "center",
                position: "relative",
              }}
            >
              <Button
                onClick={handleClose}
                style={{
                  position: "absolute",
                  zIndex: 1,
                  backgroundColor: "transparent",
                  right: 0,
                }}
              >
                X
              </Button>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "black",
                  opacity: 0.5,
                }}
              ></div>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  display: "flex",
                  flexDirection: "column",
                  padding: 80,
                }}
              >
                <span
                  style={{
                    fontSize: 25,
                    color: "white",
                  }}
                >
                  {" "}
                  Detalles del programa:{" "}
                  {currentEvent && currentEvent.unix_begin}{" "}
                </span>
                <span
                  style={{
                    fontSize: 20,
                    color: "white",
                  }}
                >
                  {currentEvent &&
                    new Date(currentEvent.date_begin).getHours() +
                      ":" +
                      new Date(currentEvent.date_begin).getMinutes() +
                      "hs a " +
                      new Date(currentEvent.date_end).getHours() +
                      ":" +
                      new Date(currentEvent.date_end).getMinutes() +
                      "hs" +
                      " " +
                      currentEvent.duration}
                </span>
                <span
                  style={{
                    fontSize: 20,
                    color: "white",
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Aliquam porttitor justo non nulla feugiat, in tempor tortor
                  aliquet. Curabitur leo ex, sollicitudin mollis laoreet nec,
                  fringilla in arcu. Cras imperdiet metus tempus odio faucibus
                  ultricies. Suspendisse potenti. Curabitur euismod turpis eget
                  mi finibus, sed interdum eros congue. Nunc molestie, leo non
                  eleifend vestibulum, lectus purus malesuada ex, vel
                  scelerisque nisl leo eu libero. Donec congue sem euismod
                  libero fermentum dignissim. Vestibulum vitae ipsum non augue
                  porttitor blandit. Vestibulum tristique purus sit amet metus
                  pharetra, vel laoreet velit malesuada.
                </span>
              </div>
            </section>
            <section
              style={{
                width: "100%",
                height: "50vh",
                display: "-webkit-box",
              }}
            >
              <div
                id="channels"
                style={{
                  width: 180,
                  backgroundColor: "black",
                  fontSize: 10,
                  boxSizing: "border-box",
                  cursor: "grab",
                  float: "left",
                  height: "100%",
                  overflow: "hidden",
                  paddingTop: 30,
                }}
              >
                <div id="channels-timeline-days">
                  <span
                    style={{
                      fontSize: 22,
                      textAlign: "center",
                      color: "white",
                    }}
                  >
                    HOY
                  </span>
                </div>
                {channels &&
                  channels.map((channel) => {
                    return (
                      <div
                        id="channel_header"
                        key={channel.id}
                        style={{
                          width: "100%",
                          height: 100,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 13,
                          background: "#1a1a1a",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "20%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "white",
                              fontSize: "1.2rem",
                            }}
                          >
                            {channel.number}
                          </span>
                          <span
                            style={{
                              color: "white",
                              fontSize: "1.1rem",
                            }}
                          >
                            ❤️
                          </span>
                        </div>
                        <img
                          style={{
                            width: "80%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                          src={channel.image}
                          alt="channel_image"
                        />
                      </div>
                    );
                  })}
              </div>

              <div
                id="events"
                style={{
                  width: "calc(100% - 180px)",
                  height: "100%",
                  fontSize: "10px",
                  overflow: "hidden",
                  position: "relative",
                  cursor: "grab",
                  backgroundColor: "#1a1a1a",
                }}
              >
                <div
                  id="big"
                  style={{
                    width: DAY_WIDTH * DAYS,
                    height: DAY_HEIGHT,
                    fontSize: "10px",
                    cursor: "grab",
                    position: "absolute",
                  }}
                >
                  <div
                    id="timeline-hours"
                    style={{
                      width: DAY_WIDTH * DAYS,
                      height: 30,
                      display: "grid",
                      gridTemplateColumns: `repeat(${24 * DAYS}, 1fr)`,
                      boxSizing: "border-box",
                      backgroundColor: "black",
                      position: "absolute",
                      top: 0,
                      //position: "fixed",
                      zIndex: 1,
                      //overflowX: "auto"
                    }}
                  >
                    {tempA.map((hour, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: EVENT_WIDTH,
                          height: 30,
                          outline: "1px solid white",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 22,
                            textAlign: "center",
                            color: "white",
                          }}
                        >
                          {hour}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div id="now-bar"></div>
                  {channels &&
                    channels.map((element, index) => {
                      return (
                        <section
                          key={index}
                          style={{
                            fontSize: 10,
                            cursor: "grab",
                            height: 100,
                            position: "absolute",
                            width: "100%",
                            top: index * 100 + 30,
                            display: "flex",
                          }}
                        >
                          {element.events &&
                            element.events.map((eventShow, index) => (
                              <div
                                key={eventShow.unix_begin + index}
                                id={eventShow.unix_begin}
                                style={{
                                  border: "1px solid #b9b5b5",
                                  width: getMinutes(eventShow.duration) + "px",
                                  fontSize: 10,
                                  cursor: "grab",
                                  height: 100,
                                  left: setEventPosition(eventShow.date_begin),
                                  position: "absolute",
                                }}
                                onMouseEnter={() => {
                                  if (
                                    currentEvent?.unix_begin !==
                                    eventShow.unix_begin
                                  ) {
                                    setCurrentEvent(eventShow);
                                  }
                                }}
                                //onMouseLeave={() => setCurrentEvent(null)}
                              >
                                <span style={{ color: "white", fontSize: 20 }}>
                                  {eventShow.unix_begin}
                                </span>
                              </div>
                            ))}
                        </section>
                      );
                    })}
                </div>
              </div>
            </section>
          </main>
        </Modal.Body>
      </Modal>
    </>
  );
});

export default App;
