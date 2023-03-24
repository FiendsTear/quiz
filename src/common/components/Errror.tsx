export default function ErrorComponent(props: { message: string }) {
  return (
    <div className="w-full h-full flex justify-center items-center text-lg">
      {props.message}
    </div>
  );
}
