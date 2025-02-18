import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdministrativeForm() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Identitas Pemilik</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input id="name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="building">No. Building</Label>
                <Input id="building" />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input id="zip" />
              </div>
              <div>
                <Label htmlFor="province">Provinces</Label>
                <Select>
                  <SelectTrigger id="province">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jakarta">DKI Jakarta</SelectItem>
                    <SelectItem value="west-java">West Java</SelectItem>
                    <SelectItem value="east-java">East Java</SelectItem>
                    {/* Add more provinces as needed */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indonesia">Indonesia</SelectItem>
                  <SelectItem value="malaysia">Malaysia</SelectItem>
                  <SelectItem value="singapore">Singapore</SelectItem>
                  {/* Add more countries as needed */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengesahan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="official">Pejabat yang mengesahkan</Label>
                <Input id="official" />
              </div>
              <div>
                <Label htmlFor="validation-date">Tanggal pengesahan</Label>
                <Input id="validation-date" type="date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="official-name">Nama</Label>
                <Input id="official-name" />
              </div>
              <div>
                <Label htmlFor="pages">
                  Jumlah halaman (termasuk halaman ini)
                </Label>
                <Input id="pages" type="number" />
              </div>
            </div>
            <div>
              <Label htmlFor="nip">NIP</Label>
              <Input id="nip" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Tambahan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tool-name">Nama Alat</Label>
                <Input id="tool-name" />
              </div>
              <div>
                <Label htmlFor="serial">No. Seri</Label>
                <Input id="serial" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufacturer">Pembuat</Label>
                <Input id="manufacturer" />
              </div>
              <div>
                <Label htmlFor="calibration-date">Tanggal Kalibrasi</Label>
                <Input id="calibration-date" type="date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" />
              </div>
              <div>
                <Label htmlFor="calibration-place">Tempat Kalibrasi</Label>
                <Input id="calibration-place" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
