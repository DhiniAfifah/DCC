import Register from "@/components/register";

export default function Page() {
  return (
    <div className="bg-gradient-to-b from-white to-indigo-200 flex min-h-svh flex-col items-center justify-center pt-20">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Register formData={{ username: "", email: "", password: "" }} />
      </div>
    </div>
  );
}