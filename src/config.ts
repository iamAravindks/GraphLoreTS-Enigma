import dotenv from 'dotenv'

dotenv.config();
console.log("testing husky")
export default {
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_USER_PASS: process.env.EMAIL_USER_PASS,
    PORT: process.env.PORT
}