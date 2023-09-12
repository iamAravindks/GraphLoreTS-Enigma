import { Request } from 'express'
import { Types } from "mongoose";
import { Address } from "../models/user.model";
export interface IUserInput
{
    email: string;
    firstName: string;
    lastName?: string
    password: string
}

export interface ICreateUserArgs
{
    userInput?: IUserInput
}

export interface IAuthData
{
    token: string
    userID: string
}


export interface IProfileUserInput
{
    email?: string;
    firstName?: string;
    lastName?: string
    password?: string
    address?: Array<Address>
}