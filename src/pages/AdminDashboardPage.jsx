import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Utensils,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  X,
  LogOut,
  MessageSquare,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api, { unwrap, API_ORIGIN } from "../utils/api";
import AdminUserManagement from "../components/AdminUserManagement";
import { useAuth } from "../context/AuthContext";

// API_ORIGIN is imported from utils/api

// State will hold live data from backend

// Komponen Card KPI
const KpiCard = ({ title, value, icon: Icon, color }) => (
  <div
    className={`p-4 rounded-xl shadow-md border-l-4 ${color} bg-white transition-shadow hover:shadow-lg`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">{value}</h2>
      </div>
      <Icon className={`w-8 h-8 ${color}`} strokeWidth={1.5} />
    </div>
  </div>
);

// Komponen Modal Detail Verifikasi
const VerificationModal = ({ type, data, onClose, onVerify, onReject }) => {
  const [note, setNote] = React.useState("");
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b flex justify-between items-center bg-green-600 rounded-t-2xl">
          <h3 className="text-xl font-bold text-white">
            {type === "merchant"
              ? `Tinjauan Toko: ${data.name}`
              : `Audit Menu: ${data.menuName}`}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Bagian 1: Detail Toko */}
          {type === "merchant" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri: Info Kontak & Pemilik */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                <h4 className="font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                  <User size={20} /> Detail Kepemilikan
                </h4>
                <p className="text-sm flex items-center gap-2">
                  <User size={16} /> <strong>Nama Pemilik:</strong> {data.owner}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Mail size={16} /> <strong>Email:</strong>{" "}
                  {data.ownerEmail || data.email || "-"}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Phone size={16} /> <strong>Kontak WA:</strong> {data.contact}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Clock size={16} /> <strong>Jam Buka:</strong>{" "}
                  {data.openHours || data.operatingHours || "-"}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <strong>Saluran Pemesanan:</strong>{" "}
                  {data.salesChannels || "-"}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <strong>Website / Sosial Media:</strong>{" "}
                  {data.socialMedia || "-"}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <strong>Kategori Toko:</strong> {data.storeCategory || "-"}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <strong>Fokus Kesehatan:</strong>{" "}
                  {data.healthFocus && data.healthFocus.length
                    ? data.healthFocus.join(", ")
                    : "-"}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <strong>Jenis Lemak Dominan:</strong>{" "}
                  {data.dominantFat || "-"}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <strong>Metode Masak:</strong>{" "}
                  {data.cookingMethods && data.cookingMethods.length
                    ? data.cookingMethods.join(", ")
                    : "-"}
                </p>
                <p className="text-sm flex items-start gap-2">
                  <MapPin size={16} className="flex-shrink-0 mt-1" />{" "}
                  <strong>Koordinat Maps:</strong> {data.mapsLatLong || "-"}
                </p>
                <p className="text-sm flex items-start gap-2">
                  <MapPin size={16} className="flex-shrink-0 mt-1" />{" "}
                  <strong>Alamat:</strong> {data.address}
                </p>
                <p className="text-sm flex items-start gap-2">
                  <Clock size={16} className="flex-shrink-0 mt-1" />{" "}
                  <strong>Tanggal Pengajuan:</strong> {data.date}
                </p>
              </div>

              {/* Kolom Kanan: Konsep & Bukti */}
              <div className="bg-green-50 rounded-xl p-4 space-y-3 border border-green-200">
                <h4 className="font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                  <CheckCircle size={20} /> Konsep Kesehatan Toko
                </h4>
                <p className="text-gray-700 italic border-l-2 pl-3 border-green-500 text-sm leading-relaxed">
                  {data.concept}
                </p>
                <h4 className="font-bold text-sm text-gray-800 mt-4">
                  Document
                </h4>
                <div className="space-y-3">
                  {data.documents && data.documents.length > 0 ? (
                    data.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {String(doc).match(/\.(jpg|jpeg|png)$/i) ? (
                          <img
                            src={
                              String(doc).startsWith("/")
                                ? API_ORIGIN + doc
                                : doc
                            }
                            alt={`doc-${idx}`}
                            className="w-28 h-20 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-28 h-20 flex items-center justify-center rounded border bg-white text-xs text-gray-600">
                            File
                          </div>
                        )}
                        <div className="flex flex-col">
                          <a
                            href={
                              String(doc).startsWith("/")
                                ? API_ORIGIN + doc
                                : doc
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-green-700 underline"
                          >
                            Lihat / Unduh
                          </a>
                          <span className="text-xs text-gray-500">
                            {String(doc).split("/").pop()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : data.docUrl ? (
                    <img
                      src={data.docUrl}
                      alt="Dokumen Pendukung"
                      className="w-full rounded-lg border border-gray-300"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">
                      Tidak ada dokumen yang diunggah.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bagian 2: Detail Menu */}
          {type === "menu" && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
              <h4 className="font-bold text-lg text-gray-800">
                Detail Audit Menu {data.nama_menu || data.menuName}
              </h4>

              {/* Informasi Dasar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Nama Menu
                  </label>
                  <p className="text-gray-900">{data.nama_menu || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Deskripsi
                  </label>
                  <p className="text-gray-900">{data.deskripsi || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Harga
                  </label>
                  <p className="text-gray-900">
                    Rp{" "}
                    {data.harga
                      ? Number(data.harga).toLocaleString("id-ID")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Status Verifikasi
                  </label>
                  <p className="text-gray-900">
                    {data.status_verifikasi || "N/A"}
                  </p>
                </div>
              </div>

              {/* Bahan Baku dan Metode Masak */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Bahan Baku
                  </label>
                  <p className="text-gray-900">{data.bahan_baku || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Metode Masak
                  </label>
                  <p className="text-gray-900">{data.metode_masak || "N/A"}</p>
                </div>
              </div>

              {/* Klaim Diet */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Klaim Diet
                </label>
                <p className="text-gray-900">
                  {data.diet_claims
                    ? Array.isArray(data.diet_claims)
                      ? data.diet_claims.join(", ")
                      : data.diet_claims
                    : "N/A"}
                </p>
              </div>

              {/* Nilai Gizi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nilai Gizi per Porsi
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Kalori</span>
                    <p className="font-semibold">{data.kalori || 0} kkal</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Protein</span>
                    <p className="font-semibold">{data.protein || 0} g</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Lemak</span>
                    <p className="font-semibold">{data.lemak || 0} g</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Gula</span>
                    <p className="font-semibold">{data.gula || 0} g</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Serat</span>
                    <p className="font-semibold">{data.serat || 0} g</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Lemak Jenuh</span>
                    <p className="font-semibold">{data.lemak_jenuh || 0} g</p>
                  </div>
                </div>
              </div>

              {/* Foto */}
              {data.foto && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Foto Menu
                  </label>
                  <img
                    src={
                      data.foto.startsWith("/")
                        ? `${API_ORIGIN}${data.foto}`
                        : data.foto
                    }
                    alt="Foto Menu"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}

              {/* Catatan Admin */}
              {data.catatan_admin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Catatan Admin Sebelumnya
                  </label>
                  <p className="text-gray-900">{data.catatan_admin}</p>
                </div>
              )}
            </div>
          )}

          {/* Bagian 3: Feedback/Note Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catatan Admin (Wajib diisi jika Tolak):
            </label>
            <textarea
              rows="3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuliskan feedback atau permintaan koreksi kepada Merchant di sini..."
              className="w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Footer Aksi */}
        <div className="p-5 flex justify-end gap-3 border-t">
          <button
            onClick={() => onReject(data.id, note)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 transition-colors"
          >
            <X size={20} /> Tolak & Kirim Catatan
          </button>
          <button
            onClick={() => onVerify(data.id, note)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 transition-colors"
          >
            <CheckCircle size={20} /> Verifikasi & Kirim Undangan
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("merchants");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [pendingMenus, setPendingMenus] = useState([]);
  // KPI counts
  const [kpiPendingMerchants, setKpiPendingMerchants] = useState(0);
  const [kpiPendingMenus, setKpiPendingMenus] = useState(0);
  const [kpiActiveMenus, setKpiActiveMenus] = useState(0);
  const [kpiTotalRestaurants, setKpiTotalRestaurants] = useState(0);
  const [kpiTotalUsers, setKpiTotalUsers] = useState(0);
  const [activeRestaurants, setActiveRestaurants] = useState([]);
  const [activeMenusList, setActiveMenusList] = useState([]);
  const [restaurantHistory, setRestaurantHistory] = useState([]);
  const [menuHistory, setMenuHistory] = useState([]);
  // simple pagination state
  const [restPage, setRestPage] = useState(1);
  const [menuPage, setMenuPage] = useState(1);
  const [_loading, setLoading] = useState(false);
  const [_error, setError] = useState(null);

  // Per-list loading / error / meta state
  const [restLoading, setRestLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [restError, setRestError] = useState(null);
  const [menuError, setMenuError] = useState(null);
  const [restMeta, setRestMeta] = useState({ page: 1, per_page: 10 });
  const [menuMeta, setMenuMeta] = useState({ page: 1, per_page: 10 });

  // Fetch helpers (separate so we can refetch on-demand)
  const fetchPending = useCallback(async () => {
    if (isLoading) return; // wait for auth
    if (!isAuthenticated || !isAdmin) {
      console.warn(
        "[AdminDashboard] blocked: user not admin or not authenticated"
      );
      navigate("/signin");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const resR = await api.get("/admin/pending/restaurants");
      const resM = await api.get("/admin/pending/menus").catch(() => ({ data: [] }));
      const merchants = unwrap(resR) || [];
      const menus = unwrap(resM) || [];
      setPendingMerchants(merchants);
      setPendingMenus(menus);
    } catch (e) {
      console.error("Failed to fetch pending items", e);
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setError(
          "Akses ditolak: Anda tidak memiliki izin admin. Silakan login sebagai admin."
        );
        navigate("/signin");
        return;
      }
      setError("Gagal memuat data pending. Pastikan Anda login sebagai admin.");
    } finally {
      setLoading(false);
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  // Fetch KPI summary (new consolidated endpoint)
  const fetchKpiSummary = useCallback(async () => {
    try {
      const res = await api.get('/admin/kpi/summary');
      const body = unwrap(res) ?? (res && res.data) ?? null;
      if (body && body.pendingRestaurants !== undefined) {
        setKpiPendingMerchants(Number(body.pendingRestaurants || 0));
        setKpiPendingMenus(Number(body.pendingMenus || 0));
        setKpiActiveMenus(Number(body.activeMenus || 0));
        setKpiTotalRestaurants(Number(body.totalRestaurants || 0));
        setKpiTotalUsers(Number(body.totalUsers || 0));
      } else if (res && res.data) {
        // fallback to older shape
        const d = res.data;
        setKpiPendingMerchants(Array.isArray(d) ? d.length : pendingMerchants.length);
      }
    } catch (e) {
      // fallback: derive from already-fetched lists
      setKpiPendingMerchants(pendingMerchants.length);
      setKpiPendingMenus(pendingMenus.length);
      // active menus/total restaurants remain unknown without server support
    }
  }, [pendingMerchants.length, pendingMenus.length]);

  const fetchActiveRestaurants = useCallback(async (page = 1) => {
    setRestLoading(true);
    setRestError(null);
    try {
      const res = await api.get(`/admin/restaurants/active?page=${page}&per_page=10`);
      const data = unwrap(res) || [];
      setActiveRestaurants(data);
      setRestMeta({
        page: (res.data && res.data.page) || page,
        per_page: (res.data && res.data.per_page) || 10,
      });
    } catch (e) {
      console.error("fetchActiveRestaurants error", e);
      const status = e?.response?.status;
      const serverMsg =
        e?.response?.data?.message || e?.response?.data || e.message;
      setRestError(`${status || "ERROR"} - ${serverMsg}`);
    } finally {
      setRestLoading(false);
    }
  }, []);

  const fetchRestaurantHistory = useCallback(async (page = 1) => {
    try {
      const res = await api.get(`/admin/restaurants/history?page=${page}&per_page=50`);
      // Response shape may vary: backend returns { data: [...] , page, per_page }
      // or sometimes raw array. Normalize to an array.
      const unwrapped = unwrap(res) ?? res?.data ?? null;
      const raw = Array.isArray(unwrapped)
        ? unwrapped
        : Array.isArray(unwrapped?.data)
        ? unwrapped.data
        : [];
      if (import.meta.env.DEV) console.debug('[fetchRestaurantHistory] fetched rows:', raw.length);

      // Normalize entries and collect restaurant ids to enrich
      const toFetchRestIds = new Set();
      const normalized = raw.map((r) => {
        const restoran_id =
          r.restoran_id || r.target_id || r.objek_id || r.restoranId || null;
        if (restoran_id) toFetchRestIds.add(restoran_id);
        return {
          id: r.id,
          restoran_id,
          nama_restoran: r.nama_restoran || r.namaRestoran || null,
          admin_name:
            r.admin_name || r.admin || r.adminId || r.admin_id || null,
          status: r.status || null,
          catatan: r.catatan || r.note || r.catatan_admin || null,
          verified_at:
            r.verified_at || r.created_at || r.tanggal_verifikasi || null,
        };
      });

      // Fetch restaurant details for any missing names/owners
      const restIdArray = Array.from(toFetchRestIds).filter(Boolean);
      const restMap = {};
      if (restIdArray.length) {
        await Promise.all(
          restIdArray.map(async (id) => {
              try {
              const rres = await api.get(`/restaurants/${id}`);
              const rdata = unwrap(rres) || rres?.data || null;
              if (rdata) {
                restMap[id] = {
                  nama_restoran:
                    rdata.nama_restoran || rdata.name || rdata.nama || null,
                  owner:
                    rdata.owner_name || rdata.owner || rdata.user_id || null,
                  foto:
                    rdata.documents && rdata.documents[0]
                      ? String(rdata.documents[0]).startsWith("/")
                        ? API_ORIGIN + rdata.documents[0]
                        : rdata.documents[0]
                      : null,
                };
              }
            } catch (e) {
              // ignore single failures
              console.warn(
                "[fetchRestaurantHistory] could not fetch restaurant",
                id,
                e && e.message ? e.message : e
              );
            }
          })
        );
      }

      // Merge enriched data
      const enriched = normalized.map((n) => ({
        ...n,
        nama_restoran:
          n.nama_restoran ||
          (n.restoran_id && restMap[n.restoran_id]
            ? restMap[n.restoran_id].nama_restoran
            : null),
        owner:
          n.restoran_id && restMap[n.restoran_id]
            ? restMap[n.restoran_id].owner
            : null,
        foto:
          n.restoran_id && restMap[n.restoran_id]
            ? restMap[n.restoran_id].foto
            : null,
      }));

      // Ensure we always set an array
      setRestaurantHistory(Array.isArray(enriched) ? enriched : []);
    } catch (e) {
      console.error("fetchRestaurantHistory error", e);
    }
  }, []);

  const fetchActiveMenus = useCallback(async (page = 1) => {
    setMenuLoading(true);
    setMenuError(null);
    try {
      const res = await api.get(`/admin/menus/active?page=${page}&per_page=10`);
      const data = unwrap(res) || [];
      setActiveMenusList(data);
      setMenuMeta({
        page: (res.data && res.data.page) || page,
        per_page: (res.data && res.data.per_page) || 10,
      });
    } catch (e) {
      console.error("fetchActiveMenus error", e);
      const status = e?.response?.status;
      const serverMsg =
        e?.response?.data?.message || e?.response?.data || e.message;
      setMenuError(`${status || "ERROR"} - ${serverMsg}`);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  const fetchMenuHistory = useCallback(async (page = 1) => {
    try {
      const res = await api.get(`/admin/menus/history?page=${page}&per_page=50`);
      const unwrapped = unwrap(res) ?? res?.data ?? null;
      const raw = Array.isArray(unwrapped)
        ? unwrapped
        : Array.isArray(unwrapped?.data)
        ? unwrapped.data
        : [];
      if (import.meta.env.DEV) console.debug('[fetchMenuHistory] fetched rows:', raw.length);

      // Normalize entries and collect menu ids to enrich
      const toFetchMenuIds = new Set();
      const normalized = raw.map((r) => {
        const menu_id =
          r.menu_id || r.target_id || r.objek_id || r.menuId || null;
        if (menu_id) toFetchMenuIds.add(menu_id);
        return {
          id: r.id,
          menu_id,
          nama_menu: r.nama_menu || r.namaMenu || null,
          nama_restoran: r.nama_restoran || null,
          admin_name: r.admin_name || r.admin || r.admin_id || null,
          status: r.status || null,
          catatan: r.catatan || r.note || null,
          verified_at:
            r.verified_at || r.created_at || r.tanggal_verifikasi || null,
        };
      });

      // Fetch menu details and their restaurants
      const menuIdArray = Array.from(toFetchMenuIds).filter(Boolean);
      const menuMap = {};
      const restIdsToFetch = new Set();

      if (menuIdArray.length) {
        await Promise.all(
          menuIdArray.map(async (id) => {
              try {
              const mres = await api.get(`/menus/${id}`);
              const mdata = unwrap(mres) || mres?.data || null;
              if (mdata) {
                menuMap[id] = {
                  nama_menu:
                    mdata.nama_menu ||
                    mdata.nama_menu ||
                    mdata.name ||
                    mdata.nama ||
                    null,
                  foto: mdata.foto
                    ? String(mdata.foto).startsWith("/")
                      ? API_ORIGIN + mdata.foto
                      : mdata.foto
                    : null,
                  restoran_id: mdata.restoran_id || mdata.restaurant_id || null,
                };
                if (mdata.restoran_id) restIdsToFetch.add(mdata.restoran_id);
              }
            } catch (e) {
              console.warn(
                "[fetchMenuHistory] could not fetch menu",
                id,
                e && e.message ? e.message : e
              );
            }
          })
        );
      }

      // Fetch restaurant details for menus
      const restMap = {};
      const restIdArray = Array.from(restIdsToFetch).filter(Boolean);
      if (restIdArray.length) {
        await Promise.all(
          restIdArray.map(async (id) => {
              try {
              const rres = await api.get(`/restaurants/${id}`);
              const rdata = unwrap(rres) || rres?.data || null;
              if (rdata) {
                restMap[id] = {
                  nama_restoran:
                    rdata.nama_restoran || rdata.name || rdata.nama || null,
                  owner:
                    rdata.owner_name || rdata.owner || rdata.user_id || null,
                  foto:
                    rdata.documents && rdata.documents[0]
                      ? String(rdata.documents[0]).startsWith("/")
                        ? API_ORIGIN + rdata.documents[0]
                        : rdata.documents[0]
                      : null,
                };
              }
            } catch (e) {
              console.warn(
                "[fetchMenuHistory] could not fetch restaurant for menu",
                id,
                e && e.message ? e.message : e
              );
            }
          })
        );
      }

      // Merge enriched data
      const enriched = normalized.map((n) => {
        const menuInfo =
          n.menu_id && menuMap[n.menu_id] ? menuMap[n.menu_id] : null;
        const restInfo =
          menuInfo && menuInfo.restoran_id && restMap[menuInfo.restoran_id]
            ? restMap[menuInfo.restoran_id]
            : null;
        return {
          ...n,
          nama_menu: n.nama_menu || (menuInfo ? menuInfo.nama_menu : null),
          foto: menuInfo ? menuInfo.foto : null,
          nama_restoran:
            n.nama_restoran ||
            (restInfo ? restInfo.nama_restoran : menuInfo ? null : null),
          owner: restInfo ? restInfo.owner : null,
        };
      });

      setMenuHistory(Array.isArray(enriched) ? enriched : []);
    } catch (e) {
      console.error("fetchMenuHistory error", e);
    }
  }, []);

  // Combined refetch helper for after actions
  const refetchAll = useCallback(async () => {
    await Promise.all([
      fetchPending(),
      fetchActiveRestaurants(restPage),
      fetchActiveMenus(menuPage),
      fetchRestaurantHistory(1),
      fetchMenuHistory(1),
    ]).catch((e) => console.warn("refetchAll partial failure", e));
    // refresh KPI as well
    fetchKpiSummary().catch(() => {});
  }, [
    fetchPending,
    fetchActiveRestaurants,
    fetchActiveMenus,
    fetchRestaurantHistory,
    fetchMenuHistory,
    restPage,
    menuPage,
  ]);

  // Initial mount: load pending + active + history
  useEffect(() => {
    fetchPending();
    fetchActiveRestaurants(restPage);
    fetchActiveMenus(menuPage);
    fetchRestaurantHistory(1);
    fetchMenuHistory(1);
    fetchKpiSummary();
  }, [
    fetchPending,
    fetchActiveRestaurants,
    fetchActiveMenus,
    fetchRestaurantHistory,
    fetchMenuHistory,
    restPage,
    menuPage,
  ]);

  // When page state changes, fetch corresponding data
  useEffect(() => {
    fetchActiveRestaurants(restPage);
  }, [restPage, fetchActiveRestaurants]);
  useEffect(() => {
    fetchActiveMenus(menuPage);
  }, [menuPage, fetchActiveMenus]);

  const handleVerify = async (id, note = "") => {
    try {
      // If verifying a menu, call the menu verify endpoint and remove from pendingMenus
      if (selectedItem && selectedItem.type === "menu") {
        await api.put(`/admin/verify/menu/${id}`, { status: "approved" });
        setPendingMenus((prev) =>
          prev.filter((m) => Number(m.id) !== Number(id))
        );
        setSelectedItem(null);
        alert("Menu berhasil diverifikasi.");
        // refresh active/history lists
        refetchAll();
        return;
      }

      // Otherwise treat as restaurant verification
      await api.patch(`/admin/restaurants/${id}/verify`, {
        status: "approved",
        note,
      });
      setPendingMerchants((prev) =>
        prev.filter((p) => Number(p.id) !== Number(id))
      );
      setSelectedItem(null);
      alert("Restoran berhasil diverifikasi dan pemilik telah diberi tahu.");
      // refresh lists
      refetchAll();
    } catch (e) {
      console.error("verify error", e);
      alert("Gagal memverifikasi. Periksa konsol.");
    }
  };

  const handleReject = async (id, note = "") => {
    // For restaurant rejection, note is required
    if (
      (!note || !note.trim()) &&
      (!selectedItem || selectedItem.type !== "menu")
    ) {
      alert("Mohon isi catatan admin ketika menolak permohonan.");
      return;
    }

    try {
      if (selectedItem && selectedItem.type === "menu") {
        // Menu verify endpoint doesn't currently accept a note in backend, send status only
        await api.put(`/admin/verify/menu/${id}`, { status: "rejected" });
        setPendingMenus((prev) =>
          prev.filter((m) => Number(m.id) !== Number(id))
        );
        setSelectedItem(null);
        alert("Menu ditolak.");
        // refresh lists
        refetchAll();
        return;
      }

      await api.patch(`/admin/restaurants/${id}/verify`, {
        status: "rejected",
        note,
      });
      setPendingMerchants((prev) =>
        prev.filter((p) => Number(p.id) !== Number(id))
      );
      setSelectedItem(null);
      alert("Permohonan ditolak dan catatan telah dikirimkan ke pemilik.");
      // refresh lists
      refetchAll();
    } catch (e) {
      console.error("reject error", e);
      alert("Gagal memproses penolakan. Periksa konsol.");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/signin");
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/admin/restaurant/${id}`);
      const r = unwrap(res) || res?.data || {};
      setSelectedItem({ type: "merchant", ...r });
    } catch (e) {
      console.warn("Could not fetch restaurant detail, using fallback", e);
      const fallback = activeRestaurants.find((a) => Number(a.id) === Number(id));
      if (fallback) {
        setSelectedItem({ type: "merchant", ...fallback, id: fallback.id });
        return;
      }
      alert("Gagal memuat detail restoran.");
    }
  };

  // Tampilan Tabel Merchant
  // Card list for pending merchants (horizontal)
  const renderMerchantTable = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="space-y-3">
        {pendingMerchants.length === 0 && (
          <div className="text-sm text-gray-600 p-3">
            Tidak ada toko menunggu verifikasi.
          </div>
        )}
        {pendingMerchants.map((m) => {
          // Robust document parsing: support multiple shapes stored in DB or returned by API
          const parseDocuments = (item) => {
            try {
              if (!item) return [];
              // If API already returned an array
              if (Array.isArray(item.documents))
                return item.documents.filter(Boolean);

              // If API returned a JSON string in `documents`
              if (typeof item.documents === "string") {
                try {
                  const parsed = JSON.parse(item.documents);
                  if (Array.isArray(parsed)) return parsed.filter(Boolean);
                  if (parsed && typeof parsed === "object") {
                    return [
                      ...(Array.isArray(parsed.foto_ktp)
                        ? parsed.foto_ktp
                        : []),
                      ...(Array.isArray(parsed.dokumen_usaha)
                        ? parsed.dokumen_usaha
                        : []),
                      ...(Array.isArray(parsed.npwp) ? parsed.npwp : []),
                    ].filter(Boolean);
                  }
                } catch {
                  void 0;
                }
              }

              // Try documents_json field
              let dj = item.documents_json;
              if (typeof dj === "string") {
                try {
                  dj = JSON.parse(dj);
                } catch {
                  void 0;
                }
              }
              if (Array.isArray(dj)) return dj.filter(Boolean);
              if (dj && typeof dj === "object") {
                return [
                  ...(Array.isArray(dj.foto_ktp) ? dj.foto_ktp : []),
                  ...(Array.isArray(dj.dokumen_usaha) ? dj.dokumen_usaha : []),
                  ...(Array.isArray(dj.npwp) ? dj.npwp : []),
                ].filter(Boolean);
              }

              // Fallback to single-file columns
              return [item.foto_ktp, item.dokumen_usaha, item.npwp].filter(
                Boolean
              );
            } catch {
              return [];
            }
          };

          const derivedDocs = parseDocuments(m);

          const row = {
            id: m.id,
            name: m.nama_restoran || m.name || "—",
            owner: m.owner_name || m.user_id || m.owner || "—",
            ownerEmail: m.owner_email || m.ownerEmail || m.email || "-",
            concept: m.deskripsi || "—",
            address: m.alamat || m.address || "—",
            date: m.created_at || m.tanggal || "—",
            contact: m.no_telepon || m.phone_admin || m.contact || "—",
            operatingHours: m.operating_hours || m.openHours || null,
            salesChannels: m.sales_channels || null,
            socialMedia: m.social_media || null,
            storeCategory: m.store_category || null,
            healthFocus:
              m.health_focus && typeof m.health_focus === "string"
                ? (() => {
                    try {
                      return JSON.parse(m.health_focus);
                    } catch {
                      return [m.health_focus];
                    }
                  })()
                : m.health_focus || [],
            dominantFat: m.dominant_fat || m.dominantFat || null,
            cookingMethods:
              m.dominant_cooking_method &&
              typeof m.dominant_cooking_method === "string"
                ? (() => {
                    try {
                      return JSON.parse(m.dominant_cooking_method);
                    } catch {
                      return [m.dominant_cooking_method];
                    }
                  })()
                : m.dominant_cooking_method || m.dominantCookingMethod || [],
            mapsLatLong: m.maps_latlong || m.mapsLatLong || null,
            documents:
              derivedDocs && derivedDocs.length
                ? derivedDocs
                : [m.foto_ktp, m.dokumen_usaha, m.npwp].filter(Boolean),
          };

          const photos =
            row.documents && row.documents.length ? row.documents : [];
          const thumb = photos.length
            ? String(photos[0]).startsWith("/")
              ? API_ORIGIN + photos[0]
              : photos[0]
            : "/placeholder-store.png";

          return (
            <div
              key={row.id}
              className="flex flex-col md:flex-row items-start md:items-center gap-4 p-3 border rounded-lg hover:shadow-md transition-shadow"
            >
              <img
                src={thumb}
                alt={row.name}
                className="w-28 h-20 object-cover rounded-md border"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <h4 className="font-bold text-gray-800 truncate">
                    {row.name}
                  </h4>
                  <span className="ml-auto text-xs text-gray-500">
                    {row.date ? new Date(row.date).toLocaleString() : "—"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {(row.concept || "").substring(0, 140)}
                </p>
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-3">
                  <span className="flex items-center gap-2">
                    <User size={14} /> {row.owner}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin size={14} /> {row.address}
                  </span>
                  {row.storeCategory && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {row.storeCategory}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-3 md:mt-0 md:ml-4">
                <button
                  onClick={async () => {
                    try {
                      const res = await api.get(`/admin/restaurant/${row.id}`);
                      const r = unwrap(res) || res?.data || {};
                      setSelectedItem({ type: "merchant", ...r });
                    } catch (e) {
                      console.warn(
                        "Could not fetch restaurant detail, using row data fallback",
                        e
                      );
                      setSelectedItem({
                        type: "merchant",
                        id: row.id,
                        name: row.name,
                        owner: row.owner,
                        ownerEmail: row.ownerEmail,
                        contact: row.contact,
                        openHours: row.operatingHours,
                        address: row.address,
                        date: row.date,
                        concept: row.concept,
                        salesChannels: row.salesChannels,
                        socialMedia: row.socialMedia,
                        storeCategory: row.storeCategory,
                        healthFocus: row.healthFocus,
                        dominantFat: row.dominantFat,
                        cookingMethods: row.cookingMethods,
                        mapsLatLong: row.mapsLatLong,
                        documents: row.documents,
                      });
                    }
                  }}
                  className="px-3 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Lihat Detail
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Setujui toko ini?")) return;
                    try {
                      await api.patch(`/admin/restaurants/${row.id}/verify`, {
                        status: "approved",
                        note: "",
                      });
                      setPendingMerchants((prev) =>
                        prev.filter((p) => Number(p.id) !== Number(row.id))
                      );
                      refetchAll();
                      alert("Restoran disetujui");
                    } catch (e) {
                      console.error(e);
                      alert("Gagal menyetujui restoran. Periksa konsol.");
                    }
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700"
                >
                  Setujui
                </button>
                <button
                  onClick={() => {
                    setSelectedItem({
                      type: "merchant",
                      id: row.id,
                      name: row.name,
                    });
                  }}
                  className="px-3 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600"
                >
                  Tolak
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Tampilan Tabel Restoran Aktif
const renderActiveRestaurantsTable = () => (
  // Mengubah tampilan container menjadi lebih menonjol
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
    
    {/* Header Section */}
    <h3 className="p-5 font-bold text-xl text-gray-800 border-b border-gray-100">
        Daftar Restoran Terverifikasi ✅
    </h3>

    {/* Loading & Error State */}
    {(restLoading || restError) && (
      <div className="p-5">
        {restLoading && (
          <div className="text-sm text-blue-600 flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memuat restoran aktif...
          </div>
        )}
        {restError && (
          <div className="text-sm text-red-600 flex items-center justify-between">
            <div>Error: {restError}</div>
            <button
              onClick={() => fetchActiveRestaurants(restMeta.page || 1)}
              className="ml-4 px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm transition"
            >
              Ulangi (Retry)
            </button>
          </div>
        )}
      </div>
    )}

    {/* List Body */}
    <div className="divide-y divide-gray-100">
      {activeRestaurants.length === 0 && !restLoading && (
        <div className="text-sm text-gray-500 p-5">
          Tidak ada restoran aktif saat ini.
        </div>
      )}
      
      {activeRestaurants.map((r) => {
        
        // Menentukan warna badge status
        const status = r.status_verifikasi || 'Unknown';
        let statusColor = 'bg-gray-100 text-gray-700'; // Default
        if (status.includes('Verified')) {
          statusColor = 'bg-green-100 text-green-700';
        } else if (status.includes('Pending')) {
          statusColor = 'bg-yellow-100 text-yellow-700';
        } else if (status.includes('Rejected')) {
          statusColor = 'bg-red-100 text-red-700';
        }

        return (
          // List Item: Lebih menonjol dan memiliki efek hover yang lebih baik
          <div
            key={r.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 hover:bg-gray-50 transition-colors duration-200"
          >
            {/* Left Section (Icon & Main Info) */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Placeholder/Logo - Menggunakan ikon bisnis yang lebih baik */}
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v2h2a1 1 0 110 2h-2v2h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1v-2h2v-2h-2v-2h-1V4H9V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-lg text-gray-900 truncate">
                    {r.nama_restoran}
                  </h4>
                  {/* Status Badge */}
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>
                    {status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  <span className='font-medium'>Alamat:</span> {r.alamat || "Alamat belum terdaftar"}
                </p>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  Pemilik: **{r.owner_name || r.user_id || "-"}**
                </div>
              </div>
            </div>

            {/* Right Section (Date & Action Placeholder) */}
            <div className="sm:text-right space-y-2 flex-shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:border-l sm:pl-4">
              <div className="text-xs text-gray-500">
                Diperbarui: {r.updated_at
                  ? new Date(r.updated_at).toLocaleString()
                  : r.created_at
                  ? new Date(r.created_at).toLocaleString()
                  : "-"}
              </div>
               {/* Placeholder untuk aksi, misalnya tombol "Lihat Detail" */}
              <button
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150"
                onClick={() => handleViewDetails(r.id)}
              >
                Lihat Detail 👁️
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* Pagination */}
    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-2xl">
      <button
        disabled={restPage <= 1}
        onClick={() => {
          setRestPage((p) => Math.max(1, p - 1));
        }}
        className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        &larr; Halaman Sebelumnya
      </button>
      <span className="text-sm font-medium text-gray-700">Halaman **{restPage}**</span>
      <button
        onClick={() => {
          setRestPage((p) => p + 1);
        }}
        // Perlu menambahkan logika disabled based on restMeta.total_pages jika tersedia
        className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Halaman Berikutnya &rarr;
      </button>
    </div>
  </div>
);

  // Tabel: Riwayat Verifikasi Restoran
  // Timeline view for restaurant verification history
  const renderRestaurantHistoryTable = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      {restaurantHistory.length === 0 && (
        <div className="text-sm text-gray-600 p-2">
          Belum ada riwayat verifikasi restoran.
        </div>
      )}
      <div className="space-y-4">
        {restaurantHistory.map((h) => (
          <div key={h.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  h.status === "disetujui"
                    ? "bg-green-500"
                    : h.status === "ditolak"
                    ? "bg-red-500"
                    : "bg-gray-400"
                }`}
              ></div>
              <div className="w-px bg-gray-200 h-full mt-1"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h5 className="font-semibold text-gray-800">
                  {h.nama_restoran || "#" + h.restoran_id}
                </h5>
                <span className="text-xs text-gray-500 ml-auto">
                  {h.verified_at
                    ? new Date(h.verified_at).toLocaleString()
                    : "-"}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <strong className="text-gray-700">
                  {h.admin_name || h.admin_id || "-"}
                </strong>{" "}
                —{" "}
                <span
                  className="text-xs px-2 py-0.5 rounded ml-2"
                  style={{ background: "#f3f4f6" }}
                >
                  {h.status}
                </span>
              </div>
              {h.catatan && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 border">
                  {h.catatan}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Tampilan Tabel Menu
  // Grid cards for pending menus
  const renderMenuTable = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      {pendingMenus.length === 0 && (
        <div className="text-sm text-gray-600 p-2">
          Tidak ada menu menunggu verifikasi.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingMenus.map((m) => (
          <div
            key={m.id}
            className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
          >
            <div className="w-full h-40 bg-gray-100">
              {m.foto ? (
                <img
                  src={m.foto.startsWith("/") ? API_ORIGIN + m.foto : m.foto}
                  alt={m.nama_menu}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-semibold text-gray-800 truncate">
                {m.nama_menu || m.menuName}
              </h4>
              <p className="text-sm text-gray-600">{m.nama_restoran || "-"}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setSelectedItem({ type: "menu", ...m })}
                  className="px-3 py-2 bg-white border rounded-md text-sm"
                >
                  Lihat Detail
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Setujui menu ini?")) return;
                    try {
                      await api.put(`/admin/verify/menu/${m.id}`, {
                        status: "approved",
                      });
                      refetchAll();
                      alert("Menu disetujui");
                    } catch (e) {
                      console.error(e);
                      alert("Gagal menyetujui menu");
                    }
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm"
                >
                  Setujui
                </button>
                <button
                  onClick={() => {
                    setSelectedItem({ type: "menu", ...m });
                  }}
                  className="px-3 py-2 bg-red-500 text-white rounded-md text-sm"
                >
                  Tolak
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Tabel: Menu Aktif
  // Grid cards for active menus
  const renderActiveMenuTable = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      {menuLoading && (
        <div className="p-3 text-sm text-gray-600">Memuat menu aktif...</div>
      )}
      {menuError && (
        <div className="p-3 text-sm text-red-600 flex items-center justify-between">
          <div>{menuError}</div>
          <button
            onClick={() => fetchActiveMenus(menuMeta.page || 1)}
            className="ml-4 px-3 py-1 bg-gray-100 rounded"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 md:p-6">
        {activeMenusList.map((m) => (
          // Card Container: Lebih menonjol dengan bayangan lembut dan transisi hover
          <div
            key={m.id}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
          >
            {/* Image Section */}
            <div className="w-full h-48 sm:h-56 bg-gray-100 relative overflow-hidden">
              {m.foto ? (
                <img
                  // Pastikan URL API_ORIGIN ada
                  src={m.foto.startsWith("/") ? API_ORIGIN + m.foto : m.foto}
                  alt={m.nama_menu}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="text-gray-400 flex items-center justify-center w-full h-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-1-5a2 2 0 11-4 0 2 2 0 014 0zM6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-2">
              <h4
                className="font-bold text-lg text-green-700 truncate"
                title={m.nama_menu}
              >
                {m.nama_menu}
              </h4>

              {/* Restaurant Name/Source */}
              <p className="text-sm text-gray-500 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="truncate">
                  {m.nama_restoran || "Toko tidak dikenal"}
                </span>
              </p>

              {/* Price and Calories/Nutritional Info */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {/* Price - Lebih tebal dan besar */}
                <div className="text-xl text-green-600 font-extrabold">
                  Rp {m.harga ? Number(m.harga).toLocaleString("id-ID") : "—"}
                </div>

                {/* Calories - Menggunakan badge/label yang lebih jelas */}
                <div className="text-xs font-medium text-gray-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.5 7.5a1 1 0 11-2 0 1 1 0 012 0zM10 14a4 4 0 003.5-6.5h-.03a.5.5 0 00-.5-.5H8a.5.5 0 00-.5.5H7A4 4 0 0010 14z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {m.kalori ?? "-"} kkal
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 flex justify-between items-center">
        <button
          disabled={menuPage <= 1}
          onClick={() => {
            setMenuPage((p) => Math.max(1, p - 1));
          }}
          className="px-3 py-1 bg-gray-100 rounded"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">Halaman {menuPage}</span>
        <button
          onClick={() => {
            setMenuPage((p) => p + 1);
          }}
          className="px-3 py-1 bg-gray-100 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );

  // Tabel: Riwayat Verifikasi Menu
  // Timeline view for menu verification history
  const renderMenuHistoryTable = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      {menuHistory.length === 0 && (
        <div className="text-sm text-gray-600 p-2">
          Belum ada riwayat verifikasi menu.
        </div>
      )}
      <div className="space-y-4">
        {menuHistory.map((h) => (
          <div key={h.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  h.status === "disetujui"
                    ? "bg-green-500"
                    : h.status === "ditolak"
                    ? "bg-red-500"
                    : "bg-gray-400"
                }`}
              ></div>
              <div className="w-px bg-gray-200 h-full mt-1"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h5 className="font-semibold text-gray-800">
                  {h.nama_menu || "#" + h.menu_id}
                </h5>
                <span className="text-xs text-gray-500 ml-auto">
                  {h.verified_at
                    ? new Date(h.verified_at).toLocaleString()
                    : "-"}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <strong className="text-gray-700">
                  {h.admin_name || h.admin_id || "-"}
                </strong>{" "}
                —{" "}
                <span
                  className="text-xs px-2 py-0.5 rounded ml-2"
                  style={{ background: "#f3f4f6" }}
                >
                  {h.status}
                </span>
              </div>
              {h.catatan && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 border">
                  {h.catatan}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Komponen Sidebar Navigasi
  const Sidebar = () => (
    <nav className="space-y-3">
      <button
        onClick={() => setActiveTab("dashboard")}
        className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
          activeTab === "dashboard"
            ? "bg-white text-green-700 shadow-lg scale-105"
            : "text-white hover:bg-green-600/50 hover:translate-x-1"
        }`}
      >
        <div
          className={`p-2 rounded-lg ${
            activeTab === "dashboard" ? "bg-green-100" : "bg-green-600/30"
          }`}
        >
          <LayoutDashboard
            size={20}
            className={
              activeTab === "dashboard" ? "text-green-700" : "text-white"
            }
          />
        </div>
        <span className="flex-1">Ringkasan</span>
      </button>

      <button
        onClick={() => setActiveTab("users")}
        className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
          activeTab === "users"
            ? "bg-white text-green-700 shadow-lg scale-105"
            : "text-white hover:bg-green-600/50 hover:translate-x-1"
        }`}
      >
        <div
          className={`p-2 rounded-lg ${
            activeTab === "users" ? "bg-green-100" : "bg-green-600/30"
          }`}
        >
          <User
            size={20}
            className={activeTab === "users" ? "text-green-700" : "text-white"}
          />
        </div>
        <span className="flex-1">Manajemen Pengguna</span>
      </button>

      <button
        onClick={() => setActiveTab("merchants")}
        className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
          activeTab === "merchants"
            ? "bg-white text-green-700 shadow-lg scale-105"
            : "text-white hover:bg-green-600/50 hover:translate-x-1"
        }`}
      >
        <div
          className={`p-2 rounded-lg ${
            activeTab === "merchants" ? "bg-green-100" : "bg-green-600/30"
          }`}
        >
          <Store
            size={20}
            className={
              activeTab === "merchants" ? "text-green-700" : "text-white"
            }
          />
        </div>
        <span className="flex-1">Management Toko</span>
        {pendingMerchants.length > 0 && (
          <span className="px-2.5 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-md">
            {pendingMerchants.length}
          </span>
        )}
      </button>

      <button
        onClick={() => setActiveTab("menus")}
        className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
          activeTab === "menus"
            ? "bg-white text-green-700 shadow-lg scale-105"
            : "text-white hover:bg-green-600/50 hover:translate-x-1"
        }`}
      >
        <div
          className={`p-2 rounded-lg ${
            activeTab === "menus" ? "bg-green-100" : "bg-green-600/30"
          }`}
        >
          <Utensils
            size={20}
            className={activeTab === "menus" ? "text-green-700" : "text-white"}
          />
        </div>
        <span className="flex-1">Management Menu</span>
        {pendingMenus.length > 0 && (
          <span className="px-2.5 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold shadow-md">
            {pendingMenus.length}
          </span>
        )}
      </button>

      <button
        onClick={() => setActiveTab("moderation")}
        className={`group w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
          activeTab === "moderation"
            ? "bg-white text-green-700 shadow-lg scale-105"
            : "text-white hover:bg-green-600/50 hover:translate-x-1"
        }`}
      >
        <div
          className={`p-2 rounded-lg ${
            activeTab === "moderation" ? "bg-green-100" : "bg-green-600/30"
          }`}
        >
          <MessageSquare
            size={20}
            className={
              activeTab === "moderation" ? "text-green-700" : "text-white"
            }
          />
        </div>
        <span className="flex-1">Moderasi Ulasan</span>
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 1. Sidebar Navigasi (Desktop) - UPGRADED dengan Gradient Hijau */}
      <div className="hidden md:flex flex-col w-72 bg-gradient-to-b from-green-600 via-green-700 to-green-800 text-white p-6 sticky top-0 h-screen shadow-2xl">
        {/* Logo Header dengan Efek Glassmorphism */}
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/20 backdrop-blur-sm bg-white/10 rounded-2xl p-4 shadow-lg">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <img
              src="/logo-RasoSehat.png"
              alt="Logo"
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              RasoSehat
            </span>
            <p className="text-xs text-green-100 font-medium">Admin Panel</p>
          </div>
        </div>

        <Sidebar />

        {/* Logout Button dengan Gradient */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-white"
          >
            <LogOut size={20} />
            <span>Logout Admin</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1">
        {/* Header Mobile & Tablet dengan Gradient */}
        <header className="md:hidden sticky top-0 z-40 bg-gradient-to-r from-green-600 to-green-700 shadow-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
                <img
                  src="/logo-RasoSehat.png"
                  alt="Logo"
                  className="w-7 h-7 rounded-full"
                />
              </div>
              <div>
                <span className="text-lg font-bold text-white">
                  Admin Panel
                </span>
                <p className="text-xs text-green-100">RasoSehat</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-all shadow-md"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <LayoutDashboard className="w-8 h-8 text-green-700" />
              </div>
              Dashboard Verifikasi
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KpiCard
                title="Toko Menunggu"
                  value={kpiPendingMerchants}
                icon={Store}
                color="text-red-500 border-red-500"
              />
              <KpiCard
                title="Menu Baru (Audit)"
                  value={kpiPendingMenus}
                icon={Utensils}
                color="text-yellow-500 border-yellow-500"
              />
              <KpiCard
                title="Total Menu Aktif"
                  value={kpiActiveMenus}
                icon={CheckCircle}
                color="text-green-600 border-green-600"
              />
              <KpiCard
                title="Total Toko Terdaftar"
                  value={kpiTotalRestaurants}
                icon={User}
                color="text-blue-500 border-blue-500"
              />
            </div>

            {/* Kontainer Utama Tab */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* Tab Navigation (Mobile) */}
              <div
                role="tablist"
                className="tabs tabs-boxed mb-6 bg-gradient-to-r from-green-50 to-green-100 md:hidden flex-wrap p-1"
              >
                <a
                  role="tab"
                  className={`tab text-gray-700 font-semibold text-xs ${
                    activeTab === "users"
                      ? "tab-active !bg-green-600 !text-white shadow-lg"
                      : "hover:bg-green-200"
                  }`}
                  onClick={() => setActiveTab("users")}
                >
                  Pengguna
                </a>
                <a
                  role="tab"
                  className={`tab text-gray-700 font-semibold text-xs ${
                    activeTab === "merchants"
                      ? "tab-active !bg-green-600 !text-white shadow-lg"
                      : "hover:bg-green-200"
                  }`}
                  onClick={() => setActiveTab("merchants")}
                >
                  Toko ({pendingMerchants.length})
                </a>
                <a
                  role="tab"
                  className={`tab text-gray-700 font-semibold text-xs ${
                    activeTab === "menus"
                      ? "tab-active !bg-green-600 !text-white shadow-lg"
                      : "hover:bg-green-200"
                  }`}
                  onClick={() => setActiveTab("menus")}
                >
                  Menu ({pendingMenus.length})
                </a>
                <a
                  role="tab"
                  className={`tab text-gray-700 font-semibold ${
                    activeTab === "moderation"
                      ? "tab-active !bg-green-600 !text-white shadow-lg"
                      : "hover:bg-green-200"
                  }`}
                  onClick={() => setActiveTab("moderation")}
                >
                  Ulasan
                </a>
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "dashboard" && (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-600">
                      Selamat datang di panel admin RasoSehat. Berikut ringkasan
                      aktivitas platform.
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                          <Store size={18} /> Aktivitas Toko
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex justify-between">
                            <span>Menunggu Verifikasi</span>{" "}
                            <span className="font-bold text-red-600">
                              {pendingMerchants.length}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Total Terdaftar</span>{" "}
                            <span className="font-bold text-green-600">
                              {pendingMerchants.length}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Toko Aktif Bulan Ini</span>{" "}
                            <span className="font-bold text-blue-600">48</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-5 border border-yellow-200">
                        <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                          <Utensils size={18} /> Aktivitas Menu
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex justify-between">
                            <span>Menunggu Audit</span>{" "}
                            <span className="font-bold text-yellow-600">
                              {pendingMenus.length}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Total Menu Aktif</span>{" "}
                            <span className="font-bold text-green-600">
                              {pendingMenus.length}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span>Menu Ditolak</span>{" "}
                            <span className="font-bold text-red-600">5</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock size={18} /> Aktivitas Terbaru
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm p-3 bg-white rounded-lg border">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">
                            Toko <strong>"Warung Sehat Ibu"</strong> berhasil
                            diverifikasi
                          </span>
                          <span className="ml-auto text-xs text-gray-400">
                            2 jam lalu
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm p-3 bg-white rounded-lg border">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-600">
                            Menu <strong>"Nasi Merah Rendang"</strong> menunggu
                            audit
                          </span>
                          <span className="ml-auto text-xs text-gray-400">
                            5 jam lalu
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm p-3 bg-white rounded-lg border">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">
                            Pendaftaran baru dari{" "}
                            <strong>"Toko Sehat Bundo"</strong>
                          </span>
                          <span className="ml-auto text-xs text-gray-400">
                            1 hari lalu
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "merchants" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold">Management Toko</h3>
                    <p className="text-sm text-gray-600">
                      Tinjau pengajuan toko baru dan kelola daftar toko aktif
                      serta riwayat verifikasi.
                    </p>
                    <div className="space-y-4">
                      <h4 className="font-semibold">
                        Toko Menunggu Verifikasi
                      </h4>
                      {renderMerchantTable()}
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-semibold">Toko Aktif</h4>
                      {renderActiveRestaurantsTable()}
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-semibold">Riwayat Verifikasi Toko</h4>
                      {renderRestaurantHistoryTable()}
                    </div>
                  </div>
                )}
                {activeTab === "menus" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold">Management Menu</h3>
                    <p className="text-sm text-gray-600">
                      Audit menu, lihat daftar menu aktif, dan riwayat
                      verifikasi menu.
                    </p>

                    <div className="space-y-4">
                      <h4 className="font-semibold">
                        Menu Menunggu Verifikasi
                      </h4>
                      {renderMenuTable()}
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-semibold">Menu Aktif</h4>
                      {renderActiveMenuTable()}
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-semibold">Riwayat Verifikasi Menu</h4>
                      {renderMenuHistoryTable()}
                    </div>
                  </div>
                )}
                {activeTab === "moderation" && (
                  <div className="p-4 text-center text-gray-600">
                    Fitur Moderasi Ulasan akan ditambahkan di fase selanjutnya.
                  </div>
                )}

                {activeTab === "users" && <AdminUserManagement />}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Modal Sidebar Mobile dengan Gradient Hijau */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 150 }}
              className="w-72 bg-gradient-to-b from-green-600 via-green-700 to-green-800 text-white p-6 h-screen shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo Header Mobile */}
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/20 backdrop-blur-sm bg-white/10 rounded-2xl p-4 shadow-lg">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <img
                    src="/logo-RasoSehat.png"
                    alt="Logo"
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-white tracking-tight">
                    RasoSehat
                  </span>
                  <p className="text-xs text-green-100 font-medium">
                    Admin Panel
                  </p>
                </div>
              </div>

              <Sidebar />

              {/* Logout Button Mobile */}
              <div className="mt-8 pt-6">
                <button
                  onClick={handleAdminLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl text-white"
                >
                  <LogOut size={20} />
                  <span>Logout Admin</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Verifikasi */}
      <AnimatePresence>
        {selectedItem && (
          <VerificationModal
            type={selectedItem.type}
            data={selectedItem}
            onClose={() => setSelectedItem(null)}
            onVerify={handleVerify}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
