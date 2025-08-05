import { PersonalizePass } from "@/components/personalize-pass"

export default function PersonalizePage({ params }: { params: { id: string } }) {
  return <PersonalizePass passId={params.id} />
} 