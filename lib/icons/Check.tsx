import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Check(props: { size: number; className: string; strokeWidth: number }) {
  return <FontAwesome name="check" size={props.size} className={props.className} />;
}
