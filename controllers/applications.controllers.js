const prisma = require("../libs/prisma");
const { parseDateAsWIB, withWIBDate } = require("../utils/date");

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
    const {
      search,
      status,
      source,
      city,
      startDate,
      endDate,
      page,
      limit,
      all,
    } = req.query;

    const noPagination = all === "true" || all === "1";

    const currentPage = Math.max(parseInt(page) || 1, 1);
    const pageSize = 10;

    const where = {
      userId: req.user.id,
    };

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          status: false,
          message: `Status tidak valid. Pilih salah satu: ${VALID_STATUSES.join(
            ", "
          )}`,
        });
      }
      where.status = status;
    }

    if (source) {
      where.source = { equals: source, mode: "insensitive" };
    }

    // Filter berdasarkan kota (opsional)
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    // Filter berdasarkan rentang tanggal appliedDate (bukan createdAt)
    if (startDate || endDate) {
      where.appliedDate = {};
      if (startDate) {
        where.appliedDate.gte = parseDateAsWIB(startDate);
      }
      if (endDate) {
        where.appliedDate.lte = parseDateAsWIB(endDate);
      }
    }

    if (search) {
      where.OR = [
        { company: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.jobApplication.count({ where });
    const totalPages = noPagination
      ? 1
      : Math.max(Math.ceil(total / pageSize), 1);

    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { appliedDate: "desc" },
      ...(noPagination
        ? {}
        : { skip: (currentPage - 1) * pageSize, take: pageSize }),
    });

    res.status(200).json({
      status: true,
      message: "Berhasil mengambil data lamaran",
      data: applications.map(withWIBDate),
      pagination: noPagination
        ? { page: 1, limit: total, total, totalPages: 1 }
        : { page: currentPage, limit: pageSize, total, totalPages },
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
      data: withWIBDate(application),
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
    const {
      company,
      position,
      status,
      source,
      city,
      salaryRange,
      appliedDate,
      notes,
    } = req.body;

    if (!company || !position || !appliedDate || !source) {
      return res.status(400).json({
        status: false,
        message:
          "Nama Perusahaan, posisi, sumber dan tanggal lamaran kerja wajib diisi",
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
        source,
        city,
        salaryRange,
        appliedDate: parseDateAsWIB(appliedDate),
        notes,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      status: true,
      message: "Lamaran berhasil ditambahkan",
      data: withWIBDate(application),
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
    const {
      company,
      position,
      status,
      source,
      city,
      salaryRange,
      appliedDate,
      notes,
    } = req.body;

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
        source,
        city,
        salaryRange,
        appliedDate: appliedDate ? parseDateAsWIB(appliedDate) : undefined,
        notes,
      },
    });

    res.status(200).json({
      status: true,
      message: "Lamaran berhasil diperbarui",
      data: withWIBDate(application),
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
