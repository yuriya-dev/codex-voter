"use client";

import { useState } from "react";
import { Lock, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getBackendUrl } from "@/lib/config";

interface AdminLoginFormProps {
  onLoginSuccess: (token: string) => void;
}

export default function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const BACKEND_URL = getBackendUrl();
      const res = await fetch(`${BACKEND_URL}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.token);
      } else {
        const errData = await res.json();
        setError(errData.error || "Password admin salah");
      }
    } catch (err) {
      setError("Koneksi backend gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
      padding: "20px 0"
    }}>
      <div 
        className="card" 
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-sm)",
            border: "2px solid var(--color-delft-blue)",
            background: "var(--color-pistachio)",
            color: "var(--color-delft-blue)",
            marginBottom: "16px",
            boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
          }}>
            <KeyRound size={26} />
          </div>
          <h2 style={{ 
            fontSize: "1.4rem", 
            fontWeight: "700", 
            fontFamily: "var(--font-heading)", 
            color: "var(--color-delft-blue)", 
            textTransform: "uppercase",
            marginBottom: "8px" 
          }}>
            Admin Authentication
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--color-delft-blue)", opacity: 0.8, fontWeight: "500" }}>
            Masukkan password administrator untuk melanjutkan.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-delft-blue)" }}>
              Password Admin
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="form-control"
                placeholder="Masukkan password admin..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  paddingLeft: "42px"
                }}
              />
              <Lock 
                size={18} 
                style={{ 
                  position: "absolute", 
                  left: "14px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--color-delft-blue)",
                  opacity: 0.7 
                }} 
              />
            </div>
          </div>

          {error && (
            <div style={{ 
              background: "rgba(239, 68, 68, 0.1)", 
              border: "2px solid var(--color-delft-blue)",
              borderRadius: "var(--radius-sm)",
              padding: "12px",
              color: "#d93838",
              fontSize: "0.85rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "3px 3px 0 0 var(--color-delft-blue)"
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              height: "48px",
              gap: "8px"
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                MEMVERIFIKASI...
              </>
            ) : (
              "MASUK DASHBOARD"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <Link href="/" className="btn btn-secondary" style={{
            width: "100%",
            fontSize: "0.85rem",
            gap: "8px",
            height: "44px"
          }}>
            <ArrowLeft size={16} /> KEMBALI KE BERANDA
          </Link>
        </div>
      </div>
    </div>
  );
}
