export const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk'
    },
    { event: 'clerk/user.created' },

    async ({ event, logger }) => { // <-- Add 'logger' here
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            imageUrl: image_url
        }
        
        try {
            logger.info("Connecting to DB...");
            await connectDb();
            logger.info("DB connected. Creating user...");

            const newUser = await User.create(userData);
            logger.info("User created successfully!", newUser);

            return { success: true, user: newUser };

        } catch (error) {
            logger.error("Error creating user:", error); // This will log the error in Inngest
            throw error; // This will make the run fail so you can see it
        }
    }
)