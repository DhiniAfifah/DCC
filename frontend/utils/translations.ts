type Language = 'id' | 'en';

const translations: Record<string, { id: string; en: string }> = {
  // Login
  login: { id: 'Masuk ke akun Anda', en: 'Log in to your account' },
  email: { id: 'Surel', en: 'E-mail' },
  password: { id: 'Kata sandi', en: 'Password' },
  log_in: { id: 'Masuk', en: 'Log in' },

  logout: { id: 'Keluar', en: 'Log out' },
  
  // Menu
  generator: { id: 'Mulai membuat <i>Digital Calibration Certificate</i> (DCC) baru. Klik di sini.', 
                en: 'Start creating a new Digital Calibration Certificate (DCC). Click here.' },
  importer: { id: 'Akses <i>Digital Calibration Certificate</i> (DCC) Anda dan ekspor datanya ke Ms. Excel. Klik di sini.',
                en: 'Access your Digital Calibration Certificate (DCC) and export the data to Excel. Click here.' },

  // Stepper
  administrasi: {id: 'Administrasi', en: 'Administration'},
  hasil: { id: 'Hasil Kalibrasi', en: ' Calibration Results' },
  statements: { id: 'Pernyataan', en: 'Statements' },
  preview: { id: 'Pratinjau', en: 'Preview' },

  asterisk: { id: 'Menandakan pertanyaan wajib', en: 'Indicates required question' },
  submit: { id: 'Kirim', en: 'Submit' },

  // === Administrative ===
  // Software
  software: { id: 'Perangkat Lunak', en: 'Software' },
  nama: { id: 'Nama', en: 'Name' },
  versi: { id: 'Versi', en: 'Version' },

  // Data Administrasi
  data: {id: 'Data Administrasi', en: 'Administrative Data'},
  negara_calib: { id: 'Negara tempat kalibrasi', en: 'Country of calibration' },
  cari_negara: { id: 'Cari negara...', en: 'Search country...' },
  tempat: { id: 'Tempat kalibrasi', en: 'Calibration place' },
  other: { id: 'lainnya', en: 'other' },
  used: { id: 'Bahasa yang digunakan', en: 'Used language' },
  cari_bahasa: { id: 'Cari bahasa...', en: 'Search language...' },
  mandatory: { id: 'Bahasa yang diwajibkan', en: 'Mandatory language' },
  order: { id: 'Nomor order', en: 'Order number' },
  penerbit_order: { id: 'Penerbit nomor order', en: 'Order number issuer' },
  sertifikat: { id: 'Nomor sertifikat', en: 'Certificate number' },

  // Linimasa
  linimasa: { id: 'Linimasa Pengukuran', en: 'Measurement Timeline' },
  mulai: { id: 'Tanggal mulai pengukuran', en: 'Measurement start date' },
  akhir: { id: 'Tanggal akhir pengukuran', en: 'Measurement end date' },
  pengesahan: { id: 'Tanggal pengesahan', en: 'Issue date' },

  // Objek
  object_desc: { id: 'Deskripsi Objek yang Dikalibrasi/Diukur', en: 'Description of Calibrated/Measured Object' },
  objek: { id: 'Objek', en: 'Object' },
  jenis: { id: 'Jenis alat atau objek', en: 'Type of instrument or object' },
  merek: { id: 'Merek/pembuat', en: 'Brand/manufacturer' },
  tipe: { id: 'Tipe', en: 'Type' },
  identifikasi: { id: 'Identifikasi alat', en: 'Instrument identification' },
  penerbit_seri: { id: 'Penerbit nomor seri', en: 'Serial number issuer' },
  seri: { id: 'Nomor seri', en: 'Serial number' },
  id_lain: { id: 'Identifikasi lain', en: 'Other identification' },

  // Penanggung Jawab
  responsible: { id: 'Penanggung Jawab', en: 'Responsible Person' },
  pelaksana: { id: 'Pelaksana Kalibrasi', en: 'Calibration Officer' },
  nip: { id: 'NIP', en: 'Employee ID number' },
  penyelia: { id: 'Penyelia Kalibrasi', en: 'Calibration Supervisor' },
  kepala: { id: 'Kepala Laboratorium', en: 'Laboratory Head' },
  lab: { id: 'Laboratorium', en: 'Laboratory' },
  direktur: { id: 'Direktur', en: 'Director' },
  jabatan: { id: 'Jabatan', en: 'Position' },

  // Pemilik
  identitas: { id: 'Identitas Pemilik Objek yang Dikalibrasi/Diukur', en: 'Owner Identification of the Calibrated/Measured Objects' },
  alamat: { id: 'Alamat', en: 'Address' },
  jalan: { id: 'Jalan', en: 'Street' },
  no_jalan: { id: 'Nomor', en: 'Number' },
  kota: { id: 'Kecamatan/kabupaten/kota', en: 'Subdistrict/regency/city' },
  provinsi: { id: 'Provinsi', en: 'Province' },
  pos: { id: 'Kode pos', en: 'Postal code' },
  negara_cust: { id: 'Negara', en: 'Country' },

  // === Measurement ===
  // Metode
  metode: { id: 'Metode', en: 'Method' },
  norm: { id: 'Norma', en: 'Norm' },
  deskripsi: { id: 'Deskripsi', en: 'Description' },
  cb_rumus_metode: { id: 'Metode ini melibatkan ekspresi matematika atau rumus', 
                      en: 'This method includes mathematical notation or formula' },
  rumus: { id: 'Rumus', en: 'Formula' },
  editor: { id: 'Buka editor', en: 'Open editor' },
  cb_gambar_metode: { id: 'Metode ini disertai gambar', en: 'This method is accompanied by an image' },
  gambar: { id: 'Gambar', en: 'Image' },
  upload_gambar: { id: 'Unggah file gambar', en: 'Upload figure file' },
  caption: { id: 'Keterangan gambar', en: 'Figure caption' },

  // Alat Pengukuran
  pengukuran: { id: 'Standar atau Alat Pengukuran', 
                en: 'Standards or Measuring Equipments' },
  alat: { id: 'Alat', en: 'Equipment' },
  model: { id: 'Merek dan model', en: 'Manufacturer and type' },

  // Kondisi
  kondisi: { id: 'Kondisi Lingkungan', en: 'Environmental Condition' },
  lingkungan: { id: 'Parameter lingkungan', en: 'Environmental parameter' },
  suhu: { id: 'Suhu', en: 'Temperature' },
  lembap: { id: 'Kelembapan', en: 'Humidity' },
  other_condition: { id: 'Masukkan kondisi lain', en: 'Enter another condition' },
  tengah: { id: 'Titik tengah', en: 'Median' },
  nilai: { id: 'Nilai', en: 'Value' },
  prefix: { id: 'Awalan', en: 'Prefix' },
  satuan: { id: 'Satuan', en: 'Unit' },
  eksponen: { id: 'Pangkat', en: 'Exponent' },
  rentang: { id: 'Rentang', en: 'Range' },

  // Excel
  lampiran: { id: 'Lampiran', en: 'Attachment' },
  excel: { id: 'Unggah file Excel', en: 'Upload Excel file' },
  excel_desc: { 
    id: 'Silakan pilih dan unggah file Excel yang memmuat data-data yang akan ditampilkan pada bagian Hasil Kalibrasi di Sertifikat Kalibrasi.',
    en: 'Please select and upload an Excel file containing the data to be displayed in the Calibration Results section of the Calibration Certificate.'
  },
  sheet: { id: 'Nama sheet', en: 'Sheet name' },
  sheet_desc: { id: 'Silakan pilih nama sheet dari file Excel yang diunggah', en: 'Please select the sheet name of the uploaded Excel file.' },

  // Hasil
  judul: { id: 'Judul tabel', en: 'Table title' },
  bahasa: { id: 'Bahasa:', en: 'Language:' },
  kolom: { id: 'Kolom', en: 'Column' },
  label: { id: 'Label kolom', en: 'Column label' },
  kolom_desc: { id: '*tidak termasuk ketidakpastian', en: '*excluding uncertainty' },
  subkolom: { id: 'Jumlah sub-kolom', en: 'Number of sub-columns' },
  ketidakpastian: { id: 'Parameter Evaluasi Ketidakpastian', en: 'Uncertainty Evaluation Parameters' },  
  ketidakpastian_desc: { id: 'Data ketidakpastian hanya akan tampil di XML, tidak di template Word atau PDF.', 
                          en: 'These data will only appear in XML, not in Word or PDF templates.' },
  factor: { id: 'Faktor cakupan', en: 'Coverage Factor' },
  probability: { id: 'Tingkat kepercayaan', en: 'Coverage probability' },
  distribution: { id: 'Distribusi', en: 'Distribution' },
  segiempat: { id: 'Segiempat', en: 'Rectangular' },
  segitiga: { id: 'Segitiga', en: 'Triangular' },
  other_distribution: { id: 'Masukkan distribusi lain', en: 'Enter another distribution' },

  // === Statement ===
  statement: { id: 'Pernyataan', en: 'Statement' },
  cb_rumus_statement: { id: 'Pernyataan ini melibatkan ekspresi matematika atau rumus', 
                        en: 'This statement includes mathematical notation or formula' },
  cb_gambar_statement: { id: 'Pernyataan ini disertai gambar', en: 'This statement is accompanied by an image' },
  
  // Importer
  pdf: { id: 'Unggah file PDF', en: 'Upload PDF file' },

  // === D-SI ===

  // Prefix
  yocto: { id: 'yokto', en: 'yocto' },
  pico: { id: 'piko', en: 'pico' },
  micro: { id: 'mikro', en: 'micro' },
  milli: { id: 'mili', en: 'milli' },
  centi: { id: 'senti', en: 'centi' },
  deci: { id: 'desi', en: 'deci' },
  deca: { id: 'deka', en: 'deca' },
  hecto: { id: 'hekto', en: 'hecto' },
  exa: { id: 'eksa', en: 'exa' },
  exbi: { id: 'eksbi', en: 'exbi' },

  // Unit
  degreeCelsius: { id: 'derajat Celsius', en: 'degree Celsius' },
  percent: { id: 'persen', en: 'percent' },
  metre: { id: 'meter', en: 'metre' },
  second: { id: 'detik', en: 'second' },
  ampere: { id: 'amper', en: 'ampere' },
  mole: { id: 'mol', en: 'mole' },
  candela: { id: 'kandela', en: 'candela' },
  one: { id: 'satu', en: 'one' },
  day: { id: 'hari', en: 'day' },
  hour: { id: 'jam', en: 'hour' },
  minute: { id: 'menit', en: 'minute' },
  degree: { id: 'derajat', en: 'degree' },
  arcminute: { id: 'menit busur', en: 'arcminute' },
  arcsecond: { id: 'detik busur', en: 'arcsecond' },
  byte: { id: 'bite', en: 'byte' },
  hectare: { id: 'hektar', en: 'hectare' },
  litre: { id: 'liter', en: 'litre' },
  tonne: { id: 'ton', en: 'tonne' },
  electronvolt: { id: 'elektronvolt', en: 'electronvolt' },
  astronomicalUnit: { id: 'satuan astronomi', en: 'astronomical unit' },
  decibel: { id: 'desibel', en: 'decibel' },
  mmHg: { id: 'milimeter air raksa', en: 'millimetre of mercury' },
  nauticalmile: { id: 'mil laut', en: 'nauticalmile' },

  // About
  about: { id: 'Tentang', en: 'About' },
  about_us: { id: 'Tentang Kami', en: 'About Us' },
  about_content: { 
    id: 'Badan Standardisasi Nasional (BSN) merupakan lembaga nasional yang bertugas dalam bidang standardisasi di Indonesia, dengan tujuan meningkatkan kualitas dan keandalan produk serta jasa di seluruh negeri. Salah satu inisiatif utama BSN adalah pengembangan dan implementasi Sertifikat Kalibrasi Digital (<i>Digital Calibration Certificate</i>/DCC) sebagai solusi modern untuk proses sertifikasi kalibrasi. <br><br> Sertifikat Kalibrasi Digital (DCC) merupakan solusi digital canggih yang menggantikan sertifikat kalibrasi berbasis kertas dengan format elektronik yang aman, standar, dan mudah diakses. Inisiatif ini bertujuan untuk meningkatkan akurasi, keterlacakan, dan transparansi dalam pengelolaan data kalibrasi di berbagai sektor industri. <br><br> Misi kami adalah mendukung pelaku industri, laboratorium, dan regulator dengan menyediakan platform digital terpercaya yang menjamin kepatuhan terhadap standar internasional serta mempermudah pemenuhan persyaratan metrologi nasional. Melalui sistem DCC, BSN mendorong transformasi digital di bidang metrologi untuk meningkatkan efisiensi, mengurangi kesalahan, dan mendukung daya saing Indonesia di pasar global. <br><br> Di BSN, kami berkomitmen pada inovasi, jaminan kualitas, dan peningkatan berkelanjutan untuk membangun industri Indonesia yang lebih kuat, standar, dan berdaya saing secara digital.', 
    en: 'Badan Standardisasi Nasional (BSN) is the national standardization body of Indonesia, committed to enhancing the quality and reliability of products and services throughout the country. One of BSN’s key initiatives is the development and implementation of the Digital Calibration Certificate (DCC) system to modernize and streamline calibration certification processes. <br><br> The Digital Calibration Certificate (DCC) is an advanced digital solution designed to replace traditional paper-based calibration certificates with a secure, standardized, and easily accessible electronic format. This initiative aims to improve accuracy, traceability, and transparency in calibration data management across various industries. <br><br> Our mission is to support industry players, laboratories, and regulators by providing a reliable digital platform that ensures conformity to international standards and facilitates easier compliance with national metrology requirements. Through the DCC system, BSN promotes the adoption of digital transformation in metrology to increase efficiency, reduce errors, and support Indonesia’s competitiveness in the global market. <br><br> At BSN, we are dedicated to innovation, quality assurance, and continuous improvement to help build a stronger, standardized, and digitally empowered Indonesian industry.' 
  },
};

export const getTranslation = (key: string, language: Language = 'en') => {
  const translation = translations[key];
  return translation ? translation[language] : key; // Fallback to key if translation is missing
};

// {t('')}
// placeholder={`${t('bahasa')}`}