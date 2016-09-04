from flask import Flask, render_template, jsonify
import json

app = Flask(__name__, static_url_path='', static_folder='../build/public', template_folder='../build/templates')
RECIPE_FILE = "base.json"


@app.route("/")
def index():
    return render_template("index.html.j2")

@app.route("/react")
def home():
    return render_template("home.html.j2")

@app.route("/base.json")
def recipes():
    recipes = json.load(open(RECIPE_FILE))
    return jsonify(recipes)


if __name__ == "__main__":
    app.run(debug=True)
