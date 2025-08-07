import DirectorProtectedRoute from "@/components/DirectorProtectedRoute";
import { access } from "fs";

type Language = "id" | "en";

const translations: Record<string, { id: string; en: string }> = {
  // Login
  welcome_back: { id: "Selamat datang kembali!", en: "Welcome back!" },
  log_in: { id: "Masuk ke akun Anda", en: "Log in to your account" },
  email: { id: "Surel", en: "E-mail" },
  password: { id: "Kata sandi", en: "Password" },
  login: { id: "Masuk", en: "Login" },
  login_fail: { id: "Gagal masuk, silakan periksa kredensial Anda.", 
                en: "Login failed, please check your credentials." },
  to_register: { id: "Belum punya akun?", en: "Don't have an account?" },

  // Register
  welcome: { id: "Selamat datang!", en: "Welcome!" },
  register_account: { id: "Daftar akun baru", en: "Register a new account" },
  register: { id: "Daftar", en: "Register" },
  register_fail: { id: "Gagal mendaftar, silakan coba lagi.", en: "Registration failed, please try again." },
  to_login: { id: "Sudah punya akun?", en: "Have an account?" },

  // Logout
  logout: { id: "Keluar", en: "Logout" },
  tooltip: { id: "Klik untuk keluar dari akun Anda", en: "Click to log out of your account" },

  // Menu
  generator: {
    id: "Mulai membuat <i>Digital Calibration Certificate</i> (DCC) baru. Klik di sini.",
    en: "Start creating a new Digital Calibration Certificate (DCC). Click here.",
  },
  importer: {
    id: "Akses <i>Digital Calibration Certificate</i> (DCC) Anda dan ekspor datanya ke Ms. Excel. Klik di sini.",
    en: "Access your Digital Calibration Certificate (DCC) and export the data to Excel. Click here.",
  },

  // Stepper
  administrasi: { id: "Administrasi", en: "Administration" },
  hasil: { id: "Hasil Kalibrasi", en: " Calibration Results" },
  statements: { id: "Pernyataan", en: "Statements" },
  preview: { id: "Pratinjau", en: "Preview" },

  asterisk: {
    id: "Menandakan pertanyaan wajib",
    en: "Indicates required question",
  },
  submit: { id: "Kirim", en: "Submit" },

  pilih_bahasa: {id: "Tolong pilih bahasa yang digunakan.", en: "Please select the used languages."},

  // === Administrative ===
  // Software
  software: { id: "Perangkat Lunak", en: "Software" },
  nama: { id: "Nama", en: "Name" },
  versi: { id: "Versi", en: "Version" },

  // Data Administrasi
  data: { id: "Data Administrasi", en: "Administrative Data" },
  negara_calib: { id: "Negara tempat kalibrasi", en: "Country of calibration" },
  cari_negara: { id: "Cari negara...", en: "Search country..." },
  tempat: { id: "Tempat kalibrasi", en: "Calibration place" },
  other: { id: "lainnya", en: "other" },
  used: { id: "Bahasa yang digunakan", en: "Used language" },
  cari_bahasa: { id: "Cari bahasa...", en: "Search language..." },
  mandatory: { id: "Bahasa yang diwajibkan", en: "Mandatory language" },
  order: { id: "Nomor order", en: "Order number" },
  penerbit_order: { id: "Penerbit nomor order", en: "Order number issuer" },
  sertifikat: { id: "Nomor sertifikat", en: "Certificate number" },

  // Linimasa
  linimasa: { id: "Linimasa Pengukuran", en: "Measurement Timeline" },
  mulai: { id: "Tanggal mulai pengukuran", en: "Measurement start date" },
  akhir: { id: "Tanggal akhir pengukuran", en: "Measurement end date" },
  pengesahan: { id: "Tanggal pengesahan", en: "Issue date" },

  // Objek
  object_desc: {
    id: "Deskripsi Objek yang Dikalibrasi/Diukur",
    en: "Description of Calibrated/Measured Object",
  },
  objek: { id: "Objek", en: "Object" },
  jenis: { id: "Jenis alat atau objek", en: "Type of instrument or object" },
  merek: { id: "Merek/pembuat", en: "Brand/manufacturer" },
  tipe: { id: "Tipe", en: "Type" },
  identifikasi: { id: "Identifikasi alat", en: "Instrument identification" },
  penerbit_seri: { id: "Penerbit nomor seri", en: "Serial number issuer" },
  seri: { id: "Nomor seri", en: "Serial number" },
  id_lain: { id: "Identifikasi lain", en: "Other identification" },

  // Penanggung Jawab
  responsible: { id: "Penanggung Jawab", en: "Responsible Person" },
  pelaksana: { id: "Pelaksana Kalibrasi", en: "Calibration Officer" },
  nip: { id: "NIP", en: "Employee ID number" },
  penyelia: { id: "Penyelia Kalibrasi", en: "Calibration Supervisor" },
  kepala: { id: "Kepala Laboratorium", en: "Laboratory Head" },
  lab: { id: "Laboratorium", en: "Laboratory" },
  direktur: { id: "Direktur", en: "Director" },
  jabatan: { id: "Jabatan", en: "Position" },

  // Pemilik
  identitas: {
    id: "Identitas Pemilik Objek yang Dikalibrasi/Diukur",
    en: "Owner Identification of the Calibrated/Measured Objects",
  },
  alamat: { id: "Alamat", en: "Address" },
  jalan: { id: "Jalan", en: "Street" },
  no_jalan: { id: "Nomor", en: "Number" },
  kota: { id: "Kecamatan/kabupaten/kota", en: "Subdistrict/regency/city" },
  provinsi: { id: "Provinsi", en: "Province" },
  pos: { id: "Kode pos", en: "Postal code" },
  negara_cust: { id: "Negara", en: "Country" },

  // === Measurement ===
  // Metode
  metode: { id: "Metode", en: "Method" },
  norm: { id: "Norma", en: "Norm" },
  deskripsi: { id: "Deskripsi", en: "Description" },
  basic_methodMeasurementUncertainty: {
    id: "Metode untuk menentukan ketidakpastian pengukuran yang tercantum dalam dokumen. Contoh: Ketidakpastian diperluas yang dilaporkan dinyatakan sebagai ketidakpastian standar yang dikalikan dengan faktor cakupan k. Faktor cakupan k=2 untuk distribusi normal berkorelasi dengan tingkat kepercayaan sekitar 95%",
    en: "Method to determine the measurement uncertainties stated in the document. Example: The reported expanded uncertainty is stated as the standard uncertainty multiplied by a coverage factor k. The coverage factor k=2 for a normal distribution corresponds to a coverage probability of approx. 95%",
  },
  cb_rumus_metode: {
    id: "Metode ini melibatkan ekspresi matematika atau rumus",
    en: "This method includes mathematical notation or formula",
  },
  rumus: { id: "Rumus", en: "Formula" },
  editor: { id: "Buka editor", en: "Open editor" },
  cb_gambar_metode: {
    id: "Metode ini disertai gambar",
    en: "This method is accompanied by an image",
  },
  gambar: { id: "Gambar", en: "Image" },
  upload_gambar: { id: "Unggah file gambar", en: "Upload figure file" },
  caption: { id: "Keterangan gambar", en: "Figure caption" },

  // Alat Pengukuran
  pengukuran: {
    id: "Standar atau Alat Pengukuran",
    en: "Standards or Measuring Equipments",
  },
  alat: { id: "Alat", en: "Equipment" },
  manuf: { id: "Merek", en: "Manufacturer" },
  model: { id: "Model", en: "Type" },
  basic_measurementStandard: {
    id: "Peralatan standar acuan",
    en: "Standard reference equipment",
  },

  // Kondisi
  kondisi: { id: "Kondisi Lingkungan", en: "Environmental Condition" },
  lingkungan: { id: "Parameter lingkungan", en: "Environmental parameter" },
  suhu: { id: "Suhu", en: "Temperature" },
  lembap: { id: "Kelembapan", en: "Humidity" },
  other_condition: {
    id: "Masukkan kondisi lain",
    en: "Enter another condition",
  },
  tengah: { id: "Nilai tengah", en: "Central value" },
  nilai: { id: "Nilai", en: "Value" },
  prefix: { id: "Awalan", en: "Prefix" },
  satuan: { id: "Satuan", en: "Unit" },
  eksponen: { id: "Pangkat", en: "Exponent" },
  rentang: { id: "Simpangan", en: "Deviation" },

  // Excel
  lampiran: { id: "Lampiran", en: "Attachment" },
  excel: { id: "Unggah file Excel", en: "Upload Excel file" },
  excel_desc: {
    id: "Silakan pilih dan unggah file Excel yang memmuat data-data yang akan ditampilkan pada bagian Hasil Kalibrasi di Sertifikat Kalibrasi.",
    en: "Please select and upload an Excel file containing the data to be displayed in the Calibration Results section of the Calibration Certificate.",
  },
  sheet: { id: "Nama sheet", en: "Sheet name" },
  sheet_desc: {
    id: "Silakan pilih nama sheet dari file Excel yang diunggah",
    en: "Please select the sheet name of the uploaded Excel file.",
  },

  // Hasil
  judul: { id: "Judul tabel", en: "Table title" },
  bahasa: { id: "Bahasa:", en: "Language:" },
  kolom: { id: "Kolom", en: "Column" },
  kolom_desc: {
    id: "*tidak termasuk ketidakpastian",
    en: "*excluding uncertainty",
  },
  label: { id: "Label kolom", en: "Column label" },
  basic_measuredValue: {
    id: "Nilai yang merepresentasikan hasil pengukuran",
    en: "Quantity value representing a measurement result",
  },
  basic_nominalValue: {
    id: "Titik ukur atau nilai nominal",
    en: "Measurement point or nominal value",
  },
  basic_referenceValue: {
    id: "Nilai acuan yang digunakan untuk membandingkan dengan nilai-nilai lain dari jenis yang sama",
    en: "Value used as a basis for comparison with values of the same kind",
  },
  basic_measurementError_error: {
    id: "Nilai error pengukuran",
    en: "Measurement error value",
  },
  basic_measurementError_correction: {
    id: "Nilai koreksi pengukuran",
    en: "Measurement correction value",
  },
  subkolom: { id: "Jumlah sub-kolom", en: "Number of sub-columns" },
  ketidakpastian: {
    id: "Parameter Evaluasi Ketidakpastian",
    en: "Uncertainty Evaluation Parameters",
  },
  ketidakpastian_desc: {
    id: "Data ketidakpastian hanya akan tampil di XML, tidak di template Word atau PDF.",
    en: "These data will only appear in XML, not in Word or PDF templates.",
  },
  factor: { id: "Faktor cakupan", en: "Coverage Factor" },
  probability: { id: "Tingkat kepercayaan", en: "Coverage probability" },
  distribution: { id: "Distribusi", en: "Distribution" },
  segiempat: { id: "Segiempat", en: "Rectangular" },
  segitiga: { id: "Segitiga", en: "Triangular" },
  other_distribution: {
    id: "Masukkan distribusi lain",
    en: "Enter another distribution",
  },

  // === Statement ===
  statement: { id: "Pernyataan", en: "Statement" },
  refType: { id: "Kategori", en: "Category" },
  basic_conformity: {
    id: "Pernyataan kesesuaian untuk suatu hasil (memenuhi/tidak memenuhi atau sesuai/tidak sesuai)",
    en: "Statement of conformity for a result (meets/does not meet or conforms/does not conform)",
  },
  basic_metrologicallyTraceableToSI: {
    id: "Pernyataan mengenai apakah dan bagaimana hasil pengukuran ditelusurkan secara metrologis ke SI (Système International d'Unités/Sistem Internasional Satuan)",
    en: "Statement indicating whether, and how, the measurement results are metrologically traceable to the International System of Units (SI)",
  },
  basic_revision: {
    id: "Pernyataan/identifikasi perubahan dan, jika relevan, alasan dilakukannya revisi terhadap DCC",
    en: "Statement/identification of the changes and, where appropriate, reasons for the revision of a DCC",
  },
  basic_isInCMC: {
    id: "Catatan bahwa CMC yang ada mencakup seluruh atau sebagian dari hasil kalibrasi",
    en: "Note that existing CMCs cover all or some of the calibration results",
  },
  cb_rumus_statement: {
    id: "Pernyataan ini melibatkan ekspresi matematika atau rumus",
    en: "This statement includes mathematical notation or formula",
  },
  cb_gambar_statement: {
    id: "Pernyataan ini disertai gambar",
    en: "This statement is accompanied by an image",
  },

  // Comment
  comment: { id: "Catatan", en: "Comment" },
  title: { id: "Judul", en: "Title" },
  cb_file: {
    id: "Catatan ini menyertakan file dan/atau gambar",
    en: "This comment includes files and/or images",
  },
  upload_file: { id: "Unggah file", en: "Upload file" },

  preparing_data: {id: "Mempersiapkan data...", en: "Preparing data..."},
  processing_files: {id: "Memproses file...", en: "Processing files..."},
  generating_dcc: {id: "Menghasilkan DCC...", en: "Generating DCC..."},
  finalizing: {id: "Menyelesaikan PDF...", en: "Finalizing PDF..."},
  dcc_created_successfully: {
    id: "DCC berhasil dibuat! Silakan unduh.", en: "DCC created successfully! Please download.",
  },

  // Importer
  pdf_to_excel: { id: "Unggah file PDF", en: "Upload PDF file" },
  submit_convert: {id: "Kirim dan Konversi ke Excel", en: "Submit and Convert to Excel"},
  processing: {id: "Memproses...", en: "Processing..."},
  extract: {id: "Mengekstrak XML dari PDF...", en: "Extracting XML from PDF..."},
  converting: {id: "Mengonversi ke Excel...", en: "Converting to Excel..."},
  uploading: {id: "Mengunggah file", en: "Uploading file"},
  completed: {id: "selesai", en: "completed"},
  convert_success: {
    id: "Konversi berhasil! File siap untuk diunduh...",
    en: "Conversion successful! File is ready to be downloaded...",
  },

  download: { id: "Unduh", en: "Download" },

  // === D-SI ===

  // Prefix
  yocto: { id: "yokto", en: "yocto" },
  pico: { id: "piko", en: "pico" },
  micro: { id: "mikro", en: "micro" },
  milli: { id: "mili", en: "milli" },
  centi: { id: "senti", en: "centi" },
  deci: { id: "desi", en: "deci" },
  deca: { id: "deka", en: "deca" },
  hecto: { id: "hekto", en: "hecto" },
  exa: { id: "eksa", en: "exa" },
  exbi: { id: "eksbi", en: "exbi" },

  // Unit
  degreeCelsius: { id: "derajat Celsius", en: "degree Celsius" },
  percent: { id: "persen", en: "percent" },
  metre: { id: "meter", en: "metre" },
  second: { id: "detik", en: "second" },
  ampere: { id: "amper", en: "ampere" },
  mole: { id: "mol", en: "mole" },
  candela: { id: "kandela", en: "candela" },
  one: { id: "satu", en: "one" },
  day: { id: "hari", en: "day" },
  hour: { id: "jam", en: "hour" },
  minute: { id: "menit", en: "minute" },
  degree: { id: "derajat", en: "degree" },
  arcminute: { id: "menit busur", en: "arcminute" },
  arcsecond: { id: "detik busur", en: "arcsecond" },
  byte: { id: "bite", en: "byte" },
  hectare: { id: "hektar", en: "hectare" },
  litre: { id: "liter", en: "litre" },
  tonne: { id: "ton", en: "tonne" },
  electronvolt: { id: "elektronvolt", en: "electronvolt" },
  astronomicalUnit: { id: "satuan astronomi", en: "astronomical unit" },
  decibel: { id: "desibel", en: "decibel" },
  mmHg: { id: "milimeter air raksa", en: "millimetre of mercury" },
  nauticalmile: { id: "mil laut", en: "nauticalmile" },

  // About
  about: { id: "Tentang", en: "About" },
  about_us: { id: "Tentang Kami", en: "About Us" },
  about_content: {
    id: "Badan Standardisasi Nasional (BSN) merupakan lembaga nasional yang bertugas dalam bidang standardisasi di Indonesia, dengan tujuan meningkatkan kualitas dan keandalan produk serta jasa di seluruh negeri. Salah satu inisiatif utama BSN adalah pengembangan dan implementasi Sertifikat Kalibrasi Digital (<i>Digital Calibration Certificate</i>/DCC) sebagai solusi modern untuk proses sertifikasi kalibrasi. <br><br> Sertifikat Kalibrasi Digital (DCC) merupakan solusi digital canggih yang menggantikan sertifikat kalibrasi berbasis kertas dengan format elektronik yang aman, standar, dan mudah diakses. Inisiatif ini bertujuan untuk meningkatkan akurasi, keterlacakan, dan transparansi dalam pengelolaan data kalibrasi di berbagai sektor industri. <br><br> Misi kami adalah mendukung pelaku industri, laboratorium, dan regulator dengan menyediakan platform digital terpercaya yang menjamin kepatuhan terhadap standar internasional serta mempermudah pemenuhan persyaratan metrologi nasional. Melalui sistem DCC, BSN mendorong transformasi digital di bidang metrologi untuk meningkatkan efisiensi, mengurangi kesalahan, dan mendukung daya saing Indonesia di pasar global. <br><br> Di BSN, kami berkomitmen pada inovasi, jaminan kualitas, dan peningkatan berkelanjutan untuk membangun industri Indonesia yang lebih kuat, standar, dan berdaya saing secara digital.",
    en: "Badan Standardisasi Nasional (BSN) is the national standardization body of Indonesia, committed to enhancing the quality and reliability of products and services throughout the country. One of BSN’s key initiatives is the development and implementation of the Digital Calibration Certificate (DCC) system to modernize and streamline calibration certification processes. <br><br> The Digital Calibration Certificate (DCC) is an advanced digital solution designed to replace traditional paper-based calibration certificates with a secure, standardized, and easily accessible electronic format. This initiative aims to improve accuracy, traceability, and transparency in calibration data management across various industries. <br><br> Our mission is to support industry players, laboratories, and regulators by providing a reliable digital platform that ensures conformity to international standards and facilitates easier compliance with national metrology requirements. Through the DCC system, BSN promotes the adoption of digital transformation in metrology to increase efficiency, reduce errors, and support Indonesia’s competitiveness in the global market. <br><br> At BSN, we are dedicated to innovation, quality assurance, and continuous improvement to help build a stronger, standardized, and digitally empowered Indonesian industry.",
  },

  // Dashboard
  dasbor: { id: "Dasbor", en: "Dashboard" },
  access_denied: { id: "Akses Ditolak", en: "Access Denied" },
  DirectorProtectedRoute: { id: "Halaman ini hanya dapat diakses oleh Direktur.", en: "This page is only accessible to Directors." },
  back_to_main: { id: "Kembali ke Halaman Utama", en: "Back to Main Page" },
  dashboard: { id: "Dasbor Direktur", en: "Director Dashboard" },
  welcome_dashboard: { 
    id: "Selamat datang di dasbor direktur. Di sini Anda dapat melihat dan mengelola semua pengajuan DCC.", 
    en: "Welcome to the director dashboard. Here you can view and manage all DCC submissions." 
  },
  search: { id: "Cari", en: "Search" },
  columns: { id: "Kolom", en: "Columns" },
  certificate_id: { id: "ID Sertifikat", en: "Certificate ID" },
  submission_date: { id: "Tanggal Pengajuan", en: "Submission Date" },
  calibrated_object: { id: "Objek yang Dikalibrasi", en: "Calibrated Object" },
  submitted_by: { id: "Diajukan oleh", en: "Submitted by" },
  view: { id: "Lihat", en: "View" },
  approve: { id: "Setujui", en: "Approve" },
  reject: { id: "Tolak", en: "Reject" },
  pending: { id: "Menunggu", en: "Pending" },
  approved: { id: "Disetujui", en: "Approved" },
  rejected: { id: "Ditolak", en: "Rejected" },

  // animate-spin
  authentication: { id: "Memeriksa autentikasi", en: "Checking authentication"},
  verify_director: { id: "Memverifikasi akses direktur", en: "Verifying director access" },
  verify_session: { id: "Memverifikasi sesi", en: "Verifying session" },
};

export const getTranslation = (key: string, language: Language = "en") => {
  const translation = translations[key];
  return translation ? translation[language] : key; // Fallback to key if translation is missing
};

// {t('')}
// placeholder={`${t('bahasa')}`}