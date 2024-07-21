from config.blibs import *

SECRET_KEY = 'Makiz-Code'

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to access route: Token is missing<b data-time='{get_time()}'></b>", 
                }
            })

        try:
            data = jwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
            current_user = data['username']
        except jwt.ExpiredSignatureError:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to access route: Token has expired<b data-time='{get_time()}'></b>", 
                }
            })
        except jwt.InvalidTokenError:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to access route: Invalid token<b data-time='{get_time()}'></b>", 
                }
            })
        return f(current_user, *args, **kwargs)
    return decorated_function
