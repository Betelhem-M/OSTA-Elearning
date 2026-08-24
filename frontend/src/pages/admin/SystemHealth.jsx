import { useEffect, useState } from "react";
import {
  Activity,
  Database,
  Server,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Cpu,
} from "lucide-react";

import { apiRequest } from "@services/api";

export default function SystemHealth() {
  const [health, setHealth] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD SYSTEM HEALTH
  // =====================================================

  async function loadHealth() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("osta_token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data = await apiRequest(
        "/admin/system-health",
        {
          token,
        }
      );

      setHealth(data);
    } catch (err) {
      console.error(
        "System health error:",
        err
      );

      setError(
        err.message ||
          "Failed to load system health."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadHealth();
  }, []);

  // =====================================================
  // STATUS BADGE
  // =====================================================

  function StatusBadge({ status }) {
    const healthy = status === "healthy";

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
          healthy
            ? "bg-primary-light text-primary"
            : "bg-red-50 text-red-600"
        }`}
      >
        {healthy ? (
          <CheckCircle size={12} />
        ) : (
          <AlertTriangle size={12} />
        )}

        {healthy ? "Healthy" : "Degraded"}
      </span>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        {/* HEADER */}

        <div>
          <h1 className="text-xl font-extrabold text-ink">
            System Health
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor OSTA API, database, and server health.
          </p>
        </div>

        {/* LOADING CARD */}

        <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <p className="text-sm text-slate-500">
            Checking system health...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink">
            System Health
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor OSTA API, database, and server health.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadHealth}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =================================================
          OVERALL STATUS
      ================================================= */}

      {health && (
        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* LEFT */}

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Activity size={23} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-ink">
                  Overall System Status
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest check:{" "}
                  {health.checkedAt
                    ? new Date(
                        health.checkedAt
                      ).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>

            {/* STATUS */}

            <StatusBadge
              status={health.status}
            />
          </div>
        </section>
      )}

      {/* =================================================
          HEALTH CARDS
      ================================================= */}

      {health && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* =================================================
              API
          ================================================= */}

          <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
            <div className="flex items-start justify-between">
              
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  API
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      health.api?.status
                    }
                  />
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Activity size={19} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              {health.api?.message ||
                "API status unavailable."}
            </p>
          </section>

          {/* =================================================
              DATABASE
          ================================================= */}

          <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Database
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      health.database?.status
                    }
                  />
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Database size={19} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Response time:{" "}
              {health.database
                ?.responseTimeMs !== null &&
              health.database
                ?.responseTimeMs !==
                undefined
                ? `${health.database.responseTimeMs} ms`
                : "Unavailable"}
            </p>
          </section>

          {/* =================================================
              SERVER
          ================================================= */}

          <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Server
                </p>

                <p className="mt-2 text-lg font-extrabold text-ink">
                  {health.server
                    ?.uptimeFormatted ||
                    "—"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Server size={19} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Current process uptime
            </p>
          </section>
        </div>
      )}

      {/* =================================================
          SERVER INFORMATION
      ================================================= */}

      {health && (
        <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

          {/* HEADER */}

          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Cpu size={19} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-ink">
                  Server Information
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Runtime information from the Node.js server.
                </p>
              </div>

            </div>
          </div>

          {/* DETAILS */}

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* NODE VERSION */}

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400">
                Node.js
              </p>

              <p className="mt-2 text-sm font-extrabold text-ink">
                {health.server
                  ?.nodeVersion ||
                  "—"}
              </p>
            </div>

            {/* PLATFORM */}

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400">
                Platform
              </p>

              <p className="mt-2 text-sm font-extrabold text-ink">
                {health.server
                  ?.platform ||
                  "—"}
              </p>
            </div>

            {/* ENVIRONMENT */}

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400">
                Environment
              </p>

              <p className="mt-2 text-sm font-extrabold text-ink">
                {health.server
                  ?.environment ||
                  "—"}
              </p>
            </div>

            {/* UPTIME */}

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400">
                Uptime
              </p>

              <p className="mt-2 text-sm font-extrabold text-ink">
                {health.server
                  ?.uptimeFormatted ||
                  "—"}
              </p>
            </div>

          </div>
        </section>
      )}

    </div>
  );
}