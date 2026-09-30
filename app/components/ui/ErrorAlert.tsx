export default function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}
