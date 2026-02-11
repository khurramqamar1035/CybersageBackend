const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "cybersage2024";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "cybersage_admin_2024_secure_token";

export const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_TOKEN, message: "Login successful" });
  }

  res.status(401).json({ message: "Invalid credentials" });
};
