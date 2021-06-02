# import necessary libraries
from flask_sqlalchemy import SQLAlchemy
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)


import pandas
from sklearn import model_selection
from sklearn.linear_model import LogisticRegression
import joblib

app = Flask(__name__)

from flask_sqlalchemy import SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', '') or "sqlite:///db.sqlite"

# Remove tracking modifications
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Home = create_classes(db)
# create route that renders index.html template


#################################################
# Flask Setup
#################################################
app = Flask(__name__)
# create route that renders index.html template


@app.route("/")
def welcome():
    app.logger.info("home")
    return render_template("form.html", price= "$0.00", bed = "", bath = "", condition = "", age = "", sqft = "")
   # return render_template("index.html")

# Query the database and send the jsonified results
@app.route("/send", methods=["GET", "POST"])
def send():
    app.logger.info("reached beginning of method")

    predicted_price_rounded = 0
    gotvalues=  False

    if request.method == "POST":
        gotvalues = True
        numBedRooms = request.form["numBedRooms"]
        numBathRooms = request.form["numBathRooms"]
        condition = min(4, max(0, int(request.form["condition"])))
        houseAge = request.form['houseAge']
        houseSq = request.form["houseSq"]
        condition_array = [0, 0, 0, 0]
        # app.logger.info(numBedRooms)

        if int(condition) != 0:
            condition_array[condition-2] = 1


        linear_ridge_model = joblib.load("ridge_model.sav")
        loaded_y_scaler = joblib.load("y_scaler.sav")
        loaded_X_scaler = joblib.load("X_scaler.sav")
        house_data_scaled = loaded_X_scaler.transform(
            [[numBedRooms, numBathRooms, houseSq, condition_array[0], condition_array[1], condition_array[2], condition_array[3], houseAge]])
        predicted_price = loaded_y_scaler.inverse_transform(
            linear_ridge_model.predict(house_data_scaled))
        predicted_price_rounded = "${:,.2f}".format(round(predicted_price[0][0]))
      #  return_predicted_price = [{
      #      "predited_price": predicted_price_rounded
      #  }]

    bedReturn = numBedRooms if gotvalues else ""
    bathReturn = numBathRooms if gotvalues else ""
    conditionReturn = condition if gotvalues else ""
    ageReturn = houseAge if gotvalues else ""
    sqftReturn = houseSq if gotvalues else ""


    return render_template("form.html", price = predicted_price_rounded, bed = bedReturn, bath = bathReturn, condition = conditionReturn, age = ageReturn, sqft = sqftReturn)
    # return render_template("form.html", price= "$0.00", bed = "", bath = "", condition = "", age = "", sqft = "")
    # redirect("/", pricepredicted = return_predicted_price) 

if __name__ == "__main__":
    app.run(debug=False)
