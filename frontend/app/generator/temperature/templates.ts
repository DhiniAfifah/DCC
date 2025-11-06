export const blankTemplate = {
  software: "",
  version: "",
  Measurement_TimeLine: {
    tgl_mulai: "",
    tgl_akhir: "",
    tgl_pengesahan: "",
  },
  administrative_data: {
    core_issuer: "calibrationLaboratory",
    country_code: "",
    used_languages: [{ value: "" }],
    mandatory_languages: [{ value: "" }],
    sertifikat: "",
    order: "",
    tempat: "",
    tempat_pdf: "",
  },
  objects: [
    {
      jenis: {},
      merek: "",
      tipe: "",
      item_issuer: "",
      seri_item: "",
      id_lain: {},
    },
  ],
  responsible_persons: {
    pelaksana: [
      {
        nama_resp: "",
        nip: "",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    penyelia: [
      {
        nama_resp: "",
        nip: "",
        peran: "Penyelia Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    kepala: {
      nama_resp: "",
      nip: "",
      peran: "",
      main_signer: "0",
      signature: "0",
      timestamp: "0",
    },
    direktur: {
      nama_resp: "",
      nip: "",
      peran: "",
      main_signer: "1",
      signature: "1",
      timestamp: "1",
    },
  },
  owner: {
    nama_cust: "",
    jalan_cust: "",
    no_jalan_cust: "",
    kota_cust: "",
    state_cust: "",
    pos_cust: "",
    negara_cust: "",
  },
  methods: [
    {
      method_name: {},
      method_desc: {},
      norm: "",
      refType: "",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
  ],
  equipments: [
    {
      nama_alat: {},
      manuf_model: {},
      model: {},
      seri_measuring: "",
      refType: "",
    },
  ],
  conditions: [
    {
      jenis_kondisi: "",
      desc: {},
      tengah: "",
      rentang: "",
      rentang_unit: {
        prefix: "", //
        prefix_pdf: "",
        unit: "", //xml only
        unit_pdf: "", //
        eksponen: "",
        eksponen_pdf: "",
      },
      tengah_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "",
        unit_pdf: "",
        eksponen: "",
        eksponen_pdf: "",
      },
    },
  ],
  sheet_names: [],
  sheet_name: "",
  excel: "",
  results: [
    {
      parameters: {},
      columns: [
        {
          kolom: {},
          refType: "",
          real_list: "1",
          column_unit: {
            prefix: "",
            unit: "",
            eksponen: "",
          },
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "",
        real_list: "1",
        uncertainty_unit: {
          prefix: "",
          unit: "",
          eksponen: "",
        },
      },
    },
  ],
  statements: [
    {
      values: {},
      refType: "",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
  ],
  comment: {
    title: "",
    desc: {},
    has_file: false,
    files: [
      {
        file: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
    ],
  },
}

export const pt25Template = {
  software: "DiCCA",
  version: "0.1",
  Measurement_TimeLine: {
    tgl_mulai: "",
    tgl_akhir: "",
    tgl_pengesahan: "",
  },
  administrative_data: {
    core_issuer: "calibrationLaboratory",
    country_code: "ID",
    used_languages: [{ value: "id" }, { value: "en" }],
    mandatory_languages: [{ value: "id" }],
    sertifikat: "",
    order: "",
    tempat: "laboratory",
    tempat_pdf: "Laboratorium SNSU-BSN",
  },
  objects: [
    { // 1
      jenis: {id: "SPRT Pt-25", en: "SPRT Pt-25"},
      merek: "Fluke",
      tipe: "5681",
      item_issuer: "manufacturer",
      seri_item: "-",
      id_lain: {id: "-", en: "-"},
    },
  ],
  responsible_persons: {
    pelaksana: [
      // { // 1
      //   nama_resp: "Dwi Larassati, S.T.",
      //   nip: "",
      //   peran: "Pelaksana Kalibrasi",
      //   main_signer: "0",
      //   signature: "0",
      //   timestamp: "0",
      // },
      { // 2
        nama_resp: "Kelvin Sapta Dewantara, S.Si.",
        nip: "199709242022031003",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    penyelia: [
      { // 1
        nama_resp: "Dr. Aditya Achmadi, S.Si., M.T.",
        nip: "198109032005021002",
        peran: "Penyelia Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    kepala: {
      nama_resp: "Dr. Aditya Achmadi, S.Si., M.T.",
      nip: "198109032005021002",
      peran: "Kepala Laboratorium SNSU Suhu",
      main_signer: "0",
      signature: "0",
      timestamp: "0",
    },
    direktur: {
      nama_resp: "Dr. Ghufron Zaid",
      nip: "197111041990121001",
      peran: "Direktur SNSU Termoelektrik dan Kimia",
      main_signer: "1",
      signature: "1",
      timestamp: "1",
    },
  },
  owner: {
    nama_cust: "",
    jalan_cust: "",
    no_jalan_cust: "",
    kota_cust: "",
    state_cust: "",
    pos_cust: "",
    negara_cust: "",
  },
  methods: [
    { // 1
      method_name: {id: "Metode Titik Tetap", en: "Fixed Point Method"},
      method_desc: {
        id: "Termometer Tahanan Platina Semi Standar (TTPS) Pt-100 dengan spesifikasi di atas dikalibrasi " + 
            "dengan metode titik tetap berdasarkan skala suhu internasional tahun 1990 (ITS-90) " + 
            "pada sub-rentang W_5 (-38,8344 °C — 29,7646 °C) dan sub-rentang W_7 (0.01 °C — 660.323 °C).",
        en: "The Semi Standard Platinum Resistance Thermometer (SPRT) Pt-100 with above specifications is calibrated " + 
            "by fixed point method in accordance with the International Temperature Scale of 1990 (ITS-90) " + 
            "in the sub-range W_5 (-38,8344 °C — 29,7646 °C) and in the sub-range W_7 (0.01 °C — 660.323 °C).",
      },
      norm: "ITS-90",
      refType: "basic_calibrationMethod",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 2
      method_name: {id: "Persamaan untuk Konversi Suhu", en: "Equations for Temperature Conversion"},
      method_desc: {
        id: "Konversi suhu dalam derajat celcius (t_90/°C) dapat diperolah dengan persamaan ITS-90 sebagai berikut.",
        en: "The temperature conversion in unit of degree celcius (t_90/°C) can be obtained using the following ITS-90 equations.",
      },
      norm: "ITS-90",
      refType: "basic_calibrationMethod",
      has_formula: true,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 3
      method_name: {id: "Koefisien D dan B", en: "D and B Coefficients"},
      method_desc: {
        id: "Koefisien-koefisien D_i dan B_i diperoleh dari dokumen ITS-90 sebagai berikut: " +
            "D_0 = 439,932 854 ; D_1 = 472,418 020 ; D_2 = 37,684 494 ; D_3 = 7,472 018 ; D_4 = 2,920 828 ; " +
            "D_5 = 0,005 184 ; D_6 = -0,963 864 ; D_7 = -0,188 732 ; D_8 = 0,191 203 ; D_9 = 0,049 025 ; B_0 = 0,183 324 722 ; " +
            "B_1 = 0,240 975 303 ; B_2 = 0,209 108 771 ; B_3 = 0,190 439 972 ; B_4 = 0,142 648 498 ; B_5 = 0,077 993 465 ; " +
            "B_6 = 0,012 475 611 ; B_7 = -0,032 267 127 ; B_8 = -0,075 291 522 ; B_9 = -0,056 470 670 ; B_10 = 0,076 201 285 ; " +
            "B_11 = 0,123 893 204 ; B_12 = -0,029 201 193 ; B_13 = -0,091 173 542 ; B_14 = 0,001 317 696 ; B_15 = 0,026 025 526", 
        en: "The coefficients D_i and B_i can be obtained from the ITS-90 official document as follows: " +
            "D_0 = 439,932 854 ; D_1 = 472,418 020 ; D_2 = 37,684 494 ; D_3 = 7,472 018 ; D_4 = 2,920 828 ; " +
            "D_5 = 0,005 184 ; D_6 = -0,963 864 ; D_7 = -0,188 732 ; D_8 = 0,191 203 ; D_9 = 0,049 025 ; B_0 = 0,183 324 722 ; " +
            "B_1 = 0,240 975 303 ; B_2 = 0,209 108 771 ; B_3 = 0,190 439 972 ; B_4 = 0,142 648 498 ; B_5 = 0,077 993 465 ; " +
            "B_6 = 0,012 475 611 ; B_7 = -0,032 267 127 ; B_8 = -0,075 291 522 ; B_9 = -0,056 470 670 ; B_10 = 0,076 201 285 ; " +
            "B_11 = 0,123 893 204 ; B_12 = -0,029 201 193 ; B_13 = -0,091 173 542 ; B_14 = 0,001 317 696 ; B_15 = 0,026 025 526"
      },
      norm: "ITS-90",
      refType: "basic_calibrationMethod",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 4
      method_name: {id: "Persamaan W_r", en: "W_r Equation"},
      method_desc: {
        id: "W_r(t_90) dapat diperoleh dari persamaan berikut: ",
        en: "W_r(t_90) can be obtained using the following equations: ",
      },
      norm: "-",
      refType: "basic_calibrationMethod",
      has_formula: true,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 5
      method_name: {id: "Persamaan W", en: "W Equation"},
      method_desc: {
        id: "W(t_90) dapat diperoleh dari persamaan berikut, di mana " + 
            "R(t_90) adalah tahanan SSPRT pada suhu t dalam satuan Ω dan " + 
            "R(t_TPW) adalah tahanan SSPRT pada titik tripel air (0,01 °C) dalam satuan Ω.",
        en: "W(t_90) can be obtained using the following equations, where " + 
            "R(t_90) is the SPRT resistance at a temperature t in unit Ω and " +
            "R(t_TPW) is the SPRT resistance at triple point of water (0,01 °C) in unit Ω."
      },
      norm: "-",
      refType: "basic_calibrationMethod",
      has_formula: true,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 6
      method_name: {id: "Koefisien a, b, c", en: "a, b, c Coefficients"},
      method_desc: {
        id: "Koefisien-koefisien a_5, b_5, a_7, b_7, dan c_7 diperoleh dari hasil kalibrasi pada arus eksitasi 1 mA: " + 
            "a_5 = -2,930 475 E-04 ; b_5 = 2,563 645 E-04 ; a_7 = -2,717 029 E-04 ; b_7 = -1,586 798 E-05 ; c_7 = 1,043 757 E-06",
        en: "The coefficients a_5, b_5, a_7, b_7, and c_7 were obtained from the calibration at exitation current of 1 mA: " + 
            "a_5 = -2,930 475 E-04 ; b_5 = 2,563 645 E-04 ; a_7 = -2,717 029 E-04 ; b_7 = -1,586 798 E-05 ; c_7 = 1,043 757 E-06"
      },
      norm: "-",
      refType: "basic_calibrationMethod",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 7
      method_name: {id: "Ketidakpastian Rambatan", en: "Propagated Uncertainty"},
      method_desc: {
        id: "Ketidakpastian rambatan dalam satuan mK sebagai fungsi suhu U(t_90) " + 
            "pada rentang-rentang kalibrasi tersebut dapat diperkirakan dengan grafik berikut:",
        en: "The propagated uncertainty in unit of mK, as the function of temperature U(t_90) " + 
            "in the mentioned calibration ranges, can be estimated using the following chart:"
      },
      norm: "-",
      refType: "basic_calibrationMethod",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: true,
      image: [
        {
          caption: "",
          fileName: "propagated_uncertainty_low_temp.jpg",
          mimeType: "image/jpg",
          base64: "",
        },
        {
          caption: "",
          fileName: "propagated_uncertainty_high_temp.jpg",
          mimeType: "image/jpg",
          base64: "",
        },
      ],
    },
    { // 8
      method_name: {id: "Ketidakpastian", en: "Uncertainty"},
      method_desc: {
        id: "Semua nilai ketidakpastian pada pengukuran ini dinyatakan pada tingkat kepercayaan 95% dengan faktor cakupan k = 2",
        en: "All the uncertainty values in this measurement are expressed at 95% confidence level with coverage factor of k = 2",
      },
      norm: "-",
      refType: "basic_methodMeasurementUncertainty",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
  ],
  equipments: [
    { // 1
      nama_alat: {id: "Hg TP Cell", en: "Hg TP Cell"},
      manuf_model: {id: "Fluke", en: "Fluke"},
      model: {id: "5900", en: "5900"},
      seri_measuring: "Hg 00001",
      refType: "basic_measurementStandard",
    },
    { // 2
      nama_alat: {id: "H2O TP Cell", en: "H2O TP Cell"},
      manuf_model: {id: "PTB", en: "PTB"},
      model: {id: "-", en: "-"},
      seri_measuring: "PTB4",
      refType: "basic_measurementStandard",
    },
    { // 3
      nama_alat: {id: "Ga MP Cell", en: "Ga MP Cell"},
      manuf_model: {id: "Fluke", en: "Fluke"},
      model: {id: "HS 5943", en: "HS 5943"},
      seri_measuring: "43013",
      refType: "basic_measurementStandard",
    },
    { // 4
      nama_alat: {id: "Sn FP Cell", en: "Sn FP Cell"},
      manuf_model: {id: "Fluke", en: "Fluke"},
      model: {id: "HS 5925", en: "HS 5925"},
      seri_measuring: "05065",
      refType: "basic_measurementStandard",
    },
    { // 5
      nama_alat: {id: "Zn FP Cell", en: "Zn FP Cell"},
      manuf_model: {id: "Fluke", en: "Fluke"},
      model: {id: "HS 5926", en: "HS 5926"},
      seri_measuring: "06070",
      refType: "basic_measurementStandard",
    },
    { // 6
      nama_alat: {id: "Al FP Cell", en: "Al FP Cell"},
      manuf_model: {id: "Fluke", en: "Fluke"},
      model: {id: "HS 5927", en: "HS 5927"},
      seri_measuring: "07096",
      refType: "basic_measurementStandard",
    },
    { // 7
      nama_alat: {id: "Thermometry Bridge", en: "Thermometry Bridge"},
      manuf_model: {id: "Isotech MicroK 70", en: "Isotech MicroK 70"},
      model: {id: "20-P2273", en: "20-P2273"},
      seri_measuring: "ITL42569-1",
      refType: "basic_measurementStandard",
    },
  ],
  conditions: [
    { // 1
      jenis_kondisi: "Suhu",
      desc: {id: "-", en: "-"},
      tengah: "21.4",
      tengah_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\degreecelsius",
        unit_pdf: "°C",
        eksponen: "",
        eksponen_pdf: "",
      },
      rentang: "0",
      rentang_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\degreecelsius",
        unit_pdf: "°C",
        eksponen: "",
        eksponen_pdf: "",
      },
    },
    { // 2
      jenis_kondisi: "Kelembapan",
      desc: {id: "-", en: "-"},
      tengah: "62.6",
      tengah_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\percent",
        unit_pdf: "%",
        eksponen: "",
        eksponen_pdf: "",
      },
      rentang: "0",
      rentang_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\percent",
        unit_pdf: "%",
        eksponen: "",
        eksponen_pdf: "",
      },
    },
  ],
  sheet_names: [],
  sheet_name: "",
  excel: "",
  results: [
    { // 1
      parameters: {
        id: "Hasil Kalibrasi SSPRT Pt-100 Menggunakan Metode Titik Tetap", 
        en: "Calibration Results of SSPRT Pt-100 using Fixed Points Method"
      },
      columns: [
        // { // 1
        //   kolom: {id: "Titik Tetap", en: "Fixed Points"},
        //   refType: "other",
        //   real_list: "1",
        //   column_unit: {
        //     prefix: "",
        //     unit: "",
        //     eksponen: "",
        //   },
        // },
        { // 2
          kolom: {id: "Definisi Suhu", en: "Temp. Definitions"},
          refType: "other",
          real_list: "1",
          column_unit: {
            prefix: "",
            unit: "°C",
            eksponen: "",
          },
        },
        { // 3
          kolom: {id: "Penunjukkan SPRT", en: "SPRT Indications"},
          refType: "basic_measurementError_error",
          real_list: "1",
          column_unit: {
            prefix: "",
            unit: "Ω",
            eksponen: "",
          },
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
        uncertainty_unit: {
          prefix: "m",
          unit: "K",
          eksponen: "",
        },
      },
    },
  ],
  statements: [
    { // 1
      values: {
        id: "Kalibrasi ini dilakukan pada rentang pengukuran (-38,8344 ~ 660,323) °C", 
        en: "The calibration is performed within the measurement range (-38,8344 ~ 660,323) °C"
      },
      refType: "other",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 2
      values: {
        id: "Hasil kalibrasi tersebut tertelusur ke satuan pengukuran SI melalui " + 
            "Laboratorium Standar Nasional Satuan Ukuran (SNSU) — Badan Standardisasi Nasional (BSN).", 
        en: "The calibration results are traceable to the SI unit through the " +
            "Laboratory of National Measurement Standards (NMS) — The National Standardization Agency (BSN)."
      },
      refType: "basic_metrologicallyTraceableToSI",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
  ],
  comment: {
    title: "-",
    desc: {id: "-", en: "-"},
    has_file: false,
    files: [
      {
        file: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
    ],
  },
}

export const pt100Template = {
  software: "DiCCA",
  version: "0.1",
  Measurement_TimeLine: {
    tgl_mulai: "",
    tgl_akhir: "",
    tgl_pengesahan: "",
  },
  administrative_data: {
    core_issuer: "calibrationLaboratory",
    country_code: "ID",
    used_languages: [{ value: "id" }, { value: "en" }],
    mandatory_languages: [{ value: "id" }],
    sertifikat: "",
    order: "",
    tempat: "laboratory",
    tempat_pdf: "Laboratorium SNSU-BSN",
  },
  objects: [
    { // 1
      jenis: {id: "SSPRT Pt-100", en: "SSPRT Pt-100"},
      merek: "Isothermal Technology Ltd",
      tipe: "27098",
      item_issuer: "manufacturer",
      seri_item: "-",
      id_lain: {id: "-", en: "-"},
    },
  ],
  responsible_persons: {
    pelaksana: [
      { // 1
        nama_resp: "Arief Gunawan, S.Si., MPP., M.E.",
        nip: "198904172014021002",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
      { // 2
        nama_resp: "Kelvin Sapta Dewantara, S.Si.",
        nip: "199709242022031003",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    penyelia: [
      // { // 1
      //   nama_resp: "Dewi Larassati, S.T.",
      //   nip: "",
      //   peran: "Penyelia Kalibrasi",
      //   main_signer: "0",
      //   signature: "0",
      //   timestamp: "0",
      // },
    ],
    kepala: {
      nama_resp: "Dr. Aditya Achmadi, S.Si., M.T.",
      nip: "198109032005021002",
      peran: "Kepala Laboratorium SNSU Suhu",
      main_signer: "0",
      signature: "0",
      timestamp: "0",
    },
    direktur: {
      nama_resp: "Dr. Ghufron Zaid",
      nip: "197111041990121001",
      peran: "Direktur SNSU Termoelektrik dan Kimia",
      main_signer: "1",
      signature: "1",
      timestamp: "1",
    },
  },
  owner: {
    nama_cust: "",
    jalan_cust: "",
    no_jalan_cust: "",
    kota_cust: "",
    state_cust: "",
    pos_cust: "",
    negara_cust: "",
  },
  methods: [
    { // 1
      method_name: {id: "Instruksi Kerja", en: "Work Instruction"},
      method_desc: {
        id: "SSPRT Pt-100 dengan spesifikasi di atas dikalibrasi dengan metode perbandingan terhadap Termometer " + 
            "Tahanan Platina Standar (TTPS) Pt-25 di dalam bak cairan dan tungku pada rentang suhu " + 
            '(0 ~ 500) °C berdasarkan prosedur kalibrasi I.MT.1.02 tentang "Kalibrasi Termometer Tahanan ' +
            'Platina dengan Metode Perbandingan", yang mengacu ke dokumen SNSU PK.S-05:2024. Skala ' +
            "suhu yang digunakan adalah ITS-90. Hasil kalibrasi yang dilaporkan tertelusur ke satuan sistem " +
            "internasional melalui Laboratorium Standar Nasional Saturan Ukuran, Badan Standardisasi Nasional.",
        en: "The SSPRT Pt-100 with above specifications was calibrated by comparison method against a Standard " + 
            "Platinum Resistance Thermometer (SPRT) Pt-25 in a liquid bath and a furnace over the temperature range " + 
            'of (0 to 500) °C. The calibration followed procedure I.MT.1.02 on "Calibration of Platinum Resistance ' +
            'Thermometers by Comparison Method", which refers to document SNSU PK.S-05:2024. The temperature ' +
            "scale used was ITS-90. The reported calibration results are traceable to the International System of " + 
            "Units (SI) through the Laboratory of National Measurements Standards, National Standardization Agency.",
      },
      norm: "SNSU PK.S-05:2024",
      refType: "basic_calibrationMethod",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 2
      method_name: {id: "Kondisi Kalibrasi", en: "Calibration Condition"},
      method_desc: {
        id: "Proses kalibrasi dilakukan dengan mencelupkan alat pada kedalaman maksimum 300 mm di dalam bak cairan.",
        en: "The calibration process was carried out by immersing the UUT about 300 mm into the liquid bath.",
      },
      norm: "-",
      refType: "basic_calibrationMethod",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 3
      method_name: {id: "Rumus Menghitung Suhu Terukur", en: "Formula for Determining Measured Temperature"},
      method_desc: {
        id: "Suhu terukur dapat dihitung menggunakan persamaan Callendar-Van Dusen berikut, di mana " +
            "R_0 = Tahanan PRT pada suhu 0 °C sebesar 100,056 469 Ω, " +
            "R_t = Tahanan PRT pada suhu t °C dalam satuan Ω, dan " +
            "t = Suhu yang ditunjukkan PRT dalam satuan °C.",
        en: "The measured temperature can be determined by employing the following Callendar-Van Dusen equation, where " +
            "R_0 = The PRT resistance at 0 °C is 100,056 469 Ω, " +
            "R_t = The PRT resistance at t °C, in unit Ω, and " +
            "t = The temperature measured by PRT, in unit °C."
      },
      norm: "-",
      refType: "basic_calibrationMethod",
      has_formula: true,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 4
      method_name: {id: "Ketidakpastian", en: "Uncertainty"},
      method_desc: {
        id: "Ketidakpastian pengukuran dinyatakan pada tingkat kepercayaan 95% dengan faktor cakupan k = 2.",
        en: "The measurement uncertainty is expressed at a confidence level of 95% with coverage factor k = 2.",
      },
      norm: "-",
      refType: "basic_methodMeasurementUncertainty",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
  ],
  equipments: [
    { // 1
      nama_alat: {id: "SPRT Pt-25", en: "SPRT Pt-25"},
      manuf_model: {id: "Isotech", en: "Isotech"},
      model: {id: "670SH", en: "670SH"},
      seri_measuring: "318",
      refType: "basic_measurementStandard",
    },
    { // 2
      nama_alat: {id: "Thermometry Bridge", en: "Thermometry Bridge"},
      manuf_model: {id: "Isotech", en: "Isotech"},
      model: {id: "MicroK 250", en: "MicroK 250"},
      seri_measuring: "40967/1",
      refType: "basic_measurementStandard",
    },
  ],
  conditions: [
    { // 1
      jenis_kondisi: "Suhu",
      desc: {id: "-", en: "-"},
      tengah: "22",
      tengah_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\degreecelsius",
        unit_pdf: "°C",
        eksponen: "",
        eksponen_pdf: "",
      },
      rentang: "2",
      rentang_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\degreecelsius",
        unit_pdf: "°C",
        eksponen: "",
        eksponen_pdf: "",
      },
    },
    { // 2
      jenis_kondisi: "Kelembapan",
      desc: {id: "-", en: "-"},
      tengah: "63",
      tengah_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\percent",
        unit_pdf: "%",
        eksponen: "",
        eksponen_pdf: "",
      },
      rentang: "5",
      rentang_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\percent",
        unit_pdf: "%",
        eksponen: "",
        eksponen_pdf: "",
      },
    },
  ],
  sheet_names: [],
  sheet_name: "",
  excel: "",
  results: [
    {
      parameters: {},
      columns: [
        {
          kolom: {},
          refType: "",
          real_list: "1",
          column_unit: {
            prefix: "",
            unit: "",
            eksponen: "",
          },
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "",
        real_list: "1",
        uncertainty_unit: {
          prefix: "",
          unit: "",
          eksponen: "",
        },
      },
    },
  ],
  statements: [
    { // 1
      values: {
        id: "Kalibrasi ini dilakukan pada rentang pengukuran (-200 ~ 660) °C", 
        en: "The calibration is performed within the measurement range (-200 ~ 660) °C"
      },
      refType: "other",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
    { // 2
      values: {
        id: "Histeresis tidak dimasukkan dalam perhitungan ketidakpastian; " + 
            "oleh karena itu, hasil kalibrasi ini hanya berlaku untuk arah suhu naik.", 
        en: "Hysteresis is not included in the uncertainty calculation; " +
            "therefore, the calibration result is valid only for increasing temperature direction."
      },
      refType: "other",
      has_formula: false,
      formula: [
        {
          latex: "",
          mathml: "",
        },
      ],
      has_image: false,
      image: [
        {
          caption: "",
          fileName: "",
          mimeType: "",
          base64: "",
        },
      ],
    },
  ],
  comment: {
    title: "-",
    desc: {id: "-", en: "-"},
    has_file: false,
    files: [
      {
        file: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
    ],
  },
}