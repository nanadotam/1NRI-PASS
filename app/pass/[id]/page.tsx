import { FullscreenPassViewer } from "@/components/fullscreen-pass-viewer"

export default function PassPage({ params }: { params: { id: string } }) {
  return <FullscreenPassViewer passId={params.id} />
} 