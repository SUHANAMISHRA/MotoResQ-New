import { useState } from "react";
import { login, signup } from "../services/auth";
import "./AuthForm.css";

export default function AuthForm({ onLogin, initialMode = "login" }) {
    const [mode, setMode] = useState(initialMode);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isSignup = mode === "signup";

    function switchMode() {
        setMode(isSignup ? "login" : "signup");
        setError("");
        setSuccess("");
        setPassword("");
        setConfirmPassword("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (isSignup && password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            if (isSignup) {
                await signup(name.trim(), email.trim(), password);
                setSuccess("Account created! You can now log in.");
                setMode("login");
                setPassword("");
                setConfirmPassword("");
            } else {
                const result = await login(email.trim(), password);
                onLogin(result);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-screen">
            <div className="auth-visual">
                <div className="auth-brand">MOTO<span>RESQ</span></div>
                <div className="auth-visual-content">
                    <p className="auth-eyebrow">RIDE WITH CONFIDENCE</p>
                    <h1>Every ride deserves a backup plan.</h1>
                    <p>
                        Your motorcycle companion for diagnostics,
                        maintenance, and roadside assistance.
                    </p>
                </div>
            </div>

            <div className="auth-form-side">
                <form className="auth-card" onSubmit={handleSubmit}>
                    <p className="auth-eyebrow">WELCOME TO MOTORESQ</p>
                    <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
                    <p className="auth-subtitle">
                        {isSignup
                            ? "Join MotoResQ and get ready for every ride."
                            : "Sign in to access your rider dashboard."}
                    </p>

                    {isSignup && (
                        <label className="auth-field">
                            Full name
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                minLength={2}
                                maxLength={100}
                                required
                            />
                        </label>
                    )}

                    <label className="auth-field">
                        Email address
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label className="auth-field">
                        Password
                        <div className="auth-password">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete={
                                    isSignup ? "new-password" : "current-password"
                                }
                                minLength={isSignup ? 8 : undefined}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </label>

                    {isSignup && (
                        <label className="auth-field">
                            Confirm password
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                            />
                        </label>
                    )}

                    {error && <p className="auth-error" role="alert">{error}</p>}
                    {success && <p className="auth-success">{success}</p>}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isSignup
                                ? "Create account"
                                : "Sign in"}
                    </button>

                    <p className="auth-switch">
                        {isSignup
                            ? "Already have an account?"
                            : "New to MotoResQ?"}{" "}
                        <button type="button" onClick={switchMode}>
                            {isSignup ? "Sign in" : "Create an account"}
                        </button>
                    </p>
                </form>
            </div>
        </main>
    );
}
