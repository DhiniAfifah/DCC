"use client";

import { useState, useEffect, useCallback } from "react";
import Stepper from "@/components/ui/stepper";
import Administrative from "@/components/administrative";
import Measurement from "@/components/measurement-temperature";
import Statements from "@/components/statements";
import Comment from "@/components/comment";
import Preview from "@/components/preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Thermometer, Send, Save, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

const pt25Template = {
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
      { // 1
        nama_resp: "Dwi Larassati, S.T.",
        nip: "",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
      { // 2
        nama_resp: "Kelvin Sapta Dewantara, S.Si.",
        nip: "",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    penyelia: [
      { // 1
        nama_resp: "Dr. Aditya Achmadi, S.Si., M.T.",
        nip: "",
        peran: "Penyelia Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    kepala: {
      nama_resp: "Dr. Aditya Achmadi, S.Si., M.T.",
      nip: "",
      peran: "Kepala Laboratorium SNSU Suhu",
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

const pt100Template = {
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
        nip: "",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
      { // 2
        nama_resp: "Kelvin Sapta Dewantara, S.Si.",
        nip: "",
        peran: "Pelaksana Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    penyelia: [
      { // 1
        nama_resp: "Dewi Larassati, S.T.",
        nip: "",
        peran: "Penyelia Kalibrasi",
        main_signer: "0",
        signature: "0",
        timestamp: "0",
      },
    ],
    kepala: {
      nama_resp: "Dr. Aditya Achmadi, S.Si., M.T.",
      nip: "",
      peran: "Kepala Laboratorium SNSU Suhu",
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

export default function CreateDCC() {
  useEffect(() => {
    document.title = "Temperature | Generator | DiCCA";
  }, []);

  const { t, language } = useLanguage();

  const [templateChangeKey, setTemplateChangeKey] = useState(0);

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
              method.image.forEach((img: any, imgIndex: number) => {
                // Check if image has been uploaded (either has fileName string or base64)
                const hasUploadedImage = (img.fileName && typeof img.fileName === 'string') || (img.base64 && img.base64.trim());
                
                if (!hasUploadedImage) {
                  errors.push(t("metode") + ` ${index + 1}, ` + t("gambar") + ` ${imgIndex + 1}: ` + t("figure_file") + t("required") + t("uncheck_gambar"));
                }
                
                // Only check caption if image has been uploaded
                if (hasUploadedImage && (!img.caption || !img.caption.trim())) {
                  errors.push(t("metode") + ` ${index + 1}, ` + t("gambar") + ` ${imgIndex + 1}: ` + t("caption") + t("required"));
                }
              });
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

        if (!formData.excel && !uploadedFile) {
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
                // if (!col.unit?.trim()) errors.push(`Parameter ${index + 1}, ` + t("kolom") + `${colIndex + 1}: `+ t("subkolom") + t("required"));
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
              stmt.image.forEach((img: any, imgIndex: number) => {
                // Check if image has been uploaded
                const hasUploadedImage = (img.fileName && typeof img.fileName === 'string') || 
                                        (img.base64 && img.base64.trim());
                
                if (!hasUploadedImage) {
                  errors.push(t("statement") + ` ${index + 1}, ` + t("gambar") + ` ${imgIndex + 1}: ` + t("figure_file") + t("required") + t("uncheck_gambar"));
                }
                
                // Only check caption if image has been uploaded
                if (hasUploadedImage && (!img.caption || !img.caption.trim())) {
                  errors.push(t("statement") + ` ${index + 1}, ` + t("gambar") + ` ${imgIndex + 1}: ` + t("caption") + t("required"));
                }
              });
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
        if (formData.comment.has_file) {
          formData.comment.files.forEach((file: any, index: number) => {
            // Check if file has been uploaded
            const hasUploadedFile = (file.fileName && typeof file.fileName === 'string') || (file.base64 && file.base64.trim());
            if (!hasUploadedFile) {
              errors.push(t("comment_file") + ` ${index + 1}: File ` + t("required") + t("uncheck_file"));
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

  const convertImageToBase64 = async (imagePath: string): Promise<string> => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return '';
    }
  };

  // When template changes, update formData
  useEffect(() => {
    const loadTemplate = async () => {
      if (selectedTemplate === "pt25") {
        // Load pt25 template with images
        const templateWithImages = { ...pt25Template };
        
        // Pre-fill image for method 7
        // You'll need to provide the actual image path or URL
        const imagePath1 = '/templates/propagated_uncertainty_low_temp.jpg';
        const base64Image1 = await convertImageToBase64(imagePath1);

        const imagePath2 = '/templates/propagated_uncertainty_high_temp.jpg';
        const base64Image2 = await convertImageToBase64(imagePath2);
        
        if (templateWithImages.methods[6] && templateWithImages.methods[6].has_image) {
          templateWithImages.methods[6].image[0].base64 = base64Image1;
          templateWithImages.methods[6].image[1].base64 = base64Image2;
        }
        
        setFormData(templateWithImages);
      } else if (selectedTemplate === "pt100") {
        setFormData(pt100Template);
      } else {
        setFormData(blankTemplate);
      }
      
      // Increment key to signal template change
      setTemplateChangeKey(prev => prev + 1);
    };
    
    loadTemplate();
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

  const updateFormData = useCallback((data: any) => {
    // Prevent updates if data hasn't actually changed
    setFormData((prev) => {
      if (JSON.stringify(prev) === JSON.stringify({ ...prev, ...data })) {
        return prev; // No change, return same reference
      }
      
      return {
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
              jenis: obj.jenis || {},
              merek: obj.merek || "",
              tipe: obj.tipe || "",
              item_issuer: obj.item_issuer || "",
              seri_item: obj.seri_item || "",
              id_lain: obj.id_lain || {},
            }))
          : prev.objects,
        statements: Array.isArray(data.statements)
          ? data.statements
          : prev.statements,
      };
    });
  }, []); // Remove all dependencies to make it stable

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
          if (method.has_image && Array.isArray(method.image)) {
            return {
              ...method,
              image: method.image.map(img =>
                img?.fileName && isFile(img.fileName)
                  ? {
                      ...img,
                      base64: img.fileName.name,
                      mimeType: img.mimeType,
                      fileName: img.fileName,
                    }
                  : img
              ),
            };
          }
          return method;
        }),
        statements: dataToPreview.statements.map((stmt, index) => {
          if (stmt.has_image && Array.isArray(stmt.image)) {
            return {
              ...stmt,
              image: stmt.image.map(img =>
                img?.fileName && isFile(img.fileName)
                  ? {
                      ...img,
                      base64: img.fileName.name,
                      mimeType: img.mimeType,
                      fileName: img.fileName,
                    }
                  : img
              ),
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
            column_unit: {
              prefix: col.column_unit?.prefix || "",
              unit: col.column_unit?.unit || "",
              eksponen: col.column_unit?.eksponen || "",
            },
          })),
          uncertainty: result.uncertainty
            ? {
                factor: result.uncertainty.factor || "0",
                probability: result.uncertainty.probability || "0",
                distribution: result.uncertainty.distribution || "",
                real_list: Number(result.uncertainty.real_list) || 1,
                uncertainty_unit: {
                  prefix: result.uncertainty?.uncertainty_unit?.prefix || "",
                  unit: result.uncertainty?.uncertainty_unit?.unit || "",
                  eksponen: result.uncertainty?.uncertainty_unit?.eksponen || "",
                },
              }
            : { 
                factor: "0", 
                probability: "0", 
                distribution: "",
                real_list: 1,
                uncertainty_unit: {
                  prefix: "",
                  unit: "",
                  eksponen: "",
                },
              },
        })),
        excel: fileName,
      };

      const sanitizeData = (data: any) => {
        return {
          ...data,
          methods: data.methods.map((m: any) => ({
            ...m,
            formula: m.has_formula && Array.isArray(m.formula) ? m.formula : [],
            image: m.has_image && Array.isArray(m.image) ? m.image : [],
          })),
          statements: data.statements.map((s: any) => ({
            ...s,
            formula: s.has_formula && Array.isArray(s.formula) ? s.formula : [],
            image: s.has_image && Array.isArray(s.image) ? s.image : [],
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
        toast.error("Please fill in all required fields:", {
          description: (
            <div>
              <ul className="list-disc pl-5">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              {t("strip")}
            </div>
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
      if (method.has_image && Array.isArray(method.image)) {
        return {
          ...method,
          image: method.image.map(img =>
            img?.fileName && isFile(img.fileName)
              ? {
                  ...img,
                  base64: img.fileName.name,
                  mimeType: img.mimeType,
                  fileName: img.fileName,
                }
              : img
          ),
        };
      }
      return method;
    }),
    statements: formData.statements.map((stmt, index) => {
      if (stmt.has_image && Array.isArray(stmt.image)) {
        return {
          ...stmt,
          image: stmt.image.map(img =>
            img?.fileName && isFile(img.fileName)
              ? {
                  ...img,
                  base64: img.fileName.name,
                  mimeType: img.mimeType,
                  fileName: img.fileName,
                }
              : img
          ),
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
        column_unit: {
          prefix: col.column_unit?.prefix || "",
          unit: col.column_unit?.unit || "",
          eksponen: col.column_unit?.eksponen || "",
        },
      })),
      uncertainty: result.uncertainty
        ? {
            factor: result.uncertainty.factor || "0",
            probability: result.uncertainty.probability || "0",
            real_list: Number(result.uncertainty.real_list) || 1,
            uncertainty_unit: {
              prefix: result.uncertainty?.uncertainty_unit?.prefix || "",
              unit: result.uncertainty?.uncertainty_unit?.unit || "",
              eksponen: result.uncertainty?.uncertainty_unit?.eksponen || "",
            },
          }
        : { 
            factor: "0", 
            probability: "0", 
            distribution: "",
            real_list: 1,
            uncertainty_unit: {
              prefix: "",
              unit: "",
              eksponen: "",
            },
          },
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
    setProgressMessage(t("preparing"));
    setProgressPercent(0);

    // Get the authentication token from cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];

    if (!token) {
      toast.error("Authentication required", {
        description: "Please log in to submit DCC",
        duration: 5000
      });
      setIsProcessingSubmission(false);
      return;
    }

    // Create FormData object for multipart/form-data submission
    const submitFormData = new FormData();

    // Prepare FormData for file uploads
    formData.methods.forEach((method, methodIndex) => {
      if (method.has_image && Array.isArray(method.image)) {
        method.image.forEach((img, imgIndex) => {
          if (img?.fileName && isFile(img.fileName)) {
            const file = img.fileName;

            submitFormData.append(
              `methods[${methodIndex}].image[${imgIndex}].gambar`,
              file
            );
            submitFormData.append(
              `methods[${methodIndex}].image[${imgIndex}].mimeType`,
              img.mimeType
            );
            submitFormData.append(
              `methods[${methodIndex}].image[${imgIndex}].fileName`,
              img.fileName
            );
          }
        });
      }
    });

    formData.statements.forEach((stmt, stmtIndex) => {
      if (stmt.has_image && Array.isArray(stmt.image)) {
        stmt.image.forEach((img, imgIndex) => {
          if (img?.fileName && isFile(img.fileName)) {
            const file = img.fileName;

            submitFormData.append(
              `statements[${stmtIndex}].image[${imgIndex}].gambar`,
              file
            );
            submitFormData.append(
              `statements[${stmtIndex}].image[${imgIndex}].mimeType`,
              img.mimeType
            );
            submitFormData.append(
              `statements[${stmtIndex}].image[${imgIndex}].fileName`,
              img.fileName
            );
          }
        });
      }
    });

    submitFormData.append("data", JSON.stringify(modifiedFormData));

    console.log("Data yang dikirim ke backend:", modifiedFormData);

    try {
      const response = await fetch("http://127.0.0.1:8000/create-dcc-streaming/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": language === 'id' ? 'id-ID,id;q=0.9' : 'en-US,en;q=0.9',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizeData(modifiedFormData)),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Authentication failed", {
            description: "Please log in again",
          });
          // Optionally redirect to login page
          window.location.href = '/';
          return;
        }

        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorText}`
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { value, done } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.progress !== undefined) {
                  setProgressPercent(data.progress);
                }

                if (data.message) {
                  setProgressMessage(data.message);
                }

                // Handle completion
                if (data.progress === 100 && data.download_url) {
                  setIsSubmitted(true);
                  
                  // Create download URL for the PDF
                  const downloadUrl = `http://127.0.0.1:8000${data.download_url}`;
                  setPdfBlobUrl(downloadUrl);
                  
                  toast.success(t("dcc_created_successfully"), {
                    description: `Certificate: ${data.certificate_name}`,
                    duration: 5000
                  });

                  // Hide progress after delay
                  setTimeout(() => {
                    setIsProcessingSubmission(false);
                  }, 2000);
                }

              } catch (parseError) {
                console.error("Error parsing SSE data:", parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      setProgressMessage(
        `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
      );
      setProgressPercent(0);
      setIsProcessingSubmission(false);
      
      toast.error("Failed to create DCC", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
        duration: 5000
      });
    }
  };

  const saveDraft = async (name: string, data: any) => {
    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        toast.error(t("authentication_required"));
        return;
      }
      
      const response = await fetch("http://127.0.0.1:8000/api/drafts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          data: data,
          form_type: "temperature",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success(t("draft_saved"));
      return result;
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(t("failed_to_save_draft") + ": " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  // Load draft
  const loadDraft = async (draftId: string) => {
    try {
      setIsLoadingDraft(true);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`http://127.0.0.1:8000/api/drafts/${draftId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load draft");
      }

      const draft = await response.json();
      
      // CRITICAL: Ensure data is properly formatted before setting
      const loadedData = {
        ...draft.data,
        // Ensure arrays exist
        objects: Array.isArray(draft.data.objects) ? draft.data.objects : [],
        methods: Array.isArray(draft.data.methods) ? draft.data.methods : [],
        equipments: Array.isArray(draft.data.equipments) ? draft.data.equipments : [],
        conditions: Array.isArray(draft.data.conditions) ? draft.data.conditions : [],
        results: Array.isArray(draft.data.results) ? draft.data.results : [],
        statements: Array.isArray(draft.data.statements) ? draft.data.statements : [],
        sheet_names: Array.isArray(draft.data.sheet_names) ? draft.data.sheet_names : [],
        // Ensure nested objects exist
        administrative_data: draft.data.administrative_data || blankTemplate.administrative_data,
        Measurement_TimeLine: draft.data.Measurement_TimeLine || blankTemplate.Measurement_TimeLine,
        responsible_persons: draft.data.responsible_persons || blankTemplate.responsible_persons,
        owner: draft.data.owner || blankTemplate.owner,
        comment: draft.data.comment || blankTemplate.comment,
      };
      
      setFormData(loadedData);
      
      // Increment template change key to force re-render of all child components
      setTemplateChangeKey(prev => prev + 1);
      
      toast.success(t("loaded"));
      setIsLoadingDraft(false);
    } catch (error) {
      console.error("Error loading draft:", error);
      toast.error(t("failed_to_load"));
      setIsLoadingDraft(false);
    }
  };

  // Check for draft parameter in URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const draftId = searchParams.get('draft');
    
    if (draftId) {
      // Small delay to ensure components are mounted
      setTimeout(() => {
        loadDraft(draftId);
      }, 100);
    }
  }, []); // Keep empty dependency array

  const [draftName, setDraftName] = useState<string>("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const editId = searchParams.get('edit');
    
    if (editId) {
      const loadDccForEdit = async () => {
        try {
          setIsLoadingDraft(true);
          
          // Try to get data from sessionStorage first
          const storedData = sessionStorage.getItem('editDccData');
          if (storedData) {
            const dccData = JSON.parse(storedData);
            
            // Transform data to match form structure
            const transformedData = {
              software: dccData.software || "",
              version: dccData.version || "",
              administrative_data: {
                ...dccData.administrative_data,
                // Ensure languages are in correct format
                used_languages: Array.isArray(dccData.administrative_data?.used_languages)
                  ? dccData.administrative_data.used_languages.map((lang: any) => 
                      typeof lang === 'object' && 'value' in lang ? lang : { value: lang }
                    )
                  : [],
                mandatory_languages: Array.isArray(dccData.administrative_data?.mandatory_languages)
                  ? dccData.administrative_data.mandatory_languages.map((lang: any) => 
                      typeof lang === 'object' && 'value' in lang ? lang : { value: lang }
                    )
                  : [],
              },
              Measurement_TimeLine: dccData.Measurement_TimeLine || blankTemplate.Measurement_TimeLine,
              objects: Array.isArray(dccData.objects) ? dccData.objects : [],
              responsible_persons: dccData.responsible_persons || blankTemplate.responsible_persons,
              owner: dccData.owner || blankTemplate.owner,
              methods: Array.isArray(dccData.methods) ? dccData.methods : [],
              equipments: Array.isArray(dccData.equipments) ? dccData.equipments : [],
              conditions: Array.isArray(dccData.conditions) ? dccData.conditions : [],
              results: Array.isArray(dccData.results) ? dccData.results : [],
              statements: Array.isArray(dccData.statements) ? dccData.statements : [],
              comment: dccData.comment || blankTemplate.comment,
              excel: dccData.excel || "",
              sheet_name: dccData.sheet_name || "",
              sheet_names: Array.isArray(dccData.sheet_names) ? dccData.sheet_names : [],
            };
            
            setFormData(transformedData);
            setFileName(dccData.excel || "");
            setTemplateChangeKey(prev => prev + 1);
            
            // Clear sessionStorage after loading
            sessionStorage.removeItem('editDccData');
            
            toast.success(t("loaded"));
          }
          
          setIsLoadingDraft(false);
        } catch (error) {
          console.error('Error loading DCC for edit:', error);
          toast.error(t("failed_to_load"));
          setIsLoadingDraft(false);
        }
      };
      
      setTimeout(() => {
        loadDccForEdit();
      }, 100);
    }
  }, []);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [uploadedImages, setUploadedImages] = useState<{
    methods: { [key: string]: File }[];
    statements: { [key: string]: File }[];
  }>({
    methods: [],
    statements: [],
  });

  const [uploadedCommentFiles, setUploadedCommentFiles] = useState<File[]>([]);

  return (
    <div className="container mx-auto py-8 pt-20">
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-white to-green-100"></div>

      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-50 border border-red-200 rounded-3xl shadow-sm">
          <Thermometer className="text-red-600 w-7 h-7" />
          <h1 className="text-2xl font-semibold text-red-900 tracking-wide">
            {t("suhu")}
          </h1>
        </div>
      </div>

      <Stepper
        currentStep={currentStep}
        steps={steps}
        onStepClick={setCurrentStep}
      />

      <div className="flex justify-center mt-10 mb-6 px-10">
        {currentStep !== 4 && (
          <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
            <SelectTrigger className="w-[400px] bg-white">
              <SelectValue placeholder={t("template")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t("template")}</SelectLabel>
                <SelectItem value="blank">{t("blank")}</SelectItem>
                <SelectItem value="pt25">{t("pt25")}</SelectItem>
                <SelectItem value="pt100">{t("pt100")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        {currentStep == 4 && (
          <Alert variant="destructive" className="bg-white w-fit">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>{t("close_excel")}</AlertTitle>
          </Alert>
        )}
      </div>
      
      <div className="space-y-10">
        {currentStep === 0 && (
          <Administrative
            formData={formData}
            updateFormData={updateFormData}
            templateChangeKey={templateChangeKey}
          />
        )}
        {currentStep === 1 && (
          <Measurement
            formData={formData}
            updateFormData={updateFormData}
            setFileName={setFileName}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            uploadedImages={uploadedImages.methods}
            setUploadedImages={(images) => setUploadedImages(prev => ({ ...prev, methods: images }))}
          />
        )}
        {currentStep === 2 && (
          <Statements 
            formData={formData} 
            updateFormData={updateFormData}
            uploadedImages={uploadedImages.statements}
            setUploadedImages={(images) => setUploadedImages(prev => ({ ...prev, statements: images }))}
          />
        )}
        {currentStep === 3 && (
          <Comment 
            formData={formData} 
            updateFormData={updateFormData}
            uploadedFiles={uploadedCommentFiles}
            setUploadedFiles={setUploadedCommentFiles}
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

      {isProcessingSubmission && (
        <div id="progress-bar" className="max-w-4xl mx-auto px-4 mt-8">
          <div className="p-6 bg-sky-50 rounded-lg border border-sky-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sky-800 font-semibold text-lg">{progressMessage}</p>
              <span className="text-sky-600 text-sm">{progressPercent}%</span>
            </div>

            <Progress value={progressPercent} />
            
            <div className="flex items-center justify-between text-xs text-sky-600">
              <div>
                {progressPercent > 0 && progressPercent < 100 && (
                  <div className="mt-3 flex items-center text-sm text-sky-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600 mr-2"></div>
                  </div>
                )}
              </div>
              
              <span>{t("please_wait")}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between max-w-4xl mx-auto px-4 mt-8">
        <Button variant="blue" onClick={prevStep} disabled={currentStep === 0 || isProcessingSubmission}>
          <ArrowLeft />
        </Button>

        <div className="flex justify-center gap-4 max-w-4xl mx-auto px-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="amber"
                disabled={isProcessingSubmission}
              >
                <Save />
                {t("save_draft")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("save_draft")}</DialogTitle>
                <DialogDescription>{t("draft_desc")}</DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="draft_name">{t("draft_name")}</Label>
                  <Input
                    id="draft_name"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{t("cancel")}</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    onClick={() => {
                      if (draftName.trim()) {
                        saveDraft(draftName, formData);
                        setDraftName("");
                        // Don't try to update drafts here since they're in DashboardClient
                        // The drafts will be visible when user navigates back to dashboard
                      }
                    }}
                    variant="green"
                  >
                    {t("save")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {currentStep === steps.length - 1 ? (
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={handleSubmit} 
              variant="green"
              disabled={isProcessingSubmission}
            >
              {isProcessingSubmission ? t("processing") : (
                <>
                  <Send />
                  {t("submit")}
                </>
              )}
            </Button>
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