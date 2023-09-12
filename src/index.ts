import express, { Express } from 'express'
import helmet from "helmet"
import morgan from "morgan"
import cors from 'cors'
import dotenv from 'dotenv'
import 'colorts/lib/string';
import config from './config'
import connectDB from "./db"
import { graphqlHTTP } from "express-graphql"

import graphqlSchema from "./graphql/schema"
import graphqlResolver from "./graphql/resolver"
import { IErrorObject } from "./interfaces/error.interface"
import { auth, errorHandler, notFound } from "./middlewares/middleware"


const app: Express = express()
const PORT = config.PORT

dotenv.config()

connectDB()

app.use(morgan("dev"))
app.use(helmet())
// app.use(cors())
app.use(express.json())

app.use(auth)


app.use("/graphql", graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(error)
    {
        if (!error.originalError) return error
        const { data, message = "An error occurred", code: status = 500 }: IErrorObject = error.originalError
        return { message, status, data, stack: error.stack }
    }
}))

app.use(notFound)

app.use(errorHandler)



app.listen(PORT, () =>
{
    console.log(`server listens at http://localhost:${PORT}`.blue)
    console.log(`graphiql runs on http://localhost:${PORT}/graphql`.magenta)
})