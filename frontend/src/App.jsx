import { useEffect, useState } from "react";
import "./App.css";
import AuthForm from "./components/AuthForm";

const STORAGE_KEY = "motoreSResQ.motorcycle";
const PROFILE_KEY = "motoresq.profile";

const emptyMotorcycle = {
  make: "",
  model: "",
  year: "",
  mileage: "",
  photo: "",
};

const menuItems = [
  { icon: "⌂", label: "Dashboard" },
  { icon: "🏍", label: "My Motorcycle" },
  { icon: "⌕", label: "Diagnose a Problem" },
  { icon: "✦", label: "AI Assistant" },
  { icon: "▤", label: "Maintenance" },
  { icon: "✚", label: "Emergency Assistance" },
];

const actions = [
  {
    icon: "⌕",
    title: "Diagnose a Problem",
    description: "Find possible causes and troubleshooting steps.",
    color: "orange",
    section: "Diagnose a Problem",
  },
  {
    icon: "✦",
    title: "Ask AI Assistant",
    description: "Get help understanding motorcycle problems.",
    color: "purple",
    section: "AI Assistant",
  },
  {
    icon: "▤",
    title: "Maintenance Records",
    description: "Keep track of servicing and repairs.",
    color: "blue",
    section: "Maintenance",
  },
  {
    icon: "✚",
    title: "Emergency Assistance",
    description: "Access emergency contacts and location tools.",
    color: "red",
    section: "Emergency Assistance",
  },
];

function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [authMode, setAuthMode] = useState(null);
  const [session, setSession] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const [motorcycle, setMotorcycle] = useState(emptyMotorcycle);
  const [savedMotorcycle, setSavedMotorcycle] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showMotorcycleForm, setShowMotorcycleForm] = useState(false);

  const [profileName, setProfileName] = useState("Rider");
  const [profileDraft, setProfileDraft] = useState("Rider");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Connection failed");
        }
        return response.json();
      })
      .then((data) => {
        setApiStatus(
          data.status === "healthy" ? "Connected" : "Unavailable"
        );
      })
      .catch(() => setApiStatus("Offline"));
  }, []);

  useEffect(() => {
    try {
      const savedBike = localStorage.getItem(STORAGE_KEY);
      if (savedBike) {
        setSavedMotorcycle(JSON.parse(savedBike));
      }

      const savedProfile = localStorage.getItem(PROFILE_KEY);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const name = profile.name || "Rider";
        setProfileName(name);
        setProfileDraft(name);
      }
    } catch (error) {
      console.error("Could not load saved data:", error);
    }
  }, []);
  function handleLogin(result) {
    setSession(result);
    setProfileName(result.user.name);
    setProfileDraft(result.user.name);
    setAuthMode(null);
  }

  function handleLogout() {
    setSession(null);
    setAuthMode(null);
    setShowProfile(false);
    setShowMotorcycleForm(false);
    setProfileName("Rider");
    setProfileDraft("Rider");
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an image smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const photo = reader.result;

      if (typeof photo === "string") {
        setMotorcycle((previous) => ({
          ...previous,
          photo,
        }));
        setPhotoPreview(photo);
      }
    };

    reader.readAsDataURL(file);
  }

  function openMotorcycleForm() {
    const details = savedMotorcycle || emptyMotorcycle;

    setMotorcycle({ ...details });
    setPhotoPreview(details.photo || "");
    setShowMotorcycleForm(true);
  }

  function saveMotorcycle(event) {
    event.preventDefault();

    const details = {
      make: motorcycle.make.trim(),
      model: motorcycle.model.trim(),
      year: motorcycle.year,
      mileage: motorcycle.mileage,
      photo: motorcycle.photo || "",
    };

    if (!details.make || !details.model) {
      alert("Please enter motorcycle make and model.");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
      setSavedMotorcycle(details);
      setShowMotorcycleForm(false);
      setMotorcycle({ ...emptyMotorcycle });
      setPhotoPreview("");
    } catch {
      alert(
        "Could not save your motorcycle. Try using a smaller image."
      );
    }
  }

  function clearMotorcyclePhoto() {
    setPhotoPreview("");
    setMotorcycle((previous) => ({
      ...previous,
      photo: "",
    }));
  }

  function removeMotorcycle() {
    if (!window.confirm("Remove your saved motorcycle?")) return;

    localStorage.removeItem(STORAGE_KEY);
    setSavedMotorcycle(null);
    setMotorcycle({ ...emptyMotorcycle });
    setPhotoPreview("");
    setShowMotorcycleForm(false);
  }

  function openProfile() {
    setProfileDraft(profileName);
    setShowProfile(true);
  }

  function saveProfile(event) {
    event.preventDefault();

    const name = profileDraft.trim();

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({ name })
      );

      setProfileName(name);
      setShowProfile(false);
    } catch {
      alert("Could not save your profile.");
    }
  }

  function openSection(label) {
    setActiveMenu(label);

    if (label === "My Motorcycle") {
      openMotorcycleForm();
      return;
    }

    if (label === "Emergency Assistance") {
      document.getElementById("emergency-section")?.scrollIntoView({
        behavior: "smooth",
      });
      return;
    }

    if (label === "Maintenance") {
      document.getElementById("maintenance-section")?.scrollIntoView({
        behavior: "smooth",
      });
      return;
    }

    if (label === "Dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    document.getElementById("quick-actions")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  const riderInitial = profileName.charAt(0).toUpperCase();
  if (authMode && !session) {
    return (
      <AuthForm
        key={authMode}
        initialMode={authMode}
        onLogin={handleLogin}
      />
    );
  }
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            openSection("Dashboard");
          }}
        >
          <span className="brand-mark">M</span>
          <span>
            <strong>MotoResQ</strong>
            <small>RIDE WITH CONFIDENCE</small>
          </span>
        </a>

        <div className="nav-caption">WORKSPACE</div>

        <nav className="navigation">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.label}
              className={`nav-item ${activeMenu === item.label ? "active" : ""
                }`}
              onClick={() => openSection(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>

              {item.label === "Emergency Assistance" && (
                <span className="nav-alert">!</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">?</span>
            <strong>Need help?</strong>
            <p>Get assistance with your ride.</p>
            <button
              type="button"
              onClick={() => openSection("AI Assistant")}
            >
              Get support →
            </button>
          </div>

          <button
            type="button"
            className="profile-row profile-row-button"
            onClick={openProfile}
          >
            <div className="avatar">{riderInitial}</div>
            <div className="profile-info">
              <strong>{profileName}</strong>
              <small>MotoResQ User</small>
            </div>
            <span className="profile-menu">•••</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="account-header">
          <div className="account-header-actions">
            {session ? (
              <>
                <button
                  type="button"
                  className="account-login"
                  onClick={handleLogout}
                >
                  Log out
                </button>

                <button
                  type="button"
                  className="account-avatar"
                  aria-label="Open rider profile"
                  onClick={openProfile}
                >
                  <span>{riderInitial}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="account-login"
                  onClick={() => setAuthMode("login")}
                >
                  Log in
                </button>

                <button
                  type="button"
                  className="account-signup"
                  onClick={() => setAuthMode("signup")}
                >
                  Sign up
                </button>

                <button
                  type="button"
                  className="account-avatar"
                  aria-label="Open login"
                  onClick={() => setAuthMode("login")}
                >
                  <span>R</span>
                </button>
              </>
            )}
          </div>
        </div>


        <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">
                YOUR MOTORCYCLE COMPANION
              </p>

              <h1>
                Dashboard<span>.</span>
              </h1>

              <p className="muted">
                Stay prepared, keep your motorcycle healthy,
                and ride safely.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={openMotorcycleForm}
            >
              <span>＋</span>
              {savedMotorcycle ? "Edit Motorcycle" : "Add Motorcycle"}
            </button>
          </section>

          {/* HERO BANNER */}
          <section className="hero-card cinematic-hero">

            {/* User's motorcycle photo */}
            <div className="hero-photo-layer">
              {savedMotorcycle?.photo && (
                <img
                  src={savedMotorcycle.photo}
                  alt={`${savedMotorcycle.make} ${savedMotorcycle.model}`}
                  className="hero-background-photo"
                />
              )}
            </div>

            {/* Permanent smoke and gradient effect */}
            <div className="hero-smoke-layer" />

            {/* Text content */}
            <div className="hero-content">
              <span className="hero-label">
                WELCOME TO MOTORESQ
              </span>

              <h2>
                Every ride deserves
                <br />
                <span className="hero-highlight">
                  peace of mind.
                </span>
              </h2>

              <p>
                Diagnose problems, manage maintenance,
                and get roadside assistance—all in one place.
              </p>

              <button
                type="button"
                className="hero-button"
                onClick={() => openSection("Diagnose a Problem")}
              >
                Explore assistance <span>→</span>
              </button>
            </div>

          </section>

          {/* DASHBOARD STATS */}
          <section className="stats-grid">
            <article className="stat-card">
              {savedMotorcycle?.photo ? (
                <img
                  className="stat-bike-photo"
                  src={savedMotorcycle.photo}
                  alt={`${savedMotorcycle.make} ${savedMotorcycle.model}`}
                />
              ) : (
                <div className="stat-icon orange-bg">🏍</div>
              )}

              <div>
                <p>My Motorcycle</p>
                <h3>
                  {savedMotorcycle
                    ? "1 registered"
                    : "Not added"}
                </h3>

                <span className="stat-note">
                  {savedMotorcycle
                    ? `${savedMotorcycle.make} ${savedMotorcycle.model}`
                    : "Add your bike to get started"}
                </span>

                {savedMotorcycle && (
                  <button
                    type="button"
                    className="edit-bike-button"
                    onClick={openMotorcycleForm}
                  >
                    Edit motorcycle
                  </button>
                )}
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon blue-bg">▤</div>
              <div>
                <p>Maintenance</p>
                <h3>Stay on track</h3>
                <span className="stat-note">
                  Record upcoming service
                </span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon red-bg">✚</div>
              <div>
                <p>Emergency Support</p>
                <h3>Quick access</h3>
                <span className="stat-note">
                  Keep help within reach
                </span>
              </div>
            </article>
          </section>

          {/* QUICK ACTIONS */}
          <section
            id="quick-actions"
            className="section-block"
          >
            <div className="section-heading">
              <div>
                <h2>Quick actions</h2>
                <p>What do you need help with today?</p>
              </div>
            </div>

            <div className="actions-grid">
              {actions.map((action) => (
                <button
                  type="button"
                  key={action.title}
                  className="action-card"
                  onClick={() =>
                    openSection(action.section)
                  }
                >
                  <span
                    className={`action-icon ${action.color}`}
                  >
                    {action.icon}
                  </span>

                  <span className="action-title">
                    {action.title}
                  </span>

                  <span className="action-description">
                    {action.description}
                  </span>

                  <span className="action-arrow">↗</span>
                </button>
              ))}
            </div>
          </section>

          {/* MAINTENANCE AND EMERGENCY */}
          <section className="lower-grid">
            <article
              id="maintenance-section"
              className="panel"
            >
              <div className="panel-heading">
                <div>
                  <h2>Maintenance overview</h2>
                  <p>
                    Keep your bike ready for the next ride.
                  </p>
                </div>

                <span className="panel-icon">▤</span>
              </div>

              <div className="empty-state">
                <div className="empty-icon">✓</div>

                <strong>
                  No maintenance records yet
                </strong>

                <p>
                  Your service and repair records will
                  appear here.
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    alert(
                      "Maintenance record form is coming next."
                    )
                  }
                >
                  Prepare maintenance log
                </button>
              </div>
            </article>

            <article
              id="emergency-section"
              className="panel emergency-panel"
            >
              <div className="panel-heading">
                <div>
                  <h2>Emergency assistance</h2>
                  <p>
                    Keep emergency contacts accessible.
                  </p>
                </div>

                <span className="panel-icon emergency-icon">
                  ✚
                </span>
              </div>

              <div className="emergency-number">
                <div>
                  <span>India emergency response</span>
                  <strong>112</strong>
                </div>

                <a href="tel:112" className="call-button">
                  Call 112 ↗
                </a>
              </div>

              <div className="emergency-number">
                <div>
                  <span>Ambulance service</span>
                  <strong>108</strong>
                </div>

                <a href="tel:108" className="call-button">
                  Call 108 ↗
                </a>
              </div>

              <p className="emergency-note">
                In an emergency, call the appropriate
                local service. Number availability
                can vary by region.
              </p>
            </article>
          </section>

          <footer className="footer">
            <span>© 2026 MotoResQ</span>
            <span>Ride safe. Stay prepared.</span>
          </footer>
        </div>
      </main>

      {/* MOTORCYCLE FORM */}
      {showMotorcycleForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowMotorcycleForm(false);
            }
          }}
        >
          <section
            className="motorcycle-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="motorcycle-modal-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setShowMotorcycleForm(false)
              }
              aria-label="Close"
            >
              ×
            </button>

            <p className="eyebrow">YOUR GARAGE</p>

            <h2 id="motorcycle-modal-title">
              {savedMotorcycle
                ? "Edit your motorcycle"
                : "Add your motorcycle"}
            </h2>

            <p className="muted">
              Enter your bike details to personalize
              your dashboard.
            </p>

            <form onSubmit={saveMotorcycle}>
              <label>
                Motorcycle photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>

              {photoPreview && (
                <div className="bike-photo-preview">
                  <img
                    src={photoPreview}
                    alt="Motorcycle preview"
                  />

                  <button
                    type="button"
                    className="remove-bike"
                    onClick={clearMotorcyclePhoto}
                  >
                    Clear motorcycle photo
                  </button>
                </div>
              )}

              <label>
                Make / brand *
                <input
                  value={motorcycle.make}
                  onChange={(event) =>
                    setMotorcycle({
                      ...motorcycle,
                      make: event.target.value,
                    })
                  }
                  placeholder="e.g. Honda"
                  required
                />
              </label>

              <label>
                Model *
                <input
                  value={motorcycle.model}
                  onChange={(event) =>
                    setMotorcycle({
                      ...motorcycle,
                      model: event.target.value,
                    })
                  }
                  placeholder="e.g. Activa 6G"
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Year
                  <input
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    value={motorcycle.year}
                    onChange={(event) =>
                      setMotorcycle({
                        ...motorcycle,
                        year: event.target.value,
                      })
                    }
                    placeholder="2024"
                  />
                </label>

                <label>
                  Mileage (km)
                  <input
                    type="number"
                    min="0"
                    value={motorcycle.mileage}
                    onChange={(event) =>
                      setMotorcycle({
                        ...motorcycle,
                        mileage: event.target.value,
                      })
                    }
                    placeholder="12000"
                  />
                </label>
              </div>

              <button
                className="primary-button form-submit"
                type="submit"
              >
                Save motorcycle
              </button>
            </form>

            {savedMotorcycle && (
              <button
                type="button"
                className="remove-bike"
                onClick={removeMotorcycle}
              >
                Remove saved motorcycle
              </button>
            )}
          </section>
        </div>
      )}

      {/* PROFILE FORM */}
      {showProfile && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowProfile(false);
            }
          }}
        >
          <section
            className="motorcycle-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowProfile(false)}
              aria-label="Close profile"
            >
              ×
            </button>

            <p className="eyebrow">RIDER ACCOUNT</p>
            <h2 id="profile-modal-title">My Profile</h2>

            <p className="muted">
              Personalize how your name appears
              in MotoResQ.
            </p>

            <form onSubmit={saveProfile}>
              <label>
                Display name
                <input
                  type="text"
                  value={profileDraft}
                  onChange={(event) =>
                    setProfileDraft(event.target.value)
                  }
                  placeholder="Enter your name"
                  maxLength={60}
                  required
                />
              </label>

              <button
                type="submit"
                className="primary-button form-submit"
              >
                Save profile
              </button>
            </form>

            <p className="muted">
              Login, account settings, and profile
              photo will be added when we build
              authentication.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;