import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  ExternalLink,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { organizationsApi } from "../lib/services";
import { Card, Button, Input, Badge } from "../components/ui";
import { OrganizationFormDialog } from "../components/organizations/OrganizationFormDialog";
import { shortDate, relative } from "../lib/format";

/* ========================================================================= */
/* Organizations Page                                                        */
/* ========================================================================= */

export default function Organizations() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Organization details drawer
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [stakeholders, setStakeholders] = useState([]);
  const [stakeholdersLoading, setStakeholdersLoading] = useState(false);

  // Contact details drawer
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);

  /* ---------------------------------------------------------------------- */
  /* Load organizations                                                      */
  /* ---------------------------------------------------------------------- */

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);

      const res = await organizationsApi.list({
        search: search || undefined,
      });

      setOrganizations(res.organizations || []);
    } catch (err) {
      toast.error(err?.message || "Could not load organizations");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrganizations();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadOrganizations]);

  /* ---------------------------------------------------------------------- */
  /* Create / Edit                                                           */
  /* ---------------------------------------------------------------------- */

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (organization) => {
    setEditing(organization);
    setFormOpen(true);
  };

  /* ---------------------------------------------------------------------- */
  /* Delete                                                                  */
  /* ---------------------------------------------------------------------- */

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      setDeleteLoading(true);

      await organizationsApi.remove(deleting._id);

      toast.success("Organization deleted");

      setDeleting(null);

      if (selectedOrganization?._id === deleting._id) {
        setSelectedOrganization(null);
        setStakeholders([]);
      }

      await loadOrganizations();
    } catch (err) {
      toast.error(err?.message || "Could not delete organization");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Open organization                                                       */
  /* ---------------------------------------------------------------------- */

  const openOrganization = async (organization) => {
    setSelectedOrganization(organization);
    setStakeholders([]);
    setStakeholdersLoading(true);

    try {
      const res = await organizationsApi.stakeholders(organization._id);

      setStakeholders(res.stakeholders || []);
    } catch (err) {
      toast.error(
        err?.message || "Could not load organization stakeholders"
      );
    } finally {
      setStakeholdersLoading(false);
    }
  };

  const closeOrganization = () => {
    setSelectedOrganization(null);
    setStakeholders([]);
  };

  /* ---------------------------------------------------------------------- */
  /* Open stakeholder/contact                                                */
  /* ---------------------------------------------------------------------- */

  const openStakeholder = (stakeholder) => {
    if (!stakeholder) return;

    /*
      The stakeholder returned by the backend already contains:
      firstName, lastName, email, mobile, jobTitle, tags, notes, etc.

      Add the current organization object so the ContactDrawer can
      display the organization name correctly.
    */
    setSelectedStakeholder({
      ...stakeholder,
      organization:
        stakeholder.organization &&
        typeof stakeholder.organization === "object"
          ? stakeholder.organization
          : selectedOrganization,
    });
  };

  const closeStakeholder = () => {
    setSelectedStakeholder(null);
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Organizations
          </h1>

          <p className="mt-1 text-sm text-ink-soft">
            Manage your target organizations and company information.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
              <Building2 className="h-5 w-5 text-brand-600" />
            </div>

            <div>
              <p className="text-sm text-ink-soft">
                Total Organizations
              </p>

              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {organizations.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
              <Users className="h-5 w-5 text-brand-600" />
            </div>

            <div>
              <p className="text-sm text-ink-soft">
                Total Employees
              </p>

              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {organizations
                  .reduce(
                    (total, organization) =>
                      total +
                      (Number(organization.employeeCount) || 0),
                    0
                  )
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Organizations */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-ink-soft">
              Loading organizations...
            </p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
              <Building2 className="h-6 w-6 text-ink-soft" />
            </div>

            <h3 className="mt-4 font-semibold text-ink">
              No organizations found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-ink-soft">
              Add your first organization to start building your CRM.
            </p>

            <Button className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Organization
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-surface-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3.5 font-medium">
                    Organization
                  </th>

                  <th className="px-5 py-3.5 font-medium">
                    ID
                  </th>

                  <th className="px-5 py-3.5 font-medium">
                    Industry
                  </th>

                  <th className="px-5 py-3.5 font-medium">
                    Location
                  </th>

                  <th className="px-5 py-3.5 font-medium">
                    Employees
                  </th>

                  <th className="px-5 py-3.5 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {organizations.map((organization) => (
                  <tr
                    key={organization._id}
                    onClick={() => openOrganization(organization)}
                    className="cursor-pointer border-b border-line last:border-0 transition hover:bg-surface-muted/50"
                  >
                    {/* Organization */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                          <Building2 className="h-5 w-5 text-brand-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {organization.name}
                          </p>

                          {organization.website && (
                            <p className="mt-0.5 truncate text-xs text-ink-soft">
                              {organization.website}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-surface-muted px-2 py-1 font-mono text-xs text-ink-soft">
                        {organization.entityId || "—"}
                      </span>
                    </td>

                    {/* Industry */}
                    <td className="px-5 py-4 text-ink-soft">
                      {organization.industry || "—"}
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4 text-ink-soft">
                      {[
                        organization.city,
                        organization.region,
                        organization.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>

                    {/* Employees */}
                    <td className="px-5 py-4 text-ink-soft">
                      {organization.employeeCount
                        ? organization.employeeCount.toLocaleString()
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-5 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(organization)}
                          className="rounded-lg p-2 text-ink-soft transition hover:bg-surface-muted hover:text-ink"
                          title="Edit organization"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setDeleting(organization)}
                          className="rounded-lg p-2 text-ink-soft transition hover:bg-rose-50 hover:text-rose-600"
                          title="Delete organization"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit */}
      <OrganizationFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        organization={editing}
        onSaved={loadOrganizations}
      />

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              Delete organization?
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              Are you sure you want to delete{" "}
              <span className="font-medium text-ink">
                {deleting.name}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleting(null)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleteLoading}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Organization Details */}
      {selectedOrganization && (
        <OrganizationDetails
          organization={selectedOrganization}
          stakeholders={stakeholders}
          loading={stakeholdersLoading}
          onClose={closeOrganization}
          onOpenStakeholder={openStakeholder}
        />
      )}

      {/* Stakeholder / Contact Details */}
      {selectedStakeholder && (
       <ContactDrawer
  contact={selectedStakeholder}
  onClose={closeStakeholder}
  onEdit={() => {
    if (!selectedStakeholder) return;

    closeStakeholder();

    navigate("/contacts", {
      state: {
        editContact: selectedStakeholder,
      },
    });
  }}
  onDelete={() => {
    toast.info("Delete this contact from the Contacts page.");
  }}
/>
      )}
    </div>
  );
}

/* ========================================================================= */
/* Organization Details Drawer                                               */
/* ========================================================================= */

function OrganizationDetails({
  organization,
  stakeholders,
  loading,
  onClose,
  onOpenStakeholder,
}) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Organization details
            </p>

            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              {organization.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition hover:bg-surface-muted hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-7">
            {/* Hero */}
            <div className="flex items-center gap-4">
              <div className="brand-gradient flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm">
                <Building2 className="h-7 w-7" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-display text-2xl font-bold text-ink">
                  {organization.name}
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {organization.entityId && (
                    <span className="rounded-md bg-brand-50 px-2 py-1 font-mono text-xs font-medium text-brand-700">
                      {organization.entityId}
                    </span>
                  )}

                  {organization.industry && (
                    <span className="text-sm text-ink-soft">
                      {organization.industry}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Organization information */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">
                Organization information
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <OrganizationInfoItem
                  label="Website"
                  value={organization.website}
                  link
                />

                <OrganizationInfoItem
                  label="Employees"
                  value={
                    organization.employeeCount
                      ? organization.employeeCount.toLocaleString()
                      : "—"
                  }
                />

                <OrganizationInfoItem
                  label="City"
                  value={organization.city || "—"}
                />

                <OrganizationInfoItem
                  label="Region"
                  value={organization.region || "—"}
                />

                <OrganizationInfoItem
                  label="Country"
                  value={organization.country || "—"}
                />

                <OrganizationInfoItem
                  label="Industry"
                  value={organization.industry || "—"}
                />
              </div>
            </section>

            <div className="h-px bg-line" />

            {/* Stakeholders */}
            <section>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-600" />

                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">
                      Stakeholders
                    </h3>
                  </div>

                  <p className="mt-1 text-sm text-ink-soft">
                    People associated with this organization
                  </p>
                </div>

                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-50 px-2 text-xs font-semibold text-brand-700">
                  {stakeholders.length}
                </span>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="rounded-2xl border border-line bg-surface-muted p-6 text-center">
                    <p className="text-sm text-ink-soft">
                      Loading stakeholders...
                    </p>
                  </div>
                ) : stakeholders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line bg-surface-muted p-8 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface">
                      <Users className="h-5 w-5 text-ink-soft" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-ink">
                      No stakeholders yet
                    </p>

                    <p className="mt-1 text-xs text-ink-soft">
                      Contacts linked to this organization will
                      appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stakeholders.map((stakeholder) => (
                      <StakeholderCard
                        key={stakeholder._id}
                        stakeholder={stakeholder}
                        onClick={() =>
                          onOpenStakeholder(stakeholder)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line bg-surface px-6 py-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </aside>
    </div>
  );
}

/* ========================================================================= */
/* Stakeholder Card                                                          */
/* ========================================================================= */

function StakeholderCard({
  stakeholder,
  onClick,
}) {
  const fullName =
    `${stakeholder.firstName || ""} ${
      stakeholder.lastName || ""
    }`.trim();

  const initials =
    `${stakeholder.firstName?.[0] || ""}${
      stakeholder.lastName?.[0] || ""
    }`.toUpperCase() || "?";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-line bg-surface p-4 text-left transition hover:border-brand-200 hover:bg-surface-muted"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          {/* Name + ID */}
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold leading-tight text-ink">
              {fullName || "Unnamed stakeholder"}
            </p>

            {stakeholder.entityId && (
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-soft">
                {stakeholder.entityId}
              </span>
            )}
          </div>

          {/* Job title */}
          {stakeholder.jobTitle && (
            <p className="mt-1 text-sm text-ink-soft">
              {stakeholder.jobTitle}
            </p>
          )}

          {/* Email / Mobile */}
          <div className="mt-3 space-y-1.5">
            {stakeholder.email && (
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <Mail className="h-3.5 w-3.5 shrink-0" />

                <span className="truncate">
                  {stakeholder.email}
                </span>
              </div>
            )}

            {stakeholder.mobile && (
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <Phone className="h-3.5 w-3.5 shrink-0" />

                <span>
                  {stakeholder.mobile}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {stakeholder.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stakeholder.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="mt-3 text-xs font-medium text-brand-700 opacity-0 transition group-hover:opacity-100">
            View contact details →
          </p>
        </div>
      </div>
    </button>
  );
}

/* ========================================================================= */
/* Contact Drawer                                                            */
/* ========================================================================= */

function ContactDrawer({
  
  contact,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!contact) return null;

  const fullName =
    `${contact.firstName || ""} ${
      contact.lastName || ""
    }`.trim();

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Contact details
            </p>

            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              {fullName || "Contact"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition hover:bg-surface-muted hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Identity */}
            <div className="flex items-center gap-4">
              <div className="brand-gradient flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white">
                {`${contact.firstName?.[0] || ""}${
                  contact.lastName?.[0] || ""
                }`.toUpperCase() || "?"}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-xl font-semibold text-ink">
                    {fullName}
                  </h3>

                  {contact.favorite && (
                    <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                  )}
                </div>

                {contact.entityId && (
                  <p className="mt-1 font-mono text-xs text-ink-soft">
                    {contact.entityId}
                  </p>
                )}

                {(contact.jobTitle ||
                  contact.organization) && (
                  <p className="mt-1 text-sm text-ink-soft">
                    {[
                      contact.jobTitle,
                      contact.organization?.name,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}

                {contact.favorite && (
                  <Badge className="mt-2 bg-amber-50 text-[11px] text-amber-700">
                    Favorite
                  </Badge>
                )}
              </div>
            </div>

            {/* Contact fields */}
            <div className="divide-y divide-line rounded-2xl border border-line">
              {contact.email && (
                <ContactDrawerRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                >
                  <a
                    href={`mailto:${contact.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="break-all text-brand-700 hover:underline"
                  >
                    {contact.email}
                  </a>
                </ContactDrawerRow>
              )}

              {contact.mobile && (
                <ContactDrawerRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Mobile"
                >
                  <a
                    href={`tel:${contact.mobile}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-brand-700 hover:underline"
                  >
                    {contact.mobile}
                  </a>
                </ContactDrawerRow>
              )}

              {contact.organization && (
                <ContactDrawerRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="Organization"
                >
                  <span className="text-ink">
                    {contact.organization?.name ||
                      "Unknown organization"}
                  </span>
                </ContactDrawerRow>
              )}
            </div>

            {/* Tags */}
            {contact.tags?.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-brand-50 text-brand-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {contact.notes && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
                  Notes
                </p>

                <p className="whitespace-pre-line rounded-xl bg-surface-muted px-4 py-3 text-sm leading-relaxed text-ink">
                  {contact.notes}
                </p>
              </div>
            )}

            {/* Meta */}
            {contact.createdAt && (
              <p className="text-xs text-ink-soft">
                Added {shortDate(contact.createdAt)}{" "}
                <span className="opacity-60">
                  ({relative(contact.createdAt)})
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-line bg-surface px-6 py-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </aside>
    </div>
  );
}

/* ========================================================================= */
/* Contact Drawer Row                                                        */
/* ========================================================================= */

function ContactDrawerRow({
  icon,
  label,
  children,
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="shrink-0 text-ink-soft">
        {icon}
      </span>

      <span className="w-20 shrink-0 text-xs text-ink-soft">
        {label}
      </span>

      <span className="min-w-0 text-sm">
        {children}
      </span>
    </div>
  );
}

/* ========================================================================= */
/* Organization Info Item                                                    */
/* ========================================================================= */

function OrganizationInfoItem({
  label,
  value,
  link = false,
}) {
  const hasValue = value && value !== "—";

  return (
    <div className="rounded-xl border border-line bg-surface-muted px-4 py-3">
      <p className="text-xs font-medium text-ink-soft">
        {label}
      </p>

      {link && hasValue ? (
        <a
          href={
            value.startsWith("http")
              ? value
              : `https://${value}`
          }
          target="_blank"
          rel="noreferrer"
          className="mt-1 flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
        >
          <span className="truncate">{value}</span>

          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ) : (
        <p className="mt-1 truncate text-sm font-medium text-ink">
          {value || "—"}
        </p>
      )}
    </div>
  );
}