import { useState } from "react";
import { Input } from "@/components/ui/input"; // Mengimpor komponen Input
import { Label } from "@/components/ui/lable"; // Mengimpor komponen Label
import { FormEvent } from "react"; // Mengimpor FormEvent dari React

function create() {
  const [labCode, setLabCode] = useState("");
  const [certificate, setCertificate] = useState("");
  const [order, setOrder] = useState("");

  // Deskripsi objek yang dikalibrasi
  const [jenis, setJenis] = useState("");
  const [merek, setMerek] = useState("");
  const [tipe, setTipe] = useState("");
  const [seri, setSeri] = useState("");
  const [issuer, setIssuer] = useState("");
  const [value, setValue] = useState("");

  // Identitas pemilik
  const [namaCust, setNamaCust] = useState("");
  const [kotaCust, setKotaCust] = useState("");

  // Pengesahan
  const [pejabat, setPejabat] = useState("");
  const [namaPejabat, setNamaPejabat] = useState("");

  // Footer
  const [namaLab, setNamaLab] = useState("");
  const [kotaLab, setKotaLab] = useState("");

  // Isi alat
  const [namaAlat, setNamaAlat] = useState("");
  const [pembuat, setPembuat] = useState("");
  const [model, setModel] = useState("");
  const [noSeri, setNoSeri] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Mencegah reload halaman
    const response = await fetch("/api/create-new-dcc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        labCode,
        certificate,
        order,
        jenis,
        merek,
        tipe,
        seri,
        issuer,
        value,
        namaCust,
        kotaCust,
        pejabat,
        namaPejabat,
        namaLab,
        kotaLab,
        namaAlat,
        pembuat,
        model,
        noSeri,
      }),
    });

    const data = await response.json();
    console.log(data);
    alert("Sertifikat berhasil dibuat!");
  };

  return (
    <div>
      <h1>Create New DCC</h1>
      <form onSubmit={handleSubmit}>
        <h2>Header</h2>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="labCode">Laboratory Code</Label>
          <Input
            type="text"
            id="labCode"
            value={labCode}
            onChange={(e) => setLabCode(e.target.value)}
            placeholder="Enter Laboratory Code"
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="certificate">Certificate Number</Label>
          <Input
            type="text"
            id="certificate"
            value={certificate}
            onChange={(e) => setCertificate(e.target.value)}
            placeholder="Enter Certificate Number"
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="order">Order Number</Label>
          <Input
            type="text"
            id="order"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="Enter Order Number"
          />
        </div>

        {/* Form untuk data lainnya */}
        <button type="submit">Generate DCC</button>
      </form>
    </div>
  );
}

export default create;
