import React, { useState } from "react";
import { Grid, Typography } from "@mui/material";
import dayjs from "dayjs";
import DateRangePicker from "../components/DateRangePicker";
import StockTable from "../components/StockTable";

const Stock = () => {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography
            variant="h5"
            sx={{ fontWeight: "600", color: "#808080", display: "inline" }}
          >
            Stock /
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#4d4d4d",
              display: "inline",
              marginLeft: "5px",
              fontWeight: "500",
            }}
          >
            15 Items Out of Stock
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ marginTop: "10px" }}>
          <StockTable />
        </Grid>
      </Grid>
    </>
  );
};

export default Stock;
