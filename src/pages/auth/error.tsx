import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  const errors: Record<string, string> = {
    default: "An error occurred during authentication.",
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification link may have been used or has expired.",
    OAuthSignin: "Error in the OAuth sign-in process.",
    OAuthCallback: "Error in the OAuth callback process.",
    OAuthCreateAccount: "Could not create OAuth provider account.",
    EmailCreateAccount: "Could not create email provider account.",
    Callback: "Error in the callback handler.",
    OAuthAccountNotLinked: "This email is already associated with another account.",
    EmailSignin: "Error sending the email verification link.",
    CredentialsSignin: "The credentials you provided were invalid.",
    SessionRequired: "Please sign in to access this page.",
  };

  const errorMessage = error && errors[error as string] ? errors[error as string] : errors.default;

  return (
    <>
      <Head>
        <title>Authentication Error | Luxe Hair Collection</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {errorMessage}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Link href="/auth/signin" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Return to Sign In
                </Link>
                <span className="mx-2">or</span>
                <Link href="/" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Go to Home Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
