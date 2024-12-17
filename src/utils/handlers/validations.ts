import { getAuthPayload } from "../../services/user.services";
import { asyncHandler } from "./asyncHandler";
import { resp, response } from "./response";
import { Request, Response, NextFunction } from "express";

const regex = {
  name: /^[a-zA-Z ]*$/,
  email: /^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  pass: {
    len: /.{8,}/,
    num: /(?=.*\d).*\d.*/,
    small: /(?=.*[a-z]).*[a-z].*/,
    capital: /(?=.*[A-Z]).*[A-Z].*/,
    special: /(?=.*[@$!%*?&]).*[@$!%*?&].*/,
    invalid: /[^A-Za-z\d@$!%*?&]/,
  },
};

export const strings = {
  name: (str: String) => !!str.match(regex.name),
  email: (str: String) => !!str.match(regex.email),
  password: (str: String) =>
    !!str.match(regex.password) ||
    [
      str.match(regex.pass.len) ? undefined : "Minimum 8 characters required",
      str.match(regex.pass.small)
        ? undefined
        : "At-least One Small Character is required",
      str.match(regex.pass.num) ? undefined : "At-least One Number is required",
      str.match(regex.pass.capital)
        ? undefined
        : "At-least One Capital Character is required",
      str.match(regex.pass.special)
        ? undefined
        : "At-least One Special(@$!%*?&) is required",
      !str.match(regex.pass.invalid)
        ? undefined
        : "Password contains invalid characters",
    ]
      .filter((i) => i)
      .join(", "),
};

export const authorizeUserToken = (authorization: string | undefined) => {
  if (!authorization)
    return {
      error: [401, "Token is required", { authorization: authorization || "" }],
    };
  try {
    return getAuthPayload(authorization.split(" ")[1]);
  } catch (error: any) {
    if (error.message === "jwt expired")
      return {
        error: [401, "Token Expired", { authorization: authorization || "" }],
      };
    return {
      error: [401, error.message, { authorization: authorization || "" }],
    };
  }
};


interface UserIdParams {
  obj: keyof Request;
  key: string;
} 

export const authorizeUser = (userID: UserIdParams = { obj: 'params', key: 'userId' }) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const tokenPayload: any = authorizeUserToken(req.headers.authorization);
    if (tokenPayload?.error) return response(res, 401, tokenPayload.error); // Adjust status code and error message as needed
    console.log('tokenPayload', tokenPayload);
    const user = req[userID.obj][userID.key];
    if (tokenPayload.id !== user)
      return response(
        res,
        403,
        'Access Denied!',
        {},
        { message: 'Token user is different than user in params' }
      );
    next();
  });