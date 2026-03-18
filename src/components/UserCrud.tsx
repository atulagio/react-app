import { useEffect, useMemo, useState, type FormEvent } from "react";

type User = {
    id: number;
    name: string;
    email: string;
    phone?: string;
};

type UserDraft = {
    name: string;
    email: string;
    phone?: string;
};

const API_BASE = "https://jsonplaceholder.typicode.com/users";

function UserCrud() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [draft, setDraft] = useState<UserDraft>({ name: "", email: "", phone: "" });
    const [editingId, setEditingId] = useState<number | null>(null);

    const nextLocalId = useMemo(() => {
        const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
        return maxId + 1;
    }, [users]);

    useEffect(() => {
        void readUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // READ
    async function readUsers(): Promise<void> {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) {
                throw new Error(`Failed to fetch users (${response.status})`);
            }
            const data = (await response.json()) as User[];
            setUsers(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    }

    // CREATE
    async function createUser(user: UserDraft): Promise<void> {
        setError(null);
        try {
            const response = await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            if (!response.ok) {
                throw new Error(`Failed to create user (${response.status})`);
            }
            const created = (await response.json()) as Partial<User>;

            const userToAdd: User = {
                id: typeof created.id === "number" ? created.id : nextLocalId,
                name: created.name ?? user.name,
                email: created.email ?? user.email,
                phone: created.phone ?? user.phone,
            };

            setUsers((prev) => [userToAdd, ...prev]);
            setDraft({ name: "", email: "", phone: "" });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to create user");
        }
    }

    // UPDATE
    async function updateUser(id: number, updates: UserDraft): Promise<void> {
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...updates }),
            });
            if (!response.ok) {
                throw new Error(`Failed to update user (${response.status})`);
            }
            const updated = (await response.json()) as Partial<User>;

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === id
                        ? {
                              ...u,
                              name: updated.name ?? updates.name,
                              email: updated.email ?? updates.email,
                              phone: updated.phone ?? updates.phone,
                          }
                        : u
                )
            );
            setEditingId(null);
            setDraft({ name: "", email: "", phone: "" });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to update user");
        }
    }

    // DELETE
    async function deleteUser(id: number): Promise<void> {
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
            if (!response.ok) {
                throw new Error(`Failed to delete user (${response.status})`);
            }
            setUsers((prev) => prev.filter((u) => u.id !== id));
            if (editingId === id) {
                setEditingId(null);
                setDraft({ name: "", email: "", phone: "" });
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete user");
        }
    }

    function startEdit(user: User): void {
        setEditingId(user.id);
        setDraft({ name: user.name, email: user.email, phone: user.phone ?? "" });
    }

    function cancelEdit(): void {
        setEditingId(null);
        setDraft({ name: "", email: "", phone: "" });
    }

    function onSubmit(e: FormEvent): void {
        e.preventDefault();
        if (!draft.name.trim() || !draft.email.trim()) {
            setError("Name and email are required");
            return;
        }
        if (editingId == null) {
            void createUser({ ...draft, phone: draft.phone?.trim() || undefined });
        } else {
            void updateUser(editingId, { ...draft, phone: draft.phone?.trim() || undefined });
        }
    }

    return (
        <div>
            <h2>User CRUD</h2>

            <div style={{ marginBottom: 12 }}>
                <button type="button" onClick={() => void readUsers()} disabled={loading}>
                    {loading ? "Loading…" : "Refresh"}
                </button>
            </div>

            {error && (
                <div style={{ marginBottom: 12, color: "crimson" }} role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                        placeholder="Name"
                        value={draft.name}
                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    />
                    <input
                        placeholder="Email"
                        value={draft.email}
                        onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                    />
                    <input
                        placeholder="Phone (optional)"
                        value={draft.phone ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                    />

                    <button type="submit">{editingId == null ? "Create" : "Update"}</button>
                    {editingId != null && (
                        <button type="button" onClick={cancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <h3>User List</h3>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <strong>{user.name}</strong> — {user.email}
                        {user.phone ? ` — ${user.phone}` : ""}
                        <div style={{ display: "flex", gap: 8, marginTop: 6, marginBottom: 10 }}>
                            <button type="button" onClick={() => startEdit(user)}>
                                Edit
                            </button>
                            <button type="button" onClick={() => void deleteUser(user.id)}>
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserCrud;
