import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, ChevronDown, User, LogOut, Sparkles } from "lucide-react";
import {
  Avatar,
  IconButton,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  Dialog,
  Input,
} from "../ui";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { leadsApi, contactsApi } from "../../lib/services";

/* Centered text links — a subset of the primary nav, rendered in a white pill
   exactly like the reference top bar. */
const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/leads", label: "Leads" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/contacts", label: "Contacts" },
  { to: "/tasks", label: "Follow-ups" },
];

export function TopNav({ onMenuClick }) {
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
    <header className="flex items-center gap-3">
      {/* Brand */}
      <div className="flex items-center gap-2.5 pr-2">
        <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="hidden font-display text-lg font-bold text-ink sm:block">
          TTP CRM
        </span>
      </div>

      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-ink-soft hover:bg-surface-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Centered nav pill */}
      <nav className="mx-auto hidden items-center gap-1 rounded-full bg-surface p-1.5 shadow-(--shadow-soft) lg:flex">
        {LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "rounded-full px-5 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-surface-muted text-ink shadow-sm"
                  : "text-ink-soft hover:text-ink"
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-2">
        <IconButton
          aria-label="Search"
          className="hidden sm:inline-flex"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4.5 w-4.5" />
        </IconButton>
        <Dropdown
          trigger={
            <IconButton aria-label="Notifications" className="relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-surface" />
            </IconButton>
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

