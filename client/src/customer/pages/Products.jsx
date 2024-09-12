import React, { useEffect, useState } from "react";

import "./styles.css";

import ProductCard from "../components/productPageCard";
import { Container } from "@mui/system";
import Loading from "../../Admin/components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/Slices/productsSlice";
import { fetchCategories } from "../../redux/Slices/categoriesSlice";
import {
  Box,
  Grid,
  Typography,
  Slider,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import CategoryChip from "../components/catagoreyChip";
import ReactPaginate from "react-paginate"; // for pagination
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai"; // icons form react-icons
import { IconContext } from "react-icons"; // for customizing icons

import "./styles.css"; // stylesheet

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Start from page 1
  const [totalCount, setTotalCount] = useState(0);
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]); // Default price range
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, applyFilter] = useState(false);
  const [isloading, setisLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const stateCategories = useSelector((state) => state.categories);
  useEffect(() => {
    if (stateCategories.data) {
      setCategories(stateCategories.data);
      console.log(categories);
    }
  }, [stateCategories.data]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setCurrentPage(1); // Reset to page 1 when selecting a new category
  };
  const handlePageClick = (event) => {
    setCurrentPage(event.selected + 1);

    console.log(event.selected);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(
          `${import.meta.env.VITE_BACKEND_DOMAIN_NAME}/api/product/getProducts`
        );
        url.searchParams.set("page", currentPage);
        url.searchParams.set("limit", 10);

        if (selectedCategory) {
          url.searchParams.set("category", selectedCategory);
        }

        // Price Range Filter
        url.searchParams.set("minPrice", priceRange[0]);
        url.searchParams.set("maxPrice", priceRange[1]);

        // Search Query Filter
        if (searchQuery) {
          url.searchParams.set("search", searchQuery);
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products);
        setTotalCount(data.pagination.totalPages);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, selectedCategory, filter]); // Fetch when currentPage or selectedCategory changes

  const applyFilters = () => {
    setCurrentPage(1);
    applyFilter(!filter);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 10000]); // Reset to default price range
    setSearchQuery("");
    setCurrentPage(1); // Optional: Reset to the first page

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(
          `${import.meta.env.VITE_BACKEND_DOMAIN_NAME}/api/product/getProducts`
        );
        url.searchParams.set("page", currentPage);
        url.searchParams.set("limit", 10);

        if (selectedCategory) {
          url.searchParams.set("category", selectedCategory);
        }

        // Price Range Filter
        url.searchParams.set("minPrice", priceRange[0]);
        url.searchParams.set("maxPrice", priceRange[1]);

        // Search Query Filter
        if (searchQuery) {
          url.searchParams.set("search", searchQuery);
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products);
        setTotalCount(data.pagination.totalPages);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Refetch products (this will use the default/cleared filter values)
    fetchProducts();
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);

    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  if (stateCategories.isLoading || loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column" },
        bg: "url(./images/bg.png)",
      }}
    >
      <Container
        sx={{
          maxWidth: "lg",
          display: "flex",
          justifyContent: "end",
          py: 9,
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: "600px" }, // Adjust width for larger layout

            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Category Dropdown and Search Input aligned horizontally */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            <TextField
              label="Search products"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <FormControl fullWidth>
              <InputLabel id="category-label">Categories</InputLabel>
              <Select
                labelId="category-label"
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                label="Categories"
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.categoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Buttons aligned horizontally */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              gap: 2,
              // Add margin to the top of buttons
            }}
          >
            <Button
              variant="contained"
              onClick={applyFilters}
              sx={{
                paddingX: 5,
                backgroundColor: "#0B355B",
                borderRadius: "5px",
                border: "2px solid #0B355B",
                fontWeight: "600",
                boxShadow:
                  "rgba(0, 0, 0, 0.1) 0px 14px 28px, rgba(0, 0, 0, 0.10) 0px 10px 10px",

                "&:hover": {
                  backgroundColor: "#F5F5F5",
                  border: "2px solid #0B355B",
                  color: "#0B355B",

                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow:
                    "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
                },
              }}
            >
              Apply Filters
            </Button>

            <Button
              variant="contained"
              onClick={clearFilters}
              sx={{
                paddingX: 5,
                backgroundColor: "#0B355B",
                borderRadius: "5px",
                border: "2px solid #0B355B",
                fontWeight: "600",
                boxShadow:
                  "rgba(0, 0, 0, 0.1) 0px 14px 28px, rgba(0, 0, 0, 0.10) 0px 10px 10px",

                "&:hover": {
                  backgroundColor: "#F5F5F5",
                  border: "2px solid #0B355B",
                  color: "#0B355B",

                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow:
                    "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Products List (Left) */}
      <Box sx={{ flex: 1 }}>
        {" "}
        {/* Takes up remaining space */}
        {products.length === 0 ? (
          <Container maxWidth="lg">
            <Typography variant="h6" align="center" sx={{ py: 10 }}>
              No products found
            </Typography>
          </Container>
        ) : (
          <Container maxWidth={"lg"}>
            <Grid container spacing={4}>
              {products.map((product) => (
                <ProductCard product={product} />
              ))}
            </Grid>

            <Grid container justifyContent={"center"}>
              <Box sx={{ marginTop: "50px", marginBottom: "30px" }}>
                <ReactPaginate
                  key={currentPage} // Add this key
                  containerClassName={"pagination"}
                  pageClassName={"page-item"}
                  activeClassName={"active"}
                  onPageChange={handlePageClick}
                  pageCount={totalCount}
                  breakLabel="..."
                  previousLabel={
                    <IconContext.Provider
                      value={{ color: "#0c355b", size: "36px" }}
                    >
                      <AiFillLeftCircle />
                    </IconContext.Provider>
                  }
                  nextLabel={
                    <IconContext.Provider
                      value={{ color: "#0c355b", size: "36px" }}
                    >
                      <AiFillRightCircle />
                    </IconContext.Provider>
                  }
                  renderOnZeroPageCount={null}
                  forcePage={currentPage - 1} // Ensure 0-based index for forcePage
                  pageRangeDisplayed={8}
                />
              </Box>
            </Grid>
          </Container>
        )}
      </Box>
    </Box>
  );
};

export default Products;
