import "./App.css";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import gifImage from "./assets/arrowgif.gif";
import { useState } from "react";
import React, { Suspense } from "react";
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Import ScrollTrigger
import axios from 'axios';

import { gsap } from "gsap";
import shineimage from "./assets/shine.png";

const Spline = React.lazy(() => import("@splinetool/react-spline"));
gsap.registerPlugin(ScrollTrigger); // Register ScrollTrigger plugin

function App() {
  const [prediction, setPrediction] = useState(null);
  const [inputText, setInputText] = useState('');

  const makePredictionRequest = async () => {
    console.log(inputText);
    try {
      const response = await axios.post(
        'http://localhost:8000/prediction/prediction/',
        { text: inputText }, // Data payload
        { headers: { "Content-Type": "application/json" } } // Headers
      );
      console.log(response)
      setPrediction(response.data.prediction); // Set the prediction state
      handlePredictionResponse(response.data.prediction)
    } catch (error) {
      console.error('Error making prediction request:', error);
    }
  };
  
  const handleInputChange = (event) => {
    setInputText(event.target.value); // Update state with input value
  };

  const handlePredictionResponse = (predictionData) => {
    // Initialize objects to store words for each category
    const categories = {
      'B-LOC': [],
      'B-MIS': [],
      'B-ORG': [],
      'B-PER': [],
      'I-LOC': [],
      'I-MIS': [],
      'I-ORG': [],
      'I-PER': [],
      'O': []
    };
  
    // Iterate over the prediction data
    predictionData.forEach((wordPrediction) => {
      console.log(wordPrediction)
      const [word, category] = wordPrediction.split(':'); // Split word and category
  
      // Add word to the corresponding category
      categories[category].push(word);
    });
  
    // Update the content of each div with the words from the corresponding category
    Object.keys(categories).forEach((category, index) => {
      const divClassName = `item${index + 1}`; // Get the class name of the div
      const words = categories[category].join(' '); // Join words with space
      
      // Update the content of the div
      const divElement = document.querySelector(`.${divClassName}`);
      console.log(divElement)
      divElement.textContent = category+ ' : \n'
      if (divElement) {
        
        divElement.textContent += words 
      }
    });
  };
  
  
  const mainContentRef = useRef(null);
  // Run only once on component mount

  const containerRef = useRef(null);
  const labelRef = useRef(null);

  const bigcontainer = useRef(null);

  useEffect(() => {
    const bigcontainerscr = bigcontainer.current;

    gsap.to(containerRef.current, {
      width: 500,
      opacity: 1,
      duration: 0.9,
      delay: 0.4,
      ease: "expo.inOut",
      backgroundColor: "rgb(214, 211, 211)",
      scrollTrigger: {
        trigger: bigcontainerscr,
        start: "top 0%",
        end: "bottom 70%",
        scrub: true,
        
      },
    });
   
    gsap.to(".inputcontainer", {
      width: "500px",
      alignSelf: "center",
      marginLeft: "155px",
      paddingRight: "130px",
      duration: 1,
      scrollTrigger: {
        trigger: bigcontainerscr,
        start: "top 0%",
        end: "bottom 70%",
       
        scrub: true,
      },
      
    });
    gsap.to(".entity-container", {
      maxheight: 0,
      alignSelf: "center",
      opacity: "1",
      marginTop: window.innerWidth <= 1592 ? "40px" : "0px",
      duration: 1,
      scrollTrigger: {
        trigger: bigcontainerscr,
        start: "top 40%",
        end: "bottom 40%",
       
        scrub: true,
      },
      
    });
  }, []);
  const [activePoint, setActivePoint] = useState(0); // State to track active point
  const previousPointRef = useRef(0); // Ref to track previous active point

  const toggleVisibility = (pointNumber) => {
    // Store the previous active point
    const previousPoint = previousPointRef.current;
    console.log('previous', previousPoint);
    console.log('current', pointNumber);

    // Update active point
    setActivePoint(pointNumber);

    timeoutRef.current = setTimeout(() => {
      // Define GSAP animations for different combinations of previous and current points
      const animations = {
        '0_1': { x: "6.2vw" }, 
        '1_1': { x: "6.2vw" }, 
        '2_1': { x: "6.2vw" }, 
        '3_1': { x: "6.2vw" }, 
        '4_1': { x: "6.2vw" }, 
        '0_2': { x: "12.7vw" },
        '1_2': { x: "12.7vw" }, 
        '2_2': { x: "12.7vw" }, 
        '3_2': { x: "12.7vw" }, 
        '4_2': { x: "12.7vw" }, 
        '0_3': { x: "17.8vw" }, 
        '1_3': { x: "17.8vw" }, 
        '2_3': { x: "17.8vw" }, 
        '3_3': { x: "17.8vw" }, 
        '4_3': { x: "17.8vw" }, 
        '0_4': { x: "23.28vw" }, 
        '1_4': { x: "23.28vw" }, 
        '2_4': { x: "23.28vw" }, 
        '3_4': { x: "23.28vw" }, 
        '4_4': { x: "23.28vw" }, 
        '0_0': { x: "0.0vw" }, 
        '1_0': { x: "0.0vw" }, 
        '2_0': { x: "0.0vw" },
        '3_0': { x: "0.0vw" }, 
        '4_0': { x: "0.0vw" }, 
      };

      // Get the key for the animations object based on previous and current points
      const animationKey = `${previousPoint}_${pointNumber}`;

      // Apply GSAP animation if it exists for the combination
      if (animations[animationKey]) {
        gsap.to(".active", {
          ...animations[animationKey],
          duration: 0.4,
          ease: 'back.inOut'
        });
      }
    }, 200);

    // Update previousPointRef after the state update
    previousPointRef.current = pointNumber;
  };

  const [isToggled, setIsToggled] = useState(true);

  const toggle = () => {
    setIsToggled(!isToggled);
  };
  const timeoutRef = useRef(null);

  const handletoggle = () => {
    timeoutRef.current = setTimeout(() => {
      setIsToggled((prevState) => !prevState);
    }, 2000);
  };

  // Clear the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  const handleFadeOut = () => {
    console.log(inputText)
    makePredictionRequest();
    toggle();
    handletoggle();
    gsap.to(".fade-out", {
      opacity: 0,
      y: window.innerWidth <= 1592 ? -250 : -200,
      duration: 0.8,
    });

    gsap.to(".item1", {
      opacity: 1,
      duration: 1,
      maxHeight: 360,
      delay: 0.5,
      ease: "expo.inOut",
    });
    gsap.to(".item2", {
      opacity: 1,
      duration: 1,
      maxHeight: 360,
      delay: 0.65,
      ease: "expo.inOut",
    });
    gsap.to(".item3", {
      opacity: 1,
      duration: 1,
      maxHeight: 360,
      delay: 0.75,
      ease: "expo.inOut",
    });
    gsap.to(".item4", {
      opacity: 1,
      duration: 1,
      maxHeight: 360,
      delay: 0.85,
      ease: "expo.inOut",
    });
    gsap.to(".item5", {
      opacity: 1,
      duration: 1,
      maxHeight: 360,
      delay: 0.95,
      ease: "expo.inOut",
    });
    gsap.to(".item6", {
      opacity: 1,
      duration: 1,
      maxHeight: 360,
      delay: 1.05,
      ease: "expo.inOut",
    });
    gsap.to(".item7", {
      opacity: 1,
      duration: 1,
      maxHeight: 360,
      delay: 1.15,
      ease: "expo.inOut",
    });
    gsap.to(".item8", {
      opacity: 1,
      duration: 1,
      maxHeight: 360,
      delay: 1.25,
      ease: "expo.inOut",
    });
    gsap.to(".item9", {
      opacity: 1,
      duration: 1,
      maxHeight: 360,
      delay: 1.35,
      ease: "expo.inOut",
    });
    gsap.to(".fade-out1", {
      opacity: 0,
      y: window.innerWidth <= 1592 ? -250 : -200,
      duration: 0.8,
    });
    gsap.to(".MainContainer1", {
      y: window.innerWidth <= 1592 ? -260 : -200,
      duration: 1,
      zIndex: 999999999,
    });
  };

  const scrollToMainContent = () => {
    mainContentRef.current.scrollIntoView({ behavior: "smooth" });
    gsap.to(containerRef.current, {
      width: 500,
      opacity: 1,
      duration: 0.9,
      delay: 0.4,
      ease: "expo.inOut",
      
      backgroundColor: "rgb(214, 211, 211)",
    });
    gsap.to(".inputcontainer", {
      width: "500px",
      alignSelf: "center",
      marginLeft: "155px",
      paddingRight: "130px",
      duration: 1,
    });
    gsap.to(labelRef.current, {
      fontSize: "15px",
      duration: 1.3,
      opacity: 1,
      delay: 1.1,
      ease: "power2.out",
    });
  };

  return (
    <div
    ref={bigcontainer}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "200vh",
        width: "100vw",
        overflowX: "hidden",
      }}
    >
      <div className="backgroundspline">
        {/* Background Spline */}
        <div className="background-spline">
          {isToggled && (
            <Suspense fallback={<div>Loading...</div>}>
              <Spline scene="https://prod.spline.design/UEFInGICL9XFVxXK/scene.splinecode" />
            </Suspense>
          )}
        </div>

        {/* Blurred overlay */}
        <div className="blur-overlay">
          {/* Text */}
          <div
            className="column"
            style={{
              height: "100vh",
              justifyContent: "center",
              backgroundColor: "transparent",
              position: "relative",
              top: "-20px",
              alignItems: "center",
            }}
          >
            <motion.span className="title">Arabic Entity Resolver</motion.span>
            <div
              style={{ height: "50px", backgroundColor: "transparent" }}
            ></div>
            <motion.span className="subtitle">
              Uncover the magic within Arabic text with our dynamic web
              platform, Where named entities shine bright, clear, and defined
              with precision untold. Harnessing specialized lexical databases,
              we decode the language's richness, Empowering your applications to
              soar, navigate, and thrive in the Arabic digital realm.{" "}
            </motion.span>
          </div>

          <div className="video-arrow-slide" onClick={scrollToMainContent}>
            <span
              style={{
                color: "white",
                position: "relative",
                top: "60px",
                left: "0px",
                fontFamily: "outfitmed",
                cursor: "pointer",
              }}
            >
              Start
            </span>
            <img
              src={gifImage}
              alt="GIF Image"
              style={{
                height: "200px",
                width: "auto",
                backgroundColor: "transparent",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </div>
      <div className="navbaritems">
        <div className="rowitem">
          <span
            className={` ${activePoint === 0 ? "navitem1" : "navitem"}`}
            onClick={() => toggleVisibility(0)}
          >
            Home
          </span>
          <div style={{ width: "20px ", backgroundColor: "transparent" }}></div>
          <span
            className={` ${activePoint === 1 ? "navitem1" : "navitem"}`}
            onClick={() => toggleVisibility(1)}
          >
            Documentation
          </span>
          <div style={{ width: "20px ", backgroundColor: "transparent" }}></div>
          <span
            className={` ${activePoint === 2 ? "navitem1" : "navitem"}`}
            onClick={() => toggleVisibility(2)}
          >
            Corpus
          </span>
          <div style={{ width: "20px ", backgroundColor: "transparent" }}></div>
          <span
            className={` ${activePoint === 3 ? "navitem1" : "navitem"}`}
            onClick={() => toggleVisibility(3)}
          >
            Dataset
          </span>
          <div style={{ width: "20px ", backgroundColor: "transparent" }}></div>
          <span
            className={` ${activePoint === 4 ? "navitem1" : "navitem"}`}
            onClick={() => toggleVisibility(4)}
          >
            About us
          </span>
        </div>
        <div className="active"></div>
      </div>

      <div
        className="MainContainer"
        ref={mainContentRef}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          alignItems: "center",
        }}
      >
        <div style={{ height: "50px" }}></div>

        <div
          className="fade-out"
          style={{
            width: "70%",
            paddingLeft: window.innerWidth <= 1592 ? "10vw" : "0",
            alignContent: "center",
            alignSelf: "center",
          }}
        >
          <span
            style={{
              textAlign: "center",
              color: "white",
              fontSize: "50px",
              fontFamily: "outfit",
            }}
          >
            Get ready to embark on a journey of empowerment with our Arabic
            Entity Resolver!
          </span>
        </div>
        <div className="fade-out1" style={{ height: "30px" }}></div>
        <div
          className="fade-out"
          style={{
            width: "70%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              textAlign: "center",
              marginRight: "0px",
              color: "#d6d6d6",
              fontSize: "18px",
              fontFamily: "outfitlight",
              alignSelf: "center",
            }}
          >
            Empower yourself with the ability to swiftly identify names,
            organizations, locations,<p></p> and more.
          </span>
        </div>

        <div style={{ height: "5%" }}></div>

        <div className="MainContainer1" style={{ height: "fit-content" }}>
          <div
            style={{
              width: "0",
              alignSelf: "center",
              marginLeft: "155px",
              paddingRight: "130px",
            }}
            className="inputcontainer"
          >
            <input
              ref={containerRef}
              type="text"
              onChange={handleInputChange} // Handle input change
              value={inputText} // Bind input value to state variable
              placeholder="Enter Your Text and extract The main entities"
              style={{
                border: "none",
                outline: "none",
                margin: "20px",
                paddingLeft: "25px",
                paddingRight: "25px", // Adding padding to the left and right
                overflow: "hidden",
                opacity: "0",
                color: "black",
                width: "350px",
                height: "75%",
                borderRadius: "15px",
                background: "transparent",
                fontSize: "14.5px",
              }}
            ></input>
          </div>
          <div className="button" onClick={handleFadeOut}>
            <img
              src={shineimage}
              style={{ width: "20px", height: "auto" }}
            ></img>
            <div style={{ width: "10px" }}></div>
            <span>Predict</span>
          </div>
        </div>
        <div style={{ height: "5%" }}></div>

        <div
          className="entity-container"
          style={{
            opacity: "0",
            marginTop: window.innerWidth <= 1592 ? "40px" : "0px",
          }}
        >
          <div
            className="item1"
            style={{
              overflowY: "auto",
              maxHeight: "0",
              width: "33%",
              color: "black",
              backgroundColor: "white",
              height: "360px",
              marginRight: "10px",
            }}
          ></div>{" "}
          <div
            className="item2"
            style={{
              overflowY: "auto",
              maxHeight: "0",
              width: "33%",
              color: "black",
              backgroundColor: "white",
              height: "360px",
              marginRight: "10px",
            }}
          ></div>{" "}
          <div
            className="item3"
            style={{
              overflowY: "auto",
              maxHeight: "0px",
              color: "black",
              width: "33%",
              backgroundColor: "white",
              height: "360px",
              marginRight: "10px",
            }}
          ></div>{" "}
          <div
            className="item4"
            style={{
              overflowY: "auto",
              maxHeight: "0px",
              color: "black",
              width: "33%",
              backgroundColor: "white",
              height: "360px",
              marginRight: "10px",
            }}
          ></div>{" "}
          <div
            className="item5"
            style={{
              overflowY: "auto",
              maxHeight: "0px",
              color: "black",
              width: "33%",
              backgroundColor: "white",
              height: "360px",
              marginRight: "10px",
            }}
          ></div>{" "}
          <div
            className="item6"
            style={{
              overflowY: "auto",
              maxHeight: "0px",
              color: "black",
              width: "33%",
              backgroundColor: "white",
              height: "360px",
              marginRight: "10px",
            }}
          ></div>{" "}
          <div
            className="item7"
            style={{
              overflowY: "auto",
              maxHeight: "0px",
              width: "33%",
              color: "black",
              backgroundColor: "white",
              height: "360px",
              marginRight: "10px",
            }}
          ></div>{" "}
          <div
            className="item8"
            style={{
              overflowY: "auto",
              maxHeight: "0px",
              width: "33%",
              color: "black",
              backgroundColor: "white",
              height: "360px",
              marginRight: "10px",
            }}
          ></div>{" "}
          <div
            className="item9"
            style={{
              overflowY: "auto",
              maxHeight: "0px",
              width: "33%",
              color: "black",
              backgroundColor: "white",
              height: "360px",
              marginRight: "10px",
            }}
          ></div>{" "}
        </div>
      </div>
    </div>
  );
}

export default App;
