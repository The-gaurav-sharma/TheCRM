import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { organizationsApi } from "../lib/services";
import { Card, Button, Input } from "../components/ui";
import { OrganizationFormDialog } from "../components/organizations/OrganizationFormDialog";


export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);

      const res = await organizationsApi.list({
        search: search || undefined,
      });

      setOrganizations(res.organizations || []);
    } catch (err) {
      toast.error(err.message || "Could not load organizations");
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


  const totalOrganizations = organizations.length;

  const totalEmployees = useMemo(() => {
    return organizations.reduce(
      (total, organization) =>
        total + (Number(organization.employeeCount) || 0),
      0
    );
  }, [organizations]);


  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };


  const openEdit = (organization) => {
    setEditing(organization);
    setFormOpen(true);
  };


  const handleDelete = async () => {
    if (!deleting) return;

    try {
      setDeleteLoading(true);

      await organizationsApi.remove(deleting._id);

      toast.success("Organization deleted");

      setDeleting(null);
      loadOrganizations();

    } catch (err) {
      toast.error(err.message || "Could not delete organization");
    } finally {
      setDeleteLoading(false);
    }
  };


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Organizations
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your target organizations and company information.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Organization
        </Button>

      </div>


      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2">

        <Card className="p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-primary/10 p-3">
              <Building2 className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Organizations
              </p>

              <p className="mt-1 font-display text-2xl font-bold">
                {totalOrganizations}
              </p>
            </div>

          </div>
        </Card>


        <Card className="p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-primary/10 p-3">
              <Building2 className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Employees
              </p>

              <p className="mt-1 font-display text-2xl font-bold">
                {totalEmployees.toLocaleString()}
              </p>
            </div>

          </div>
        </Card>

      </div>


      {/* Search */}
      <Card className="p-4">

        <div className="relative">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="pl-9"
          />

        </div>

      </Card>


      {/* Organizations Table */}
      <Card className="overflow-hidden">

        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading organizations...
            </p>
          </div>

        ) : organizations.length === 0 ? (

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="rounded-full bg-muted p-4">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="mt-4 font-semibold">
              No organizations found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add your first target organization to start building your CRM.
            </p>

            <Button
              className="mt-4"
              onClick={openCreate}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </Button>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="border-b bg-muted/30">

                <tr className="text-left">

                  <th className="px-5 py-4 font-medium">
                    Organization
                  </th>

                  <th className="px-5 py-4 font-medium">
                    ID
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Industry
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Location
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Employees
                  </th>

                  <th className="px-5 py-4 text-right font-medium">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y">

                {organizations.map((organization) => (

                  <tr
                    key={organization._id}
                    className="transition-colors hover:bg-muted/20"
                  >

                    {/* Organization */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">

                          <Building2 className="h-5 w-5 text-primary" />

                        </div>

                        <div>

                          <p className="font-medium">
                            {organization.name}
                          </p>

                          {organization.website && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {organization.website}
                            </p>
                          )}

                        </div>

                      </div>

                    </td>


                    {/* ID */}
                    <td className="px-5 py-4">

                      <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                        {organization.entityId || "—"}
                      </span>

                    </td>


                    {/* Industry */}
                    <td className="px-5 py-4 text-muted-foreground">
                      {organization.industry || "—"}
                    </td>


                    {/* Location */}
                    <td className="px-5 py-4 text-muted-foreground">

                      {[
                        organization.city,
                        organization.region,
                        organization.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}

                    </td>


                    {/* Employees */}
                    <td className="px-5 py-4 text-muted-foreground">

                      {organization.employeeCount
                        ? organization.employeeCount.toLocaleString()
                        : "—"}

                    </td>


                    {/* Actions */}
                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(organization)}
                          title="Edit organization"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(organization)}
                          title="Delete organization"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>

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


      {/* Delete Confirmation */}
      {deleting && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <Card className="w-full max-w-md p-6">

            <h2 className="font-display text-lg font-semibold">
              Delete organization?
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleting.name}
              </span>
              ? This action cannot be undone.
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
                variant="destructive"
                onClick={handleDelete}
                loading={deleteLoading}
              >
                Delete
              </Button>

            </div>

          </Card>

        </div>

      )}

    </div>
  );
}