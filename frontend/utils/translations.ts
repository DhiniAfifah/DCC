type Language = 'id' | 'en';

const translations: Record<string, { id: string; en: string }> = {
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
  sheet_desc: { id: 'Silakan pilih nama sheet dari file Excel yang diunggah.', en: 'Please select the sheet name from the uploaded Excel file.' },

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
};

export const getTranslation = (key: string, language: Language = 'en') => {
  const translation = translations[key];
  return translation ? translation[language] : key; // Fallback to key if translation is missing
};

// {t('')}
// placeholder={`${t('bahasa')}`}