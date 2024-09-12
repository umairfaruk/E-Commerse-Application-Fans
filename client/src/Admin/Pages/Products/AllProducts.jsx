import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import {
  Box,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Button
} from "@mui/material";

import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";

import ReactPaginate from "react-paginate"; // for pagination
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai"; // icons form react-icons
import { IconContext } from "react-icons"; // for customizing icons

import "./styles.css"; // stylesheet
const AllProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [postsPerPage, setPostsPerPage] = useState(12);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Start from page 1
  const [totalCount, setTotalCount] = useState(0);

  const stateCategories = useSelector((state) => state.categories);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]); // Default price range
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, applyFilter] = useState(false);



  const lastPostIndex = postsPerPage * currentPage;
  const firstPostIndex = lastPostIndex - postsPerPage;

  const slicedProducts = products.slice(firstPostIndex, lastPostIndex);
  console.log("slicedProducts", slicedProducts);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));



  const dispatch = useDispatch();
  const state = useSelector((state) => state.products);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    setCurrentPage(event.selected + 1);

    console.log(event.selected);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(`${import.meta.env.VITE_BACKEND_DOMAIN_NAME}/api/product/getProducts`);
        url.searchParams.set('page', currentPage);
        url.searchParams.set('limit', 10);

        if (selectedCategory) {
          url.searchParams.set('category', selectedCategory);
        }


        // Price Range Filter
        url.searchParams.set('minPrice', priceRange[0]);
        url.searchParams.set('maxPrice', priceRange[1]);

        // Search Query Filter
        if (searchQuery) {
          url.searchParams.set('search', searchQuery);
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
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
  }, [currentPage, filter]); // Fetch when currentPage or selectedCategory changes





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
        const url = new URL(`${import.meta.env.VITE_BACKEND_DOMAIN_NAME}/api/product/getProducts`);
        url.searchParams.set('page', currentPage);
        url.searchParams.set('limit', 10);

        if (selectedCategory) {
          url.searchParams.set('category', selectedCategory);
        }


        // Price Range Filter
        url.searchParams.set('minPrice', priceRange[0]);
        url.searchParams.set('maxPrice', priceRange[1]);

        // Search Query Filter
        if (searchQuery) {
          url.searchParams.set('search', searchQuery);
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
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

  }

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    console.log("value changed")
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


  if (products?.length === 0) {
    return <div className="flex flex-col items-center justify-center  w-full min-h-screen">
      <h1>No Product added. Add some </h1>

      <button
        onClick={() => navigate("/admin/addproduct")}
        className="relative mt-6 inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-[#0B355B] to-[#0B355B] group-hover:from-[#0B355B] group-hover:to-[#0B355B] hover:text-white focus:ring-4 focus:outline-none focus:ring-[#0B355B] dark:focus:ring-[#0B355B]">
        <span className="relative px-5 py-2.5 text-black hover:text-white transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
          Add Product
        </span>
      </button>
    </div>
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ color: "#5d737e", fontWeight: "500" }}>
          All Products
        </Typography>
        <Box sx={{
          display: "flex",
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: "center",
          gap: '.5rem'

        }}>
          <TextField
            label="Search products"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: isSmallScreen ? "50%" : "250px" }}
          />
          <Button style={{ marginTop: '1rem', background: '#0b2743' }} variant="contained" onClick={applyFilters} >
            Search
          </Button></Box>


      </Box>
      <Grid container spacing={5} justifyContent="center">
        {products.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <ProductCard product={product} />
          </Grid>
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
              <IconContext.Provider value={{ color: "#0c355b", size: "36px" }}>
                <AiFillLeftCircle />
              </IconContext.Provider>
            }
            nextLabel={
              <IconContext.Provider value={{ color: "#0c355b", size: "36px" }}>
                <AiFillRightCircle />
              </IconContext.Provider>
            }
            renderOnZeroPageCount={null}
            forcePage={currentPage - 1} // Ensure 0-based index for forcePage
          />

        </Box>
      </Grid>
    </>
  );
};

export default AllProducts;
