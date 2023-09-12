import mongoose, { Document, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";
import isEmail from "validator/lib/isEmail";

export interface Address
{
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    zip: string;
}

export interface IAddressDocument extends Address, Document
{
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser
{
    firstName: string;
    lastName?: string;
    password: string;
    email: string;
    isAdmin: boolean;
    resetPasswordToken?: string;
    resetPasswordExpire?: string;
    address: Array<Address>;
}



export interface IUserDocument extends IUser, Document
{
    address: Types.Array<IAddressDocument>;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(enteredPassword: string): Promise<boolean>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _doc?: any
    toJSON(): IUser;
}

export interface IUserModel extends Model<IUserDocument> { }

interface IAddressModel extends Model<IAddressDocument> { }


const userAddressSchema = new mongoose.Schema<IAddressDocument, IAddressModel>({
    addressLine1: {
        type: String,
        required: true
    },
    addressLine2: String,
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
}, { timestamps: true })

const userSchema = new mongoose.Schema<IUserDocument, IUserModel>({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: isEmail
    },
    firstName: {
        type: String,
        required: true,
        lowercase: true,
        minlength: 3,

    },
    lastName: {
        type: String,
        lowercase: true,
        minlength: 2
    },
    password: {
        type: String,
        required: true,
    },
    address: [userAddressSchema],
    resetPasswordToken: String, resetPasswordExpire: String,
}, {
    timestamps: true
});

userSchema.index({ email: 1 });

// Virtual method
userSchema.virtual("fullName").get(function (this: IUserDocument)
{
    return `${this.firstName} ${this.lastName}`;
});

// When the user registers
userSchema.pre(
    "save",
    async function (this: IUserDocument, next)
    {
        // only hash the password if it has been modified (or is new)
        if (!this.isModified("password")) return next();

        // Random additional data
        const salt = await bcrypt.genSalt(10);

        const hash = await bcrypt.hashSync(this.password, salt);

        // Replace the password with the hash
        this.password = hash;

        return next();
    }
);

// Compare a candidate password with the user's password
userSchema.methods.comparePassword = async function (
    this: IUserDocument,
    enteredPassword: string
): Promise<boolean>
{
    // So we don't have to pass this into the interface method

    return await bcrypt.compare(enteredPassword, this.password)
};


userSchema.methods.toJSON = async function (
    this: IUserDocument
)
{
    return {
        ...this._doc,
        _id: this._id.toString(),
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString(),
        address: this.address.map(add =>
        {

            return {
                addressLine1: add.addressLine1,
                addressLine2: add.addressLine2,
                city: add.city,
                state: add.city,
                country: add.country,
                zip: add.zip,
                _id: add._id.toString(),
                createdAt: add.createdAt.toISOString(),
                updatedAt: add.updatedAt.toISOString(),
            }
        })
    }
}
export default mongoose.model<IUserDocument, IUserModel>("User", userSchema);