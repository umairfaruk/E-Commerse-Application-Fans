import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import poster1 from "../images/poster1.jpg";

import { Box } from "@mui/material";
import { main_1, main_2, main_3 } from "../imports";

const HeroSection = () => {
  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Enables auto-scroll
    autoplaySpeed: 3000,
  };
  return (
    <>
      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <Slider {...settings} style={{ height: "100%" }}>
          <div>
            <div className="banner-container">
              <img src={main_1} alt="Background" className="background-image" />
            </div>
          </div>
          <div>
            <div className="banner-container">
              <img src={main_2} alt="Background" className="background-image" />
            </div>
          </div>
          <div>
            <div className="banner-container">
              <img src={main_3} alt="Background" className="background-image" />
            </div>
          </div>
        </Slider>
      </Box>
    </>
  );
};

export default HeroSection;
