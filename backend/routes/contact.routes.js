 import { Router } from "express";
 import { getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    getUnassignedContacts
  } from "../controllers/contact.controller.js";

  import { protect } from "../middleware/auth.middleware.js";
  const router = Router();
  router.use(protect);


  router.route("/").get(getContacts).post(createContact);
  router.get("/unassigned", protect, getUnassignedContacts);
  router.route("/:id").get(getContact).put(updateContact).delete(deleteContact);

  export default router;