import { Organization } from "../models/Organization.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateEntityId } from "../utils/generateEntityId.js";


export const getOrganizations = asyncHandler(async (req, res) => {

    const { search, industry, country } = req.query;

    const filter = {
        owner: req.user._id
    };

    if (industry) {
        filter.industry = industry;
    }

    if (country) {
        filter.country = country;
    }

    if (search) {
        const rx = new RegExp(search, "i");

        filter.$or = [
            { name: rx },
            { website: rx },
            { industry: rx }
        ];
    }

    const organizations = await Organization
        .find(filter)
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: organizations.length,
        organizations
    });
});


export const getOrganization = asyncHandler(async (req, res) => {

    const organization = await Organization.findOne({
        _id: req.params.id,
        owner: req.user._id
    });

    if (!organization) {
        throw new ApiError(404, "Organization Not Found");
    }

    res.json({
        success: true,
        organization
    });
});


export const createOrganization = asyncHandler(async (req, res) => {

    const entityId = await generateEntityId(
        Organization,
        "CN"
    );

    const organization = await Organization.create({
        ...req.body,
        owner: req.user._id,
        entityId
    });

    res.status(201).json({
        success: true,
        organization
    });
});

export const updateOrganization = asyncHandler(async (req, res) => {

    // Don't allow the frontend to change ownership
    const { owner, organizationId, ...update } = req.body;

    const organization = await Organization.findOneAndUpdate(
        {
            _id: req.params.id,
            owner: req.user._id
        },
        update,
        {
            new: true,
            runValidators: true
        }
    );

    if (!organization) {
        throw new ApiError(404, "Organization Not Found");
    }

    res.json({
        success: true,
        organization
    });
});


export const deleteOrganization = asyncHandler(async (req, res) => {

    const organization = await Organization.findOneAndDelete({
        _id: req.params.id,
        owner: req.user._id
    });

    if (!organization) {
        throw new ApiError(404, "Organization Not Found");
    }

    res.json({
        success: true,
        message: "Organization Deleted"
    });
});