/**
 * Example server-side adapter for the TALOS intranet.
 * Requires Node.js 20+. Mount gpsArchiveHandler under GET /api/checkpoints/archive.
 * Do not expose this route without verifying Microsoft SSO / authorisation on the server.
 * Set TALOS_GPS_FLOW_URL as a PRIVATE server environment variable. Never in browser HTML.
 */
export async function gpsArchiveHandler(req, res) {
  // Replace this gate with your intranet's verified Microsoft session AND role check.
  if (!req.user?.authenticated || !req.user?.roles?.includes('gps-review')) {
    res.writeHead(403, {'Content-Type':'text/plain','Cache-Control':'no-store'});
    res.end('Access denied'); return;
  }
  const flowUrl = process.env.TALOS_GPS_FLOW_URL;
  if (!flowUrl) { res.writeHead(503); res.end('GPS archive service is not configured'); return; }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const upstream = await fetch(flowUrl, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:'{}',
      signal:controller.signal, redirect:'error', cache:'no-store'
    });
    if (!upstream.ok) throw new Error(`Archive flow returned ${upstream.status}`);
    const csv = await upstream.text();
    if (csv.length > 20000000) throw new Error('Archive response exceeded 20 MB');
    res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(csv);
  } catch(e) {
    res.writeHead(502,{'Content-Type':'text/plain','Cache-Control':'no-store'});
    res.end('Archive temporarily unavailable');
  } finally {clearTimeout(timeout)}
}
