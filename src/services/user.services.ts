import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.JWT_SECRET_AUTH_TOKEN;

export const getToken = (
  data: Record<string, any>,
  secret: any,
  config: Record<string, any>
) => jwt.sign(data, secret, config);

export const getAuthToken = (user: Record<string, any>) =>
  getToken(
    { id: user._id, email: user.email, username: user.username },
    token,
    { expiresIn: "30d" }
  );

export const tokenPayload = (token:string, secret: any) => jwt.verify(token, secret);

export const getAuthPayload = (token:string) =>
  tokenPayload(token, process.env.JWT_SECRET_AUTH_TOKEN);
