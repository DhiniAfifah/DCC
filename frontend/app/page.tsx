import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="bg-gradient-to-b from-white to-indigo-200 flex min-h-svh flex-col items-center justify-center pt-20">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm formData={{ email: "", password: "" }} />
      </div>
    </div>
  )
}