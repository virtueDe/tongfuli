import { NextRequest, NextResponse } from "next/server";

const CORE_PLATFORM_BASE_URL =
  process.env.CORE_PLATFORM_BASE_URL ??
  process.env.NEXT_PUBLIC_CORE_PLATFORM_BASE_URL ??
  "http://127.0.0.1:8080";
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function buildTargetUrl(path: string[], request: NextRequest): URL {
  const pathname = path.length > 0 ? path.join("/") : "";
  const target = new URL(`/api/v1/public/${pathname}`, CORE_PLATFORM_BASE_URL);
  target.search = request.nextUrl.search;
  return target;
}

function copyHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  for (const [key, value] of request.headers.entries()) {
    const normalizedKey = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(normalizedKey) || normalizedKey === "authorization") {
      continue;
    }
    headers.set(key, value);
  }

  return headers;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;
  const targetUrl = buildTargetUrl(path, request);
  const method = request.method;
  const headers = copyHeaders(request);
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Web 代理请求 core-platform 失败",
        detail: error instanceof Error ? error.message : "unknown error",
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  return proxyRequest(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  return proxyRequest(request, context);
}
