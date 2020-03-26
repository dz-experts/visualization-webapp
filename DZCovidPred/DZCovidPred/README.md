# visualization-webapp

# Intro
This is a very basic flask-based visualization app. The goal is predict the spread of COVID-19 and also compare it against the medical capacity (number of ICU bed).
Hopefully some people already designed functions for the disease spread models, however, we need to estimate the parameters that apply to Algeria. Probably we should get an epidemiologist to give us the right estimates of $\text{R}_0$, incubation time, ... etc.
I am planning to use the SEIR epidemic model adapted to include the different possible clinical stages/outcomes of COVID19 infection. It is based on this implementation: https://alhill.shinyapps.io/COVID19seir/.

The model is shown bellow: 
![](images/model.png){:height="10%" width="10%"}


# Installation

This should work with `python>=3.6` and make sure to install the required packages.

```bash
cd DZCovidPred 
pip install -r requirements.txt
```

Then run as follows:

* In Windows
```
   set FLASK_APP=autoapp.py
   flask run -h 0.0.0.0
```

* In unix
```
   export FLASK_APP=autoapp.py
   flask run -h 0.0.0.0
```

# TO Do

Not in any articular order

- [ ] Fetch data COVID-19 data (ideally from the https://stats-api.covid19dz.com/docs)
- [ ] Automate the charts creation code (located in `Charts.js`)
- [ ] Improve the UI
- [ ] Add tests

# How to contribute
 - If you add a new page, add it as a blueprint and create a folder with the name of the page with the files `__init__.py`, `views.py` and `forms.py`. 
 - update `app.py`
 - update `requirements.txt`
 - it would be great if you can add a test.


