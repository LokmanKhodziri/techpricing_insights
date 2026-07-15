import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-16">
      <SignIn />
    </div>
  );
}
