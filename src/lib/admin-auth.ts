export function verifyAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  const secret = process.env.METRICS_SECRET
  return !!(secret && authHeader === `Bearer ${secret}`)
}
