import dynamic from "next/dynamic";

const ResetPassword = dynamic(() => import("../../components/ResetPassword"), { ssr: false });

export default function Page() {
  return <ResetPassword />;
}
