import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        entityId: {
    type: String,
    unique: true,
    index: true,
},

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: [true, "Organization Name is required"],
            trim: true,
        },

        website: {
            type: String,
            trim: true,
            default: "",
        },

        linkedinUrl: {
            type: String,
            trim: true,
            default: "",
        },

        industry: {
            type: String,
            trim: true,
            default: "",
        },

        employeeCount: {
            type: Number,
            default: null,
            min: 0,
        },

        city: {
            type: String,
            trim: true,
            default: "",
        },

        country: {
            type: String,
            trim: true,
            default: "",
        },

        region: {
            type: String,
            trim: true,
            default: "",
        },

        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

organizationSchema.index({
    name: "text",
    website: "text",
    industry: "text",
});

export const Organization = mongoose.model(
    "Organization",
    organizationSchema
);