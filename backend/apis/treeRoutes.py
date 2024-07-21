from flask import Flask, Blueprint, jsonify
from transformers import BertTokenizer, BertModel, pipeline
from flasgger import swag_from
import numpy as np
import torch
import logging
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine_similarity
import string
from bson import ObjectId
import json
from datetime import datetime
from config.DBs import get_db

# Initialize Flask app and Blueprint
app = Flask(__name__)
classification_bp = Blueprint('classification_bp', __name__)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load pre-trained BERT model and tokenizer once
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')
qa_pipeline = pipeline("question-answering", model="bert-base-multilingual-cased")
ner_pipeline = pipeline("ner", model="dslim/bert-large-NER")

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('stopwords')

# Set stopwords
stop_words = set(stopwords.words('english') + stopwords.words('french'))

def preprocess_text(text):
    if text is None:
        return ''
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stop_words]
    return ' '.join(tokens)

def get_bert_embeddings(texts):
    inputs = tokenizer(texts, return_tensors='pt', padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).detach().numpy()

def get_leaf_paths(tree, current_path=[]):
    if "children" not in tree or not tree["children"]:
        return [' -> '.join(current_path + [tree["name"]])]
    paths = []
    for child in tree["children"]:
        paths.extend(get_leaf_paths(child, current_path + [tree["name"]]))
    return paths

def classify_ticket_dfs(ticket_vector, node, current_path, X_paths, leaf_paths, threshold=0.5):
    similarities = []
    if "children" in node and node["children"]:
        for child in node["children"]:
            similarities.extend(classify_ticket_dfs(ticket_vector, child, current_path + [node["name"]], X_paths, leaf_paths, threshold))
    else:
        path = ' -> '.join(current_path + [node["name"]])
        try:
            path_index = leaf_paths.index(path)
            path_vector = X_paths[path_index].reshape(1, -1)
            similarity = sk_cosine_similarity(ticket_vector, path_vector)[0][0]
            similarities.append((path, similarity))
        except Exception as e:
            logging.error(f'Error processing path {path}: {e}')
    return similarities

# Custom JSON encoder to handle ObjectId and numpy.float32
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, np.float32):
            return float(obj)
        return json.JSONEncoder.default(self, obj)

app.json_encoder = JSONEncoder

def check_for_person_name(text, ner_pipeline, threshold=0.3):
    text = preprocess_text(text)
    results = ner_pipeline(text)
    for entity in results:
        if entity['score'] > threshold and 'PER' in entity['entity']:
            return True
    return False

def is_trivial_answer(answer):
    trivial_answers = {"comment", "comment by", "none", "nothing", "n/a"}
    return answer and answer.strip().lower() in trivial_answers

def generate_comments_summary(jira_id):
    db = get_db()
    ticket = db.jira_tickets.find_one({'ID': jira_id})
    if not ticket:
        return None, 404
    
    comments = ticket.get('Comments', [])
    if not comments:
        return "No comments available for this ticket.", 200

    query = "What are they talking about?"
    summary_points = []

    for comment in comments:
        comment = comment.strip()
        if not comment or is_trivial_answer(comment):
            continue

        answer = qa_pipeline(question=query, context=comment)
        answer_text = answer['answer']

        if not is_trivial_answer(answer_text) and not check_for_person_name(answer_text, ner_pipeline):
            summary_points.append(answer_text)

    if not summary_points:
        return "No significant comments to summarize.", 200

    return " ".join(summary_points), 200

def generate_description_summary(description):
    if not description:
        return None, 200

    query = "What problem is described?"
    answer = qa_pipeline(question=query, context=description)
    answer_text = answer['answer']

    if is_trivial_answer(answer_text) or check_for_person_name(answer_text, ner_pipeline):
        return None, 200
    
    return answer_text, 200

def generate_ticket_summary(jira_id, title, status, project, component, ticket_type, resolution, sum_comm=None):
    db = get_db()
    ticket = db.jira_tickets.find_one({'ID': jira_id})
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    
    created_date = ticket.get('Created', 'Unknown Date')
    updated_date = ticket.get('Updated', 'Unknown Date')
    summary = (
        f"The Jira ticket {jira_id} titled '{title}' was created on {created_date} "
        f"and last modified on {updated_date}. Currently, it is {status}. "
        f"The project related to this ticket is {project}, with the component {component}. "
        f"It is a {ticket_type} and has a resolution status of '{resolution}'."
    )

    if sum_comm:
        summary += f" The comments are talking about: {sum_comm}."

    return summary

@classification_bp.route('/match_issues', methods=['GET'])
@swag_from({
    'tags': ['Classification'],
    'summary': 'Match issues to tree nodes',
    'description': 'Fetches issues from the database, applies BERT tokenization, and returns the best matching tree node for each issue along with progress percentage.',
    'responses': {
        200: {
            'description': 'Best matching nodes for issues and progress percentage',
            'examples': {
                'application/json': {
                    'matched_issues': [
                        {
                            'issue': 'Issue description here...',
                            'best_matches': [
                                {'path': 'Root -> Node -> Subnode', 'similarity_score': 0.95},
                                {'path': 'Root -> AnotherNode', 'similarity_score': 0.90},
                                {'path': 'Root -> Node -> Subnode2', 'similarity_score': 0.85}
                            ],
                            'jira_id': '60d0fe4f5311236168a109ca',
                            'ticket_summary': 'Generated summary here...'
                        }
                    ],
                    'progress_percentage': 100
                }
            }
        },
        404: {
            'description': 'Issues or classification tree not found',
            'examples': {
                'application/json': {
                    'error': 'Issues or classification tree not found'
                }
            }
        }
    }
})
def match_issues():
    logging.info('Starting to match issues...')
    db = get_db()

    try:
        classification_tree = db.classification_tree.find_one()
        if not classification_tree:
            logging.error('Classification tree not found.')
            return jsonify({'error': 'Classification tree not found'}), 404
    except Exception as e:
        logging.error(f'Error fetching classification tree: {e}')
        return jsonify({'error': 'Error fetching classification tree'}), 500

    leaf_paths = get_leaf_paths(classification_tree)
    X_paths = get_bert_embeddings(leaf_paths)

    try:
        issues_cursor = db.jira_tickets.find()
        issues = list(issues_cursor)
        if not issues:
            logging.error('No Jira tickets found.')
            return jsonify({'error': 'No Jira tickets found'}), 404
    except Exception as e:
        logging.error(f'Error fetching Jira tickets: {e}')
        return jsonify({'error': 'Error fetching Jira tickets'}), 500

    matched_issues = []
    total_issues = len(issues)
    progress_percentage = 0

    for index, issue in enumerate(issues):
        description = issue.get('Description', '')
        preprocessed_ticket = preprocess_text(description)
        if not preprocessed_ticket.strip() or not description:
            logging.warning(f"Issue {issue['_id']} has no meaningful content or description, skipping.")
            
            matched_issues.append({
                'issue': description,
                'best_matches': None,
                'jira_id': str(issue['_id']),
                'ticket_summary': generate_ticket_summary(
                    issue.get('ID', 'Unknown ID'),
                    issue.get('Title', 'No Title'),
                    issue.get('Status', 'No Status'),
                    issue.get('Project', 'No Project'),
                    issue.get('Component', 'No Component'),
                    issue.get('Type', 'No Type'),
                    issue.get('Resolution', 'No Resolution'),
                    sum_comm=''
                )
            })
            continue

        ticket_vector = get_bert_embeddings([preprocessed_ticket])[0]

        best_paths = classify_ticket_dfs(ticket_vector.reshape(1, -1), classification_tree, [], X_paths, leaf_paths, threshold=0.5)
        if best_paths:
            best_paths.sort(key=lambda x: x[1], reverse=True)
            best_matches = [{'path': path, 'similarity_score': float(score)} for path, score in best_paths if score >= 0.5][:3]
            if not best_matches:
                best_matches = []
        else:
            best_matches = []

        # Generate description summary
        sum_desc, _ = generate_description_summary(description)

        # Generate comments summary
        sum_comm, status = generate_comments_summary(issue.get('ID', 'Unknown ID'))
        if status != 200:
            sum_comm = None

        ticket_summary = generate_ticket_summary(
            issue.get('ID', 'Unknown ID'),
            issue.get('Title', 'No Title'),
            issue.get('Status', 'No Status'),
            issue.get('Project', 'No Project'),
            issue.get('Component', 'No Component'),
            issue.get('Type', 'No Type'),
            issue.get('Resolution', 'No Resolution'),
            sum_comm=sum_comm
        )

        matched_issue = {
            'issue': json.loads(json.dumps(issue, cls=JSONEncoder)),  # Serialize the issue object correctly
            'best_matches': best_matches,
            'jira_id': str(issue['_id']),
            'ticket_summary': ticket_summary,
            'description_summary': sum_desc,  # Include description summary separately
            'comments_summary': sum_comm
        }

        logging.info(f'Matched issue: {matched_issue}')
        matched_issues.append(matched_issue)

        try:
            db.matched_issues.update_one(
                {'jira_id': matched_issue['jira_id']},
                {'$set': matched_issue},
                upsert=True
            )
        except Exception as e:
            logging.error(f"Error inserting matched issue into database: {e}")
            return jsonify({'error': 'Error inserting matched issue into database'}), 500

        progress_percentage = int((index + 1) / total_issues * 100)
        logging.info(f'Progress: {progress_percentage}%')

    return jsonify({'matched_issues': matched_issues, 'progress_percentage': progress_percentage})

app.register_blueprint(classification_bp, url_prefix='/classification')

if __name__ == '__main__':
    app.run(debug=True)
