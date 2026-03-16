import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { botProtection } = body;

    let isBot = false;
    
    if (botProtection?.detection?.webdriver || botProtection?.detection?.headless) {
      isBot = true;
    }
    
    if (botProtection?.behavioral?.mouseEvents?.length === 0 && botProtection?.behavioral?.keyboardEvents?.length === 0) {
      isBot = true; 
    }

    return NextResponse.json({ success: true, isBot });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Bad Request" }, { status: 400 });
  }
}