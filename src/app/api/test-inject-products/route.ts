import { NextRequest, NextResponse } from 'next/server';
import { saveProduct, deleteProduct } from '@/lib/adminData';

export const dynamic = 'force-dynamic';

function validateTestInjectionAccess(request: NextRequest): NextResponse | null {
  // 1. Production check: Unconditionally return 404 in production environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  // 2. Explicit activation flag check
  const isEnabled = process.env.ALLOW_TEST_INJECTION === 'true';
  if (!isEnabled) {
    return NextResponse.json({ error: 'Test injection is disabled' }, { status: 403 });
  }

  // 3. Server-side test key check (NO hardcoded fallback)
  const expectedKey = process.env.TEST_INJECTION_KEY;
  if (!expectedKey) {
    return NextResponse.json({ error: 'Server test key not configured' }, { status: 401 });
  }

  const providedKey = request.headers.get('x-test-injection-key') || request.headers.get('x-test-key');

  if (!providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized: Invalid test key' }, { status: 401 });
  }

  return null; // Access granted
}

export async function POST(request: NextRequest) {
  // Checks MUST run BEFORE reading request body and BEFORE modifying memory
  const authError = validateTestInjectionAccess(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // 1. Delete specific test products by ID for clean state restoration (NO factory reset)
    if (Array.isArray(body.deleteIds) && body.deleteIds.length > 0) {
      for (const id of body.deleteIds) {
        await deleteProduct(id);
      }
      return NextResponse.json({ ok: true, deletedCount: body.deleteIds.length });
    }

    // 2. Inject specific test products
    if (Array.isArray(body.products) && body.products.length > 0) {
      for (const p of body.products) {
        await saveProduct(p);
      }
      return NextResponse.json({ ok: true, injectedCount: body.products.length });
    }

    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Checks MUST run BEFORE reading request body and BEFORE modifying memory
  const authError = validateTestInjectionAccess(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    if (Array.isArray(body.deleteIds) && body.deleteIds.length > 0) {
      for (const id of body.deleteIds) {
        await deleteProduct(id);
      }
      return NextResponse.json({ ok: true, deletedCount: body.deleteIds.length });
    }
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
