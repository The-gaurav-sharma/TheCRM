import { useState, useMemo } from "react";
import { Search, Bell, Menu, ChevronDown, User, LogOut, X } from "lucide-react";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  Dialog,
  Input,
} from "../ui";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { leadsApi, contactsApi } from "../../lib/services";

/* Sticky top navbar: mobile menu toggle, global search, notifications, profile. */
export function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ leads: [], contacts: [] });

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults({ leads: [], contacts: [] });
      return;
    }

    try {
      const q = query.toLowerCase();
      const [leadsRes, contactsRes] = await Promise.all([
        leadsApi.list(),
        contactsApi.list(),
      ]);

      const leads = (leadsRes.leads || []).filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q)
      );
      const contacts = (contactsRes.contacts || []).filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      );

      setSearchResults({ leads: leads.slice(0, 5), contacts: contacts.slice(0, 5) });
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const navigateToResult = (type, item) => {
    setSearchOpen(false);
    setSearchQuery("");
    if (type === "lead") navigate(`/leads`, { state: { highlightId: item._id } });
    else navigate(`/contacts`, { state: { highlightId: item._id } });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur md:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-ink-soft hover:bg-surface-muted md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          placeholder="Search leads, contacts…"
          onClick={() => setSearchOpen(true)}
          className="h-10 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/70 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Dropdown
          trigger={
            <button
              className="relative rounded-full border border-line bg-surface p-2.5 text-ink-soft transition hover:text-ink"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-surface" />
            </button>
          }
        >
          <DropdownLabel>Notifications</DropdownLabel>
          <DropdownSeparator />
          <DropdownItem>No new notifications</DropdownItem>
        </Dropdown>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 transition hover:bg-surface-muted">
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
              <ChevronDown className="h-4 w-4 text-ink-soft" />
            </button>
          }
        >
          <DropdownLabel>{user?.email}</DropdownLabel>
          <DropdownSeparator />
          <DropdownItem onClick={() => navigate("/settings")}>
            <User className="h-4 w-4" /> Profile & settings
          </DropdownItem>
          <DropdownItem danger onClick={logout}>
            <LogOut className="h-4 w-4" /> Log out
          </DropdownItem>
        </Dropdown>
      </div>

      {/* Search Modal */}
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} title="Search" description="Find leads and contacts">
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />

          {searchQuery && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.leads.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-2">Leads</p>
                  <div className="space-y-2">
                    {searchResults.leads.map((lead) => (
                      <button
                        key={lead._id}
                        onClick={() => navigateToResult("lead", lead)}
                        className="w-full text-left p-2 rounded-lg hover:bg-surface-muted transition"
                      >
                        <p className="text-sm font-medium text-ink">{lead.name}</p>
                        <p className="text-xs text-ink-soft">{lead.company}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {searchResults.contacts.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-ink-soft mb-2">Contacts</p>
                  <div className="space-y-2">
                    {searchResults.contacts.map((contact) => (
                      <button
                        key={contact._id}
                        onClick={() => navigateToResult("contact", contact)}
                        className="w-full text-left p-2 rounded-lg hover:bg-surface-muted transition"
                      >
                        <p className="text-sm font-medium text-ink">{contact.name}</p>
                        <p className="text-xs text-ink-soft">{contact.email}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {searchResults.leads.length === 0 && searchResults.contacts.length === 0 && (
                <p className="text-sm text-ink-soft text-center py-4">No results found</p>
              )}
            </div>
          )}
        </div>
      </Dialog>
    </header>
  );
}

