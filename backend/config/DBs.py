from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"

DB_NAMES = {
    'default': 'VERMEG',
}


# ONLY ONE INSTANCE OF MONGO CLIENT SHOULD BE USED IN THE APPLICATION
def get_uris():
    mongo_uris = {}
    for db_name, db_uri in DB_NAMES.items():
        mongo_uris[db_name] = MONGO_URI + db_uri
    return mongo_uris

def get_db(db_name='default'):
    mongo_uri = MONGO_URI + DB_NAMES.get(db_name, "")
    if not mongo_uri:
        raise ValueError(f"Database '{db_name}' is not configured.")
    client = MongoClient(mongo_uri)
    return client[DB_NAMES[db_name]]

def conf_db(app):
    for db_name, mongo_uri in get_uris().items():
        app.config[f'MONGO_URI_{db_name.upper()}'] = mongo_uri







