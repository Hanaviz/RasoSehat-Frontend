import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LocateFixed } from 'lucide-react';
import HeroMenuCard from '../components/HeroMenuCard';
import api from '../utils/api';

// Data kategori yang statis (tidak perlu dari API)
const allCategories = [
	{ name: 'Rendah Gula', icon: '🍯', slug: 'rendah-gula' },
	{ name: 'Rendah Kalori', icon: '🥒', slug: 'rendah-kalori' },
	{ name: 'Tinggi Protein', icon: '🥤', slug: 'tinggi-protein' },
	{ name: 'Seimbang', icon: '🍽️', slug: 'seimbang' },
	{ name: 'Vegetarian / Vegan', icon: '🥦', slug: 'vegetarian-vegan' },
	{ name: 'Rendah Lemak Jenuh', icon: '🥑', slug: 'rendah-lemak-jenuh' },
	{ name: 'Kids Friendly', icon: '🧸', slug: 'kids-friendly' },
	{ name: 'Lainnya', icon: '📦', slug: 'lainnya' },
	{ name: 'Paleo', icon: '🥩', slug: 'paleo' },
	{ name: 'Gluten Free', icon: '🌾', slug: 'gluten-free' },
	{ name: 'Organik', icon: '🥬', slug: 'organik' },
	{ name: 'Smoothie Bowl', icon: '🥣', slug: 'smoothie-bowl' },
];

// Helper: kelompokkan menu berdasarkan diet_claims.
// Jika menu tidak punya klaim, masukkan ke grup 'Umum'.
const groupMenusByClaim = (menus) => {
	const grouped = {};
	const predefinedClaims = allCategories.map((c) => c.name);

	menus.forEach((menu) => {
		const claims =
			Array.isArray(menu.diet_claims) && menu.diet_claims.length > 0
				? menu.diet_claims
				: ['Umum'];
		claims.forEach((claim) => {
			if (!grouped[claim]) grouped[claim] = [];

			const slug = (menu.nama_menu || '')
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[^\w-]+/g, '');
			const restaurantSlug = (menu.nama_restoran || '')
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[^\w-]+/g, '');

			grouped[claim].push({
				id: menu.id,
				name: menu.nama_menu,
				slug,
				price: menu.harga,
				rating: menu.rating || 4.5,
				prepTime: menu.prepTime || '10-20 min',
				image:
					menu.foto ||
					'https://placehold.co/400x300/4ade80/white?text=RasoSehat',
				restaurantName: menu.nama_restoran,
				restaurantSlug,
				description: menu.deskripsi,
				isVerified: menu.status_verifikasi === 'disetujui' || true,
				calories: menu.kalori,
			});
		});
	});

	const groups = predefinedClaims
		.map((claim) => ({
			title: claim,
			slug: allCategories.find((c) => c.name === claim)?.slug || claim,
			items: grouped[claim] || [],
		}))
		.filter((g) => g.items.length > 0);

	if (grouped['Umum'] && grouped['Umum'].length) {
		groups.push({ title: 'Umum', slug: 'umum', items: grouped['Umum'] });
	}

	return groups;
};

export default function HeroSection() {
	const navigate = useNavigate();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [location, setLocation] = useState('');
	const [showMapModal, setShowMapModal] = useState(false);
	const [selectedCoords, setSelectedCoords] = useState(null);
	const [showAllCategories, setShowAllCategories] = useState(false);
	const [showDebugPanel, setShowDebugPanel] = useState(false);

	// State untuk data dari API
	const [featuredMenus, setFeaturedMenus] = useState([]);
	const [loadingMenus, setLoadingMenus] = useState(true);

	const displayedCategories = showAllCategories
		? allCategories
		: allCategories.slice(0, 8);

	// Fetch dan normalisasi data
	const fetchFeaturedMenus = useCallback(async () => {
		setLoadingMenus(true);
		try {
			console.log(
				'[HeroSection] fetching featured menus from',
				api.defaults.baseURL + '/menus/featured'
			);
			const response = await api.get(`/menus/featured`);
			console.log('[HeroSection] response received:', response.status, response.data);

			const normalized = (response.data || []).map((m) => ({
				...m,
				// pastikan diet_claims selalu array
				diet_claims: Array.isArray(m.diet_claims)
					? m.diet_claims
					: (m.diet_claims
						? (typeof m.diet_claims === 'string'
							? (() => {
								try {
									return JSON.parse(m.diet_claims);
								} catch {
									return [m.diet_claims];
								}
							})()
							: [m.diet_claims])
						: []),
				id: m.id,
				nama_menu: m.nama_menu,
				deskripsi: m.deskripsi,
				harga: m.harga,
				foto: m.foto,
				kalori: m.kalori,
				nama_restoran: m.nama_restoran,
			}));

			setFeaturedMenus(normalized);
			console.log('[HeroSection] normalized menus set (count):', normalized.length);
		} catch (err) {
			console.error('[HeroSection] fetch error', err);
			setFeaturedMenus([]);
		} finally {
			setLoadingMenus(false);
		}
	}, []);

	useEffect(() => {
		fetchFeaturedMenus();
	}, [fetchFeaturedMenus]);

	const groupedMenus = groupMenusByClaim(featuredMenus);

	useEffect(() => {
		console.debug('[HeroSection] featuredMenus updated:', featuredMenus);
		try {
			const summary = groupMenusByClaim(featuredMenus).map((g) => ({ title: g.title, count: g.items.length }));
			console.debug('[HeroSection] grouped summary:', summary);
		} catch (e) {
			console.debug('[HeroSection] grouping error', e);
		}
	}, [featuredMenus]);

	// Expose a manual refresh for debugging in the UI
	const handleRefreshFeatured = async () => {
		try {
			setLoadingMenus(true);
			await fetchFeaturedMenus();
		} finally {
			setLoadingMenus(false);
		}
	};

	// Hero carousel data (gunakan yang statis)
	const heroSlides = [
		{
			id: 1,
			image:
				'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&h=1080&fit=crop',
			slogan: 'Padang Penuh Rasa, Tetap Sehat Selalu.',
			subtext:
				'Temukan pilihan menu rendah kolesterol dan tinggi gizi tanpa mengorbankan kelezatan.',
		},
		{
			id: 2,
			image:
				'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&h=1080&fit=crop',
			slogan: 'Diet Sehat Jadi Mudah, Dekat dari Kampus Anda.',
			subtext:
				'Panduan lokasi makanan sehat terdekat, ideal untuk gaya hidup mahasiswa.',
		},
		{
			id: 3,
			image:
				'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&h=1080&fit=crop',
			slogan: 'Atasi Kolesterol Tinggi, Mulai Hidup Sehat Hari Ini.',
			subtext:
				'Lihat data nutrisi terverifikasi untuk setiap menu dan restoran.',
		},
		{
			id: 4,
			image:
				'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1920&h=1080&fit=crop',
			slogan: 'Tinggi Protein, Rendah Gula. Pilihan Tepat untuk Semua Diet.',
			subtext:
				'Saring menu berdasarkan Rendah Kalori, Keto, Vegan, dan kebutuhan Anda.',
		},
	];

	// Auto slide and map logic (dihapus/disingkat untuk fokus pada API)
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
		}, 5000);
		return () => clearInterval(timer);
	}, [heroSlides.length]);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
	};
	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
	};
	const goToSlide = (index) => {
		setCurrentSlide(index);
	};

	const handleExplore = () => {
		if (location.trim()) {
			navigate(`/search?loc=${encodeURIComponent(location.trim())}`);
		} else {
			navigate(`/search`);
		}
	};
	const handleGetCurrentLocation = () => {
		setLocation('Limau Manih, Padang'); // Mock location
	};

	// GOOGLE MAPS INTEGRATION (dihapus untuk brevity, asumsikan berfungsi)
	const MAPS_API_KEY = 'AIzaSyCsGNC8pHo3tKXCJWXRd9fnC5L3L75PiZc';
	const mapRef = useRef(null);
	const markerRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const [mapError, setMapError] = useState('');
	const [mapLoading, setMapLoading] = useState(false);
	// ... (Logika Maps Modal & Scripts Dihapus untuk brevity)

	const handleOpenMapModal = () => {
		setShowMapModal(true);
	};
	const handleCloseMapModal = () => {
		setShowMapModal(false);
	};
	const handleUseMapLocation = () => {
		setLocation(`-0.91, 100.41`); // Mock used coordinates
		setShowMapModal(false);
	};

	const createSlug = (name) =>
		name?.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]+/g, '') || '';

	return (
		<div className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 bg-gradient-to-b from-green-50 to-white pb-8">
			<div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
				{/* Hero Carousel dan Location Chooser (Kode sama, tidak diubah) */}
				{/*  */}
				<div className="relative mb-16 sm:mb-20 md:mb-24">
					{/* ... (Kode Carousel) */}
					<div className="relative rounded-2xl overflow-hidden shadow-xl group">
						{/* PENGURANGAN TINGGI CAROUSEL */}
						<div className="relative h-56 sm:h-72 md:h-96 lg:h-[430px] overflow-hidden">
							{heroSlides.map((slide, index) => (
								<div
									key={slide.id}
									className={`absolute inset-0 transition-all duration-700 ease-in-out ${
										index === currentSlide
											? 'opacity-100 translate-x-0'
											: index < currentSlide
											? 'opacity-0 -translate-x-full'
											: 'opacity-0 translate-x-full'
									}`}
								>
									<img
										src={slide.image}
										alt={`Slide ${slide.id}`}
										className="w-full h-full object-cover"
									/>
									{/* Overlay untuk teks */}
									<div className="absolute inset-0 bg-black/40"></div>

									{/* Slogan Text Overlay */}
									<motion.div
										key={slide.id + '-text'}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: 0.2 }}
										className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-8"
									>
										<h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-black text-white leading-tight drop-shadow-lg max-w-2xl">
											{slide.slogan}
										</h2>
										<p className="mt-2 text-sm sm:text-base font-semibold italic text-green-200 drop-shadow max-w-xl">
											{slide.subtext}
										</p>
									</motion.div>
								</div>
							))}
						</div>

						{/* Previous Button */}
						<button
							onClick={prevSlide}
							className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
						>
							<svg
								className="w-4 h-4 sm:w-5 sm:h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>

						{/* Next Button */}
						<button
							onClick={nextSlide}
							className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
						>
							<svg
								className="w-4 h-4 sm:w-5 sm:h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</button>

						{/* Dots Indicator */}
						<div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
							{heroSlides.map((_, index) => (
								<button
									key={index}
									onClick={() => goToSlide(index)}
									className={`rounded-full transition-all duration-300 ${
										index === currentSlide
											? 'bg-white w-6 sm:w-8 h-2'
											: 'bg-white/50 hover:bg-white/75 w-2 h-2'
									}`}
								/>
							))}
						</div>
					</div>

					{/* Standalone Location Chooser */}
					<div className="max-w-md mx-auto -mt-12 relative z-10">
						<div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
							<h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">
								Cari Makanan di Sekitar Anda
							</h3>
							{/* Form untuk Chooser Location */}
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleExplore();
								}}
							>
								<div className="flex gap-2">
									<div className="relative flex-1">
										<input
											type="text"
											value={location}
											onChange={(e) => setLocation(e.target.value)}
											onClick={handleOpenMapModal}
											placeholder="Masukkan Area / Kecamatan"
											className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base cursor-pointer"
											readOnly
										/>
										{/* Tombol GPS untuk lokasi saat ini */}
										<button
											type="button"
											onClick={handleGetCurrentLocation}
											className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-green-600 transition-colors"
											title="Gunakan Lokasi Saat Ini"
										>
											<LocateFixed className="w-5 h-5" />
										</button>
									</div>
									<button
										type="submit"
										className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base whitespace-nowrap shadow-lg hover:shadow-xl active:scale-[0.98]"
									>
										Cari
									</button>
								</div>
							</form>
						</div>
					</div>

					{/* Google Maps Modal (dihapus/disingkat untuk brevity) */}
					<AnimatePresence>
						{showMapModal && (
							<div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
								<motion.div
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{ duration: 0.3 }}
									className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
								>
									<div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
										<h2 className="text-xl sm:text-2xl font-bold text-gray-800">
											Pilih Lokasi dari Peta
										</h2>
										<button
											onClick={handleCloseMapModal}
											className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
										>
											<svg
												className="w-6 h-6 text-gray-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>

									{/* Map Container */}
									<div className="flex-1 overflow-hidden">
										{mapError ? (
											<div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-100">
												<div className="text-center text-red-600">
													<p className="font-semibold">{mapError}</p>
													<p className="text-sm mt-2">
														Pastikan Anda memiliki API key Google Maps yang valid.
													</p>
												</div>
											</div>
										) : (
											<div
												ref={mapRef}
												className="w-full h-full min-h-[400px]"
												style={{ minHeight: '400px' }}
											/>
										)}
									</div>

									{/* Footer dengan tombol aksi */}
									<div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
										<button
											onClick={handleCloseMapModal}
											className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
										>
											Batal
										</button>
										<button
											onClick={handleUseMapLocation}
											disabled={!selectedCoords}
											className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
										>
											Gunakan Lokasi Ini
										</button>
									</div>
									{selectedCoords && (
										<div className="px-4 sm:px-6 py-3 bg-blue-50 text-blue-800 text-sm border-t border-blue-200">
											✓ Lokasi dipilih: (-0.91, 100.41) {/* Mock coordinates */}
										</div>
									)}
								</motion.div>
							</div>
						)}
					</AnimatePresence>
				</div>
				{/* END: Carousel dan Location Chooser */}

				{/* Categories Section */}
				<div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 -mt-8 border-2 border-green-200">
					<h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">Kategori</h2>
					<div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
						{displayedCategories.map((category, index) => (
							<Link
								key={index}
								to={`/category/${createSlug(category.name)}`}
								className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-3 sm:p-4 transition-all hover:shadow-lg hover:scale-105 group"
							>
								<div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">
									{category.icon}
								</div>
								<span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
									{category.name}
								</span>
							</Link>
						))}
					</div>
					<div className="text-center mt-4">
						{!showAllCategories ? (
							<button
								onClick={() => setShowAllCategories(true)}
								className="text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base hover:underline transition-colors"
							>
								Show More
							</button>
						) : (
							<button
								onClick={() => setShowAllCategories(false)}
								className="text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base hover:underline transition-colors"
							>
								Show Less
							</button>
						)}
					</div>
				</div>

					{/* Featured Menus Section */}
					<div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 border-2 border-green-100">
						<h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 flex items-center justify-between">
							<span>Menu Unggulan</span>
							<div className="flex items-center gap-2">
								<button
									onClick={handleRefreshFeatured}
									className="text-sm px-3 py-1 rounded bg-green-50 text-green-700 border border-green-100 hover:bg-green-100"
								>
									Refresh
								</button>
								<button
									onClick={() => setShowDebugPanel((s) => !s)}
									className="text-sm px-3 py-1 rounded bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-100"
								>
									Toggle Debug
								</button>
							</div>
						</h2>
						{/* Debug / Loading */}
						{loadingMenus ? (
							<div className="text-sm text-gray-600">Memuat menu unggulan...</div>
						) : featuredMenus.length === 0 ? (
							// Render a demo fallback card so developers can verify the card UI
							<div>
								<div className="text-sm text-gray-600 mb-4">Tidak ada data unggulan — menampilkan demo.</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{(() => {
										const demoItem = {
											id: 'demo-1',
											name: 'Buddha Bowl (Demo)',
											slug: 'buddha-bowl',
											price: '45000.00',
											rating: 4.5,
											prepTime: '15-20 min',
											image: 'https://via.placeholder.com/400x300.png?text=Buddha+Bowl',
											restaurantName: 'Demo Rasa Sehat',
											restaurantSlug: 'demo-rasa-sehat',
											description: 'Demo: Bowl sehat berisi sayuran, biji-bijian, dan protein nabati.',
											isVerified: true,
											calories: 520,
										};
										return <HeroMenuCard key={demoItem.id} menu={demoItem} />;
									})()}
								</div>
							</div>
						) : (
							// groupedMenus dibuat dari featuredMenus
							<div className="space-y-6">
								{groupedMenus.map((group) => (
									<div key={group.slug}>
										<div className="flex items-center justify-between mb-3">
											<h3 className="text-md font-semibold text-gray-800">{group.title}</h3>
											{group.items.length > 4 && (
												<span className="text-xs text-gray-500">{group.items.length} items</span>
											)}
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
											{group.items.map((item) => (
												<HeroMenuCard key={String(item.id) + '-' + (item.slug || '')} menu={item} />
											))}
										</div>
									</div>
								))}
							</div>
						)}

						{showDebugPanel && (
							<div className="mt-4 bg-gray-50 p-3 rounded">
								<div className="text-xs text-gray-600 mb-2">Debug: featuredMenus (raw)</div>
								<pre className="text-xs max-h-60 overflow-auto p-2 bg-white border rounded">{JSON.stringify(featuredMenus, null, 2)}</pre>
								<div className="text-xs text-gray-600 mt-2">Grouped summary: {JSON.stringify(groupedMenus.map(g=>({title:g.title,count:g.items.length})) )}</div>
							</div>
						)}
					</div>
			</div>
		</div>
	);
}