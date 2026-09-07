import { useEffect, useState } from "react";
import { Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@context/AuthContext";
import { apiRequest } from "@services/api";

const EMPTY = { method: "telebirr", accountName: "", accountNumber: "" };

export default function PaymentAccounts() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAccounts() {
    try {
      const data = await apiRequest("/instructor/payment-accounts", { token });
      setAccounts(data.accounts || []);
    } catch (requestError) {
      setError(requestError.message || "Failed to load payment accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAccounts(); }, []);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await apiRequest("/instructor/payment-accounts", { token, method: "PUT", body: form });
      setMessage("Account saved. It will appear to learners after verification.");
      setForm(EMPTY);
      await loadAccounts();
    } catch (requestError) {
      setError(requestError.message || "Failed to save payment account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary"><Building2 size={22} /></span>
          <div>
            <h1 className="text-2xl font-extrabold text-ink">Payment accounts</h1>
            <p className="text-sm text-slate-500">Add the account learners should use for paid courses.</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={19} />
          <p>Account numbers are encrypted at rest. Updates require verification again, and learners only see accounts attached to the instructor who owns their course.</p>
        </div>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-ink">Payment method
            <select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none focus:border-primary">
              <option value="telebirr">Telebirr</option>
              <option value="cbe">CBE Birr / CBE</option>
            </select>
          </label>
          <label className="text-sm font-bold text-ink">Account holder name
            <input value={form.accountName} onChange={(event) => setForm({ ...form, accountName: event.target.value })} required minLength={2} maxLength={100} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-primary" />
          </label>
          <label className="text-sm font-bold text-ink sm:col-span-2">Account or wallet number
            <input value={form.accountNumber} onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} required maxLength={40} inputMode="tel" className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-primary" />
          </label>
          <button disabled={saving} className="rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60 sm:col-span-2">{saving ? "Saving..." : "Save account for verification"}</button>
        </form>

        {message && <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p>}
        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-ink">Your submitted accounts</h2>
        {loading ? <p className="mt-4 text-sm text-slate-500">Loading...</p> : accounts.length === 0 ? <p className="mt-4 text-sm text-slate-500">No accounts submitted yet.</p> : <div className="mt-4 space-y-3">{accounts.map((account) => <div key={account.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4"><div><p className="font-bold capitalize text-ink">{account.method === "cbe" ? "CBE Birr / CBE" : account.method}</p><p className="text-sm text-slate-500">{account.accountName} · {account.accountNumber}</p></div><span className={`inline-flex items-center gap-1 text-xs font-bold ${account.isVerified ? "text-emerald-700" : "text-amber-700"}`}>{account.isVerified && <CheckCircle2 size={14} />}{account.isVerified ? "Verified" : "Pending verification"}</span></div>)}</div>}
      </section>
    </div>
  );
}
