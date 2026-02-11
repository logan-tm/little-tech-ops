function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="my-4 rounded-lg bg-gray-800 shadow-lg">
      {/* Optional: Language label */}
      {language && (
        <div className="px-4 py-2 text-sm font-mono text-gray-400 border-b border-gray-700">
          {language}
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-100">{code}</code>
      </pre>
    </div>
  );
}

export default CodeBlock;
