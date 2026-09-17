const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../libs/prisma");

const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Nama, email, dan password wajib diisi",
      });
    }

    if (!emailValidator.test(email)) {
      return res.status(400).json({
        status: false,
        message: "Format email tidak valid",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Password minimal 6 karakter",
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        status: false,
        message: "Email sudah terdaftar",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    delete user.password;

    res.status(201).json({
      status: true,
      message: "Registrasi berhasil",
      data: user,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ status: false, message: "Terjadi kesalahan server" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email dan password wajib diisi",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Email atau password salah",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Email atau password salah",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    delete user.password;

    res.status(200).json({
      status: true,
      message: "Login berhasil",
      data: { ...user, token },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: false, message: "Terjadi kesalahan server" });
  }
}

module.exports = { register, login };