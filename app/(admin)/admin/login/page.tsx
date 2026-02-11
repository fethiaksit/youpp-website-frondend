"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { setTokens } from "@/lib/auth";
import styles from "./login.module.css";
import Image from "next/image";



type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setTokens(response.accessToken, response.refreshToken);
      window.location.href = "/admin";
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Login failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      {/* Sol Taraf: Bilgi Paneli */}
      <section className={styles.leftPanel}>
       <div className={styles.logoWrap}>
    <img src="/youpp-logo.png" alt="Youpp Logo" width={200} />

    </div>
        <div className={styles.heroText}>
          <h1>Youpp Admin Panel</h1>
          <p>Start your journey now with us</p>
        </div>
      </section>

      {/* Sağ Taraf: Form Paneli */}
      <section className={styles.rightPanel}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Create an account</h2>
          
          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="info@youpp.com.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className={styles.eyeIcon}>👁️</span>
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <button className={styles.primaryBtn} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create account"}
            </button>

          </form>
        </div>
      </section>
    </main>
  );
}