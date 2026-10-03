import Link from "next/link";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md bg-white p-8 text-center shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-gray-800">
          Page Not Found
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button className="w-full">Go back home</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
