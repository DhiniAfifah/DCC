import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import {
  useFieldArray,
  useForm,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { useEffect, useState, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area";
import { MathJax, MathJaxContext } from "better-react-mathjax";

const empty_field_error_message = "Input diperlukan.";
const FormSchema = z.object({
  methods: z.array(
    z.object({
      method_name: z.string().min(1, { message: empty_field_error_message }),
      method_desc: z.string().min(1, { message: empty_field_error_message }),
      norm: z.string().min(1, { message: empty_field_error_message }),
      has_formula: z.boolean().default(false),
      formula: z.object({
        latex: z.string().optional(),
        mathml: z.string().optional(),
      }).optional(),
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
    suhu: z.object({
      jenis_kondisi: z.string().min(1, { message: empty_field_error_message }),
      desc: z.string().min(1, { message: empty_field_error_message }),
      tengah: z.string().min(1, { message: empty_field_error_message }),
      tengah_unit: z.string().min(1, { message: empty_field_error_message }),
      rentang: z.string().min(1, { message: empty_field_error_message }),
      rentang_unit: z.string().min(1, { message: empty_field_error_message }),
    }),
    lembap: z.object({
      jenis_kondisi: z.string().min(1, { message: empty_field_error_message }),
      desc: z.string().min(1, { message: empty_field_error_message }),
      tengah: z.string().min(1, { message: empty_field_error_message }),
      tengah_unit: z.string().min(1, { message: empty_field_error_message }),
      rentang: z.string().min(1, { message: empty_field_error_message }),
      rentang_unit: z.string().min(1, { message: empty_field_error_message }),
    }),
    other: z.array(
      z.object({
        jenis_kondisi: z.string().min(1, { message: empty_field_error_message }),
        desc: z.string().min(1, { message: empty_field_error_message }),
        tengah: z.string().min(1, { message: empty_field_error_message }),
        tengah_unit: z.string().min(1, { message: empty_field_error_message }),
        rentang: z.string().min(1, { message: empty_field_error_message }),
        rentang_unit: z.string().min(1, { message: empty_field_error_message }),
      }),
    ),
  }),
  excel: typeof window === 'undefined' ? z.any() : z.instanceof(FileList),
  sheet_name: z.string().min(1, { message: empty_field_error_message }),
  results: z.array(
    z.object({
      parameter: z.string().min(1, { message: empty_field_error_message }),
      columns: z.array(
        z.object({
          kolom: z.string().min(1, { message: empty_field_error_message }),
          real_list: z.string().min(1, { message: empty_field_error_message }),
        })
      ),
      uncertainty: z.array(
        z.object({
          factor: z.string().min(1, { message: empty_field_error_message }),
          probability: z.string().min(1, { message: empty_field_error_message }),
          distribution: z.string().min(1, { message: empty_field_error_message }),
          real_list: z.string().min(1, { message: empty_field_error_message }),
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
//   const { control, register } = useFormContext();
//   const {
//     fields: realListFields,
//     append: appendRealList,
//     remove: removeRealList,
//   } = useFieldArray<FormValues>({
//     name: `results.${resultIndex}.columns.${columnIndex}.real_list`,
//   });

//   return (
//     <div id="real_list">
//       <div className="space-y-2">
//         <div className="grid grid-cols-2 gap-4">
//           <FormLabel>Nilai</FormLabel>
//           <FormLabel>Satuan</FormLabel>
//         </div>
//         {realListFields.map((realListField, realListIndex) => (
//           <div key={realListField.id} className="flex items-center gap-2">
//             <div className="grid grid-cols-2 gap-4 flex-1">
//               <div id="value">
//                 <FormField
//                   control={control}
//                   name={`results.${resultIndex}.columns.${columnIndex}.real_list.${realListIndex}.value`}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div id="unit">
//                 <FormField
//                   control={control}
//                   name={`results.${resultIndex}.columns.${columnIndex}.real_list.${realListIndex}.unit`}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>
//             {realListFields.length > 1 && (
//               <Button
//                 type="button"
//                 variant="destructive"
//                 size="icon"
//                 onClick={() => removeRealList(realListIndex)}
//                 className="self-end" // Aligns button with input fields
//               >
//                 <X />
//               </Button>
//             )}
//           </div>
//         ))}
//       </div>
//       <Button
//         type="button"
//         variant="outline"
//         size="sm"
//         className="mt-2"
//         onClick={() => appendRealList({ value: "", unit: "" })}
//       >
//         <p className="text-xl"><Plus /></p>
//       </Button>
//     </div>
//   );
// };

const Columns = ({ resultIndex, usedLanguages }: ColumnsProps) => {
  const { control, register } = useFormContext();
  const [selectedDistribution, setDistribution] = useState<string>("");
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
                  <X />
                </Button>
              )}

              <div id="nama">
                <FormLabel>Nama Kolom</FormLabel>
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

              <div id="realList">
                <FormLabel>Jumlah Sub-kolom (nilai dan satuan)</FormLabel>
                <FormField
                  control={control}
                  name={`results.${resultIndex}.columns.${columnIndex}.real_list`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
        <p className="text-xl"><Plus /></p>
      </Button>

      <Card id="uncertainty">
        <CardHeader>
          <h3 className="text-sm font-semibold">Ketidakpastian</h3>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div id="factor" className="grid gap-1">
            <FormLabel>Coverage Factor</FormLabel>
            <FormField
              control={control}
              name={`results.${resultIndex}.uncertainty.factor`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d{0,2}$/.test(value)) {
                          field.onChange(e);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div id="probability" className="grid gap-1">
            <FormLabel>Coverage Probability</FormLabel>
            <FormField
              control={control}
              name={`results.${resultIndex}.uncertainty.probability`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      max="1"
                      step={"0.1"}
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d{0,2}$/.test(value)) {
                          field.onChange(e);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div id="distribution" className="grid gap-1">
            <FormLabel>Distribution</FormLabel>
            <FormField
              control={control}
              name={`results.${resultIndex}.uncertainty.distribution`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormItem>
                      <Select
                        onValueChange={(value) => {
                          setDistribution(value);
                          field.onChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="segiempat">Segiempat</SelectItem>
                          <SelectItem value="segitiga">Segitiga</SelectItem>
                          <SelectItem value="other">other</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedDistribution === "other" && (
                        <Input
                          placeholder="Masukkan distribusi lain"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
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

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control: form.control,
    name: "conditions.other",
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

  const [selectedSuhuTengahUnit, setSelectedSuhuTengahUnit] = useState("");
  const [selectedSuhuRentangUnit, setSelectedSuhuRentangUnit] = useState("");

  const [fileName] = useState<string | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [showFields, setShowFields] = useState(false);

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

  const handleAddCondition = () => {
    setShowFields(true);
    appendCondition({
      jenis_kondisi: "",
      desc: "",
      tengah: "",
      tengah_unit: "",
      rentang: "",
      rentang_unit: "",
    });
  };

  const usedLanguages = form.watch("used_languages") || [];

  const onSubmit = async (data: any) => {
    try {
      const cleanedMethods = data.methods.map((method: any, index: number) => {
        if (!method.has_formula) {
          form.setValue(`methods.${index}.formula`, ""); // Clear formula in form state
          const { formula, ...rest } = method;
          return rest;
        }
        return method;
      });
      
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
                        <X />
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

                    <div id="checkbox_rumus">
                      <FormField
                        control={form.control}
                        name={`methods.${index}.has_formula`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value}
                                onCheckedChange={(checked) => field.onChange(checked)}
                              />
                            </FormControl>
                            <FormLabel>Ada rumus di metode ini</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    {useEffect(() => {
                      if (!form.watch(`methods.${index}.has_formula`)) {
                        form.setValue(`methods.${index}.formula`, ""); // Reset the formula field
                      }
                    }, [form.watch(`methods.${index}.has_formula`), form, index])}

                    {form.watch(`methods.${index}.has_formula`) && (
                      <div id="rumus" className="mt-2">
                        <FormLabel>Rumus</FormLabel>
                          <div className="grid grid-cols-2 gap-1">
                            <FormField
                              control={form.control}
                              name={`methods.${index}.formula.latex`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="LaTeX" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`methods.${index}.formula.mathml`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="MathML" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-1"
                            onClick={() => {
                              const latex = form.getValues(`methods.${index}.formula.latex`);
                              const encodedLatex = encodeURIComponent(latex || "");

                              const popup = window.open(
                                `/editor_latex.html?latex=${encodedLatex}`, // adjust to your actual path
                                'mathEditorPopup',
                                'width=800,height=600'
                              );
                          
                              // Define the callback function to receive LaTeX from the popup
                              window.ShowLatexResult = (latex, mathml) => {
                                form.setValue(`methods.${index}.formula.latex`, latex);
                                form.setValue(`methods.${index}.formula.mathml`, mathml);
                              };                          
                            }}
                          >
                            Buka editor
                          </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
                onClick={() =>
                  appendMethod({ method_name: "", method_desc: "", norm: "", has_formula: false, formula: "" })
                }
              >
                <p className="text-xl"><Plus /></p>
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
                        <X />
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
                <p className="text-xl"><Plus /></p>
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
                      name={`conditions.suhu.desc`}
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
                  <div id="tengah">
                    <FormLabel>Titik Tengah</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div id="tengah_value">
                        <FormField
                          control={form.control}
                          name={`conditions.suhu.tengah`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Nilai" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div id="tengah_unit">
                        <FormField
                          control={form.control}
                          name={`conditions.suhu.tengah_unit`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={(value) => {
                                  setSelectedSuhuTengahUnit(value);
                                  field.onChange(value);
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Satuan" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="°C">°C</SelectItem>
                                  <SelectItem value="°F">°F</SelectItem>
                                  <SelectItem value="K">K</SelectItem>
                                  <SelectItem value="other">other</SelectItem>
                                </SelectContent>
                              </Select>
                              {selectedSuhuTengahUnit === "other" && (
                                <Input
                                  placeholder="Masukkan satuan lain"
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div id="rentang">
                    <FormLabel>Rentang</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div id="rentang_value">
                        <FormField
                          control={form.control}
                          name={`conditions.suhu.rentang`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Nilai" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div id="rentang_unit">
                        <FormField
                          control={form.control}
                          name={`conditions.suhu.rentang_unit`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={(value) => {
                                  setSelectedSuhuRentangUnit(value);
                                  field.onChange(value);
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Satuan" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="°C">°C</SelectItem>
                                  <SelectItem value="°F">°F</SelectItem>
                                  <SelectItem value="K">K</SelectItem>
                                  <SelectItem value="other">other</SelectItem>
                                </SelectContent>
                              </Select>
                              {selectedSuhuRentangUnit === "other" && (
                                <Input
                                  placeholder="Masukkan satuan lain"
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div id="lembap" className="grid gap-4 border-b pb-4 relative">
                  <p className="text-sm font-bold">
                    Kelembapan
                  </p>
                  <div id="lembap_desc">
                    <FormLabel>Deskripsi</FormLabel>
                    <FormField
                      control={form.control}
                      name={`conditions.lembap.desc`}
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
                  <div id="tengah">
                    <FormLabel>Titik Tengah</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div id="tengah_value">
                        <FormField
                          control={form.control}
                          name={`conditions.lembap.tengah`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Nilai" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div id="tengah_unit">
                        <FormField
                          control={form.control}
                          name={`conditions.lembap.tengah_unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Satuan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div id="rentang">
                    <FormLabel>Rentang</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div id="rentang_value">
                        <FormField
                          control={form.control}
                          name={`conditions.lembap.rentang`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Nilai" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div id="rentang_unit">
                        <FormField
                          control={form.control}
                          name={`conditions.lembap.rentang_unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Satuan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {!showFields && (
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
                    onClick={handleAddCondition}
                  >
                    <Plus />
                  </Button>
                )}
                {showFields && conditionFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-4 border-b pb-4 relative"
                  >
                    <p className="text-sm font-bold">
                      Kondisi {index + 1}
                    </p>
                    {conditionFields.length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => removeCondition(index)}
                      >
                        <X />
                      </Button>
                    )}
                    <div className="grid gap-4">
                      <div id="kondisi">
                        <FormLabel>Jenis Kondisi</FormLabel>
                        <FormField
                          control={form.control}
                          name={`conditions.other.${index}.jenis_kondisi`}
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
                    <div className="grid gap-4">
                      <div id="kondisi_desc">
                        <FormLabel>Deskripsi</FormLabel>
                        <FormField
                          control={form.control}
                          name={`conditions.other.${index}.desc`}
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
                    <div id="tengah">
                      <FormLabel>Titik Tengah</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <div id="tengah_value">
                          <FormField
                            control={form.control}
                            name={`conditions.other.${index}.tengah`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Nilai" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div id="tengah_unit">
                          <FormField
                            control={form.control}
                            name={`conditions.other.${index}.tengah_unit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Satuan" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <div id="rentang">
                      <FormLabel>Rentang</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <div id="rentang_value">
                          <FormField
                            control={form.control}
                            name={`conditions.other.${index}.rentang`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Nilai" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div id="rentang_unit">
                          <FormField
                            control={form.control}
                            name={`conditions.other.${index}.rentang_unit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Satuan" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {showFields && (
                <Button
                  type="button"
                  size="sm"
                  className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
                  onClick={handleAddCondition}
                >
                  <Plus />
                </Button>
              )}
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
                        <X />
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
                <p className="text-xl"><Plus /></p>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </FormProvider>
  );
}
