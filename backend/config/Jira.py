from flask import Blueprint, request, jsonify
from flasgger import swag_from
from jira import JIRA
import json
import requests
from config.DBs import get_db
from pymongo import UpdateOne

db = get_db()
jira_blueprint = Blueprint('jira', __name__)

@jira_blueprint.route('/download_jira_tickets', methods=['POST'])
@swag_from({
    'summary': 'Download JIRA tickets',
    'description': 'Downloads JIRA tickets from a specified JQL query and returns them as JSON.',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'jira_server': {'type': 'string', 'example': 'https://jira.atlassian.com'},
                    'jira_username': {'type': 'string', 'example': 'john.doe'},
                    'jira_api_token': {'type': 'string', 'example': 'your_api_token'},
                    'jql_query': {'type': 'string', 'example': 'project = KAN AND status = Open'}
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'JIRA tickets downloaded successfully',
            'examples': {
                'application/json': {
                    'message': 'Downloaded 10 issues from JIRA project KAN',
                    'issues': [
                        {
                            'key': 'KAN-1',
                            'summary': 'Issue summary',
                            'description': 'Issue description',
                            'status': 'Open',
                            'assignee': 'John Doe',
                            'created': '2021-01-01T12:00:00.000Z',
                            'updated': '2021-01-02T12:00:00.000Z'
                        }
                    ]
                }
            }
        },
        500: {
            'description': 'Failed to download JIRA tickets',
            'examples': {
                'application/json': {
                    'message': 'Failed to download JIRA tickets',
                    'error': 'An error message'
                }
            }
        }
    }
})
def download_jira_tickets():
    data = request.json
    required_fields = ['jira_server', 'jira_username', 'jira_api_token', 'jql_query']

    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing {field} parameter'}), 400

    jira_server = data['jira_server']
    jira_username = data['jira_username']
    jira_api_token = data['jira_api_token']
    jql_query = data['jql_query']

    try:
        options = {'server': jira_server}
        jira = JIRA(options, basic_auth=(jira_username, jira_api_token))
        issues = jira.search_issues(jql_query, maxResults=False)

        if not issues:
            return jsonify({'message': 'No issues found for the given JQL query', 'jql_query': jql_query}), 200

        issues_list = []
        new_issues_count = 0
        update_operations = []

        for issue in issues:
            issue_dict = {
                'ID': issue.key,
                'Title': issue.fields.summary,
                'Description': issue.fields.description,
                'Status': issue.fields.status.name,
                'Created': issue.fields.created,
                'Updated': issue.fields.updated,
                'Project': issue.fields.project.key,
                'Type': issue.fields.issuetype.name,
                'Resolution': issue.fields.resolution.name if issue.fields.resolution else "Unresolved",
                'Comments': [comment.body for comment in issue.fields.comment.comments] if issue.fields.comment.comments else None,
                'SumDesc': issue.fields.customfield_10000 if hasattr(issue.fields, 'customfield_10000') else None,
                'SumComm': issue.fields.customfield_10001 if hasattr(issue.fields, 'customfield_10001') else None,
                'TicketSum': issue.fields.customfield_10002 if hasattr(issue.fields, 'customfield_10002') else None,
                'Activated': True,  # Assuming 'activated' field is true by default
                'Embedding': [],  # Placeholder for embeddings if needed
            }
            issues_list.append(issue_dict)

            existing_issue = db.jira_tickets.find_one({'ID': issue_dict['ID']})

            if existing_issue:
                if existing_issue['Updated'] < issue_dict['Updated']:
                    update_operations.append(
                        UpdateOne(
                            {'ID': issue_dict['ID']},
                            {'$set': issue_dict}
                        )
                    )
            else:
                update_operations.append(
                    UpdateOne(
                        {'ID': issue_dict['ID']},
                        {'$set': issue_dict},
                        upsert=True
                    )
                )
                new_issues_count += 1

        if update_operations:
            db.jira_tickets.bulk_write(update_operations)

        response = {
            'message': f'Downloaded and saved {new_issues_count} new issues from JIRA',
            'issues': issues_list
        }
        return jsonify(response), 200

    except Exception as e:
        response = {
            'message': 'Failed to download or save JIRA tickets',
            'error': str(e)
        }
        return jsonify(response), 500
