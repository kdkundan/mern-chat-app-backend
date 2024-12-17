import { Router } from "express";
import { allUsers, createUser, signin, singleUser } from "../../../controllers/user/user.controller";
import { respondData } from "../../../utils/handlers/response";
import { authorizeUser } from "../../../utils/handlers/validations";
const router = Router();

router.get("/all/:userId", authorizeUser() ,allUsers, respondData(200, "Accounts fetched Successfully"));
router.get("/:userId",  authorizeUser(), singleUser, respondData(200, "Account fetched Successfully"));

router.post("/", createUser, respondData(200, "Account created Successfully"));
router.post("/signin", signin, respondData(200, "Sign in Successfully"));

export default router;
