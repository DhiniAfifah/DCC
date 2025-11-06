export function getValidationErrors(formData: any, currentStep: number, t: (key: string) => string): string[] {
  const errors: string[] = [];

  const usedLanguages = formData.administrative_data.used_languages?.filter(
    (lang: any) => lang.value && lang.value.trim()
  ) || [];
  
  switch (currentStep) {
    case 0: // Administrative Form
      validateAdministrativeForm(formData, usedLanguages, errors, t);
      break;
    case 1: // Measurement Form
      validateMeasurementForm(formData, usedLanguages, errors, t);
      break;
    case 2: // Statements
      validateStatementsForm(formData, usedLanguages, errors, t);
      break;
    case 3: // Comment
      validateCommentForm(formData, usedLanguages, errors, t);
      break;
  }

  return errors;
}

function validateAdministrativeForm(formData: any, usedLanguages: any[], errors: string[], t: (key: string) => string) {
  if (!formData.software?.trim()) errors.push(t("software_name") + t("required"));
  if (!formData.version?.trim()) errors.push(t("software_version") + t("required"));
  
  if (!formData.administrative_data.country_code?.trim()) errors.push(t("negara_calib") + t("required"));
  if (!formData.administrative_data.tempat?.trim()) errors.push(t("tempat") + t("required"));
  if (!formData.administrative_data.tempat_pdf?.trim()) errors.push(t("tempat") + t("required"));
  if (!formData.administrative_data.used_languages?.some((lang: any) => lang.value)) {
    errors.push(t("at_least_one") + t("used") + t("required"));
  }
  if (!formData.administrative_data.mandatory_languages?.some((lang: any) => lang.value)) {
    errors.push(t("at_least_one") + t("mandatory") + t("required"));
  }
  if (!formData.administrative_data.order?.trim()) errors.push(t("order") + t("required"));
  if (!formData.administrative_data.sertifikat?.trim()) errors.push(t("sertifikat") + t("required"));

  if (!formData.Measurement_TimeLine.tgl_mulai) errors.push(t("mulai") + t("required"));
  if (!formData.Measurement_TimeLine.tgl_akhir) errors.push(t("akhir") + t("required"));

  // Validate objects
  if (!formData.objects?.length) {
    errors.push(t("at_least_one") + t("objek") + t("required"));
  } else {
    validateMultilingualFields(formData.objects, "objek", usedLanguages, errors, t, [
      { field: "jenis", name: "jenis" },
      { field: "id_lain", name: "id_lain" },
    ], [
      { field: "merek", name: "merek" },
      { field: "tipe", name: "tipe" },
      { field: "item_issuer", name: "identifikasi" },
      { field: "seri_item", name: "seri" },
    ]);
  }

  // Validate responsible persons
  validateResponsiblePersons(formData, errors, t);
  
  // Validate owner
  validateOwner(formData, errors, t);
}

function validateMeasurementForm(formData: any, usedLanguages: any[], errors: string[], t: (key: string) => string) {
  // Validate methods
  if (!formData.methods?.length) {
    errors.push(t("at_least_one") + t("metode") + t("required"));
  } else {
    formData.methods.forEach((method: any, index: number) => {
      validateMultilingualField(method.method_name, `${t("metode")} ${index + 1}: ${t("nama")}`, usedLanguages, errors, t);
      validateMultilingualField(method.method_desc, `${t("metode")} ${index + 1}: ${t("deskripsi")}`, usedLanguages, errors, t);
      
      if (!method.norm?.trim()) errors.push(`${t("metode")} ${index + 1}: ${t("norm")}${t("required")}`);
      if (!method.refType?.trim()) errors.push(`${t("metode")} ${index + 1}: ${t("refType")}${t("required")}`);
      
      if (method.has_image) {
        validateImages(method.image, `${t("metode")} ${index + 1}`, errors, t);
      }
    });
  }

  // Validate equipments
  if (!formData.equipments?.length) {
    errors.push(t("at_least_one") + t("alat") + t("required"));
  } else {
    validateMultilingualFields(formData.equipments, "alat", usedLanguages, errors, t, [
      { field: "nama_alat", name: "nama" },
      { field: "manuf_model", name: "manuf" },
      { field: "model", name: "model" },
    ], [
      { field: "seri_measuring", name: "seri" },
      { field: "refType", name: "refType" },
    ]);
  }

  // Validate conditions
  if (!formData.conditions?.length) {
    errors.push(t("at_least_one") + t("kondisi") + t("required"));
  } else {
    formData.conditions.forEach((cond: any, index: number) => {
      if (!cond.jenis_kondisi?.trim()) errors.push(`${t("kondisi")} ${index + 1}: ${t("lingkungan")}${t("required")}`);
      validateMultilingualField(cond.desc, `${t("kondisi")} ${index + 1}: ${t("deskripsi")}`, usedLanguages, errors, t);
      
      if (!cond.tengah?.trim()) errors.push(`${t("kondisi")} ${index + 1}: ${t("tengah")}${t("required")}`);
      if (!cond.tengah_unit?.unit?.trim()) errors.push(`${t("kondisi")} ${index + 1}: ${t("tengah_unit")}${t("required")}`);
      if (!cond.rentang?.trim()) errors.push(`${t("kondisi")} ${index + 1}: ${t("rentang")}${t("required")}`);
      if (!cond.rentang_unit?.unit?.trim()) errors.push(`${t("kondisi")} ${index + 1}: ${t("rentang_unit")}${t("required")}`);
    });
  }

  // Validate results
  if (!formData.results?.length) {
    errors.push(t("at_least_one") + "parameter" + t("required"));
  } else {
    validateResults(formData.results, usedLanguages, errors, t);
  }
}

function validateStatementsForm(formData: any, usedLanguages: any[], errors: string[], t: (key: string) => string) {
  if (!formData.statements?.length) {
    errors.push(t("at_least_one") + t("statement") + t("required"));
  } else {
    formData.statements.forEach((stmt: any, index: number) => {
      validateMultilingualField(stmt.values, `${t("statement")} ${index + 1}: ${t("statement_text")}`, usedLanguages, errors, t);
      
      if (!stmt.refType?.trim()) errors.push(`${t("statement")} ${index + 1}: ${t("refType")}${t("required")}`);
      
      if (stmt.has_image) {
        validateImages(stmt.image, `${t("statement")} ${index + 1}`, errors, t);
      }
    });
  }
}

function validateCommentForm(formData: any, usedLanguages: any[], errors: string[], t: (key: string) => string) {
  if (!formData.comment.title?.trim()) errors.push(t("comment_title") + t("required"));
  
  validateMultilingualField(formData.comment.desc, t("comment_desc"), usedLanguages, errors, t);
  
  if (formData.comment.has_file) {
    formData.comment.files.forEach((file: any, index: number) => {
      const hasUploadedFile = (file.fileName && typeof file.fileName === 'string') || (file.base64 && file.base64.trim());
      if (!hasUploadedFile) {
        errors.push(`${t("comment_file")} ${index + 1}: File ${t("required")}${t("uncheck_file")}`);
      }
    });
  }
}

// Helper functions
function validateMultilingualField(field: any, fieldName: string, usedLanguages: any[], errors: string[], t: (key: string) => string) {
  if (!field || Object.keys(field).length === 0) {
    errors.push(`${fieldName}${t("required")}`);
  } else {
    usedLanguages.forEach((lang: any) => {
      if (!field[lang.value]?.trim()) {
        errors.push(`${fieldName}${t("must_be_filled_for_language")}"${lang.value}"`);
      }
    });
  }
}

function validateMultilingualFields(
  items: any[], 
  itemType: string, 
  usedLanguages: any[], 
  errors: string[], 
  t: (key: string) => string,
  multilingualFields: Array<{field: string, name: string}>,
  simpleFields: Array<{field: string, name: string}>
) {
  items.forEach((item: any, index: number) => {
    multilingualFields.forEach(({field, name}) => {
      validateMultilingualField(item[field], `${t(itemType)} ${index + 1}: ${t(name)}`, usedLanguages, errors, t);
    });
    
    simpleFields.forEach(({field, name}) => {
      if (!item[field]?.trim()) errors.push(`${t(itemType)} ${index + 1}: ${t(name)}${t("required")}`);
    });
  });
}

function validateImages(images: any[], context: string, errors: string[], t: (key: string) => string) {
  images.forEach((img: any, imgIndex: number) => {
    const hasUploadedImage = (img.fileName && typeof img.fileName === 'string') || (img.base64 && img.base64.trim());
    
    if (!hasUploadedImage) {
      errors.push(`${context}, ${t("gambar")} ${imgIndex + 1}: ${t("figure_file")}${t("required")}${t("uncheck_gambar")}`);
    }
    
    if (hasUploadedImage && (!img.caption || !img.caption.trim())) {
      errors.push(`${context}, ${t("gambar")} ${imgIndex + 1}: ${t("caption")}${t("required")}`);
    }
  });
}

function validateResponsiblePersons(formData: any, errors: string[], t: (key: string) => string) {
  if (!formData.responsible_persons.pelaksana?.length) {
    errors.push(t("at_least_one") + t("pelaksana") + t("required"));
  } else {
    formData.responsible_persons.pelaksana.forEach((person: any, index: number) => {
      if (!person.nama_resp?.trim()) errors.push(`${t("pelaksana")} ${index + 1}: ${t("nama")}${t("required")}`);
      if (!person.nip?.trim()) errors.push(`${t("pelaksana")} ${index + 1}: ${t("nip")}${t("required")}`);
    });
  }
  
  if (!formData.responsible_persons.penyelia?.length) {
    errors.push(t("at_least_one") + t("penyelia") + t("required"));
  } else {
    formData.responsible_persons.penyelia.forEach((person: any, index: number) => {
      if (!person.nama_resp?.trim()) errors.push(`${t("penyelia")} ${index + 1}: ${t("nama")}${t("required")}`);
      if (!person.nip?.trim()) errors.push(`${t("penyelia")} ${index + 1}: ${t("nip")}${t("required")}`);
    });
  }
  
  if (!formData.responsible_persons.kepala.nama_resp?.trim()) errors.push(t("nama_kepala") + t("required"));
  if (!formData.responsible_persons.kepala.nip?.trim()) errors.push(t("nip_kepala") + t("required"));
  if (!formData.responsible_persons.kepala.peran?.trim()) errors.push(t("lab_kepala") + t("required"));
  if (!formData.responsible_persons.direktur.nama_resp?.trim()) errors.push(t("nama_direktur") + t("required"));
  if (!formData.responsible_persons.direktur.nip?.trim()) errors.push(t("nip_direktur") + t("required"));
  if (!formData.responsible_persons.direktur.peran?.trim()) errors.push(t("jabatan_direktur") + t("required"));
}

function validateOwner(formData: any, errors: string[], t: (key: string) => string) {
  if (!formData.owner.nama_cust?.trim()) errors.push(t("nama_cust") + t("required"));
  if (!formData.owner.jalan_cust?.trim()) errors.push(t("jalan_cust") + t("required"));
  if (!formData.owner.no_jalan_cust?.trim()) errors.push(t("no_jalan_cust") + t("required"));
  if (!formData.owner.kota_cust?.trim()) errors.push(t("kota_cust") + t("required"));
  if (!formData.owner.state_cust?.trim()) errors.push(t("state_cust") + t("required"));
  if (!formData.owner.pos_cust?.trim()) errors.push(t("pos_cust") + t("required"));
  if (!formData.owner.negara_cust?.trim()) errors.push(t("negara_cust") + t("required"));
}

function validateResults(results: any[], usedLanguages: any[], errors: string[], t: (key: string) => string) {
  results.forEach((result: any, index: number) => {
    validateMultilingualField(result.parameters, `Parameter ${index + 1}: ${t("judul")}`, usedLanguages, errors, t);
    
    if (!result.columns?.length) {
      errors.push(`Parameter ${index + 1}: ${t("at_least_one")}${t("kolom")}${t("required")}`);
    } else {
      result.columns.forEach((col: any, colIndex: number) => {
        validateMultilingualField(col.kolom, `Parameter ${index + 1}, ${t("kolom")}${colIndex + 1}: ${t("kolom_name")}`, usedLanguages, errors, t);
        
        if (!col.refType?.trim()) errors.push(`Parameter ${index + 1}, ${t("kolom")}${colIndex + 1}: ${t("refType")}${t("required")}`);
        if (!col.real_list?.trim()) errors.push(`Parameter ${index + 1}, ${t("kolom")}${colIndex + 1}: ${t("subkolom")}${t("required")}`);
      });
    }
    
    if (!result.uncertainty?.factor?.trim()) errors.push(`Parameter ${index + 1}: ${t("factor")}${t("required")}`);
    if (!result.uncertainty?.probability?.trim()) errors.push(`Parameter ${index + 1}: ${t("probability")}${t("required")}`);
    if (!result.uncertainty?.distribution?.trim()) errors.push(`Parameter ${index + 1}: ${t("distribution")}${t("required")}`);
  });
}