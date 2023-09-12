import { buildSchema } from "graphql";

export default buildSchema(`
  type Address {
    addressLine1: String
    addressLine2: String
    city: String
    state: String
    country: String
    zip: String
  }

  

  type User {
    _id: ID!
    firstName: String!
    lastName: String
    email: String!
    isAdmin: Boolean!
    resetPasswordToken: String
    resetPasswordExpire: String
    address: [Address]
    createdAt: String
    updatedAt: String
  }

  input UserInput {
    email: String!
    firstName: String!
    lastName: String
    password: String!
  }

  input AddressInput{
    addressLine1: String
    addressLine2: String
    city: String
    state: String
    country: String
    zip: String
  }

  input ProfileUserInput {
    email:String
    firstName:String
    lastName:String
    password:String
    address: [AddressInput!]
  }

  type AuthData{
    token:String!
    userId:String!
  }

  type RootQuery {
    login(email:String!,password:String!) : AuthData!
    user:User!
  }

  type RootMutation {
    createUser(userInput: UserInput): User!
    updateUserProfile(userProfileInput:ProfileUserInput) :User!
  }




  schema {
  query:RootQuery
    mutation: RootMutation
  }
`);
