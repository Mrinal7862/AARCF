import mongoose from 'mongoose'

let cached = global.mongoose || null;

if(!cached){
    cached = global.mongoose = {conn: null, promise: null}
}

async function connectDb(){
    if(cached.conn){
        return cached.conn
    }
    if(!cached.promise){
        const opts = {
            bufferCommands: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        cached.promise = mongoose.connect(`${process.env.MONGODB_URI}/CustomEcom`, opts)
            .then((mongooseInstance) => {
                console.log("MongoDB connected successfully")
                // Return the connection object
                return mongooseInstance.connection
            })
            .catch(err => {
                // Clear promise so future calls can retry
                cached.promise = null
                console.error("MongoDB connection error", err)
                throw err
            })

    }

    cached.conn = await cached.promise
    return cached.conn
} 

export default connectDb;