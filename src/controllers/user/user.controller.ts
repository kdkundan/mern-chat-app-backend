import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../utils/handlers/asyncHandler";
import { resp } from "../../utils/handlers/response";
import { strings } from "../../utils/handlers/validations";
import model from "../../models/user";
import { saveModel } from "../../utils/handlers/model";
import { getAuthToken } from "../../services/user.services";

const hashLevel = 12;

export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {name, email, password, confirmPassword, } = req.body;
    const response = resp(res);

    if (strings.name(name) !== true)
      return response(400, "Invalid name", { name });
    if (strings.email(email) !== true)
      return response(400, "Invalid Email", { email });
    if (strings.password(password) !== true)
      return response(400, "Invalid password", {
        password,
        errors: strings.password(password),
      });
    if (password !== confirmPassword)
      return response(400, "Passwords does not match", {
        password,
        confirmPassword,
      });
    if (await model.findOne({ email }))
      return response(400, "An Account with this email already exists", {
        email,
      });

    const hashedPassword = await bcrypt.hash(password, hashLevel);
    const user = await saveModel(model, {
      name,
      email,
      password: hashedPassword,
    });
    const token = getAuthToken(user);

    res.locals.data = { id: user._id, token };
    next();
  }
);

export const signin = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
  const { email, password } = req.body
  const response = resp(res)

  if (strings.email(email) !== true) return response(400, "Invalid Email", { email })
  if (strings.password(password) !== true) return response(400, "Invalid password Format", { password, errors: strings.password(password) })

  const user = await model.findOne({ email })
  // if (!user) return response(400, "Email not found, Try Again", { email })
  if (!user) return response(400, "No user found", { email, password })
  const match = await bcrypt.compare(password, user.password)
  if (!match) return response(400, "Invalid credentials", { email, password })

  const token = getAuthToken(user)

  res.locals.data = { id: user._id, token }
  next()
})

export const allUsers = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {

  const response = resp(res)

  const users = await model.find();

  if (!users) return response(400, "Invalid User", undefined, { })
  const token = getAuthToken(users)

  res.locals.data = { users, token }
  next()
})

export const singleUser = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
  const { userId } = req.params
  const response = resp(res)

  const user = await model.findById(userId)

  if (!user) return response(400, "Invalid User", undefined, { userId })
  const token = getAuthToken(user)

  user.googleId = undefined
  user.password = undefined
  user.oldPasswords = undefined

  res.locals.data = { user, token }
  next()
})
