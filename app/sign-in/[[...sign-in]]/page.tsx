import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-cyan-500 hover:bg-cyan-600 text-sm normal-case',
            card: 'rounded-[2.5rem] border-2 border-border shadow-2xl',
          }
        }}
      />
    </div>
  );
}
