

function ProfileNotFound() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", textAlign: "center",
      fontFamily: "sans-serif", padding: "20px"
    }}>
      <span style={{ fontSize: "60px" }}>🔒</span>
      <h2 style={{ marginTop: "16px", color: "#1a1a2e" }}>Profile Not Available</h2>
      <p style={{ color: "#555", maxWidth: "400px", marginTop: "8px" }}>
        This advocate's public profile is not active yet.
        They may need to upgrade their plan to enable public listing.
      </p>
      <a
        href="/"
        style={{
          marginTop: "20px", padding: "10px 24px", background: "#f5a623",
          color: "#fff", borderRadius: "8px", textDecoration: "none",
          fontWeight: "600"
        }}
      >
       Back to Home
      </a>
    </div>
  );
}

export default ProfileNotFound;

