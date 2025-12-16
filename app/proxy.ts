// app/proxy.ts (root of app directory)
import { NextRequest, NextResponse } from "next/server"

export default function proxy(request: NextRequest) {
  // Example: redirect unauthenticated users
  // return NextResponse.redirect(new URL('/login', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
