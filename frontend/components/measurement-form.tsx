import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const empty_field_error_message = "Input diperlukan.";
const FormSchema = z.object({
  statements: z.array(
    z.object({
      statement: z.string().min(1, { message: empty_field_error_message }), // Pastikan ini 'statement'
    })
  ),
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
  conditions: z.array(
    z.object({
      kondisi: z.string().min(1, { message: empty_field_error_message }),
      kondisi_desc: z.string().min(1, { message: empty_field_error_message }),
      center_point: z.string().min(1, { message: empty_field_error_message }),
      center_unit: z.string().min(1, { message: empty_field_error_message }),
      range_value: z.string().min(1, { message: empty_field_error_message }),
      range_unit: z.string().min(1, { message: empty_field_error_message }),
    })
  ),
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

export default function MeasurementForm({
  updateFormData,
}: {
  updateFormData: (data: any) => void;
}) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      methods: [{ method_name: "", method_desc: "", norm: "" }],
      equipments: [{ nama_alat: "", manuf_model: "", seri_measuring: "" }],
      conditions: [
        {
          kondisi: "",
          kondisi_desc: "",
          center_point: "",
          center_unit: "",
          range_value: "",
          range_unit: "",
        },
      ],
      results: [
        {
          parameter: "",
          columns: [
            {
              kolom: "",
              real_list: [
                {
                  value: "",
                  unit: "",
                },
              ],
            },
          ],
        },
      ],
    },
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
    name: "conditions",
  });

  const {
    fields: resultFields,
    append: appendResult,
    remove: removeResult,
  } = useFieldArray({
    control: form.control,
    name: "results",
  });

  const columnFieldsArray = resultFields.map((_, index) =>
    useFieldArray({
      control: form.control,
      name: `results.${index}.columns`,
    })
  );

  const realListFieldsArray = columnFieldsArray.map(
    (columnFields, resultIndex) =>
      columnFields.fields.map((_, columnIndex) =>
        useFieldArray({
          control: form.control,
          name: `results.${resultIndex}.columns.${columnIndex}.real_list`,
        })
      )
  );

  const onSubmit = async (data: any) => {
    console.log("Data yang dikirim:", data);
    try {
      const response = await fetch("http://127.0.0.1:8000/create-dcc/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
                {conditionFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-4 border-b pb-4 relative"
                  >
                    <p className="text-sm text-muted-foreground">
                      Kondisi {index + 1}
                    </p>
                    {conditionFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => removeCondition(index)}
                      >
                        ✕
                      </Button>
                    )}
                    <div className="grid gap-4">
                      <div id="kondisi">
                        <FormLabel>Jenis Kondisi</FormLabel>
                        <FormField
                          control={form.control}
                          name={`conditions.${index}.kondisi`}
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
                          name={`conditions.${index}.kondisi_desc`}
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
                    <FormLabel>Titik Tengah</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div id="center_point">
                        <FormField
                          control={form.control}
                          name={`conditions.${index}.center_point`}
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
                      <div id="center_unit">
                        <FormField
                          control={form.control}
                          name={`conditions.${index}.center_unit`}
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
                    <FormLabel>Rentang</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div id="range_value">
                        <FormField
                          control={form.control}
                          name={`conditions.${index}.range_value`}
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
                      <div id="range_unit">
                        <FormField
                          control={form.control}
                          name={`conditions.${index}.range_unit`}
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
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-4 w-10 h-10 flex items-center justify-center mx-auto"
                onClick={() =>
                  appendCondition({
                    kondisi: "",
                    kondisi_desc: "",
                    center_point: "",
                    center_unit: "",
                    range_value: "",
                    range_unit: "",
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
