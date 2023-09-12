import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import config from "../config";
import { ErrorObject } from "../validators/ErrorObject";

import { IErrorObject } from '../interfaces/error.interface'

declare module 'express-serve-static-core' {
    interface Request
    {
        isAuth: boolean;
        userId?: Types.ObjectId | string
    }
}

interface ITokenDecode
{
    userId?: Types.ObjectId | string
    email?: string
}


export const auth = (req: Request, res: Response, next: NextFunction): void =>
{

    const authHeader = req.get("Authorization")
    if (!authHeader) {
        req.isAuth = false;
        return next()
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        req.isAuth = false;
        return next()
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, config.JWT_SECRET as string) as ITokenDecode;

    } catch (error) {
        req.isAuth = false;
        return next(new ErrorObject("Verification failed , try to login again", 401));
    }
    req.userId = decodedToken.userId;
    req.isAuth = true
    return next()


}

export function notFound(req: Request, res: Response, next: NextFunction)
{

    const error = new ErrorObject(`🔍 - Not Found - ${req.method} ${req.url}`, 404);
    return next(error);
}


export const errorHandler = (error: IErrorObject, req: Request, res: Response, next: NextFunction) =>
{

    const status = error.code || 500;
    const message = error.message;
    const data = error.data;
    console.log(`${message}`.red)
    res.status(status).json({ message: message, data: data, stack: error.stack });
}