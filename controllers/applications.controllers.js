const prisma = require("../libs/prisma");

const VALID_STATUSES = [
  "applied",
  "test",
  "interview HRD",
  "interview User",
  "offer",
  "rejected",
];

// GET /api/v1/applications
async function getAll(req, res) {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: true,
      message: "Berhasil mengambil data lamaran",
      data: applications,
    });
  } catch (error) {
    console.error("Get all applications error:", error);
    res
      .status(500)
      .json({ status: false, message: "Terjadi kesalahan server" });
  }
}

// GET /api/v1/applications/:id
async function getById(req, res) {
  try {
    const { id } = req.params;

    const application = await prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!application || application.userId !== req.user.id) {
      return res.status(404).json({
        status: false,
        message: "Lamaran tidak ditemukan",
      });
    }

    res.status(200).json({
      status: true,
      message: "Berhasil mengambil detail lamaran",
      data: application,
    });
  } catch (error) {
    console.error("Get application by id error:", error);
    res
      .status(500)
      .json({ status: false, message: "Terjadi kesalahan server" });
  }
}

// POST /api/v1/applications
async function create(req, res) {
  try {
    const { company, position, status, appliedDate, notes } = req.body;

    if (!company || !position || !appliedDate) {
      return res.status(400).json({
        status: false,
        message: "Company, position, dan appliedDate wajib diisi",
      });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Status tidak valid. Pilih salah satu: ${VALID_STATUSES.join(
          ", "
        )}`,
      });
    }

    const application = await prisma.jobApplication.create({
      data: {
        company,
        position,
        status: status || "applied",
        appliedDate: new Date(appliedDate),
        notes,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      status: true,
      message: "Lamaran berhasil ditambahkan",
      data: application,
    });
  } catch (error) {
    console.error("Create application error:", error);
    res
      .status(500)
      .json({ status: false, message: "Terjadi kesalahan server" });
  }
}

// PUT /api/v1/applications/:id
async function update(req, res) {
  try {
    const { id } = req.params;
    const { company, position, status, appliedDate, notes } = req.body;

    const existing = await prisma.jobApplication.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        status: false,
        message: "Lamaran tidak ditemukan",
      });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Status tidak valid. Pilih salah satu: ${VALID_STATUSES.join(
          ", "
        )}`,
      });
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        company,
        position,
        status,
        appliedDate: appliedDate ? new Date(appliedDate) : undefined,
        notes,
      },
    });

    res.status(200).json({
      status: true,
      message: "Lamaran berhasil diperbarui",
      data: application,
    });
  } catch (error) {
    console.error("Update application error:", error);
    res
      .status(500)
      .json({ status: false, message: "Terjadi kesalahan server" });
  }
}

// DELETE /api/v1/applications/:id
async function remove(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.jobApplication.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        status: false,
        message: "Lamaran tidak ditemukan",
      });
    }

    await prisma.jobApplication.delete({ where: { id } });

    res.status(200).json({
      status: true,
      message: "Lamaran berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    res
      .status(500)
      .json({ status: false, message: "Terjadi kesalahan server" });
  }
}

module.exports = { getAll, getById, create, update, remove };
