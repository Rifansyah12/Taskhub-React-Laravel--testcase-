import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [prioritas, setPrioritas] = useState("rendah");
  const [filterPrioritas, setFilterPrioritas] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const token = localStorage.getItem("token");

  // Konversi tanggal YYYY-MM-DD → dd/mm/YYYY
  const formatTanggal = (tgl) => {
    if (!tgl) return "";
    const date = new Date(tgl);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchTasks = async () => {
    const params = {};
    if (filterPrioritas) params.prioritas = filterPrioritas;
    if (filterStatus) params.status = filterStatus;

    const res = await axios.get("http://localhost:8000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    setTasks(res.data);
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/api/tasks",
        {
          judul,
          deskripsi,
          tanggal_deadline: formatTanggal(tanggal), // Kirim sesuai format backend
          prioritas,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJudul("");
      setDeskripsi("");
      setTanggal("");
      setPrioritas("rendah");
      fetchTasks();
    } catch (err) {
      console.log(err.response?.data);
      alert(
        err.response?.data?.message ||
          JSON.stringify(err.response?.data?.errors) ||
          "Gagal menambah task"
      );
    }
  };

  const selesaiTask = async (id) => {
    await axios.put(
      `http://localhost:8000/api/tasks/${id}/selesaikan`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  useEffect(() => {
    fetchTasks();
  }, [filterPrioritas, filterStatus]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dashboard TaskHub+</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded-md transition"
          >
            Logout
          </button>
        </div>
        {/* Tambah Task */}
        <h3 className="text-xl font-semibold mb-2">Tambah Task</h3>
        <form
          onSubmit={addTask}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <input
            className="p-2 border rounded-md"
            placeholder="Judul"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
          />
          <input
            className="p-2 border rounded-md"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
          />
          <textarea
            className="p-2 border rounded-md md:col-span-2"
            placeholder="Deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          />
          <select
            className="p-2 border rounded-md"
            value={prioritas}
            onChange={(e) => setPrioritas(e.target.value)}
          >
            <option value="rendah">Rendah</option>
            <option value="sedang">Sedang</option>
            <option value="tinggi">Tinggi</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
          >
            Tambah Task
          </button>
        </form>
        {/* Filter */}
        <h3 className="text-xl font-semibold mb-2">Filter Task</h3>
        <div className="flex gap-4 mb-6">
          <select
            className="p-2 border rounded-md"
            value={filterPrioritas}
            onChange={(e) => setFilterPrioritas(e.target.value)}
          >
            <option value="">Semua Prioritas</option>
            <option value="rendah">Rendah</option>
            <option value="sedang">Sedang</option>
            <option value="tinggi">Tinggi</option>
          </select>
          <select
            className="p-2 border rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="selesai">Selesai</option>
            <option value="belum">Belum</option>
          </select>
        </div>
        {/* Daftar Task */}
        <h3 className="text-xl font-semibold mb-2">Daftar Task</h3>
        
        <ul className="space-y-3">
          {tasks.map((task) => {
            const today = new Date();

            // Pisahkan dd/mm/yyyy → [dd, mm, yyyy]
            const [dd, mm, yyyy] = task.tanggal_deadline.split("/").map(Number);
            const taskDate = new Date(yyyy, mm - 1, dd); // bulan 0-indexed

            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const isDeadlineBesok =
              taskDate.getFullYear() === tomorrow.getFullYear() &&
              taskDate.getMonth() === tomorrow.getMonth() &&
              taskDate.getDate() === tomorrow.getDate();

            return (
              <li
                key={task.id}
                className={`border p-3 rounded-md flex justify-between items-center ${
                  isDeadlineBesok ? "bg-red-100" : ""
                }`}
              >
                <div>
                  <strong>{task.judul}</strong> - {task.prioritas} -{" "}
                  {task.tanggal_deadline} - {task.selesai ? "✅" : "❌"}
                  {task.butuh_perhatian && (
                    <span className="text-red-500 font-bold ml-2">
                      PERHATIAN!
                    </span>
                  )}
                </div>
                {!task.selesai && (
                  <button
                    onClick={() => selesaiTask(task.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition"
                  >
                    Selesai
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
