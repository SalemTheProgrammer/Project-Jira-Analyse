import json
from flask import Flask, request, jsonify, Blueprint
from transformers import pipeline
from flasgger import Swagger, swag_from
from config.blibs import get_db

# Initialize the Flask application and the blueprint
app = Flask(__name__)
qa_bp = Blueprint('qa_bp', __name__)

# Initialize Swagger
swagger = Swagger(app)

# Load the pre-trained question-answering pipeline
qa_pipeline = pipeline("question-answering", model="bert-large-uncased-whole-word-masking-finetuned-squad")

@qa_bp.route('/answer_question', methods=['POST'])
@swag_from({
    'tags': ['Question Answering'],
    'summary': 'Answer a question based on Jira ticket comments or description',
    'description': 'This endpoint takes a question and a Jira ticket ID, and returns an answer based on the comments or description of the specified ticket.',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'question': {
                        'type': 'string',
                        'example': 'What problem is currently being experienced?'
                    },
                    'ticket_id': {
                        'type': 'string',
                        'example': 'your_ticket_id_here'
                    }
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Answer retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'ticket_id': {
                        'type': 'string',
                        'example': 'your_ticket_id_here'
                    },
                    'question': {
                        'type': 'string',
                        'example': 'What problem is currently being experienced?'
                    },
                    'answer': {
                        'type': 'string',
                        'example': 'The server is down due to a power outage.'
                    }
                }
            }
        },
        400: {
            'description': 'Invalid input',
            'schema': {
                'type': 'object',
                'properties': {
                    'error': {
                        'type': 'string',
                        'example': 'Both question and ticket_id are required'
                    }
                }
            }
        },
        404: {
            'description': 'Ticket not found or no comments available',
            'schema': {
                'type': 'object',
                'properties': {
                    'error': {
                        'type': 'string',
                        'example': 'Ticket not found'
                    }
                }
            }
        },
        500: {
            'description': 'Internal server error',
            'schema': {
                'type': 'object',
                'properties': {
                    'error': {
                        'type': 'string',
                        'example': 'An error occurred while processing your request.'
                    }
                }
            }
        }
    }
})
def answer_question():
    try:
        # Get the JSON data from the request
        data = request.get_json()
        question = data.get('question')
        ticket_id = data.get('ticket_id')

        if not question or not ticket_id:
            return jsonify({'error': 'Both question and ticket_id are required'}), 400

        # Connect to the database and retrieve the ticket by ID
        db = get_db()
        ticket = db.matched_issues.find_one({'issue.ID': ticket_id})

        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404

        # Get the comments context from the ticket
        context = ticket.get('Comments')
        if not context:
            # If comments are not available, use the description as context
            context = ticket.get('ticket_summary')
            if not context:
                return jsonify({'error': 'No comments or description available for this ticket'}), 404

        # Use the question-answering pipeline to get the answer
        answer = qa_pipeline(question=question, context=context)

        return jsonify({
            'ticket_id': ticket_id,
            'question': question,
            'answer': answer['answer']
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Register the blueprint with the Flask application
app.register_blueprint(qa_bp, url_prefix='/qa')

if __name__ == '__main__':
    app.run(debug=False)
