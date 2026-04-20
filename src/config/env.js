import dotenv from 'dotenv'
dotenv.config()
export const ENV = {
    port: process.env.PORT || 8000,
    mongo_uri: process.env.MONGO_URI,
}
