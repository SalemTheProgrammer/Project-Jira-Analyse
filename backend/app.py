import logging
from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from apis.dashboardRoutes import dashboard_bp
from apis.accountRoutes import account_bp
from apis.loginRoutes import login_bp, register_bp
from config.DBs import conf_db
from apis.treeModelRoutes import tree_model_bp
from apis.jiraTicketRoutes import jira_bp
from apis.treeRoutes import classification_bp
from config.Jira import jira_blueprint
from apis.bestMatchesRoutes import best_matches_bp
from apis.questionAnswering import qa_bp
import webview

app = Flask(__name__)
CORS(app)
swagger = Swagger(app)



app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
app.register_blueprint(account_bp, url_prefix='/accounts')
app.register_blueprint(login_bp, url_prefix='/login')
app.register_blueprint(register_bp, url_prefix='/register')
app.register_blueprint(classification_bp, url_prefix='/tree-classification')
app.register_blueprint(tree_model_bp, url_prefix='/tree')
app.register_blueprint(jira_bp, url_prefix='/jira')
app.register_blueprint(jira_blueprint, url_prefix='/api')
app.register_blueprint(best_matches_bp, url_prefix='/best_matches_bp')
app.register_blueprint(qa_bp, url_prefix='/question-answering')

conf_db(app)

if __name__ == '__main__':
       logging.basicConfig(level=logging.INFO)
       app.run(host="0.0.0.0")
