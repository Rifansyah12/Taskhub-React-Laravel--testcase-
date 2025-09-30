#!/usr/bin/env node
const axios = require("axios");

// Ambil token dari command line argument
const token = process.argv[2];

if (!token) {
  console.log("Gunakan: node reminder.js <token>");
  process.exit(1);
}

// Function untuk cek apakah deadline besok
const isBesok = (tanggal_deadline) => {
  if (!tanggal_deadline) return false;

  // Format dari backend: YYYY-MM-DD
  const [yyyy, mm, dd] = tanggal_deadline.split("-").map(Number);
  const deadlineDate = new Date(yyyy, mm - 1, dd);

  // Ambil tanggal sekarang Jakarta
  const now = new Date();
  const jakartaNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );

  // Hitung besok
  const besok = new Date(jakartaNow);
  besok.setDate(jakartaNow.getDate() + 1);

  return (
    deadlineDate.getFullYear() === besok.getFullYear() &&
    deadlineDate.getMonth() === besok.getMonth() &&
    deadlineDate.getDate() === besok.getDate()
  );
};

// Ambil task dari API
const fetchTasks = async () => {
  try {
    const res = await axios.get("http://127.0.0.1:8000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const tasks = res.data;
    let found = false;

    tasks.forEach((task) => {
      if (isBesok(task.tanggal_deadline)) {
        found = true;
        if (task.butuh_perhatian) {
          console.log(
            `\x1b[31mPERHATIAN: ${task.judul} - Deadline Besok\x1b[0m`
          );
        } else {
          console.log(`${task.judul} - Deadline Besok`);
        }
      }
    });

    if (!found) console.log("Tidak ada task dengan deadline besok.");
  } catch (err) {
    console.error("Gagal mengambil task:", err.message);
  }
};

fetchTasks();
