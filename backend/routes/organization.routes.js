import { Router } from "express";

import {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationStakeholders
} from "../controllers/organization.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router
    .route("/")
    .get(getOrganizations)
    .post(createOrganization);

    router.get(
  "/:id/stakeholders",
  protect,
  getOrganizationStakeholders
);

router
    .route("/:id")
    .get(getOrganization)
    .put(updateOrganization)
    .delete(deleteOrganization);

export default router;