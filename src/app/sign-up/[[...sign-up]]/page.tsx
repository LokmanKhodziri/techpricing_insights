import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-16">
      <SignUp />
    </div>
  );
}
