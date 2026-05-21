import { Inngest } from "inngest";
import connectDb from "./db";
import User from "@/models/User";
import Order from "@/models/Order";

// Create Inngest Client
export const inngest = new Inngest({
  id: "aarcFood-next",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// ==============================
// Sync User Creation
// ==============================
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [{ event: "clerk/user.created" }],
  },

  async ({ event, step }) => {
    await step.run("sync-user-to-db", async () => {
      const {
        id,
        first_name,
        last_name,
        email_addresses,
        image_url,
      } = event.data;

      if (!email_addresses || email_addresses.length === 0) {
        return {
          status: "Skipped",
          reason: "No email address",
        };
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        imageUrl: image_url || "",
      };

      await connectDb();

      await User.create(userData);

      return {
        success: true,
      };
    });
  }
);

// ==============================
// Sync User Update
// ==============================
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk/user.updated" }],
  },

  async ({ event, step }) => {
    await step.run("update-user-in-db", async () => {
      const {
        id,
        first_name,
        last_name,
        email_addresses,
        image_url,
      } = event.data;

      if (!email_addresses || email_addresses.length === 0) {
        return {
          status: "Skipped",
          reason: "No email address",
        };
      }

      const userDataToUpdate = {
        email: email_addresses[0].email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        imageUrl: image_url || "",
      };

      await connectDb();

      await User.findByIdAndUpdate(id, userDataToUpdate);

      return {
        success: true,
      };
    });
  }
);

// ==============================
// Sync User Deletion
// ==============================
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
    triggers: [{ event: "clerk/user.deleted" }],
  },

  async ({ event, step }) => {
    await step.run("delete-user-from-db", async () => {
      const id = event.data.id;

      if (!id) {
        return {
          status: "Skipped",
          reason: "No ID provided",
        };
      }

      await connectDb();

      await User.findByIdAndDelete(id);

      return {
        success: true,
      };
    });
  }
);

// ==============================
// Create User Order
// ==============================
export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",

    triggers: [{ event: "order/created" }],

    batchEvents: {
      maxSize: 5,
      timeout: "5s",
    },
  },

  async ({ events, step }) => {
    console.log("createUserOrder triggered");

    const orders = events.map((event) => ({
      userId: event.data.userId,
      items: event.data.items,
      amount: event.data.amount,
      address: event.data.address,
      date: event.data.date,
    }));

    await step.run("insert-orders", async () => {
      await connectDb();

      await Order.insertMany(orders);
    });

    return {
      success: true,
      processed: orders.length,
    };
  }
);