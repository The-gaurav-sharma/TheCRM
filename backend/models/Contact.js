import mongoose from "mongoose";
import { Counter } from "./Counter.js";

const contactSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    entityId: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    mobile: {
      type: String,
      trim: true,
      default: "",
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

    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    notes: {
      type: String,
      default: "",
    },

    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

contactSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
});

// Automatically generate SH-000001, SH-000002, etc.
contactSchema.pre("save", async function () {
  if (!this.isNew || this.entityId) {
    return;
  }

  const counter = await Counter.findOneAndUpdate(
    { name: "stakeholder" },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
    }
  );

  this.entityId = `SH-${String(counter.seq).padStart(6, "0")}`;
});
export const Contact = mongoose.model("Contact", contactSchema);