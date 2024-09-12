const { sendOrderConfirmationMail, sendPaymentConfirmationMail, sendOrderShippedMail, sendOrderCanceledMail } = require("../mailtrap/email");
const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const asyncHandler = require("../utils/asyncHandler");
const { ObjectId } = require('mongodb');



module.exports = {
  createOrder: asyncHandler(async (req, res) => {
    console.log("Request is coming");

    try {
      const { shippingInfo, orderItems, totalPrice, user } = req.body;


      console.log("All items processed:", orderItems);

      // Create the order
      const order = await Order.create({
        shippingInfo,
        orderItems,
        totalPrice,
        user,
        paidAt: Date.now(),
      });

      // Send confirmation email
      await sendOrderConfirmationMail(
        shippingInfo.email,
        shippingInfo.username,
        shippingInfo.address
      );

      // Respond with success
      res.status(201).json({
        success: true,
        order,
      });

    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }),

  getorders: asyncHandler(async (req, res) => {
    try {
      const orderId = req.params.id;
      console.log(orderId);

      if (!orderId) {
        res.status(400).json({ error: "order not found" });
      }
      const order = await Order.findById(orderId);
      if (!order) {
        res.status(400).json({ error: "order not found" });
      }
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ error: "Error Getting order" });
    }
  }),
  getallorders: asyncHandler(async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let start, end, orders;

      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        start.setDate(start.getDate() - 1);

        orders = await Order.find({
          createdAt: {
            $gte: start,
            $lt: end,
          },
        });
      } else {
        start = startDate ? new Date(startDate) : new Date("1970-01-01");
        end = endDate ? new Date(endDate) : new Date();
        end.setDate(end.getDate() + 1);

        orders = await Order.find({
          createdAt: {
            $gte: start,
            $lt: end,
          },
        });
      }
      res.status(200).json({
        message: "Oders retrieved successfully!",
        data: orders,
      });
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while retrieving orders",
        error: error.message,
      });
    }
  }),

  deleteorder: asyncHandler(async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).send("order not found");
      }
      await Order.findByIdAndDelete(orderId);

      res.status(200).send("order and associated files deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).send("Error deleting order");
    }
  }),
  shippingStatusUpdate: asyncHandler(async (req, res) => {
    try {
      const { shipmentStatus } = req.body;
      const orderId = req.params.id;

      if (!shipmentStatus) {
        return res.status(400).json({ error: "Order status is required" });
      }

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus: shipmentStatus },
        { new: true }
      );


      if (shipmentStatus === "Shipped") {
        console.log("send updated order mail");

        await sendOrderShippedMail(
          order.shippingInfo.email,
          order.shippingInfo.username,
          order.shippingInfo.address
        );

      } else if (shipmentStatus === "Unshipped") {
        await sendOrderCanceledMail(
          order.shippingInfo.email,
          order.shippingInfo.username,
          order.shippingInfo.address
        );

      }

      res.status(200).json({
        message: "Order status updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Error updating order status" });
    }
  }),
  paymentStatusUpdate: asyncHandler(async (req, res) => {
    try {
      const { confirmationStatus } = req.body;
      const orderId = req.params.id;

      console.log(confirmationStatus);

      // Validate paymentStatus
      const validStatuses = ["Unpaid", "Paid"];
      if (!confirmationStatus || !validStatuses.includes(confirmationStatus)) {
        return res
          .status(400)
          .json({ error: "Invalid or missing payment status" });
      }

      const order = await Order.findById(orderId);

      console.log(order);


      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Update the payment status
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { "paymentInfo.status": confirmationStatus },
        { new: true } // Return the updated document
      );

      if (confirmationStatus === "Paid") {
        await sendPaymentConfirmationMail(
          order.shippingInfo.email,
          order.shippingInfo.username,
          order.shippingInfo.address
        );
        
        for (const orderItem of order.orderItems) {
          const { productId, quantity, type, color } = orderItem;
          console.log("Processing product:", productId._id, quantity);

          const product = await Product.findById(productId._id);

          if (!product) {
            throw new Error(`Product with ID ${productId._id} not found`);
          }

          console.log("Product details:", product);

          let stockUpdated = false;

          for (const size of product.sizes) {
            for (const colorObj of size.colors) {
              if (size.size === type && colorObj.color === color) {
                console.log("Matching size and color found");

                if (colorObj.stock < quantity) {
                  throw new Error("Not enough stock");
                }

                // Deduct the stock
                colorObj.stock -= quantity;
                console.log("New Stock:", colorObj.stock, size.size, colorObj.color);

                // Update the stock in the database
                await Product.updateOne(
                  {
                    "_id": productId._id,
                    "sizes.size": type,
                    "sizes.colors.color": color
                  },
                  {
                    $set: {
                      "sizes.$[sizeElement].colors.$[colorElement].stock": colorObj.stock
                    }
                  },
                  {
                    arrayFilters: [
                      { "sizeElement.size": type },
                      { "colorElement.color": color }
                    ]
                  }
                );

                stockUpdated = true;
                break;
              }
            }
            if (stockUpdated) break;
          }

          if (!stockUpdated) {
            throw new Error("Matching size and color not found in product");
          }
        }
      }



      res.status(200).json({
        message: "Order payment status updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Error updating order payment status:", error); // Log the error for debugging
      res.status(500).json({ error: "Error updating order payment status" });
    }
  }),
  numOfOrdersForSpecificUser: asyncHandler(async (req, res) => {
    try {
      const userId = req.params.id;
      const orders = await Order.find({ user: userId });
      if (!orders) {
        return res
          .status(404)
          .json({ error: "No orders found for this user", error });
      }
      res.status(200).json({
        message: "Number of orders for the specific user",
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error("Error fetching orders for specific user:", error);
      res
        .status(500)
        .json({ error: "Error fetching orders for specific user" });
    }
  }),
};
