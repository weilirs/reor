function errorToStringMainProcess(error: unknown, depth: number = 0): string {
  if (error instanceof Error) {
    let errorString = `${error.name}: ${error.message}`
    if (error.cause) {
      errorString += `\nCaused by: ${errorToStringMainProcess(error.cause, depth + 1)}`
    }
    if (depth === 0) {
      // Optionally include the stack trace at the top level
      errorString += `\nStack Trace:\n${error.stack}`
    }
    return errorString
  }
  return String(error)
}

export default errorToStringMainProcess
