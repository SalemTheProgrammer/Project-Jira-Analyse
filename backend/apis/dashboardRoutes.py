from config.blibs import *

dashboard_bp = Blueprint('dashboard_bp', __name__)
db = get_db()

@dashboard_bp.route("/", methods=["POST"])
def parseEmails():
    try:
        params = {
            'email_list': [],
            'passkey_list': [],
            'repository_list': [],
            'sender_emails_list': [],
            'topic_fields': {},
        }

        for mailbox in db.mailboxes.find():
            params['email_list'].append(mailbox['email'])
            params['passkey_list'].append(mailbox['passkey'])
            params['repository_list'].append(mailbox['repository'])

            sender_emails = [sender['email'] for sender in db.senders.find({'mailbox': mailbox['email']})]
            params['sender_emails_list'].append(sender_emails)

        for topic in db.topics.find():
            topic_name = topic['name']
            params['topic_fields'][topic_name] = {}

            for field in db.fields.find({'topic': topic_name}):
                field_name = field['name']
                query = field['query']
                params['topic_fields'][topic_name][field_name] = query

        from libs.VERImap import get_emails
        final_data = get_emails(params)

        for data in final_data:
            data['validate'] = False

        if final_data:
            result = db.emails.insert_many(final_data)
            if result.inserted_ids:
                return jsonify({
                'notif': {
                    'type': "primary",
                    'msg': f"New emails added to database<b data-time='{get_time()}'></b>",
                }
            })
            else:
                return jsonify({
                    'notif': {
                        'type': "danger",
                        'msg': f"Failed to add new emails to database<b data-time='{get_time()}'></b>",
                    },
                })
        else: 
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"No existing new emails<b data-time='{get_time()}'></b>",
                }
            })

    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to parse Emails: <b data-time='{get_time()}'></b>{str(e)}",
            }
        })
    
@dashboard_bp.route("/", methods=["GET"])    
def getEmails():
    emails = list(db.emails.find())
    if emails:
        for email in emails:
            if len(email.get('to', [])) > 0:
                recipient_email = email['to'][0]
                repository_info = db.mailboxes.find_one({'email': recipient_email}, {'repository': 1})
                if repository_info:
                    email['repository'] = repository_info['repository']
                else:
                    email['repository'] = ''
            else:
                email['repository'] = ''

            email['_id'] = str(email['_id'])

        return jsonify({
            'data': emails,
        })
    else:
        return jsonify({
            'notif': {
                'type': "warning",
                'msg': f"Unable to get Emails: <b data-time='{get_time()}'></b>No emails were found",
            }
        })
    

@dashboard_bp.route('/<id>', methods=['PUT'])
def validateEmail(id):
    try:
        validate = db.emails.find_one({'_id': ObjectId(id)}).get('validate')
        result = db.emails.update_one({'_id': ObjectId(id)}, {'$set': {'validate': not validate}})
        if result.modified_count > 0:
            comment = "set to validated" if not validate else "marked as not validated"
            return jsonify({
                'notif': {
                    'type': "primary",
                    'msg': f"Email <b data-time='{get_time()}'></b> {comment}"
                }
            })
        else:
            return jsonify({
                'notif': {
                    'type': "warning",
                    'msg': f"Unable to validate email: id <b data-time='{get_time()}'>{id}</b> not found", 
                }
            })
    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to validate email: <b data-time='{get_time()}'></b>{str(e)}"
            }
        })
    
@dashboard_bp.route('/download/', methods=['POST'])
def downloadFile():
    try:
        params = request.json
        filename = params.get('filename')
        payload = params.get('payload')

        path = "backend/data/records"
        filepath = os.path.abspath(os.path.join(path, filename))

        from libs.MailKit import set_file_with_payload
        set_file_with_payload(filepath, payload)

        return send_file(filepath, as_attachment=True)
    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to download file <b data-time='{get_time()}'>{filename}</b>: {str(e)}"
            }
        })
  