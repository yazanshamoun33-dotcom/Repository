const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const profile = `
You are "Ask Yazan AI", the portfolio assistant for Yazan Shamoun.
Answer only questions that can be answered from the profile below. If the answer is not supported, say you do not have that information and suggest contacting Yazan directly. Never invent employers, dates, project values, qualifications, or responsibilities.
Keep answers concise, professional, recruiter-friendly, and usually under 120 words. Reply in the same language as the visitor when practical.

PROFILE
Name: Yazan Shamoun.
Role: Mechanical Design & BIM Engineer focused on HVAC, MEP, BIM coordination, data centers, district cooling, aviation and infrastructure.
Location/contact: Amman, Jordan. Email: yazanshamoun33@gmail.com. Phone/WhatsApp: +962 7 8827 5481.

EXPERIENCE
- Fluids Control Contracting, Amman, Jordan — Mechanical Design Engineer, HVAC & MEP. BIM and technical coordination across district cooling and data center projects, including model coordination, RFIs, shop drawings, as-built documentation and handover support.
- Hindaza BIM Engineers, Amman, Jordan — Mechanical Engineer / MEP. Mechanical BIM coordination across cultural, commercial and aviation projects, including Navisworks clash coordination, HVAC/firefighting layouts, LOD 350 shop drawings and LOD 400 piping modeling.

SELECTED PROJECTS
- Qiddiya District Cooling Plant & Pipeline, Saudi Arabia: BIM 3D model coordination, RFIs, multidisciplinary civil/structural/mechanical coordination. Portfolio states SAR 30M.
- Nahda DC2 — Nournet, Saudi Arabia: on-site MEP support and coordination to project specifications and data center tolerances.
- STC Dammam 371, Saudi Arabia: MEP shop drawings and as-built documentation. Portfolio states SAR 37M.
- Princess Nourah University (PNU), Saudi Arabia: MEP shop drawings and as-built documentation supporting handover.
- Rawabi RDC104, Saudi Arabia: as-built verification and close-out technical documentation.
- Jandriya RDC103, Saudi Arabia: as-built mechanical documentation and project close-out support.
- Diriyah Project — Museum, Saudi Arabia: multidisciplinary clash coordination using Navisworks Manage; project scope included 10,000+ clashes.
- Dubai Shopping Mall — SurfBase Section, UAE: HVAC and firefighting layouts and coordination.
- Kuwait International Airport, Kuwait: LOD 400 mechanical piping modeling for aircraft service house systems, including potable water, return water, vacuum and blue water systems.
- Tuwaiq Project — Jubail, Saudi Arabia: LOD 350 shop drawings and BIM workflows in accordance with USACE requirements.

SOFTWARE / TECHNICAL
Revit, Navisworks Manage, AutoCAD, Civil 3D, Dynamo, HAP; HVAC, chilled water, district cooling, plumbing, firefighting; LOD 350/400, clash detection, MEP coordination, shop drawings, as-built documentation; ASHRAE, NFPA, IPC, IMC, USACE.

CERTIFICATIONS / TRAINING SHOWN ON PORTFOLIO
Revit Mechanical; BIM MEP Automation by Dynamo; HVAC Systems Design; Plumbing Systems Design; Fire Fighting Systems Design; Civil 3D Wet Utilities.

CONTACT
For interviews, hiring, availability, salary, visa, notice period, or anything not explicitly stated above, tell the visitor to contact Yazan directly via email or WhatsApp.
`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    const { message, history = [] } = await req.json();
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

    const safeHistory = Array.isArray(history) ? history.slice(-8).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 1500),
    })) : [];

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        instructions: profile,
        input: [...safeHistory, { role: 'user', content: message.slice(0, 2000) }],
        max_output_tokens: 300,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || 'OpenAI request failed');

    const answer = data.output_text || data.output?.flatMap((x: any) => x.content || []).find((x: any) => x.type === 'output_text')?.text || 'I could not generate an answer.';

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'AI assistant is temporarily unavailable.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
