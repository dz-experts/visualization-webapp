# -*- coding: utf-8 -*-

from uuid import uuid4

from flask import Blueprint, render_template, current_app, request, flash, \
    url_for, redirect, session, abort, jsonify


comparisons = Blueprint("comparisons",__name__, static_folder="../static", template_folder="../template")

@comparisons.route("/")
#@login_required
def index():
    if ('uid' not in session.keys() or session['uid'] is None or len(str(session['uid'])) == 0 ):
            session['uid'] = uuid4()
    return render_template("comparisons.html")


@comparisons.route("/vs/<region>")
def compare():    

    # fetch data about the target region

    # get data about algeria    

    res = {"data": []}

    return jsonify(data=res)
