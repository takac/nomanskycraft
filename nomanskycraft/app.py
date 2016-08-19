from flask import Flask, url_for, render_template, jsonify, send_from_directory
import json
app = Flask(__name__)

RECIPE_FILE="base.json"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/hello")
def hello():
    return "Hello World!"

@app.route("/base.json")
def recipes():
    recipes = json.load(open(RECIPE_FILE))
    return jsonify(recipes)

if __name__ == "__main__":
    app.run(debug=True)
