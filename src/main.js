import React, { useState, useEffect } from "react";
import heroImage from "./image/heroImg.jpeg";
import RecommendedFood from "./components/landing/recomFood";
import HomeFAQ from "./components/landing/faq";
import UserAPI from "./services/userAPI";
import "./css/main.css";

function Main({ isLoggedIn = false, currentUser = null }) {
  const [bodyType, setBodyType] = useState(null);

  // Fetch user's body type when logged in
  useEffect(() => {
    const fetchUserBodyType = async () => {
      if (isLoggedIn && currentUser?.userID) {
        try {
          console.log("Fetching user data for userID:", currentUser.userID);
          const userData = await UserAPI.getUser(currentUser.userID);
          console.log("Fetched user data:", userData.data);

          // Try to get body type from multiple possible fields
          let userBodyType = null;

          if (userData.data?.bodyType) {
            userBodyType = userData.data.bodyType;
            console.log("Found bodyType in userData.bodyType:", userBodyType);
          } else if (userData.data?.testResult?.bodyTypeID) {
            userBodyType = userData.data.testResult.bodyTypeID;
            console.log(
              "Found bodyType in userData.testResult.bodyTypeID:",
              userBodyType
            );
          } else if (userData.data?.bodyTypeRecordID) {
            userBodyType = userData.data.bodyTypeRecordID;
            console.log(
              "Found bodyType in userData.bodyTypeRecordID:",
              userBodyType
            );
          }

          if (userBodyType) {
            console.log("Setting bodyType to:", userBodyType);
            setBodyType(userBodyType);
          } else {
            console.log("No bodyType found in user data");
            setBodyType(null);
          }
        } catch (error) {
          console.error("Error fetching user body type:", error);
        }
      } else {
        // Clear body type when not logged in
        console.log("Not logged in or no userID, clearing bodyType");
        setBodyType(null);
      }
    };

    fetchUserBodyType();
  }, [isLoggedIn, currentUser]);

  return (
    <main>
      <div className="hero">
        {/* Text Content Space */}
        <div className="hero-text">
          <h2>本草智膳 MyHerbalWise</h2>
          <p>
            因人而膳，順性而養。
            <br />
            Curate Your Cuisine, Keep Natural Balance.
          </p>
        </div>

        {/* Image Space */}
        <div className="hero-image">
          <img
            src={heroImage}
            alt="Hero section featuring healthy food and traditional herbs"
          />
        </div>
      </div>

      {/* Recommended Food Section */}
      <div className="main-section">
        <div className="main-section-inner">
          <RecommendedFood
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            bodyType={bodyType}
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="main-section">
        <div className="main-section-inner">
          <HomeFAQ />
        </div>
      </div>
    </main>
  );
}

export default Main;
