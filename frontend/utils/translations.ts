type Language = "id" | "en";

const translations: Record<string, { id: string; en: string }> = {
  // Navbar
  home: { id: "Beranda", en: "Home" },

  // ProtectedRoute
  permission: { id: "Anda tidak memiliki izin untuk mengakses halaman ini.", en: "You do not have permission to access this page." },
  back_to_login: { id: "Kembali ke Login", en: "Back to Login" },

  // Login
  welcome_back: { id: "Selamat datang kembali!", en: "Welcome back!" },
  log_in: { id: "Masuk ke akun Anda", en: "Log in to your account" },
  email: { id: "Surel", en: "E-mail" },
  invalid_email: { id: "Alamat surel tidak valid", en: "Invalid email address" },
  password: { id: "Kata sandi", en: "Password" },
  password_required: { id: "Kata sandi wajib diisi", en: "Password is required" },
  login: { id: "Masuk", en: "Login" },
  login_fail: { id: "Gagal masuk, silakan periksa kredensial Anda.", 
                en: "Login failed, please check your credentials." },
  invalid_credentials: { id: "Surel atau kata sandi tidak valid", en: "Invalid email or password" },
  to_register: { id: "Belum punya akun?", en: "Don't have an account?" },

  // Register
  welcome: { id: "Selamat datang!", en: "Welcome!" },
  register_account: { id: "Daftar akun baru", en: "Register a new account" },
  name_required: { id: "Nama wajib diisi", en: "Name is required" },
  register: { id: "Daftar", en: "Register" },
  registering: { id: "Mendaftar...", en: "Registering..." },
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

  // Generator
  pilih_lab: { id: "Pilih laboratorium", en: "Select a laboratory" },
  listrik: { id: "Kelistrikan", en: "Electrical" },
  waktu: { id: "Waktu & Frekuensi", en: "Time & Frequency" },
  fotometri_radiometri: { id: "Fotometri & Radiometri", en: "Photometry & Radiometry" },
  kimia: { id: "Kimia", en: "Chemistry" },
  panjang: { id: "Panjang", en: "Length" },
  massa: { id: "Massa", en: "Mass" },
  akustik_vibrasi: { id: "Akustik & Vibrasi", en: "Acoustics & Vibration" },
  radiasi: { id: "Radiasi Pengion", en: "Ionizing Radiation" },
  biologi: { id: "Biologi", en: "Biology" },

  // Stepper
  administrasi: { id: "Administrasi", en: "Administration" },
  hasil: { id: "Hasil Kalibrasi", en: " Calibration Results" },
  statements: { id: "Pernyataan", en: "Statements" },
  preview: { id: "Pratinjau", en: "Preview" },

  template: { id: "Pilih template...", en: "Select template..." },
  using: { id: "menggunakan", en: "using" },
  blank: { id: "Kosong", en: "Blank" },

  asterisk: {
    id: "Menandakan pertanyaan wajib",
    en: "Indicates required question",
  },
  
  submit: { id: "Kirim", en: "Submit" },

  pilih_bahasa: {id: "Tolong pilih bahasa yang digunakan.", en: "Please select the used languages."},
  input_required: {id: "Input dibutuhkan.", en: "Input required."},

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
  used: { id: "Bahasa yang digunakan", en: "Used language" },
  cari_bahasa: { id: "Cari bahasa...", en: "Search language..." },
  mandatory: { id: "Bahasa yang diwajibkan", en: "Mandatory language" },
  order: { id: "Nomor order", en: "Order number" },
  penerbit_order: { id: "Penerbit nomor order", en: "Order number issuer" },
  sertifikat: { id: "Nomor sertifikat", en: "Certificate number" },

  laboratory: { id: "laboratorium", en: "laboratory" },
  customer: { id: "pelanggan", en: "customer" },
  laboratoryBranch: { id: "cabang laboratorium", en: "laboratoryBranch" },
  customerBranch: { id: "cabang pelanggan", en: "customerBranch" },
  other: { id: "lainnya", en: "other" },

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

  manufacturer: { id: "pabrikan", en: "manufacturer" },
  calibrationLaboratory: { id: "laboratorium kalibrasi", en: "calibrationLaboratory" },
  owner: { id: "pemilik", en: "owner" },

  // Penanggung Jawab
  responsible: { id: "Penanggung Jawab", en: "Responsible Person" },
  pelaksana: { id: "Pelaksana Kalibrasi", en: "Calibration Officer" },
  nip: { id: "NIP", en: "Employee ID number" },
  penyelia: { id: "Penyelia Kalibrasi", en: "Calibration Supervisor" },
  kepala: { id: "Kepala Laboratorium", en: "Laboratory Head" },
  lab: { id: "Laboratorium", en: "Laboratory" },
  direktur: { id: "Direktur", en: "Director" },
  snsu: { id: "SNSU", en: "National Measurement Standards for" },
  jabatan: { id: "Jabatan", en: "Position" },
  snsu_tk: { id: "Direktur SNSU Termoelektrik dan Kimia", en: "Director of National Measurement Standards for Thermoelectricity and Chemistry" },
  snsu_mrb: { id: "Direktur SNSU Mekanika, Radiasi, dan Biologi", en: "Director of National Measurement Standards for Mechanics, Radiation, and Biology" },

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
  negara: { id: "Negara", en: "Country" },

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
  greek: { id: "Simbol", en: "Symbols" },
  arrow: { id: "Panah", en: "Arrows" },
  mathml: { id: "Sinkronisasi ke MathML", en: "Sync to MathML" },
  latex: { id: "Sinkronisasi ke LaTeX", en: "Sync to LaTeX" },
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
    id: "Data ketidakpastian hanya akan tampil di XML, tidak di PDF.",
    en: "These data will only appear in XML, not in PDF.",
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
  
  // Preview
  refresh: { id: "Segarkan", en: "Refresh" },
  generate: { id: "Menghasilkan pratinjau", en: "Generating preview" },
  failed: { id: "Gagal memuat pratinjau PDF", en: "Failed to load PDF preview" },
  might: { 
    id: "File PDF mungkin masih dibuat atau terjadi kesalahan saat memuatnya.", 
    en: "The PDF file might still be generating or there was an error loading it." 
  },
  try: { id: "Silakan coba lagi", en: "Please try again" },
  tab: { id: "Lihat di Tab Baru", en: "View in New Tab" },
  appear: { id: "Pratinjau PDF akan muncul di sini", en: "PDF preview will appear here" },
  changes: { 
    id: "Lakukan perubahan pada formulir untuk menghasilkan pratinjau", 
    en: "Make changes to the form to generate preview" 
  },
  available: { id: "Tidak ada pratinjau XML yang tersedia", en: "No XML preview available" },
  loading: { id: "Memuat XML", en: "Loading XML" },
  xml_error: { id: "Gagal memuat XML", en: "Failed to load XML" },
  after: { id: "XML akan muncul di sini setelah pembuatan.", en: "XML will appear here after generation." },

  // Progress Bar
  preparing: {id: "Mempersiapkan data...", en: "Preparing data..."},
  please_wait: {id: "Mohon tunggu...", en: "Please wait..."},
  dcc_created_successfully: {
    id: "DCC berhasil dibuat! Silakan unduh.", en: "DCC created successfully! Please download.",
  },

  // Importer
  pdf_to_excel: { id: "Unggah File PDF", en: "Upload PDF File" },
  xml_to_excel: { id: "Unggah File XML", en: "Upload XML File" },
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
    id: "Digital Calibration Certificate App (DiCCA) adalah aplikasi resmi yang dikembangkan oleh Badan Standardisasi Nasional (BSN) sebagai bagian dari upaya transformasi digital di bidang metrologi. DiCCA hadir untuk menggantikan sertifikat kalibrasi berbasis kertas dengan Sertifikat Kalibrasi Digital (Digital Calibration Certificate/DCC) yang aman, terstandar, dan mudah diakses.<br><br>Melalui DiCCA, proses pengelolaan data kalibrasi menjadi lebih efisien, transparan, dan dapat ditelusuri sesuai dengan standar internasional. Aplikasi ini tidak hanya mempermudah laboratorium dan pelaku industri dalam penerbitan serta verifikasi sertifikat, tetapi juga mendukung regulator dalam memastikan keakuratan dan keterlacakan hasil kalibrasi.<br><br>Misi kami adalah menghadirkan solusi digital yang meningkatkan keandalan, akurasi, dan integritas dalam sertifikasi kalibrasi, sekaligus mendorong Indonesia menuju sistem metrologi yang modern dan berdaya saing global.<br><br>Dengan DiCCA, BSN berkomitmen untuk terus berinovasi dalam memberikan layanan berbasis digital yang mendukung pembangunan industri nasional yang lebih kuat, standar, dan terpercaya.",
    en: "The Digital Calibration Certificate App (DiCCA) is an official application developed by the National Standardization Agency of Indonesia (BSN) as part of the digital transformation in metrology. DiCCA replaces traditional paper-based calibration certificates with a Digital Calibration Certificate (DCC) that is secure, standardized, and easily accessible.<br><br>With DiCCA, calibration data management becomes more efficient, transparent, and traceable in accordance with international standards. The application not only facilitates laboratories and industries in issuing and verifying certificates but also supports regulators in ensuring the accuracy and traceability of calibration results.<br><br>Our mission is to provide a digital solution that enhances reliability, accuracy, and integrity in calibration certification, while driving Indonesia toward a modern and globally competitive metrology system.<br><br>Through DiCCA, BSN is committed to continuous innovation in delivering digital-based services that strengthen Indonesia’s industry with greater trust, standardization, and competitiveness.",
  },

  // Dashboard
  dasbor: { id: "Dasbor", en: "Dashboard" },
  access_denied: { id: "Akses Ditolak", en: "Access Denied" },
  DirectorProtectedRoute: { id: "Halaman ini hanya dapat diakses oleh Direktur.", en: "This page is only accessible to Directors." },
  back_to_home: { id: "Kembali ke Beranda", en: "Back to Home" },
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

  // Errors
  at_least_one: { id: "Setidaknya satu ", en: "At least one " },
  required: { id: " wajib diisi", en: " is required" },
  must_be_filled_for_language: { id: " harus diisi untuk bahasa ", en: " must be filled for language " },
  
  software_name: { id: "Nama perangkat lunak", en: "Software name" },
  software_version: { id: "Versi perangkat lunak", en: "Software version" },
  
  nama_kepala: { id: "Nama kepala lab", en: "Lab head's name" },
  nip_kepala: { id: "NIP kepala lab", en: "Lab head's employee ID number" },
  lab_kepala: { id: "Laboratorium dari kepala lab", en: "Lab head's laboratory" },
  nama_direktur: { id: "Nama direktur", en: "Director's name" },
  nip_direktur: { id: "NIP direktur", en: "Director's employee ID number" },
  jabatan_direktur: { id: "Jabatan direktur", en: "Director's position" },

  nama_cust: { id: "Nama pemilik", en: "Owner's name" },
  jalan_cust: { id: "Jalan pemilik", en: "Owner's street" },
  no_jalan_cust: { id: "Nomor jalan pemilik", en: "Owner's street number" },
  kota_cust: { id: "Kota pemilik", en: "Owner's city" },
  state_cust: { id: "Provinsi pemilik", en: "Owner's province" },
  pos_cust: { id: "Kode pos pemilik", en: "Owner's postal code" },
  negara_cust: { id: "Negara pemilik", en: "Owner's country" },

  tengah_unit: { id: "Satuan nilai tengah", en: "Central value unit" },
  rentang_unit: { id: "Satuan simpangan", en: "Deviation unit" },

  excel_file: { id: "File Excel", en: "Excel file" },
  kolom_name: { id: "Nama kolom", en: "Column name" },

  statement_text: { id: "Teks pernyataan", en: "Statement text" },

  comment_title: { id: "Judul catatan", en: "Comment title" },
  comment_desc: { id: "Deskripsi catatan", en: "Comment description" },
};

export const getTranslation = (key: string, language: Language = "en") => {
  const translation = translations[key];
  return translation ? translation[language] : key; // Fallback to key if translation is missing
};

// {t('')}
// placeholder={`${t('bahasa')}`}