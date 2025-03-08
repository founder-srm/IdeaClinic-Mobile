import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ChevronDown(props: { size: number; className: string }) {
  return <FontAwesome name="chevron-down" size={props.size} className={props.className} />;
}
