import DccOptions from "@/components/ui/options";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <DccOptions />
    </ProtectedRoute>
  );
}