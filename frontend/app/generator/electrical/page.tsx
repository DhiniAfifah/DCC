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
import { toast } from "sonner"

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

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Add validation function
  const getValidationErrors = (): string[] => {
    const errors: string[] = [];

    const usedLanguages = formData.administrative_data.used_languages?.filter(
      (lang: any) => lang.value && lang.value.trim()
    ) || [];
    
    switch (currentStep) {
      case 0: // Administrative Form
        if (!formData.software?.trim()) errors.push(t("software_name") + t("required"));
        if (!formData.version?.trim()) errors.push(t("software_version") + t("required"));

        if (!formData.administrative_data.country_code?.trim()) errors.push(t("negara_calib") + t("required"));
        if (!formData.administrative_data.tempat?.trim()) errors.push(t("tempat") + t("required"));
        if (!formData.administrative_data.tempat_pdf?.trim()) errors.push(t("tempat") + t("required"));
        if (!formData.administrative_data.used_languages?.some(lang => lang.value)) {
            errors.push(t("at_least_one") + t("used") + t("required"));
        }
        if (!formData.administrative_data.mandatory_languages?.some(lang => lang.value)) {
            errors.push(t("at_least_one") + t("mandatory") + t("required"));
        }
        if (!formData.administrative_data.order?.trim()) errors.push(t("order") + t("required"));
        if (!formData.administrative_data.sertifikat?.trim()) errors.push(t("sertifikat") + t("required"));

        if (!formData.Measurement_TimeLine.tgl_mulai) errors.push(t("mulai") + t("required"));
        if (!formData.Measurement_TimeLine.tgl_akhir) errors.push(t("akhir") + t("required"));
        if (!formData.Measurement_TimeLine.tgl_pengesahan) errors.push(t("pengesahan") + t("required"));

        if (!formData.objects?.length) {
          errors.push(t("at_least_one") + t("objek") + t("required"));
        } else {
          formData.objects.forEach((obj: any, index: number) => {
            // Check jenis (all languages must be filled)
            if (!obj.jenis || Object.keys(obj.jenis).length === 0) {
              errors.push(t("objek") + ` ${index + 1}: ` + t("jenis") + t("required"));
            } else {
              // Check that ALL used languages have values
              usedLanguages.forEach((lang: any) => {
                if (!obj.jenis[lang.value]?.trim()) {
                  errors.push(t("objek") + ` ${index + 1}: ` +  t("jenis") + t("must_be_filled_for_language") + `"${lang.value}"`);
                }
              });
            }
            // Check other required fields
            if (!obj.merek?.trim()) errors.push(t("objek") + ` ${index + 1}: ` + t("merek") + t("required"));
            if (!obj.tipe?.trim()) errors.push(t("objek") + ` ${index + 1}: ` + t("tipe") + t("required"));
            if (!obj.item_issuer?.trim()) errors.push(t("objek") + ` ${index + 1}: ` + t("identifikasi") + t("required"));
            if (!obj.seri_item?.trim()) errors.push(t("objek") + ` ${index + 1}: ` + t("seri") + t("required"));
            // Check id_lain (all languages must be filled)
            if (!obj.id_lain || Object.keys(obj.id_lain).length === 0) {
              errors.push(t("objek") + ` ${index + 1}: ` + t("id_lain") + t("required"));
            } else {
              // Check that ALL used languages have values
              usedLanguages.forEach((lang: any) => {
                if (!obj.id_lain[lang.value]?.trim()) {
                  errors.push(t("objek") + ` ${index + 1}: ` +  t("id_lain") + t("must_be_filled_for_language") + `"${lang.value}"`);
                }
              });
            }
          });
        }
        
        if (!formData.responsible_persons.pelaksana?.length) {
          errors.push(t("at_least_one") + t("pelaksana") + t("required"));
        } else {
          formData.responsible_persons.pelaksana.forEach((person: any, index: number) => {
            if (!person.nama_resp?.trim()) errors.push(t("pelaksana") + ` ${index + 1}: ` + t("nama") + t("required"));
            if (!person.nip?.trim()) errors.push(t("pelaksana") + ` ${index + 1}: ` + t("nip") + t("required"));
          });
        }
        if (!formData.responsible_persons.penyelia?.length) {
          errors.push(t("at_least_one") + t("penyelia") + t("required"));
        } else {
          formData.responsible_persons.penyelia.forEach((person: any, index: number) => {
            if (!person.nama_resp?.trim()) errors.push(t("penyelia") + ` ${index + 1}: ` + t("nama") + t("required"));
            if (!person.nip?.trim()) errors.push(t("penyelia") + ` ${index + 1}: ` + t("nip") + t("required"));
          });
        }
        if (!formData.responsible_persons.kepala.nama_resp?.trim()) errors.push(t("nama_kepala") + t("required"));
        if (!formData.responsible_persons.kepala.nip?.trim()) errors.push(t("nip_kepala") + t("required"));
        if (!formData.responsible_persons.kepala.peran?.trim()) errors.push(t("lab_kepala") + t("required"));
        if (!formData.responsible_persons.direktur.nama_resp?.trim()) errors.push(t("nama_direktur") + t("required"));
        if (!formData.responsible_persons.direktur.nip?.trim()) errors.push(t("nip_direktur") + t("required"));
        if (!formData.responsible_persons.direktur.peran?.trim()) errors.push(t("jabatan_direktur") + t("required"));

        if (!formData.owner.nama_cust?.trim()) errors.push(t("nama_cust") + t("required"));
        if (!formData.owner.jalan_cust?.trim()) errors.push(t("jalan_cust") + t("required"));
        if (!formData.owner.no_jalan_cust?.trim()) errors.push(t("no_jalan_cust") + t("required"));
        if (!formData.owner.kota_cust?.trim()) errors.push(t("kota_cust") + t("required"));
        if (!formData.owner.state_cust?.trim()) errors.push(t("state_cust") + t("required"));
        if (!formData.owner.pos_cust?.trim()) errors.push(t("pos_cust") + t("required"));
        if (!formData.owner.negara_cust?.trim()) errors.push(t("negara_cust") + t("required"));
        break;

      case 1: // Measurement Form
        if (!formData.methods?.length) {
          errors.push(t("at_least_one") + t("metode") + t("required"));
        } else {
          formData.methods.forEach((method: any, index: number) => {
            // Check method_name (all languages must be filled)
            if (!method.method_name || Object.keys(method.method_name).length === 0) {
              errors.push(t("metode") + ` ${index + 1}: ` + t("nama") + t("required"));
            } else {
              // Check that ALL used languages have values
              usedLanguages.forEach((lang: any) => {
                if (!method.method_name[lang.value]?.trim()) {
                  errors.push(t("metode") + ` ${index + 1}: ` +  t("nama") + t("must_be_filled_for_language") + `"${lang.value}"`);
                }
              });
            }
            // Check method_desc (all languages must be filled)
            if (!method.method_desc || Object.keys(method.method_desc).length === 0) {
              errors.push(t("metode") + ` ${index + 1}: ` + t("deskripsi") + t("required"));
            } else {
              // Check that ALL used languages have values
              usedLanguages.forEach((lang: any) => {
                if (!method.method_desc[lang.value]?.trim()) {
                  errors.push(t("metode") + ` ${index + 1}: ` +  t("deskripsi") + t("must_be_filled_for_language") + `"${lang.value}"`);
                }
              });
            }
            if (!method.norm?.trim()) errors.push(t("metode") + ` ${index + 1}: ` + t("norm") + t("required"));
            if (!method.refType?.trim()) errors.push(t("metode") + ` ${index + 1}: ` + t("refType") + t("required"));
            if (method.has_image) {
              if (!method.image?.caption?.trim()) {
                errors.push(t("metode") + ` ${index + 1}: ` + t("caption") + t("required"));
              }
            }
          });
        }
        
        if (!formData.equipments?.length) {
          errors.push(t("at_least_one") + t("alat") + t("required"));
        } else {
          formData.equipments.forEach((equip: any, index: number) => {
            // Check nama_alat (all languages must be filled)
            if (!equip.nama_alat || Object.keys(equip.nama_alat).length === 0) {
              errors.push(t("alat") + ` ${index + 1}: ` + t("nama") + t("required"));
            } else {
              // Check that ALL used languages have values
              usedLanguages.forEach((lang: any) => {  
                if (!equip.nama_alat[lang.value]?.trim()) {
                  errors.push(t("alat") + ` ${index + 1}: ` +  t("nama") + t("must_be_filled_for_language") + `"${lang.value}"`);
                }
              });
            }
            // Check manuf_model (all languages must be filled)
            if (!equip.manuf_model || Object.keys(equip.manuf_model).length === 0) {
              errors.push(t("alat") + ` ${index + 1}: ` + t("manuf") + t("required"));
            } else {
              // Check that ALL used languages have values
              usedLanguages.forEach((lang: any) => {
                if (!equip.manuf_model[lang.value]?.trim()) {
                  errors.push(t("alat") + ` ${index + 1}: ` +  t("manuf") + t("must_be_filled_for_language") + `"${lang.value}"`);
                }
              });
            }
            // Check model (all languages must be filled)
            if (!equip.model || Object.keys(equip.model).length === 0) {
              errors.push(t("alat") + ` ${index + 1}: ` + t("model") + t("required"));
            } else {
              // Check that ALL used languages have values
              usedLanguages.forEach((lang: any) => {
                if (!equip.model[lang.value]?.trim()) {
                  errors.push(t("alat") + ` ${index + 1}: ` +  t("model") + t("must_be_filled_for_language") + `"${lang.value}"`);
                }
              });
            }
            if (!equip.seri_measuring?.trim()) errors.push(t("alat") + ` ${index + 1}: ` + t("nama") + t("required"));
            if (!equip.refType?.trim()) errors.push(t("alat") + ` ${index + 1}: ` + t("refType") + t("required"));
          });
        }

        if (!formData.conditions?.length) {
          errors.push(t("at_least_one") + t("kondisi") + t("required"));
        } else {
          formData.conditions.forEach((cond: any, index: number) => {
            if (!cond.jenis_kondisi?.trim()) errors.push(t("kondisi") + ` ${index + 1}: ` + t("lingkungan") + t("required"));
            // Check desc (all languages must be filled)
            if (!cond.desc || Object.keys(cond.desc).length === 0) {
              errors.push(t("kondisi") + ` ${index + 1}: ` + t("deskripsi") + t("required"));
            } else {
              // Check that ALL used languages have values
              usedLanguages.forEach((lang: any) => {
                if (!cond.desc[lang.value]?.trim()) {
                  errors.push(t("kondisi") + ` ${index + 1}: ` +  t("deskripsi") + t("must_be_filled_for_language") + `"${lang.value}"`);
                }
              });
            }
            if (!cond.tengah?.trim()) errors.push(t("kondisi") + ` ${index + 1}: ` + t("tengah") + t("required"));
            if (!cond.tengah_unit?.unit?.trim()) errors.push(t("kondisi") + ` ${index + 1}: ` + t("tengah_unit") + t("required"));
            if (!cond.rentang?.trim()) errors.push(t("kondisi") + ` ${index + 1}: ` + t("rentang") + t("required"));
            if (!cond.rentang_unit?.unit?.trim()) errors.push(t("kondisi") + ` ${index + 1}: ` + t("rentang_unit") + t("required"));
          });
        }

        if (!formData.excel || formData.excel.length === 0) {
          errors.push(t("excel_file") + t("required"));
        }
        if (!formData.sheet_name?.trim()) errors.push(t("sheet") + t("required"));
        
        if (!formData.results?.length) {
          errors.push(t("at_least_one") + "parameter" + t("required"));
        } else {
          formData.results.forEach((result: any, index: number) => {
            // Check parameters (all languages must be filled)  
            if (!result.parameters || Object.keys(result.parameters).length === 0) {
              errors.push(`Parameter ${index + 1}: ` + t("judul") + t("required"));
            } else {
              // Check that ALL used languages have values
              usedLanguages.forEach((lang: any) => {  
                if (!result.parameters[lang.value]?.trim()) {
                  errors.push(`Parameter ${index + 1}: ` +  t("judul") + t("must_be_filled_for_language") + `"${lang.value}"`);
                }
              });
            }
            if (!result.columns?.length) {
              errors.push(`Parameter ${index + 1}: ` + t("at_least_one") + t("kolom") + t("required"));
            } else {
              result.columns.forEach((col: any, colIndex: number) => {
                // Check kolom (all languages must be filled) 
                if (!col.kolom || Object.keys(col.kolom).length === 0) {
                  errors.push(`Parameter ${index + 1}, ` + t("kolom") + `${colIndex + 1}: `+ t("kolom_name") + t("required"));
                } else {
                  // Check that ALL used languages have values
                  usedLanguages.forEach((lang: any) => {  
                    if (!col.kolom[lang.value]?.trim()) {
                      errors.push(`Parameter ${index + 1}, ` + t("kolom") + `${colIndex + 1}: `+ t("kolom_name") + t("must_be_filled_for_language") + `"${lang.value}"`);
                    }
                  });
                }
                if (!col.refType?.trim()) errors.push(`Parameter ${index + 1}, ` + t("kolom") + `${colIndex + 1}: `+ t("refType") + t("required"));
                if (!col.real_list?.trim()) errors.push(`Parameter ${index + 1}, ` + t("kolom") + `${colIndex + 1}: `+ t("subkolom") + t("required"));
              });
            }
            if (!result.uncertainty?.factor?.trim()) errors.push(`Parameter ${index + 1}: ` + t("factor") + t("required"));
            if (!result.uncertainty?.probability?.trim()) errors.push(`Parameter ${index + 1}: ` + t("probability") + t("required"));
            if (!result.uncertainty?.distribution?.trim()) errors.push(`Parameter ${index + 1}: ` + t("distribution") + t("required"));
          });
        }
        break;

      case 2: // Statements
        if (!formData.statements?.length) {
          errors.push(t("at_least_one") + t("statement") + t("required"));
        } else {
          formData.statements.forEach((stmt: any, index: number) => {
            // Check values (all languages must be filled)
            if (!stmt.values || Object.keys(stmt.values).length === 0) {
              errors.push(t("statement") + ` ${index + 1}: ` + t("statement_text") + t("required"));
            } else {
              // Check that ALL used languages have values
              usedLanguages.forEach((lang: any) => {  
                if (!stmt.values[lang.value]?.trim()) {
                  errors.push(t("statement") + ` ${index + 1}: ` +  t("statement_text") + t("must_be_filled_for_language") + `"${lang.value}"`);
                }
              });
            }
            if (!stmt.refType?.trim()) errors.push(t("statement") + ` ${index + 1}: ` + t("refType") + t("required"));
            if (stmt.has_image) {
              if (!stmt.image?.caption?.trim()) {
                errors.push(t("statement") + ` ${index + 1}: ` + t("caption") + t("required"));
              }
            }
          });
        }
        break;

      case 3: // Comment
        if (!formData.comment.title?.trim()) errors.push(t("comment_title") + t("required"));
        if (!formData.comment.desc || Object.keys(formData.comment.desc).length === 0) {
          errors.push(t("comment_desc") + t("required"));
        } else {
          // Check that ALL used languages have values
          usedLanguages.forEach((lang: any) => {
            const langValue = lang.value as string;
            const descValue = (formData.comment.desc as any)[langValue]; // Type assertion to fix the error
            if (!descValue?.trim()) {
              errors.push(t("comment_desc") + t("must_be_filled_for_language") + `"${lang.value}"`);
            }
          });
        }
        break;
    }

    return errors;
  };

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

      console.log("Sending preview data:", sanitizeData(modifiedFormData));

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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      // Run validation and get errors immediately
      const errors = getValidationErrors();
      
      if (errors.length > 0) {
        // Show specific validation errors immediately
        toast("Please fill in all required fields:", {
          description: (
            <ul className="list-disc pl-5">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )
        });
        return;
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
      
      <div className="space-y-10 mt-10">
        {currentStep === 0 && (
          <AdministrativeForm
            formData={formData}
            updateFormData={updateFormData}
          />
        )}
        {currentStep === 1 && (
          <MeasurementForm
            formData={formData}
            updateFormData={updateFormData}
            setFileName={setFileName}
          />
        )}
        {currentStep === 2 && (
          <Statements 
            formData={formData} 
            updateFormData={updateFormData}
          />
        )}
        {currentStep === 3 && (
          <Comment 
            formData={formData} 
            updateFormData={updateFormData}
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
          <Button 
            onClick={nextStep} 
            variant="blue" 
            disabled={isProcessingSubmission}
          >
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}