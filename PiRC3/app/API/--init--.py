"""
PiRC3 - Python API app factory / entry point

A small Flask API that sits alongside the existing Node/Express one
(app/, Api/routes, Api/controllers). This side only covers the off-chain
exchange log (database/exchange_schema.sql) for now — allocations and the
stablecoin mechanism are still Node-only (Api/routes, Api/controllers).

Run directly:
    python3 Api/init.py                  # dev server on :5000 (PY_API_PORT to override)

Or import the factory, e.g. for tests:
    from init import create_app
    app = create_app()
"""

import os

from flask import Flask

import health
import exchange


def create_app():
    app = Flask(__name__)
    app.register_blueprint(health.bp)
    app.register_blueprint(exchange.bp, url_prefix="/api/exchange")

    @app.errorhandler(404)
    def not_found(_err):
        return {"error": "Not found"}, 404

    @app.errorhandler(500)
    def server_error(err):
        app.logger.exception(err)
        return {"error": "Internal server error"}, 500

    return app


if __name__ == "__main__":
    port = int(os.environ.get("PY_API_PORT", 5000))
    create_app().run(port=port)
