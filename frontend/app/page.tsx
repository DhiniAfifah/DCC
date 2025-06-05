import Login from "@/components/login";

export default function Page() {
  return (
    <main>
      <Login formData={{ email: "", password: "" }} />
    </main>
  );
}
