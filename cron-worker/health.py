"""A tiny server so CLI knows the service is up between scheduled runs."""
import os
from http.server import BaseHTTPRequestHandler, HTTPServer


class Health(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200 if self.path == "/health" else 404)
        self.send_header("content-type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"ok": true}')

    def log_message(self, *_args):
        pass


HTTPServer(("0.0.0.0", int(os.environ.get("PORT", "8000"))), Health).serve_forever()
