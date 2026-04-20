import mongoose from 'mongoose'
import { ENV } from './env.js'

const connectDatabase = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${ENV.mongo_uri}`)
        console.log(`\n mongodb connected !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log('Mongodb connection FAILED ', error)
        process.exit(1)
    }
}
export default connectDatabase
