import { Inngest } from "inngest";
import connectDb from "./db";
import User from "@/models/User";
import Order from "@/models/Order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "aarcFood-next", eventKey: process.env.INNGEST_EVENT_KEY });

// --- Ingest function to SAVE user data to a database ---
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    await step.run("sync-user-to-db", async () => {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      // Defensive check: a user MUST have an email to be synced.
      if (!email_addresses || email_addresses.length === 0) {
        console.warn(`User created event for user ${id} skipped: No email address provided.`);
        return { status: "Skipped", reason: "No email address" };
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        // Safely construct the name, handling cases where parts are null
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        imageUrl: image_url || "",
      };

      console.log(`Attempting to create user in DB: ${userData._id}`);
      await connectDb();
      await User.create(userData);
      console.log(`Successfully created user: ${userData._id}`);
      return { status: "Success", userId: userData._id };
    });
  }
);

// --- Ingest function to UPDATE user data in the database ---
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event, step }) => {
    await step.run("update-user-in-db", async () => {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      if (!email_addresses || email_addresses.length === 0) {
        console.warn(`User updated event for user ${id} skipped: No email address provided.`);
        return { status: "Skipped", reason: "No email address" };
      }

      // We only include fields that should be updated. _id does not change.
      const userDataToUpdate = {
        email: email_addresses[0].email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        imageUrl: image_url || "",
      };

      console.log(`Attempting to update user in DB: ${id}`);
      await connectDb();
      await User.findByIdAndUpdate(id, userDataToUpdate);
      console.log(`Successfully updated user: ${id}`);
      return { status: "Success", userId: id };
    });
  }
);

// --- Ingest function to DELETE user data from the database ---
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    await step.run("delete-user-from-db", async () => {
      // The user object might be null if it was already deleted, so we check for the id.
      const id = event.data.id;
      
      if (!id) {
        console.error("User deleted event received without an ID. Skipping.");
        return { status: "Skipped", reason: "No ID provided" };
      }

      console.log(`Attempting to delete user from DB: ${id}`);
      await connectDb();
      await User.findByIdAndDelete(id);
      console.log(`Successfully deleted user: ${id}`);
      return { status: "Success", userId: id };
    });
  }
);

// Inngest function to create user's orders
export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 5,
      timeout: '5s'
    }
  },
  {
    event: "order/created"
  },
  // Add 'step' to the arguments here
  async ({ events, step }) => { 
    console.log("createUserOrder triggered, events:", events.length);

    const orders = events.map((event) => {
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date: event.data.date
      };
    });

    // Wrap your database logic in a step
    await step.run("insert-order-batch", async () => {
      await connectDb();
      await Order.insertMany(orders);
    });

    // Send the order/created event for each order
    for (const order of orders) {
      await inngest.send({
        name: "order/created",
        data: order
      });
    }

    return { success: true, processed: orders.length };
  }
);