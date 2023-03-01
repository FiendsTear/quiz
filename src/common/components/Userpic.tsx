import Image from "next/image";

export default function Userpic(props: { src?: string | null, size: number }) {
  return <Image className="rounded-full" src={props.src || "/Userpic_placeholder.jpg"} width={props.size} height={props.size} alt="userpic" />;
}
