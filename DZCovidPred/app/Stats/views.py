# -*- coding: utf-8 -*-

from uuid import uuid4

from flask import Blueprint, render_template, current_app, request, flash, \
    url_for, redirect, session, abort, jsonify
import requests
import re

stats = Blueprint("stats",__name__, static_folder="../static", template_folder="../template")

@stats.route("/")
#@login_required
def index():
    if not session.get('uuid', False):
            session['uid'] = uuid4()            
    return render_template("Stats.html")

#I feel this is a duplicated method
#I just wrote it because the Access-Control-Allow-Origin problem
@stats.route("/history")
def history():
    req = requests.get("https://stats-api.covid19dz.com/v2/history")    
    if req.status_code != 200 :
        msg = { "error" : "Couldn't fetch the data"}
        return msg, req.status_code    
    
    # format to the same format used by sohaib to not change in front-end code
    alg_info = req.json()    

    cases = [ (x['date'] , x['confirmed'] if not x['confirmed'] is None else 0) for x in alg_info if 'confirmed' in x]
    deaths = [(x['date'] , x['deaths'] if not x['deaths'] is None else 0) for x in alg_info if 'deaths' in x ]
    recovered = [ (x['date'] ,  x['recovered'] if not x['recovered'] is None  else 0) for x in alg_info]

    res = {
        'cases': dict(cases),
        "deaths": dict(deaths),
        "recovered": dict(recovered),
        'stats': {
            # I am suposing it is sorted            
            "Total" : cases[-1][1],
            "Deaths": deaths[-1][1],
            "Recovered": recovered[-1][1],
            "NewCases": cases[-1][1] - cases[-2][1],
            "StillInfected": cases[-1][1] - ( deaths[-1][1] + recovered[-1][1] )  
        }
    }    
    return jsonify(res)

@stats.route("/allWilayasStats")
def allWilayasStats():
    # I will 
    res = requests.get("https://stats-api.covid19dz.com/wilayas")   
    if res.status_code != 200 :
        msg = { "error" : "Couldn't fetch the data"}
        return msg, res.status_code        
    return jsonify(res.json())

@stats.route("/confirmed/wilaya")
def wilayaWithConfirmedCases():
    # I will 
    res = requests.get("https://stats-api.covid19dz.com/wilayas")   
    if res.status_code != 200 :
        msg = { "error" : "Couldn't fetch the data"}
        return msg, res.status_code     

    wilaya = res.json()
    filtered = [x for x in wilaya if x['confirmed'] >0 ]   
    filtered = sorted(filtered, key = lambda x: x['confirmed'], reverse=False)  
    return jsonify(filtered)


@stats.route("/active/wilaya")    
def stillInfectedWilaya():
    res = requests.get("https://stats-api.covid19dz.com/wilayas")   
    if res.status_code != 200 :
        msg = { "error" : "Couldn't fetch the data"}
        return msg, res.status_code    

    wilaya = res.json()
    # Return just the list of infected wilaya
    infected = [ { 'name' : x['name'], 'name_ar' : x['name_ar'], 'actives': x['actives'] } for x in wilaya if x['actives'] ]    

    # sort by the number of infected people
    infected = sorted(infected, key = lambda x: x['actives'], reverse=False) 
    return jsonify(infected)


@stats.route("/origins")
def casesOrigins():
    res = requests.get("https://stats-api.covid19dz.com/origins")
    if res.status_code != 200 :
        msg = { "error" : "Couldn't fetch the data"}
        return msg, res.status_code     

    return jsonify(res.json())


@stats.route("/ages")
def agesdistribution():
    res = requests.get("https://stats-api.covid19dz.com/ages")
    if res.status_code != 200 :
        msg = { "error" : "Couldn't fetch the data"}
        return msg, res.status_code  

    info = res.json()    
    # just substiture the -5 label with <5 label

    info2 = {}
    for cat in list(info):        
        cat_fixes = re.sub("^-","0-",cat)
        cat_fixes = re.sub("^\+70","70+",cat_fixes)
        info2[cat_fixes] = info[cat]    
    
    print(info2)
    return jsonify(info2)

@stats.route("/sex")
def casesOrigines():
    res = requests.get("https://stats-api.covid19dz.com/sex")
    if res.status_code != 200:
        msg = { "error" : "Couldn't fetch the data"}
        return msg, res.status_code  
    
    return jsonify(res.json())