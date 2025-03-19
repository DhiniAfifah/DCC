import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFieldArray,
  useForm,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const empty_field_error_message = "Input diperlukan.";
const FormSchema = z.object({
  methods: z.array(
    z.object({
      method_name: z.string().min(1, { message: empty_field_error_message }),
      method_desc: z.string().min(1, { message: empty_field_error_message }),
      norm: z.string().min(1, { message: empty_field_error_message }),
    })
  ),
  equipments: z.array(
    z.object({
      nama_alat: z.string().min(1, { message: empty_field_error_message }),
      manuf_model: z.string().min(1, { message: empty_field_error_message }),
      seri_measuring: z.string().min(1, { message: empty_field_error_message }),
    })
  ),
  conditions: z.object({
    suhu_desc: z.string().min(1, { message: empty_field_error_message }),
    suhu: z.string().min(1, { message: empty_field_error_message }),
    rentang_suhu: z.string().min(1, { message: empty_field_error_message }),
    lembap_desc: z.string().min(1, { message: empty_field_error_message }),
    lembap: z.string().min(1, { message: empty_field_error_message }),
    rentang_lembap: z.string().min(1, { message: empty_field_error_message }),
  }),
  excel: typeof window === 'undefined' ? z.any() : z.instanceof(FileList),
  sheet_name: z.string().min(1, { message: empty_field_error_message }),
  results: z.array(
    z.object({
      parameter: z.string().min(1, { message: empty_field_error_message }),
      columns: z.array(
        z.object({
          kolom: z.string().min(1, { message: empty_field_error_message }),
          real_list: z.array(
            z.object({
              value: z.string().min(1, { message: empty_field_error_message }),
              unit: z.string().min(1, { message: empty_field_error_message }),
            })
          ),
        })
      ),
    })
  ),
});

interface RealList {
  value: string;
  unit: string;
}

interface Column {
  kolom: string;
  real_list: RealList[];
}

interface Result {
  parameter: string;
  columns: Column[];
}

interface FormValues {
  results: Result[];
}

interface ColumnsProps {
  resultIndex: number;
  usedLanguages: { value: string }[];
}

interface RealListProps {
  resultIndex: number;
  columnIndex: number;
}

const RealLists = ({ resultIndex, columnIndex }: RealListProps) => {
  const { control, register } = useFormContext();
  const {
    fields: realListFields,
    append: appendRealList,
    remove: removeRealList,
  } = useFieldArray<FormValues>({
    name: `results.${resultIndex}.columns.${columnIndex}.real_list`,
  });

  return (
    <div id="real_list">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <FormLabel>Nilai</FormLabel>
          <FormLabel>Satuan</FormLabel>
        </div>
        {realListFields.map((realListField, realListIndex) => (
          <div key={realListField.id} className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div id="value">
                <FormField
                  control={control}
                  name={`results.${resultIndex}.columns.${columnIndex}.real_list.${realListIndex}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div id="unit">
                <FormField
                  control={control}
                  name={`results.${resultIndex}.columns.${columnIndex}.real_list.${realListIndex}.unit`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {realListFields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeRealList(realListIndex)}
                className="self-end" // Aligns button with input fields
              >
                ✕
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => appendRealList({ value: "", unit: "" })}
      >
        <p className="text-xl">+</p>
      </Button>
    </div>
  );
};

const Columns = ({ resultIndex, usedLanguages }: ColumnsProps) => {
  const { control, register } = useFormContext();
  const {
    fields: columnFields,
    append: appendColumn,
    remove: removeColumn,
  } = useFieldArray<FormValues>({
    name: `results.${resultIndex}.columns`,
  });

  return (
    <div id="columns" className="grid grid-cols-2 gap-4">
      {columnFields.map((columnField, columnIndex) => (
        <Card key={columnField.id} id="kolom">
          <CardHeader></CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 border-b pb-4 relative">
              <p className="text-sm text-muted-foreground">
                Kolom {columnIndex + 1}
              </p>

              {columnFields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0"
                  onClick={() => removeColumn(columnIndex)}
                >
                  ✕
                </Button>
              )}

              <div id="kolom">
                <FormLabel>Nama Kolom</FormLabel>
                <div className="space-y-2">
                  {usedLanguages.map((lang: { value: string }, langIndex: number) => (
                    <FormField 
                      key={langIndex} 
                      control={control} 
                      name={`results.${resultIndex}.columns.${columnIndex}.kolom`}
                      render={({ field }) => (
                        <>
                          <FormItem>
                            <FormControl>
                              <Input placeholder={`Bahasa: ${lang.value}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        </>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        size="sm"
        className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
        onClick={() =>
          appendColumn({
            kolom: "",
            real_list: [{ value: "", unit: "" }],
          })
        }
      >
        <p className="text-xl">+</p>
      </Button>
    </div>
  );
};

export default function MeasurementForm({
  formData,
  updateFormData,
  setFileName
}: {
  formData: any;
  updateFormData: (data: any) => void;
  setFileName: (name: string) => void;
}) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateFormData(values);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const {
    fields: methodFields,
    append: appendMethod,
    remove: removeMethod,
  } = useFieldArray({
    control: form.control,
    name: "methods",
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
  } = useFieldArray({
    control: form.control,
    name: "equipments",
  });

  const fileRef = form.register("excel");

  const { control, handleSubmit, register } = form;
  const {
    fields: resultFields,
    append: appendResult,
    remove: removeResult,
  } = useFieldArray({
    control,
    name: "results",
  });

  const [fileName] = useState<string | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
  
      const formData = new FormData();
      formData.append("excel", file); // Ensure the key matches the backend
  
      try {
        const response = await fetch("http://127.0.0.1:8000/upload-excel/", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) throw new Error("Failed to upload file");
  
        const result = await response.json();
        console.log("File uploaded:", result);
        
        setFileName(result.filename); // Store the filename after upload
        setSheets(result.sheets || []); // Store the extracted sheet names
        alert(`File uploaded successfully: ${result.filename}`);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("File upload failed.");
      }
    }
  };

  const usedLanguages = form.watch("used_languages") || [];

  const onSubmit = async (data: any) => {
    try {
      const formData = { ...data, excel: fileName }; // Include the uploaded file name
  
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorResult = await response.json();
        console.error("Error response from server:", errorResult);
        alert(`Failed to create DCC: ${errorResult.detail}`);
        return;
      }
  
      const result = await response.json();
      console.log("DCC Created:", result);
      alert(`DCC Created! Download: ${result.download_link}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          console.log("Form submitted!");
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-6 max-w-4xl mx-auto p-4"
      >
        <div className="space-y-6 max-w-4xl mx-auto p-4">
          <Card id="used_method">
            <CardHeader>
              <CardTitle>Metode</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                {methodFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-4 border-b pb-4 relative"
                  >
                    <p className="text-sm text-muted-foreground">
                      Metode {index + 1}
                    </p>
                    {methodFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => removeMethod(index)}
                      >
                        ✕
                      </Button>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div id="method_name">
                        <FormLabel>Nama</FormLabel>
                        <FormField
                          control={form.control}
                          name={`methods.${index}.method_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div id="norm">
                        <FormLabel>Norm</FormLabel>
                        <FormField
                          control={form.control}
                          name={`methods.${index}.norm`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div id="method_desc">
                      <FormLabel>Deskripsi</FormLabel>
                      <FormField
                        control={form.control}
                        name={`methods.${index}.method_desc`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
                onClick={() =>
                  appendMethod({ method_name: "", method_desc: "", norm: "" })
                }
              >
                <p className="text-xl">+</p>
              </Button>
            </CardContent>
          </Card>

          <Card id="measuring_equipment">
            <CardHeader>
              <CardTitle>Alat Pengukuran</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                {equipmentFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-4 border-b pb-4 relative"
                  >
                    <p className="text-sm text-muted-foreground">
                      Alat {index + 1}
                    </p>
                    {equipmentFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => removeEquipment(index)}
                      >
                        ✕
                      </Button>
                    )}
                    <div id="nama_alat">
                      <FormLabel>Nama</FormLabel>
                      <FormField
                        control={form.control}
                        name={`equipments.${index}.nama_alat`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div id="manuf_model">
                        <FormLabel>Manufacturer dan Model</FormLabel>
                        <FormField
                          control={form.control}
                          name={`equipments.${index}.manuf_model`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div id="seri_measuring">
                        <FormLabel>Nomor Seri</FormLabel>
                        <FormField
                          control={form.control}
                          name={`equipments.${index}.seri_measuring`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
                onClick={() =>
                  appendEquipment({
                    nama_alat: "",
                    manuf_model: "",
                    seri_measuring: "",
                  })
                }
              >
                <p className="text-xl">+</p>
              </Button>
            </CardContent>
          </Card>

          <Card id="influence_condition">
            <CardHeader>
              <CardTitle>Kondisi Ruangan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                <div id="suhu" className="grid gap-4 border-b pb-4 relative">
                  <p className="text-sm font-bold">
                    Suhu
                  </p>
                  <div id="suhu_desc">
                    <FormLabel>Deskripsi</FormLabel>
                    <FormField
                      control={form.control}
                      name={`conditions.suhu_desc`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div id="titik_tengah">
                      <FormLabel>Titik Tengah</FormLabel>
                      <FormField
                        control={form.control}
                        name={`conditions.suhu`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div id="rentang">
                      <FormLabel>Rentang</FormLabel>
                      <FormField
                        control={form.control}
                        name={`conditions.rentang_suhu`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div id="lembap" className="grid gap-4 pb-4 relative">
                  <p className="text-sm font-bold">
                    Kelembapan
                  </p>
                  <div id="lembap_desc">
                    <FormLabel>Deskripsi</FormLabel>
                    <FormField
                      control={form.control}
                      name={`conditions.lembap_desc`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div id="titik_tengah">
                      <FormLabel>Titik Tengah</FormLabel>
                      <FormField
                        control={form.control}
                        name={`conditions.lembap`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div id="rentang">
                      <FormLabel>Rentang</FormLabel>
                      <FormField
                        control={form.control}
                        name={`conditions.rentang_lembap`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="excel">
            <CardHeader>
              <CardTitle>Excel</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div id="excel_file">
                    <FormLabel>Upload File Excel</FormLabel>
                    <FormField
                      control={form.control}
                      name="excel"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormControl>
                              <Input type="file" {...fileRef} accept=".xls,.xlsx" onChange={handleFileUpload} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                  <div id="sheet">
                    <FormLabel>Nama Sheet Laporan</FormLabel>
                    <FormField 
                      control={form.control} 
                      name="sheet_name"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sheets.map((sheet, index) => (
                                <SelectItem key={index} value={sheet}>
                                  {sheet}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="hasil">
            <CardHeader>
              <CardTitle>Hasil</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                {resultFields.map((resultField, resultIndex) => (
                  <div key={resultField.id} className="grid gap-4 border-b pb-4 relative">
                    <p className="text-sm text-muted-foreground">Parameter {resultIndex  + 1}</p>

                    {resultFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => removeResult(resultIndex)}
                      >
                        ✕
                      </Button>
                    )}

                    <div id="parameter">
                      <FormLabel>Parameter (Judul Tabel)</FormLabel>
                      <div className="space-y-2">
                         {usedLanguages.map((lang: { value: string }, langIndex: number) => (
                           <FormField 
                             key={langIndex} 
                             control={form.control} 
                             name={`results.${resultIndex}.parameters.${langIndex}`}
                             render={({ field }) => (
                               <>
                                 <FormItem>
                                   <FormControl>
                                     <Input placeholder={`Bahasa: ${lang.value}`} {...field} />
                                   </FormControl>
                                   <FormMessage />
                                 </FormItem>
                               </>
                             )}
                           />
                         ))}
                       </div>
                    </div>

                    <Columns resultIndex={resultIndex} usedLanguages={usedLanguages} />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
                onClick={() =>
                  appendResult({ 
                    parameter: "", 
                    columns: [{ 
                      kolom: "", 
                      real_list: [{ 
                        value: "", 
                        unit: ""
                      }]
                    }]  
                  })
                }
              >
                <p className="text-xl">+</p>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </FormProvider>
  );
}
