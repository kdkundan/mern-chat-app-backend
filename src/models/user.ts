import { createModel } from "../utils/handlers/model";

const userSchema = {
  name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true, unique: true },
  password: { type: String, trim: true, required: true },
  profilePhoto: { type: String, default: "" },
  isGroupAdmin: { type: Boolean, required: true, default: false },
};

export default createModel(userSchema, "user");
