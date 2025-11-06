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
        },
      ],
      uncertainty: {
        factor: "2",
        probability: "0.95",
        distribution: "",
        real_list: "1",
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