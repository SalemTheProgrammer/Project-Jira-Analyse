from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from flasgger import swag_from
from config.utils import get_time
from models.jiraTicketModel import JiraTicket
from config.blibs import get_db
from transformers import pipeline

jira_bp = Blueprint('jira_bp', __name__)

qa_pipeline = pipeline("question-answering")
ner_pipeline = pipeline("ner", model="dslim/bert-large-NER")
db = get_db()

# Add a single JIRA ticket
@jira_bp.route('/', methods=['POST'])
@swag_from({
    'summary': 'Add a new JIRA ticket',
    'description': 'This endpoint allows you to add a new JIRA ticket.',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'key': {'type': 'string', 'example': 'JIRA-123'},
                    'title': {'type': 'string', 'example': 'Issue title'},
                    'created': {'type': 'integer', 'example': 1708041600000},
                    'updated': {'type': 'integer', 'example': 1708300800000},
                    'status': {'type': 'string', 'example': 'Open'},
                    'project': {'type': 'string', 'example': 'DevOps'},
                    'component': {'type': 'string', 'example': 'DevOps DIGITAL APP'},
                    'ticket_type': {'type': 'string', 'example': 'Problem Report'},
                    'resolution': {'type': 'string', 'example': 'Unresolved'},
                    'description': {'type': 'string', 'example': 'Issue description'},
                    'comments': {'type': 'string', 'example': 'Comments'},
                    'sum_desc': {'type': 'string', 'example': 'Summary Description'},
                    'sum_comm': {'type': 'string', 'example': 'Summary Comments'},
                    'ticket_sum': {'type': 'string', 'example': 'Ticket Summary'},
                    'embedding': {
                        'type': 'array',
                        'items': {'type': 'number'},
                        'example': [0.1, 0.2, 0.3, 0.4]
                    },
                    'activated': {'type': 'boolean', 'example': True}
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Ticket added successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Ticket JIRA-123 Added Successfully'
                    }
                }
            }
        },
        400: {
            'description': 'Failed to add ticket',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'danger',
                        'msg': 'Failed to add ticket: Ticket with key JIRA-123 already exists'
                    }
                }
            }
        }
    }
})
def add_ticket():
    try:
        ticket_data = request.json
        existing_ticket = db.jira_tickets.find_one({'key': ticket_data['key']})
        if existing_ticket:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to add ticket: Ticket with key <b data-time='{get_time()}'>{ticket_data['key']}</b> already exists",
                }
            })

        ticket = JiraTicket.from_dict(ticket_data)
        result = db.jira_tickets.insert_one(ticket.to_dict())
        if result.inserted_id:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': f"Ticket <b data-time='{get_time()}'>{ticket_data['key']}</b> Added Successfully",
                }
            })

    except Exception as e:
        error_message = str(e)
        error_field = error_message.split(": ")[0] if ": " in error_message else "Unknown"
        error_msg = error_message.split(": ")[1] if ": " in error_message else error_message

        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to add ticket: <b data-time='{get_time()}'></b>{error_message}",
            },
            'error': {
                'field': error_field,
                'msg': error_msg,
            }
        })

# Add multiple JIRA tickets
@jira_bp.route('/bulk', methods=['POST'])
@swag_from({
    'summary': 'Add multiple JIRA tickets',
    'description': 'This endpoint allows you to add multiple JIRA tickets.',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'key': {'type': 'string', 'example': 'JIRA-123'},
                        'title': {'type': 'string', 'example': 'Issue title'},
                        'created': {'type': 'integer', 'example': 1708041600000},
                        'updated': {'type': 'integer', 'example': 1708300800000},
                        'status': {'type': 'string', 'example': 'Open'},
                        'project': {'type': 'string', 'example': 'DevOps'},
                        'component': {'type': 'string', 'example': 'DevOps DIGITAL APP'},
                        'ticket_type': {'type': 'string', 'example': 'Problem Report'},
                        'resolution': {'type': 'string', 'example': 'Unresolved'},
                        'description': {'type': 'string', 'example': 'Issue description'},
                        'comments': {'type': 'string', 'example': 'Comments'},
                        'sum_desc': {'type': 'string', 'example': 'Summary Description'},
                        'sum_comm': {'type': 'string', 'example': 'Summary Comments'},
                        'ticket_sum': {'type': 'string', 'example': 'Ticket Summary'},
                        'embedding': {
                            'type': 'array',
                            'items': {'type': 'number'},
                            'example': [0.1, 0.2, 0.3, 0.4]
                        },
                        'activated': {'type': 'boolean', 'example': True}
                    }
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Tickets added successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Tickets Added Successfully'
                    }
                }
            }
        },
        400: {
            'description': 'Failed to add tickets',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'danger',
                        'msg': 'Failed to add tickets: One or more tickets already exist'
                    }
                }
            }
        }
    }
})
def add_tickets():
    try:
        db = get_db()  # Ensure you have your db connection here
        tickets_data = request.json
        keys = [ticket.get('key') for ticket in tickets_data]
        existing_tickets = db.jira_tickets.find({'key': {'$in': keys}})
        
        existing_keys = {ticket['key'] for ticket in existing_tickets}
        if existing_keys:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to add tickets: Tickets with keys {', '.join(existing_keys)} already exist",
                }
            })

        tickets = []
        for ticket_data in tickets_data:
            description = ticket_data.get('Description', '')
            if description:
                # Generate summary of the description using the QA pipeline
                answer = qa_pipeline(question="What are we talking about?", context=description)
                summary = answer['answer']

                # Remove personal names from the summary
                summary = remove_person_names(summary, ner_pipeline)
                ticket_data['SumDesc'] = summary
            else:
                ticket_data['SumDesc'] = "No description available"
            tickets.append(JiraTicket.from_dict(ticket_data))

        results = db.jira_tickets.insert_many([ticket.to_dict() for ticket in tickets])

        if results.inserted_ids:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': "Tickets Added Successfully",
                }
            })

    except KeyError as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to add tickets: missing required key {str(e)}",
            }
        })
    except Exception as e:
        error_message = str(e)
        error_field = error_message.split(": ")[0] if ": " in error_message else "Unknown"
        error_msg = error_message.split(": ")[1] if ": " in error_message else error_message

        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to add tickets: <b data-time='{get_time()}'></b>{error_message}",
            },
            'error': {
                'field': error_field,
                'msg': error_msg,
            }
        })

def remove_person_names(text, ner_pipeline, threshold=0.7):
    # Use the NER pipeline to detect named entities and remove person names
    results = ner_pipeline(text)
    for entity in results:
        if entity['score'] > threshold and entity['entity'].startswith("B-PER"):
            text = text.replace(entity['word'], "[REDACTED]")
    return text

def get_time():
    import datetime
    return datetime.datetime.now().isoformat()

@jira_bp.route('/<id>', methods=['GET'])
@swag_from({
    'summary': 'Get a JIRA ticket by ID',
    'description': 'This endpoint retrieves a JIRA ticket by its ID.',
    'parameters': [
        {
            'name': 'id',
            'in': 'path',
            'required': True,
            'type': 'string',
            'example': '60d5f2b5c2b8f3b4b0e8b5a1'
        }
    ],
    'responses': {
        200: {
            'description': 'A JIRA ticket',
            'examples': {
                'application/json': {
                    'data': {
                        '_id': '60d5f2b5c2b8f3b4b0e8b5a1',
                        'key': 'JIRA-123',
                        'title': 'Issue title',
                        'created': 1708041600000,
                        'updated': 1708300800000,
                        'status': 'Open',
                        'project': 'DevOps',
                        'component': 'DevOps DIGITAL APP',
                        'ticket_type': 'Problem Report',
                        'resolution': 'Unresolved',
                        'description': 'Issue description',
                        'comments': 'Comments',
                        'sum_desc': 'Summary Description',
                        'sum_comm': 'Summary Comments',
                        'ticket_sum': 'Ticket Summary',
                        'activated': True
                    }
                }
            }
        },
        404: {
            'description': 'Ticket not found',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'warning',
                        'msg': 'Unable to get ticket: id 60d5f2b5c2b8f3b4b0e8b5a1 not found'
                    }
                }
            }
        }
    }
})
def get_ticket(id):
    try:
        ticket = db.jira_tickets.find_one({'_id': ObjectId(id)})
        if ticket:
            ticket['_id'] = str(ticket['_id'])
            return jsonify({
                'data': ticket
            })
        else:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to get ticket: id <b data-time='{get_time()}'>{id}</b> not found",
                }
            })
    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Error retrieving ticket: <b data-time='{get_time()}'></b>{str(e)}",
            }
        })

@jira_bp.route('/<id>', methods=['PUT'])
@swag_from({
    'summary': 'Update a JIRA ticket by ID',
    'description': 'This endpoint updates a JIRA ticket by its ID.',
    'parameters': [
        {
            'name': 'id',
            'in': 'path',
            'required': True,
            'type': 'string',
            'example': '60d5f2b5c2b8f3b4b0e8b5a1'
        },
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'key': {'type': 'string', 'example': 'JIRA-123'},
                    'title': {'type': 'string', 'example': 'Issue title'},
                    'created': {'type': 'integer', 'example': 1708041600000},
                    'updated': {'type': 'integer', 'example': 1708300800000},
                    'status': {'type': 'string', 'example': 'Open'},
                    'project': {'type': 'string', 'example': 'DevOps'},
                    'component': {'type': 'string', 'example': 'DevOps DIGITAL APP'},
                    'ticket_type': {'type': 'string', 'example': 'Problem Report'},
                    'resolution': {'type': 'string', 'example': 'Unresolved'},
                    'description': {'type': 'string', 'example': 'Issue description'},
                    'comments': {'type': 'string', 'example': 'Comments'},
                    'sum_desc': {'type': 'string', 'example': 'Summary Description'},
                    'sum_comm': {'type': 'string', 'example': 'Summary Comments'},
                    'ticket_sum': {'type': 'string', 'example': 'Ticket Summary'},
                    'embedding': {
                        'type': 'array',
                        'items': {'type': 'number'},
                        'example': [0.1, 0.2, 0.3, 0.4]
                    },
                    'activated': {'type': 'boolean', 'example': True}
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Ticket updated successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Ticket JIRA-123 Updated Successfully'
                    }
                }
            }
        },
        400: {
            'description': 'Failed to update ticket',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'danger',
                        'msg': 'Failed to update ticket: Ticket with key JIRA-123 already exists'
                    }
                }
            }
        }
    }
})
def update_ticket(id):
    try:
        ticket_data = request.json
        existing_ticket = db.jira_tickets.find_one({'key': ticket_data['key']})
        if existing_ticket and str(existing_ticket['_id']) != id:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to update ticket: Ticket with key <b data-time='{get_time()}'>{ticket_data['key']}</b> already exists",
                }
            })

        ticket = JiraTicket.from_dict(ticket_data)
        result = db.jira_tickets.update_one({'_id': ObjectId(id)}, {'$set': ticket.to_dict()})
        if result.modified_count > 0:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': f"Ticket <b data-time='{get_time()}'>{ticket_data['key']}</b> Updated Successfully",
                }
            })
        else:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to update ticket: id <b data-time='{get_time()}'>{id}</b> not found",
                }
            })

    except Exception as e:
        error_message = str(e)
        error_field = error_message.split(": ")[0] if ": " in error_message else "Unknown"
        error_msg = error_message.split(": ")[1] if ": " in error_message else error_message

        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to update ticket: <b data-time='{get_time()}'></b>{error_message}",
            },
            'error': {
                'field': error_field,
                'msg': error_msg,
            }
        })

@jira_bp.route('/<id>', methods=['DELETE'])
@swag_from({
    'summary': 'Delete a JIRA ticket by ID',
    'description': 'This endpoint deletes a JIRA ticket by its ID.',
    'parameters': [
        {
            'name': 'id',
            'in': 'path',
            'required': True,
            'type': 'string',
            'example': '60d5f2b5c2b8f3b4b0e8b5a1'
        }
    ],
    'responses': {
        200: {
            'description': 'Ticket deleted successfully',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'success',
                        'msg': 'Ticket JIRA-123 Deleted Successfully'
                    }
                }
            }
        },
        404: {
            'description': 'Ticket not found',
            'examples': {
                'application/json': {
                    'notif': {
                        'type': 'warning',
                        'msg': 'Unable to delete ticket: id 60d5f2b5c2b8f3b4b0e8b5a1 not found'
                    }
                }
            }
        }
    }
})
def delete_ticket(id):
    try:
        ticket = db.jira_tickets.find_one({'_id': ObjectId(id)})
        if ticket:
            result = db.jira_tickets.delete_one({'_id': ObjectId(id)})
            if result.deleted_count > 0:
                return jsonify({
                    'notif': {
                        'type': "success",
                        'msg': f"Ticket <b data-time='{get_time()}'>{ticket.get('key')}</b> Deleted Successfully",
                    }
                })
        else:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to delete ticket: id <b data-time='{get_time()}'>{id}</b> not found",
                }
            })
    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Error deleting ticket: <b data-time='{get_time()}'></b>{str(e)}",
            }
        })


@jira_bp.route('/', methods=['GET'])
@swag_from({
    'summary': 'Get all JIRA tickets',
    'description': 'This endpoint retrieves all JIRA tickets.',
    'responses': {
        200: {
            'description': 'A list of JIRA tickets',
            'examples': {
                'application/json': {
                    'data': [
                        {
                            '_id': '60d5f2b5c2b8f3b4b0e8b5a1',
                            'key': 'JIRA-123',
                            'title': 'Issue title',
                            'created': 1708041600000,
                            'updated': 1708300800000,
                            'status': 'Open',
                            'project': 'DevOps',
                            'component': 'DevOps DIGITAL APP',
                            'ticket_type': 'Problem Report',
                            'resolution': 'Unresolved',
                            'description': 'Issue description',
                            'comments': 'Comments',
                            'sum_desc': 'Summary Description',
                            'sum_comm': 'Summary Comments',
                            'ticket_sum': 'Ticket Summary',
                            'embedding': [0.1, 0.2, 0.3, 0.4],
                            'activated': True
                        }
                    ]
                }
            }
        }
    }
})
def get_tickets():
    try:
        tickets = []
        for ticket in db.jira_tickets.find():
            ticket['_id'] = str(ticket['_id'])
            tickets.append(ticket)
        return jsonify({
            'data': tickets
        })
    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Error retrieving tickets: {str(e)}"
            }
        })



@jira_bp.route('/<ticket_id>/toggle-activation', methods=['PATCH'])
@swag_from({
    'summary': 'Toggle activation status of a JIRA ticket',
    'description': 'This endpoint toggles the activation status of a JIRA ticket by its ID.',
    'parameters': [
        {
            'name': 'ticket_id',
            'in': 'path',
            'required': True,
            'type': 'string',
            'example': '60d5f2b5c2b8f3b4b0e8b5a1'
        }
    ],
    'responses': {
        200: {
            'description': 'Ticket activation status updated',
            'examples': {
                'application/json': {
                    'message': 'Ticket activation status updated',
                    'active': True
                }
            }
        },
        404: {
            'description': 'Ticket not found',
            'examples': {
                'application/json': {
                    'error': 'Ticket not found'
                }
            }
        },
        500: {
            'description': 'Internal server error',
            'examples': {
                'application/json': {
                    'error': 'An error message'
                }
            }
        }
    }
})
def toggle_activation(ticket_id):
    try:
        ticket = db.jira_tickets.find_one({"_id": ObjectId(ticket_id)})
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        # Toggle the activation status
        new_status = not ticket.get('activated', False)
        db.jira_tickets.update_one(
            {"_id": ObjectId(ticket_id)},
            {"$set": {"activated": new_status}}
        )

        return jsonify({"message": "Ticket activation status updated", "active": new_status}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500