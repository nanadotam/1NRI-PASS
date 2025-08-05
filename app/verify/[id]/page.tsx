import { VerifyPage } from "@/components/verify-page"

export default function Verify({ params }: { params: { id: string } }) {
  return <VerifyPage passId={params.id} />
}
