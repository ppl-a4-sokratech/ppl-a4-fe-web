import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, botProtection } = body;

    let isBot = false;
    
    if (botProtection?.detection?.webdriver || botProtection?.detection?.headless) {
      isBot = true;
    }
    
    const hasMouseEvents = botProtection?.behavioral?.mouseEvents?.length > 0;
    const hasKeyboardEvents = botProtection?.behavioral?.keyboardEvents?.length > 0;
    
    if (!hasMouseEvents && !hasKeyboardEvents) {
      isBot = true; 
    }

    if (isBot) {
      return NextResponse.json({ success: false, isBot: true });
    }
    
    console.log(`[Mock DB] User created: ${username} (${email})`);

    return NextResponse.json({ success: true, isBot: false });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Bad Request atau Payload tidak valid" }, 
      { status: 400 }
    );
  }
}