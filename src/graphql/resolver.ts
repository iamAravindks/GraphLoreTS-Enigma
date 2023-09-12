import { Request } from "express"
import jwt from 'jsonwebtoken'



import { IAddressInput, IProfileUserInput, IUserInput } from "../interfaces/user.interface"
import { validatorSignUp } from "../validators/user.validator"
import { ErrorObject } from "../validators/ErrorObject"

import User, { IAddressDocument, IUserDocument } from '../models/user.model'
import config from "../config"
import mongoose, { Types } from "mongoose"

export default {
    createUser: async (args: { userInput: IUserInput }) =>
    {
        const { userInput } = args
        const errors = validatorSignUp(userInput)

        if (errors.length > 0) {
            throw new ErrorObject("Invalid inputs", 422, errors)
        }

        // eslint-disable-next-line prefer-const
        let { email, firstName, password, lastName } = userInput
        email = email.trim().toLowerCase();
        firstName = firstName.trim().toLowerCase();
        lastName = lastName?.trim().toLowerCase();

        try {

            const isUserExists = await User.exists({ email })
            if (isUserExists) {
                throw new ErrorObject("Email is Already taken", 409)
            }

            const newUser: IUserDocument = await User.create({
                email,
                firstName,
                password,
            })

            if (lastName) {
                newUser.lastName = lastName;
            }

            await newUser.save()


            return { ...newUser._doc, _id: newUser._id.toString(), createdAt: newUser.createdAt.toISOString(), updatedAt: newUser.updatedAt.toISOString() }



        } catch (error) {
            if (error instanceof ErrorObject || error instanceof Error) {
                throw error
            }
        }

    },

    login: async function (args: { email: string; password: string })
    {
        try {
            const { email, password } = args;
            const user = await User.findOne({ email });

            if (!user) {
                throw new ErrorObject("No user found ", 404);
            }

            const isPasswordMatching = await user.comparePassword(password);
            if (!isPasswordMatching) {
                throw new ErrorObject("Invalid credentials", 409);
            }
            const token = jwt.sign({
                userId: user._id,
                email
            }, config.JWT_SECRET as string, { expiresIn: "1h" })

            return {
                token, userId: user._id.toString()
            }
        } catch (error) {
            if (error instanceof ErrorObject || error instanceof Error) {
                throw error;
            }
        }
    },
    user: async function (arg: unknown, req: Request)
    {

        try {
            if (!req.isAuth) {
                throw new ErrorObject("Unauthorized", 401)
            }
            const user = await User.findById(req.userId)

            if (!user) {
                throw new ErrorObject("No user found", 404)
            }

            // return {
            //     ...user._doc,
            //     _id: user._id.toString(),
            //     createdAt: user.createdAt.toISOString(),
            //     updatedAt: user.updatedAt.toISOString()
            // }

            return user.toJSON()

        } catch (error) {
            if (error instanceof ErrorObject || error instanceof Error) {
                throw error;
            }
        }
    },

    updateUserProfile: async function (args: { userProfileInput: IProfileUserInput }, req: Request)
    {
        try {
            if (!req.isAuth) {
                throw new ErrorObject("Unauthorized", 401)
            }

            const { userProfileInput } = args
            const { address, email, firstName, lastName, password } = userProfileInput

            const user = await User.findById(req.userId) as IUserDocument;

            if (email) user.email = email
            if (firstName) user.firstName = firstName.trim();
            if (lastName) user.lastName = lastName.trim();
            if (password) user.password = password;

            if (address && address.length > 0) {
                user.address = address as Types.Array<IAddressDocument>
            }

            const storedUser = await user.save();


            return storedUser.toJSON()
            // if (address && address.length > 0) {
            //     address.forEach((add) => user.address.push(add))
            // }

        } catch (error) {
            if (error instanceof ErrorObject || error instanceof Error) {
                throw error;
            }
        }
    },
    getAddressWithID: async function (args: { addressId: string }, req: Request)
    {
        try {
            if (!req.isAuth) {
                throw new ErrorObject("Unauthorized", 401)
            }

            const { addressId } = args

            const user = await User.findOne(
                {
                    _id: req.userId,
                    "address._id": new mongoose.Types.ObjectId(addressId)
                },
                {
                    "address.$": 1,
                    "_id": 0
                }
            ) as IUserDocument

            if (!user) {
                throw new ErrorObject("No address found", 404)
            }
            const matchedAddress = user.address[0]

            return matchedAddress

        } catch (error) {
            if (error instanceof ErrorObject || error instanceof Error) {
                throw error;
            }
        }
    },
    updateUserAddressWithId: async function (args: { addressId: string, addressInput: IAddressInput }, req: Request)
    {
        try {
            if (!req.isAuth) {
                throw new ErrorObject("Unauthorized", 401)
            }

            const { addressId, addressInput } = args

            const filter = {
                _id: req.userId,
                "address._id": new mongoose.Types.ObjectId(addressId)
            }

            const user = await User.findOne(
                filter,
                {
                    "address.$": 1,
                    "_id": 0
                }
            ) as IUserDocument

            if (!user) {
                throw new ErrorObject("No address found", 404)
            }

            const { addressLine1, addressLine2, city, country, state, zip } = addressInput

            const matchedAddress = user.address[0]

            await User.updateOne(filter, {
                $set: {
                    "address.$.addressLine1": addressLine1 || matchedAddress.addressLine1,
                    "address.$.addressLine2": addressLine2 || matchedAddress.addressLine2,
                    "address.$.city": city || matchedAddress.city,
                    "address.$.state": state || matchedAddress.state,
                    "address.$.country": country || matchedAddress.country,
                    "address.$.zip": zip || matchedAddress.zip,
                },

            })
            const updatedUser = await User.findById(req.userId) as IUserDocument;
            return updatedUser.toJSON()

        } catch (error) {
            if (error instanceof ErrorObject || error instanceof Error) {
                throw error;
            }
        }
    }
}