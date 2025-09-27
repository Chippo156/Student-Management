import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrderItem {
  id: string | number;
  quantity: number;
  name?: string;
  price?: number;
  [key: string]: any;
}

interface OrderState {
  orders: OrderItem[];
}

const initialState: OrderState = {
  orders: [],
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    doAddOrder: (state, action: PayloadAction<OrderItem>) => {
      const productIndex = state.orders.findIndex(
        (order) => order.id === action.payload.id
      );

      if (productIndex >= 0) {
        // If the product is already in the cart, update the quantity
        state.orders[productIndex].quantity = action.payload.quantity;
      } else {
        // If the product is not in the cart, add it
        state.orders.push(action.payload);
      }
    },
    doRemoveOrder: (state, action: PayloadAction<{ id: string | number }>) => {
      state.orders = state.orders.filter(
        (order) => order.id !== action.payload.id
      );
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
});

export const { doAddOrder, doRemoveOrder, clearOrders } = orderSlice.actions;