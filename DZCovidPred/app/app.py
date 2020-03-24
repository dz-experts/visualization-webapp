# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
from flask import Flask, render_template
from app.extensions import bcrypt, cache, csrf_protect 


def create_app(config_object='app.settings'):
    """An application factory, 
    :param config_object: The configuration object to use.
    """
    app = Flask(__name__.split('.')[0])
    app.config.from_object(config_object)
    register_extensions(app)
    register_blueprints(app)
    #register_errorhandlers(app)    
    register_commands(app)
    return app


def register_extensions(app):
    """Register Flask extensions."""
    bcrypt.init_app(app)    
    cache.init_app(app)    
    csrf_protect.init_app(app)    
    return None


def register_blueprints(app):
    """Register Flask blueprints."""
    from app.Stats.views import stats
    from app.predictions.views import predictions
    
    app.register_blueprint(stats)
    #app.register_blueprint(predictions, url_prefix="/predictions")    
    return None


def register_errorhandlers(app):
    """Register error handlers."""
    def render_error(error):
        """Render error template."""
        # If a HTTPException, pull the `code` attribute; default to 500
        error_code = getattr(error, 'code', 500)
        return render_template('{0}.html'.format(error_code)), error_code
    for errcode in [401, 404, 500]:
        app.errorhandler(errcode)(render_error)
    return None


def register_commands(app):
    """Register Click commands."""
    #app.cli.add_command(commands.test)
    #app.cli.add_command(commands.lint)
    #app.cli.add_command(commands.clean)
    #app.cli.add_command(commands.urls)
