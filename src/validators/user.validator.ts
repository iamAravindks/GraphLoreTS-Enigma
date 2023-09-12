
import validator from "validator";
import { IUserInput } from "../interfaces/user.interface";

interface ErrorMessage
{
    message?: string
}
export const validatorSignUp = (userInput: IUserInput): Array<ErrorMessage> =>
{
    const { email, firstName, lastName, password } = userInput;

    const errors: Array<ErrorMessage> = [];

    if (!validator.isEmail(email)) {
        errors.push({ message: "Invalid email" })
    }

    if (validator.isEmpty(password) || !validator.isAlphanumeric(password) || !validator.isLength(password, { min: 6 })) {
        errors.push({ message: "Invalid password" })
    }

    if (validator.matches(firstName, /[0-9]/)) {
        errors.push({ message: "first name should not contains numbers" })

    }

    if (lastName && (validator.matches(lastName, /[0-9]/))) {
        errors.push({ message: "last name should not contains numbers" })
    }

    return errors
}

