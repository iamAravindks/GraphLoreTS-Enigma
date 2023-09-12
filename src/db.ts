import mongoose, { ConnectOptions } from "mongoose"
import config from "./config"

const connectDB = async () =>
{
    try {
        const conn = await mongoose.connect(config.MONGODB_URL as string, {
            useUnifiedTopology: true,
            useNewUrlParser: true,

        } as ConnectOptions)

        console.log(`MongoDB successfully connected on ${conn.connection.host}`.bgGreen)
    } catch (error) {
        if (error instanceof Error) {
            console.log({
                message: error.message,
                stack: error.stack
            })
        }
        process.exit(1)
    }

}

export default connectDB