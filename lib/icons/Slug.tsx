import FontAwesome from '@expo/vector-icons/FontAwesome';

export function ArrowLeft(props: { size: number; className: string }) {
  return <FontAwesome name="arrow-left" size={props.size} className={props.className} />;
}

export function Heart(props: { 
  size: number; 
  className: string; 
  fill?: boolean;  // New prop to control filled/outlined state
}) {
  // Use "heart" for filled and "heart-o" for outlined
  const iconName = props.fill ? "heart" : "heart-o";
  return <FontAwesome name={iconName} size={props.size} className={props.className} />;
}

export function Download(props: { size: number; className: string }) {
  return <FontAwesome name="download" size={props.size} className={props.className} />;
}

export function MessageCircle(props: { size: number; className: string }) {
  return <FontAwesome name="comment" size={props.size} className={props.className} />;
}

export function Share2(props: { size: number; className: string }) {
  return <FontAwesome name="share-alt" size={props.size} className={props.className} />;
}