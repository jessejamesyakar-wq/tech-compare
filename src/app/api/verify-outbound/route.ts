import { NextRequest, NextResponse } from 'next/server';
import { PriceVerificationEngine } from '@/lib/security/priceVerification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, storeName, price, targetUrl, stockStatus, checkedAt } = body;

    if (!productId || !storeName || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters (productId, storeName, price)' },
        { status: 400 }
      );
    }

    const verification = PriceVerificationEngine.verifyOffer({
      productId,
      storeName,
      price: Number(price),
      targetUrl: targetUrl || '',
      stockStatus: stockStatus || 'IN_STOCK',
      checkedAt
    });

    return NextResponse.json({
      success: true,
      verification
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
