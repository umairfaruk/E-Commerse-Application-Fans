import React from "react";
import HeroSection from "../sections/HeroSection";

import QualitySection from "../sections/QualitySection";
import OurGoal from "../sections/OurGoal";
import FeatureProducts from "../sections/FeatureProducts";
import { BasicTable } from "../imports";

import ProductCategories from "../sections/ProductCategories";
import ServicesSection from "../sections/ServicesSection";
import CoorporationPartners from "../sections/CoorporationPartners";

const Home = () => {
  return (
    <>
      <HeroSection />
      <QualitySection />
      <OurGoal />
      <FeatureProducts />
      <ProductCategories />
      <BasicTable />
      <CoorporationPartners />
      <ServicesSection />
    </>
  );
};

export default Home;
