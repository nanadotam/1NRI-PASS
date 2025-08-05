import { PassViewer } from "@/components/pass-viewer"

export default function PassPage({ params }: { params: { id: string } }) {
  return <PassViewer passId={params.id} />
} 