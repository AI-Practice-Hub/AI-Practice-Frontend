
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-zinc-50 to-purple-100 dark:from-black dark:via-zinc-900 dark:to-gray-900 font-sans">
      <header className="flex items-center justify-between px-8 py-6 shadow-sm bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-700 dark:text-purple-400">AI Practice Hub</span>
        </div>
        <nav className="flex gap-6">
          <Link href="/login" className="text-base font-medium text-blue-700 dark:text-purple-300 hover:underline">Login</Link>
          <Link href="/signup" className="text-base font-medium text-blue-700 dark:text-purple-300 hover:underline">Sign Up</Link>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center py-24 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-zinc-900 dark:text-zinc-100 mb-6">
          Automate Your Testing with AI
        </h1>
        <p className="max-w-2xl text-lg text-center text-zinc-700 dark:text-zinc-300 mb-10">
          Welcome to the next generation of software testing. Our platform leverages AI to generate, execute, and manage test cases for your web applications. Experience seamless, multimodal chat-driven automation and persistent history, all in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🤖</span>
            <h2 className="text-xl font-semibold mb-2 text-blue-700 dark:text-purple-300">AI-Powered Test Generation</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-center">Provide any input—text, image, audio, or URL—and let our agent generate detailed test scenarios for you.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">💬</span>
            <h2 className="text-xl font-semibold mb-2 text-blue-700 dark:text-purple-300">Persistent Chat Experience</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-center">Chat with the agent, review and modify test cases, and access your previous sessions anytime.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">⚡</span>
            <h2 className="text-xl font-semibold mb-2 text-blue-700 dark:text-purple-300">Automated Execution & Results</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-center">Generate executable code, run tests, and get instant feedback on pass/fail status—all powered by AI.</p>
          </div>
        </div>
        <Link href="/signup" className="px-8 py-4 rounded-full bg-blue-700 text-white dark:bg-purple-600 dark:text-zinc-100 font-bold text-lg shadow-lg hover:bg-blue-800 dark:hover:bg-purple-700 transition">Get Started</Link>
      </main>
      <footer className="text-center py-6 text-zinc-500 dark:text-zinc-400 text-sm">
        &copy; {new Date().getFullYear()} AI Practice Hub. All rights reserved.
      </footer>
    </div>
  );
}
