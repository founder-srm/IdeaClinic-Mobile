import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ChevronUp(props: { size: number; className: string }) {
  return <FontAwesome name="chevron-up" size={props.size} className={props.className} />;
}
