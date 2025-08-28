"use client";

import { useState, useEffect } from "react";
import Stepper from "@/components/ui/stepper";
import AdministrativeForm from "@/components/administrative-form";
import MeasurementForm from "@/components/measurement-form";
import Statements from "@/components/statements";
import Comment from "@/components/comment";
import Preview from "@/components/preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Helper type guard untuk cek apakah value adalah File
const isFile = (value: any): value is File => {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.name === "string" &&
    typeof value.size === "number"
  );
};

const blankTemplate = {
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
      formula: {
        latex: "",
        mathml: "",
      },
      has_image: false,
      image: {
        caption: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
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
      formula: {
        latex: "",
        mathml: "",
      },
      has_image: false,
      image: {
        caption: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
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

const multimeterTemplate = {
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
    tempat_pdf: "",
  },
  objects: [
    {
      jenis: {id: 'Digital Multimeter', en: 'Digital Multimeter'},
      merek: "Fluke",
      tipe: "5730A",
      item_issuer: "manufacturer",
      seri_item: "",
      id_lain: {id: '', en: ''},
    },
  ],
  responsible_persons: {
    pelaksana: [
      {
        nama_resp: "Hayati Amalia, M.T.",
        nip: "199009212015022002",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    penyelia: [
      {
        nama_resp: "Agah Faisal, M.Sc.",
        nip: "",
        peran: "Penyelia Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
      {
        nama_resp: "Lukluk Khairiyanti, M.T.",
        nip: "",
        peran: "Penyelia Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    kepala: {
      nama_resp: "Agah Faisal, M.Sc.",
      nip: "",
      peran: "Kepala Laboratorium SNSU Kelistrikan",
      main_signer: "0",
      signature: "0",
      timestamp: "0",
    },
    direktur: {
      nama_resp: "Dr. Ghufron Zaid",
      nip: "19711104 199012 1 001",
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
    {
      method_name: {id: 'Instruksi Kerja', en: 'Work Instruction'},
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
      norm: "",
      refType: "basic_calibrationMethod",
      has_formula: false,
      formula: {
        latex: "",
        mathml: "",
      },
      has_image: false,
      image: {
        caption: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
    },
    {
      method_name: {id: 'Ketidakpastian', en: 'Uncertainty'},
      method_desc: {
        id: 'Ketidakpastian pengukuran dihitung  dengan tingkat kepercayaan tidak kurang dari 95% dan faktor cakupan k = 2.',
        en: 'The uncertainty of measurement was calculated with a confidence level not less than 95% and coverage factor of k = 2.',
      },
      norm: "",
      refType: "basic_methodMeasurementUncertainty",
      has_formula: false,
      formula: {
        latex: "",
        mathml: "",
      },
      has_image: false,
      image: {
        caption: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
    },
  ],
  equipments: [
    {
      nama_alat: {id: 'Multifunction Calibrator', en: 'Multifunction Calibrator'},
      manuf_model: {id: 'Fluke', en: 'Fluke'},
      model: {id: '5730A', en: '5730A'},
      seri_measuring: "4978506",
      refType: "basic_measurementStandard",
    },
    {
      nama_alat: {id: 'Transconductance Amplifier', en: 'Transconductance Amplifier'},
      manuf_model: {id: 'Clarke Hess', en: 'Clarke Hess'},
      model: {id: '8200', en: '8200'},
      seri_measuring: "117",
      refType: "basic_measurementStandard",
    },
  ],
  conditions: [
    {
      jenis_kondisi: "Suhu",
      desc: {id: '', en: ''},
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
    {
      jenis_kondisi: "Kelembapan",
      desc: {id: '', en: ''},
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
  sheet_name: "",
  excel: "",
  results: [
    {
      parameters: {id: 'Tegangan DC', en: 'DC Voltage'},
      columns: [
        {
          kolom: {id: 'Rentang', en: 'Range'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Titik Ukur', en: 'Measurement Point'},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        {
          kolom: {id: 'Pembacaan Alat', en: 'Instrument Reading'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Koreksi', en: 'Correction'},
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
    {
      parameters: {id: 'Arus DC', en: 'DC Current'},
      columns: [
        {
          kolom: {id: 'Rentang', en: 'Range'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Titik Ukur', en: 'Measurement Point'},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        {
          kolom: {id: 'Pembacaan Alat', en: 'Instrument Reading'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Koreksi', en: 'Correction'},
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
    {
      parameters: {id: 'Tegangan AC', en: 'AC Voltage'},
      columns: [
        {
          kolom: {id: 'Rentang', en: 'Range'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Titik Ukur', en: 'Measurement Point'},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        {
          kolom: {id: 'Frekuensi', en: 'Frequency'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Pembacaan Alat', en: 'Instrument Reading'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Koreksi', en: 'Correction'},
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
    {
      parameters: {id: 'Arus AC', en: 'AC Current'},
      columns: [
        {
          kolom: {id: 'Rentang', en: 'Range'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Titik Ukur', en: 'Measurement Point'},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        {
          kolom: {id: 'Frekuensi', en: 'Frequency'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Pembacaan Alat', en: 'Instrument Reading'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Koreksi', en: 'Correction'},
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
    {
      parameters: {id: 'Resistansi', en: 'Resistance'},
      columns: [
        {
          kolom: {id: 'Rentang', en: 'Range'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Titik Ukur', en: 'Measurement Point'},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        {
          kolom: {id: 'Pembacaan Alat', en: 'Instrument Reading'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Koreksi', en: 'Correction'},
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
    {
      values: {
        id: 'Hasil kalibrasi yang ditandai bintang (*) tidak tercakup dalam ruang lingkup akreditasi KAN.', 
        en: 'Calibration results marked by asterisk (*) are not covered by KAN accreditation.'
      },
      refType: "basic_isInCMC",
      has_formula: false,
      formula: {
        latex: "",
        mathml: "",
      },
      has_image: false,
      image: {
        caption: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
    },
  ],
  comment: {
    title: "",
    desc: {id: '', en: ''},
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

const calibratorTemplate = {
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
    tempat_pdf: "",
  },
  objects: [
    {
      jenis: {id: 'Multiproduct Calibrator', en: 'Multiproduct Calibrator'},
      merek: "Fluke",
      tipe: "8508A",
      item_issuer: "manufacturer",
      seri_item: "",
      id_lain: {id: '', en: ''},
    },
  ],
  responsible_persons: {
    pelaksana: [
      {
        nama_resp: "Hayati Amalia, M.T.",
        nip: "199009212015022002",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    penyelia: [
      {
        nama_resp: "Agah Faisal, M.Sc.",
        nip: "",
        peran: "Penyelia Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    kepala: {
      nama_resp: "Agah Faisal, M.Sc.",
      nip: "",
      peran: "Kepala Laboratorium SNSU Kelistrikan",
      main_signer: "0",
      signature: "0",
      timestamp: "0",
    },
    direktur: {
      nama_resp: "Dr. Ghufron Zaid",
      nip: "19711104 199012 1 001",
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
    {
      method_name: {id: 'Instruksi Kerja', en: 'Work Instruction'},
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
      norm: "",
      refType: "basic_calibrationMethod",
      has_formula: false,
      formula: {
        latex: "",
        mathml: "",
      },
      has_image: false,
      image: {
        caption: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
    },
    {
      method_name: {id: 'Ketidakpastian', en: 'Uncertainty'},
      method_desc: {
        id: 'Ketidakpastian pengukuran dihitung  dengan tingkat kepercayaan tidak kurang dari 95% dan faktor cakupan k = 2.',
        en: 'The uncertainty of measurement was calculated with a confidence level not less than 95% and coverage factor of k = 2.',
      },
      norm: "",
      refType: "basic_methodMeasurementUncertainty",
      has_formula: false,
      formula: {
        latex: "",
        mathml: "",
      },
      has_image: false,
      image: {
        caption: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
    },
  ],
  equipments: [
    {
      nama_alat: {id: 'Reference Multimeter', en: 'Reference Multimeter'},
      manuf_model: {id: 'Fluke', en: 'Fluke'},
      model: {id: '8508A', en: '8508A'},
      seri_measuring: "941254525",
      refType: "basic_measurementStandard",
    },
  ],
  conditions: [
    {
      jenis_kondisi: "Suhu",
      desc: {id: '', en: ''},
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
    {
      jenis_kondisi: "Kelembapan",
      desc: {id: '', en: ''},
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
  sheet_name: "",
  excel: "",
  results: [
    {
      parameters: {id: 'Tegangan DC', en: 'DC Voltage'},
      columns: [
        {
          kolom: {id: 'Rentang', en: 'Range'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Titik Ukur', en: 'Measurement Point'},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        {
          kolom: {id: 'Pembacaan Standar', en: 'Standard Reading'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Koreksi', en: 'Correction'},
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
    {
      parameters: {id: 'Arus DC', en: 'DC Current'},
      columns: [
        {
          kolom: {id: 'Rentang', en: 'Range'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Titik Ukur', en: 'Measurement Point'},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        {
          kolom: {id: 'Pembacaan Standar', en: 'Standard Reading'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Koreksi', en: 'Correction'},
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
    {
      parameters: {id: 'Tegangan AC', en: 'AC Voltage'},
      columns: [
        {
          kolom: {id: 'Rentang', en: 'Range'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Titik Ukur', en: 'Measurement Point'},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        {
          kolom: {id: 'Frekuensi', en: 'Frequency'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Pembacaan Standar', en: 'Standard Reading'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Koreksi', en: 'Correction'},
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
    {
      parameters: {id: 'Arus AC', en: 'AC Current'},
      columns: [
        {
          kolom: {id: 'Rentang', en: 'Range'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Titik Ukur', en: 'Measurement Point'},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        {
          kolom: {id: 'Frekuensi', en: 'Frequency'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Pembacaan Standar', en: 'Standard Reading'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Koreksi', en: 'Correction'},
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
    {
      parameters: {id: 'Resistansi', en: 'Resistance'},
      columns: [
        {
          kolom: {id: 'Rentang', en: 'Range'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Titik Ukur', en: 'Measurement Point'},
          refType: "basic_nominalValue",
          real_list: "1",
        },
        {
          kolom: {id: 'Pembacaan Standar', en: 'Standard Reading'},
          refType: "other",
          real_list: "1",
        },
        {
          kolom: {id: 'Koreksi', en: 'Correction'},
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
    {
      values: {
        id: 'Hasil kalibrasi yang ditandai bintang (*) tidak tercakup dalam ruang lingkup akreditasi KAN.', 
        en: 'Calibration results marked by asterisk (*) are not covered by KAN accreditation.'
      },
      refType: "basic_isInCMC",
      has_formula: false,
      formula: {
        latex: "",
        mathml: "",
      },
      has_image: false,
      image: {
        caption: "",
        fileName: "",
        mimeType: "",
        base64: "",
      },
    },
  ],
  comment: {
    title: "",
    desc: {id: '', en: ''},
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

export default function CreateDCC() {
  const { t } = useLanguage();

  const [formApis, setFormApis] = useState<any[]>([]);

  const registerFormApi = (index: number, api: any) => {
    setFormApis((prev) => {
      const copy = [...prev];
      copy[index] = api;
      return copy;
    });
  };

  const [formApi, setFormApi] = useState<any>(null);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [previewFiles, setPreviewFiles] = useState<{pdf: string | null, xml: string | null}>({
    pdf: null,
    xml: null
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Progress tracking states
  const [isProcessingPreview, setIsProcessingPreview] = useState<boolean>(false);
  const [isProcessingSubmission, setIsProcessingSubmission] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    t("administrasi"),
    t("hasil"),
    t("statements"),
    t("comment"),
    t("preview"),
  ];

  const [fileName, setFileName] = useState<string>("");

  // Simpan data form di state
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [formData, setFormData] = useState(blankTemplate);

  // When template changes, update formData
  useEffect(() => {
    if (selectedTemplate === "multimeter") {
      setFormData(multimeterTemplate);
    } else if (selectedTemplate === "calibrator") {
      setFormData(calibratorTemplate);
    } else {
      setFormData(blankTemplate);
    }
  }, [selectedTemplate]);

  // Kasih warning saat user mencoba meninggalkan halaman (agar isi formulir tidak hilang)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    if (formData) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData]);

  const formatDate = (date: Date | string | null): string | null => {
    if (!date) return null;
    const localDate = new Date(date);
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset()
    );
    return localDate.toISOString().split("T")[0];
  };

  const updateFormData = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      administrative_data: {
        ...prev.administrative_data,
        ...(data.administrative_data ?? {}),
      },
      Measurement_TimeLine: {
        ...prev.Measurement_TimeLine,
        ...(data.Measurement_TimeLine
          ? {
              tgl_mulai: data.Measurement_TimeLine.tgl_mulai
                ? formatDate(new Date(data.Measurement_TimeLine.tgl_mulai))
                : prev.Measurement_TimeLine.tgl_mulai,
              tgl_akhir: data.Measurement_TimeLine.tgl_akhir
                ? formatDate(new Date(data.Measurement_TimeLine.tgl_akhir))
                : prev.Measurement_TimeLine.tgl_akhir,
              tgl_pengesahan: data.Measurement_TimeLine.tgl_pengesahan
                ? formatDate(new Date(data.Measurement_TimeLine.tgl_pengesahan))
                : prev.Measurement_TimeLine.tgl_pengesahan,
            }
          : prev.Measurement_TimeLine),
      },
      responsible_persons: {
        ...prev.responsible_persons,
        ...(data.responsible_persons ?? {}),
      },
      objects: Array.isArray(data.objects)
        ? data.objects.map((obj: any) => ({
            jenis: obj.jenis || "",
            merek: obj.merek || "",
            tipe: obj.tipe || "",
            item_issuer: obj.item_issuer || "",
            seri_item: obj.seri_item || "",
            id_lain: obj.id_lain || "",
          }))
        : prev.objects,
      statements: Array.isArray(data.statements)
        ? data.statements
        : prev.statements,
    }));
  };

  // Function to send preview data to backend
  const generatePreview = async (dataToPreview = formData) => {
    try {
      setIsProcessingPreview(true);

      const modifiedFormData = {
        ...dataToPreview,
        administrative_data: {
          ...dataToPreview.administrative_data,
          used_languages:
            dataToPreview.administrative_data.used_languages
              ?.filter((lang) => lang.value && lang.value.trim() !== "")
              .map((lang) => lang.value) || [],
          mandatory_languages:
            dataToPreview.administrative_data.mandatory_languages.map(
              (lang) => lang.value
            ),
        },
        methods: dataToPreview.methods.map((method, index) => {
          if (
            method.has_image &&
            method.image?.fileName &&
            isFile(method.image.fileName)
          ) {
            return {
              ...method,
              image: {
                ...method.image,
                base64: method.image.fileName.name,
                mimeType: method.image.mimeType,
                fileName: method.image.fileName,
              },
            };
          }
          return method;
        }),
        statements: dataToPreview.statements.map((stmt, index) => {
          if (
            stmt.has_image &&
            stmt.image?.fileName &&
            isFile(stmt.image.fileName)
          ) {
            return {
              ...stmt,
              image: {
                ...stmt.image,
                base64: stmt.image.fileName.name,
                mimeType: stmt.image.mimeType,
                fileName: stmt.image.fileName,
              },
            };
          }
          return stmt;
        }),
        results: dataToPreview.results.map((result) => ({
          parameters: result.parameters,
          columns: result.columns.map((col) => ({
            kolom: Array.isArray(col.kolom) ? col.kolom[0] || "" : col.kolom,
            real_list: Number(col.real_list) || 1,
            refType: col.refType || "",
          })),
          uncertainty: result.uncertainty
            ? {
                factor: result.uncertainty.factor || "0",
                probability: result.uncertainty.probability || "0",
                distribution: result.uncertainty.distribution || "",
              }
            : { factor: "0", probability: "0", distribution: "" },
        })),
        excel: fileName,
      };

      const sanitizeData = (data: any) => {
        return {
          ...data,
          methods: data.methods.map((m: any) => ({
            ...m,
            formula: m.has_formula ? m.formula : null,
            image: m.has_image ? m.image : null,
          })),
          statements: data.statements.map((s: any) => ({
            ...s,
            formula: s.has_formula ? s.formula : null,
            image: s.has_image ? s.image : null,
          })),
          comment: data.comment?.has_file
            ? data.comment
            : { ...data.comment, files: [] },
        };
      };

      const response = await fetch("http://127.0.0.1:8000/generate-preview/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizeData(modifiedFormData)),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      setPreviewFiles({
        pdf: result.pdf_url,
        xml: result.xml_url
      });
      
      setTimeout(() => {
        setIsProcessingPreview(false);
      }, 1000);

    } catch (error) {
      console.error("Error generating preview:", error);
      setIsProcessingPreview(false);
    }
  };

  // Generate preview when formData changes (debounced)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentStep === 4) { // Only generate preview when on preview step
        generatePreview();
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(debounceTimer);
  }, [formData, currentStep]);

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      const currentForm = formApis[currentStep];
      if (currentForm) {
        const isValid = await currentForm.trigger();
        if (!isValid) {
          const firstError = document.querySelector("[data-invalid='true']");
          if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return; // stop navigation if invalid
        }
      }

      const newStep = currentStep + 1;
      setCurrentStep(newStep);

      if (newStep === 4) {
        generatePreview();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const modifiedFormData = {
    ...formData,
    administrative_data: {
      ...formData.administrative_data,
      used_languages:
        formData.administrative_data.used_languages
          ?.filter((lang) => lang.value && lang.value.trim() !== "")
          .map((lang) => lang.value) || [],
      mandatory_languages:
        formData.administrative_data.mandatory_languages.map(
          (lang) => lang.value
        ),
    },
    methods: formData.methods.map((method, index) => {
      if (
        method.has_image &&
        method.image?.fileName &&
        isFile(method.image.fileName)
      ) {
        return {
          ...method,
          image: {
            ...method.image,
            base64: method.image.fileName.name,
            mimeType: method.image.mimeType,
            fileName: method.image.fileName,
          },
        };
      }
      return method;
    }),
    statements: formData.statements.map((stmt, index) => {
      if (
        stmt.has_image &&
        stmt.image?.fileName &&
        isFile(stmt.image.fileName)
      ) {
        return {
          ...stmt,
          image: {
            ...stmt.image,
            base64: stmt.image.fileName.name,
            mimeType: stmt.image.mimeType,
            fileName: stmt.image.fileName,
          },
        };
      }
      return stmt;
    }),
    results: formData.results.map((result) => ({
      parameters: result.parameters,
      columns: result.columns.map((col) => ({
        kolom: Array.isArray(col.kolom) ? col.kolom[0] || "" : col.kolom,
        real_list: Number(col.real_list) || 1,
        refType: col.refType || "",
      })),
      uncertainty: result.uncertainty
        ? {
            factor: result.uncertainty.factor || "0",
            probability: result.uncertainty.probability || "0",
            distribution: result.uncertainty.distribution || "",
          }
        : { factor: "0", probability: "0", distribution: "" },
    })),
    excel: fileName,
  };

  const sanitizeData = (data: any) => {
    return {
      ...data,
      methods: data.methods.map((m: any) => ({
        ...m,
        formula: m.has_formula ? m.formula : null,
        image: m.has_image ? m.image : null,
      })),
      statements: data.statements.map((s: any) => ({
        ...s,
        formula: s.has_formula ? s.formula : null,
        image: s.has_image ? s.image : null,
      })),
      comment: data.comment?.has_file
        ? data.comment
        : { ...data.comment, files: [] },
    };
  };

  const handleSubmit = async () => {
    // Start processing
    setIsProcessingSubmission(true);
    setProgressMessage(t("preparing_data"));
    setProgressPercent(10);

    // Create FormData object for multipart/form-data submission
    const submitFormData = new FormData();

    setProgressMessage(t("processing_files"));
    setProgressPercent(30);

    // Prepare FormData for file uploads
    formData.methods.forEach((method, index) => {
      if (
        method.has_image &&
        method.image?.fileName &&
        isFile(method.image.fileName)
      ) {
        const file = method.image.fileName;
        submitFormData.append(`methods[${index}].image.gambar`, file);
        submitFormData.append(
          `methods[${index}].image.mimeType`,
          method.image.mimeType
        );
        submitFormData.append(
          `methods[${index}].image.fileName`,
          method.image.fileName
        );
      }
    });

    formData.statements.forEach((stmt, index) => {
      if (
        stmt.has_image &&
        stmt.image?.fileName &&
        isFile(stmt.image.fileName)
      ) {
        const file = stmt.image.fileName;
        submitFormData.append(`statements[${index}].image.gambar`, file);
        submitFormData.append(
          `statements[${index}].image.mimeType`,
          stmt.image.mimeType
        );
        submitFormData.append(
          `statements[${index}].image.fileName`,
          stmt.image.fileName
        );
      }
    });

    submitFormData.append("data", JSON.stringify(modifiedFormData));

    console.log("Data yang dikirim ke backend:", modifiedFormData);

    setProgressMessage(t("generating_dcc") );
    setProgressPercent(50);

    try {
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizeData(modifiedFormData)),
      });

      setProgressPercent(75);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorText}`
        );
      }

      setProgressMessage(t("finalizing"));
      setProgressPercent(90);

      // Handle PDF response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setIsSubmitted(true);

      setProgressMessage(t("dcc_created_successfully"));
      setProgressPercent(100);

      // Hide progress after a delay
      setTimeout(() => {
        setIsProcessingSubmission(false);
      }, 2000);

    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      setProgressMessage(
        `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
      );
      setProgressPercent(0);
      setIsProcessingSubmission(false);
      
      if (error instanceof Error) {
        alert(`Failed to create DCC. Error: ${error.message}`);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="container mx-auto py-8 pt-20">
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-white to-green-100"></div>

      <Stepper
        currentStep={currentStep}
        steps={steps}
        onStepClick={setCurrentStep}
      />

      {currentStep !== 4 && (
        <div className="flex justify-center mb-4">
          <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
            <SelectTrigger className="w-[400px] mt-10 bg-white">
              <SelectValue placeholder={t("template")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multimeter">Digital Multimeter {t("using")} Fluke 5730A</SelectItem>
              <SelectItem value="calibrator">Multiproduct Calibrator {t("using")} Fluke 8508A</SelectItem>
              <SelectItem value="blank">{t("blank")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-10">
        {currentStep === 0 && (
          <AdministrativeForm
            formData={formData}
            updateFormData={updateFormData}
            onFormReady={(api) => registerFormApi(0, api)}
          />
        )}
        {currentStep === 1 && (
          <MeasurementForm
            formData={formData}
            updateFormData={updateFormData}
            setFileName={setFileName}
            onFormReady={(api) => registerFormApi(1, api)}
          />
        )}
        {currentStep === 2 && (
          <Statements 
            formData={formData} 
            updateFormData={updateFormData}
            onFormReady={(api) => registerFormApi(2, api)}
          />
        )}
        {currentStep === 3 && (
          <Comment 
            formData={formData} 
            updateFormData={updateFormData}
            onFormReady={(api) => registerFormApi(3, api)}
          />
        )}
        {currentStep === 4 && (
          <Preview 
            previewFiles={previewFiles}
            isLoading={isProcessingPreview}
            onRefresh={() => generatePreview()}
          />
        )}
      </div>

      {/* Progress Bar */}
      {isProcessingSubmission && (
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="p-4 bg-sky-50 rounded-md border border-sky-200">
            <p className="text-sky-700 font-medium mb-2">{progressMessage}</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-sky-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-sky-600 mt-1">{progressPercent}% {t("completed") || "completed"}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between max-w-4xl mx-auto px-4 mt-8">
        <Button variant="blue" onClick={prevStep} disabled={currentStep === 0 || isProcessingSubmission}>
          <ArrowLeft />
        </Button>

        {currentStep === steps.length - 1 ? (
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={handleSubmit} 
              variant="green"
              disabled={isProcessingSubmission}
            >
              {isProcessingSubmission ? (t("processing")) : t("submit")}
            </Button>

            {isSubmitted && pdfBlobUrl && !isProcessingSubmission && (
              <div>
                <Button asChild variant="blue">
                  <a 
                    href={pdfBlobUrl}
                    download={`${formData.administrative_data.sertifikat}.pdf`}
                  >
                    {t("download")}
                  </a>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Button onClick={nextStep} variant="blue" disabled={isProcessingSubmission}>
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}