import Register from "@/components/register";

export default function Page() {
  return (
    <main>
      <Register formData={{ username: "", email: "", password: "" }} />
    </main>
  );
}