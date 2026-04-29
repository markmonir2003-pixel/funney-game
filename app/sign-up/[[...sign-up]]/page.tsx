import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-sm normal-case',
            card: 'rounded-[2.5rem] border-2 border-border shadow-2xl',
          }
        }}
      />
    </div>
  );
}
