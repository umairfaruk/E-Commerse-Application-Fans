import React, { useEffect, useState } from "react";
import "./styles.css";
import ProductCard from "../components/productPageCard";
import { Container } from "@mui/system";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleCategories } from "../../redux/Slices/singleCategorySlice";
import axios from "axios";
import { Box, Button, Grid, Typography } from "@mui/material";
import { motion } from "framer-motion";

const UniqueProducts = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the category ID from the URL parameters
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const state = useSelector((state) => state.Singlecategory);
  console.log(state);

  useEffect(() => {
    // Fetch category details
    dispatch(fetchSingleCategories({ id: id }));
  }, [dispatch, id]);

  useEffect(() => {
    // Fetch products based on category ID
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_DOMAIN_NAME
          }/api/product/uniqueproduct/${id}`
        );
        setProducts(response.data); // Assuming response.data contains the array of products
      } catch (error) {
        setError(error.response.data.message || "Failed to fetch products");
        // console.log(error.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProducts();
    }
  }, [id]);

  if (loading)
    return (
      <p className="mt-20 flex justify-center">
        <div className="loader"></div>
      </p>
    );

  if (error) {
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          p: 2,
        }}
      >
        <Box
          component={motion.div}
          initial={{ scale: 0.8, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 1 }}
        >
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: "4rem", md: "6rem" }, fontWeight: "bold" }}
          >
            404
          </Typography>
        </Box>
        <Typography
          component={motion.p}
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8 }}
          variant="h4"
          sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, mb: 3 }}
        >
          Product Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontSize: { xs: "1rem", md: "1.25rem" }, mb: 3 }}
        >
          Sorry, the product you're looking for doesn't exist.
        </Typography>
        <Button
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          variant="contained"
          color="primary"
          onClick={() => navigate("/categories")}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <div className="mx-auto p-4 bg-[url('./images/bg.png')]">
      <h1 className="text-3xl font-bold mb-4 text-center text-[#0f4c82] mt-16">
        {state?.data?.categoryName}
      </h1>
      <Container maxWidth={"lg"}>
        <Grid container spacing={4}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default UniqueProducts;
