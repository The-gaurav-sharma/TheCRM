import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, Button, Field, Input, Textarea } from "../ui";
import { organizationsApi } from "../../lib/services";

export function OrganizationFormDialog({
  open,
  onClose,
  organization,
  onSaved,
}) {
  const editing = Boolean(organization?._id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!open) return;

    reset({
      name: organization?.name || "",
      website: organization?.website || "",
      linkedinUrl: organization?.linkedinUrl || "",
      industry: organization?.industry || "",
      employeeCount: organization?.employeeCount || "",
      city: organization?.city || "",
      country: organization?.country || "",
      region: organization?.region || "",
      notes: organization?.notes || "",
    });
  }, [open, organization, reset]);

  const onSubmit = async (form) => {
    const payload = {
      ...form,
      employeeCount:
        form.employeeCount === ""
          ? null
          : Number(form.employeeCount),
    };

    try {
      const res = editing
        ? await organizationsApi.update(organization._id, payload)
        : await organizationsApi.create(payload);

      toast.success(
        editing
          ? "Organization updated"
          : "Organization created"
      );

      onSaved?.(res.organization);
      onClose();
    } catch (err) {
      toast.error(
        err.message || "Could not save organization"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit organization" : "New organization"}
      description={
        editing
          ? "Update this organization's details."
          : "Add a target organization to your CRM."
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">

          {/* Organization Name */}
          <Field
            label="Organization Name"
            error={errors.name?.message}
            className="col-span-2"
          >
            <Input
              placeholder="ABC Technologies"
              {...register("name", {
                required: "Organization name is required",
              })}
            />
          </Field>

          {/* Website */}
          <Field label="Website">
            <Input
              type="url"
              placeholder="https://example.com"
              {...register("website")}
            />
          </Field>

          {/* LinkedIn */}
          <Field label="LinkedIn">
            <Input
              type="url"
              placeholder="https://linkedin.com/company/..."
              {...register("linkedinUrl")}
            />
          </Field>

          {/* Industry */}
          <Field label="Industry">
            <Input
              placeholder="Technology"
              {...register("industry")}
            />
          </Field>

          {/* Employee Count */}
          <Field label="Employees">
            <Input
              type="number"
              min="0"
              placeholder="500"
              {...register("employeeCount")}
            />
          </Field>

          {/* City */}
          <Field label="City">
            <Input
              placeholder="Jaipur"
              {...register("city")}
            />
          </Field>

          {/* Region */}
          <Field label="Region / State">
            <Input
              placeholder="Rajasthan"
              {...register("region")}
            />
          </Field>

          {/* Country */}
          <Field label="Country">
            <Input
              placeholder="India"
              {...register("country")}
            />
          </Field>

          {/* Notes */}
          <Field
            label="Notes"
            className="col-span-2"
          >
            <Textarea
              placeholder="Additional information about this organization..."
              {...register("notes")}
            />
          </Field>

        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={isSubmitting}
          >
            {editing
              ? "Save changes"
              : "Create organization"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}