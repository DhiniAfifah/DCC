export const multimeterTemplate = {
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
      jenis: {id: "Digital Multimeter", en: "Digital Multimeter"},
      merek: "Fluke",
      tipe: "8508A",
      item_issuer: "manufacturer",
      seri_item: "-",
      id_lain: {id: "-", en: "-"},
    },
  ],
  responsible_persons: {
    pelaksana: [
      { // 1
        nama_resp: "Hayati Amalia, M.T.",
        nip: "199009212015022002",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    penyelia: [
      { // 1
        nama_resp: "Agah Faisal, M.Sc.",
        nip: "198102142006041004",
        peran: "Penyelia Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
      { // 2
        nama_resp: "Lukluk Khairiyati, M.T.",
        nip: "197911292006042005",
        peran: "Penyelia Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    kepala: {
      nama_resp: "Agah Faisal, M.Sc.",
      nip: "198102142006041004",
      peran: "Kepala Laboratorium SNSU Kelistrikan",
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
        id: "Hasil kalibrasi ini diperoleh berdasarkan prosedur kalibrasi " +
            "I.ME.1.03 untuk tegangan DC, " +
            "I.ME.3.04 untuk arus DC, " +
            "I.ME.5.05 untuk tegangan AC, " +
            "I.ME.6.03 untuk arus AC, dan " +
            "I.ME.2.10 untuk resistansi " +
            "dengan menggunakan alat standar yang tertelusur ke SI melalui SNSU-BSN.",
        en: "The calibration result was acquired based on the procedure of " +
            "I.ME.1.03 for DC voltage, " +
            "I.ME.3.04 for DC current, " +
            "I.ME.5.05 for AC voltage, " +
            "I.ME.6.03 for AC current, and " +
            "I.ME.2.10 for resistance " +
            "using standard instruments that is traceable to SI through SNSU-BSN.",
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
    { // 2
      method_name: {id: "Pengkabelan untuk Pengukuran Resistansi", en: "Wiring Setup for Resistance Measurement"},
      method_desc: {
        id: "Pengukuran resistansi di bawah dan sama dengan 100 kΩ menggunakan metode 4-kawat, sedangkan pada nominal di atas 100 kΩ menggunakan metode 2-kawat.",
        en: "The resistance measurement below and equal to 100 kΩ uses the 4-wire method, while for nominal resistance above 100 kΩ use the 2-wire method.",
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
      method_name: {id: "Ketidakpastian", en: "Uncertainty"},
      method_desc: {
        id: "Ketidakpastian pengukuran dihitung  dengan tingkat kepercayaan tidak kurang dari 95% dan faktor cakupan k = 2.",
        en: "The uncertainty of measurement was calculated with a confidence level not less than 95% and coverage factor of k = 2.",
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
      nama_alat: {id: "Multifunction Calibrator", en: "Multifunction Calibrator"},
      manuf_model: {id: "Fluke", en: "Fluke"},
      model: {id: "5730A", en: "5730A"},
      seri_measuring: "4978506",
      refType: "basic_measurementStandard",
    },
    { // 2
      nama_alat: {id: "Transconductance Amplifier", en: "Transconductance Amplifier"},
      manuf_model: {id: "Clarke Hess", en: "Clarke Hess"},
      model: {id: "8200", en: "8200"},
      seri_measuring: "117",
      refType: "basic_measurementStandard",
    },
  ],
  conditions: [
    { // 1
      jenis_kondisi: "Suhu",
      desc: {id: "-", en: "-"},
      tengah: "23",
      tengah_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\degreecelsius",
        unit_pdf: "°C",
        eksponen: "",
        eksponen_pdf: "",
      },
      rentang: "1",
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
      tengah: "54",
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
    { // 1
      parameters: {id: "Tegangan DC", en: "DC Voltage"},
      columns: [
        { // 1
          kolom: {id: "Rentang", en: "Range"},
          refType: "other",
          real_list: "1",
        },
        { // 2
          kolom: {id: "Titik Ukur", en: "Measurement Point"},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        { // 3
          kolom: {id: "Pembacaan Alat", en: "Instrument Reading"},
          refType: "other",
          real_list: "1",
        },
        { // 4
          kolom: {id: "Koreksi", en: "Correction"},
          refType: "basic_measurementError_correction",
          real_list: "1",
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
      },
    },
    { // 2
      parameters: {id: "Arus DC", en: "DC Current"},
      columns: [
        { // 1
          kolom: {id: "Rentang", en: "Range"},
          refType: "other",
          real_list: "1",
        },
        { // 2
          kolom: {id: "Titik Ukur", en: "Measurement Point"},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        { // 3
          kolom: {id: "Pembacaan Alat", en: "Instrument Reading"},
          refType: "other",
          real_list: "1",
        },
        { // 4
          kolom: {id: "Koreksi", en: "Correction"},
          refType: "basic_measurementError_correction",
          real_list: "1",
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
      },
    },
    { // 3
      parameters: {id: "Tegangan AC", en: "AC Voltage"},
      columns: [
        { // 1
          kolom: {id: "Rentang", en: "Range"},
          refType: "other",
          real_list: "1",
        },
        { // 2
          kolom: {id: "Titik Ukur", en: "Measurement Point"},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        { // 3
          kolom: {id: "Frekuensi", en: "Frequency"},
          refType: "other",
          real_list: "1",
        },
        { // 4
          kolom: {id: "Pembacaan Alat", en: "Instrument Reading"},
          refType: "other",
          real_list: "1",
        },
        { // 5
          kolom: {id: "Koreksi", en: "Correction"},
          refType: "basic_measurementError_correction",
          real_list: "1",
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
      },
    },
    { // 4
      parameters: {id: "Arus AC", en: "AC Current"},
      columns: [
        { // 1
          kolom: {id: "Rentang", en: "Range"},
          refType: "other",
          real_list: "1",
        },
        { // 2
          kolom: {id: "Titik Ukur", en: "Measurement Point"},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        { // 3
          kolom: {id: "Frekuensi", en: "Frequency"},
          refType: "other",
          real_list: "1",
        },
        { // 4
          kolom: {id: "Pembacaan Alat", en: "Instrument Reading"},
          refType: "other",
          real_list: "1",
        },
        { // 5
          kolom: {id: "Koreksi", en: "Correction"},
          refType: "basic_measurementError_correction",
          real_list: "1",
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
      },
    },
    { // 5
      parameters: {id: "Resistansi", en: "Resistance"},
      columns: [
        { // 1
          kolom: {id: "Rentang", en: "Range"},
          refType: "other",
          real_list: "1",
        },
        { // 2
          kolom: {id: "Titik Ukur", en: "Measurement Point"},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        { // 3
          kolom: {id: "Pembacaan Alat", en: "Instrument Reading"},
          refType: "other",
          real_list: "1",
        },
        { // 4
          kolom: {id: "Koreksi", en: "Correction"},
          refType: "basic_measurementError_correction",
          real_list: "1",
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
      },
    },
  ],
  statements: [
    { // 1
      values: {
        id: "Hasil kalibrasi yang ditandai bintang (*) tidak tercakup dalam ruang lingkup akreditasi KAN.", 
        en: "Calibration results marked by asterisk (*) are not covered by KAN accreditation."
      },
      refType: "basic_isInCMC",
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

export const calibratorTemplate = {
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
      jenis: {id: "Multiproduct Calibrator", en: "Multiproduct Calibrator"},
      merek: "Fluke",
      tipe: "5730A",
      item_issuer: "manufacturer",
      seri_item: "-",
      id_lain: {id: "-", en: "-"},
    },
  ],
  responsible_persons: {
    pelaksana: [
      { // 1
        nama_resp: "Hayati Amalia, M.T.",
        nip: "199009212015022002",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    penyelia: [
      { // 1
        nama_resp: "Agah Faisal, M.Sc.",
        nip: "198102142006041004",
        peran: "Penyelia Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    kepala: {
      nama_resp: "Agah Faisal, M.Sc.",
      nip: "198102142006041004",
      peran: "Kepala Laboratorium SNSU Kelistrikan",
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
        id: "Hasil kalibrasi ini diperoleh berdasarkan prosedur kalibrasi " +
            "I.ME.1.05 untuk tegangan DC, " +
            "I.ME.3.05 untuk arus DC, " +
            "I.ME.5.04 untuk tegangan AC, " +
            "I.ME.6.06 untuk arus AC, dan " +
            "I.ME.2.09 untuk resistansi " +
            "dengan menggunakan alat standar yang tertelusur ke SI melalui SNSU-BSN.", 
        en: "The calibration result was acquired based on the procedure of " +
            "I.ME.1.05 for DC voltage, " +
            "I.ME.3.05 for DC current, " +
            "I.ME.5.04 for AC voltage, " +
            "I.ME.6.06 for AC current, and " +
            "I.ME.2.09 for resistance " +
            "using standard instruments that is traceable to SI through SNSU-BSN.",
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
    { // 2
      method_name: {id: "Pengkabelan untuk Pengukuran Resistansi", en: "Wiring Setup for Resistance Measurement"},
      method_desc: {
        id: "Pengukuran resistansi di bawah dan sama dengan 100 kΩ menggunakan metode 4-kawat, sedangkan pada nominal di atas 100 kΩ menggunakan metode 2-kawat.",
        en: "The resistance measurement below and equal to 100 kΩ uses the 4-wire method, while for nominal resistance above 100 kΩ use the 2-wire method.",
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
      method_name: {id: "Ketidakpastian", en: "Uncertainty"},
      method_desc: {
        id: "Ketidakpastian pengukuran dihitung  dengan tingkat kepercayaan tidak kurang dari 95% dan faktor cakupan k = 2.",
        en: "The uncertainty of measurement was calculated with a confidence level not less than 95% and coverage factor of k = 2.",
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
      nama_alat: {id: "Reference Multimeter", en: "Reference Multimeter"},
      manuf_model: {id: "Fluke", en: "Fluke"},
      model: {id: "8508A", en: "8508A"},
      seri_measuring: "941254525",
      refType: "basic_measurementStandard",
    },
  ],
  conditions: [
    { // 1
      jenis_kondisi: "Suhu",
      desc: {id: "-", en: "-"},
      tengah: "23",
      tengah_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\degreecelsius",
        unit_pdf: "°C",
        eksponen: "",
        eksponen_pdf: "",
      },
      rentang: "1",
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
      tengah: "56",
      tengah_unit: {
        prefix: "",
        prefix_pdf: "",
        unit: "\\percent",
        unit_pdf: "%",
        eksponen: "",
        eksponen_pdf: "",
      },
      rentang: "6",
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
      parameters: {id: "Tegangan DC", en: "DC Voltage"},
      columns: [
        { // 1
          kolom: {id: "Rentang", en: "Range"},
          refType: "other",
          real_list: "1",
        },
        { // 2
          kolom: {id: "Titik Ukur", en: "Measurement Point"},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        { // 3
          kolom: {id: "Pembacaan Standar", en: "Standard Reading"},
          refType: "other",
          real_list: "1",
        },
        { // 4
          kolom: {id: "Koreksi", en: "Correction"},
          refType: "basic_measurementError_correction",
          real_list: "1",
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
      },
    },
    { // 2
      parameters: {id: "Arus DC", en: "DC Current"},
      columns: [
        { // 1
          kolom: {id: "Rentang", en: "Range"},
          refType: "other",
          real_list: "1",
        },
        { // 2
          kolom: {id: "Titik Ukur", en: "Measurement Point"},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        { // 3
          kolom: {id: "Pembacaan Standar", en: "Standard Reading"},
          refType: "other",
          real_list: "1",
        },
        { // 4
          kolom: {id: "Koreksi", en: "Correction"},
          refType: "basic_measurementError_correction",
          real_list: "1",
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
      },
    },
    { // 3
      parameters: {id: "Tegangan AC", en: "AC Voltage"},
      columns: [
        { // 1
          kolom: {id: "Rentang", en: "Range"},
          refType: "other",
          real_list: "1",
        },
        { // 2
          kolom: {id: "Titik Ukur", en: "Measurement Point"},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        { // 3
          kolom: {id: "Frekuensi", en: "Frequency"},
          refType: "other",
          real_list: "1",
        },
        { // 4
          kolom: {id: "Pembacaan Standar", en: "Standard Reading"},
          refType: "other",
          real_list: "1",
        },
        { // 5
          kolom: {id: "Koreksi", en: "Correction"},
          refType: "basic_measurementError_correction",
          real_list: "1",
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
      },
    },
    { // 4
      parameters: {id: "Arus AC", en: "AC Current"},
      columns: [
        { // 1
          kolom: {id: "Rentang", en: "Range"},
          refType: "other",
          real_list: "1",
        },
        { // 2
          kolom: {id: "Titik Ukur", en: "Measurement Point"},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        { // 3
          kolom: {id: "Frekuensi", en: "Frequency"},
          refType: "other",
          real_list: "1",
        },
        { // 4
          kolom: {id: "Pembacaan Standar", en: "Standard Reading"},
          refType: "other",
          real_list: "1",
        },
        { // 5
          kolom: {id: "Koreksi", en: "Correction"},
          refType: "basic_measurementError_correction",
          real_list: "1",
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
      },
    },
    { // 5
      parameters: {id: "Resistansi", en: "Resistance"},
      columns: [
        { // 1
          kolom: {id: "Rentang", en: "Range"},
          refType: "other",
          real_list: "1",
        },
        { // 2
          kolom: {id: "Titik Ukur", en: "Measurement Point"},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        { // 3
          kolom: {id: "Pembacaan Standar", en: "Standard Reading"},
          refType: "other",
          real_list: "1",
        },
        { // 4
          kolom: {id: "Koreksi", en: "Correction"},
          refType: "basic_measurementError_correction",
          real_list: "1",
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "normal",
        real_list: "1",
      },
    },
  ],
  statements: [
    { // 1
      values: {
        id: "Hasil kalibrasi yang ditandai bintang (*) tidak tercakup dalam ruang lingkup akreditasi KAN.", 
        en: "Calibration results marked by asterisk (*) are not covered by KAN accreditation."
      },
      refType: "basic_isInCMC",
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