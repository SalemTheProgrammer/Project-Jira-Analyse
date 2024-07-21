from config.blibs import *

dataset_bp = Blueprint('dataset_bp', __name__)
db = get_db()

@dataset_bp.route("/", methods=["POST"])
def uploadFile():
    try:
        if "file" not in request.files:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to upload file: <b data-time='{get_time()}'></b>No file part", 
                }
            })

        file = request.files["file"]
        if file.filename == "":
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to upload file: <b data-time='{get_time()}'></b>No selected file", 
                }
            })

        save_folder = "backend/data/uploads"
        path = os.path.join(save_folder, file.filename)

        file.save(path)

        from libs.VERData import data_extraction
        result = data_extraction(path, path)
        if result == True:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': f"File <b data-time='{get_time()}'>{file.filename}</b> uploaded successfully", 
                }
            })
        else:
            os.remove(path)
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to upload dataset: <b data-time='{get_time()}'>{file.filename}</b> is empty", 
                }
            })
    except Exception as e:
            os.remove(path)
            return jsonify({
                'notif': {
                    'type': "danger", 
                    'msg': f"Failed to upload dataset: <b data-time='{get_time()}'>{file.filename}</b> {str(e)}", 
                }
            })

@dataset_bp.route("/files", methods=["POST"])
def uploadFiles():
    try:
        if "folder" not in request.files:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to upload file: <b data-time='{get_time()}'></b>No file parts",
                }
            })

        files = request.files.getlist("folder")
        if len(files) == 0:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to upload file: <b data-time='{get_time()}'></b>No selected files",
                }
            })

        src_path = "backend/data/uploads/mails"
        dest_path = "backend/data/uploads/eml-auto-data.csv"

        for file in files:
            if file.filename != "":
                file.save(os.path.join(src_path, file.filename))

        from libs.VERData import data_extraction
        result = data_extraction(src_path, dest_path)
        if result == True:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': f"File <b data-time='{get_time()}'>eml-auto-data.csv</b> uploaded successfully", 
                }
            })
    except Exception as e:
            os.remove(dest_path)
            return jsonify({
                'notif': {
                    'type': "danger", 
                    'msg': f"Failed to upload dataset: <b data-time='{get_time()}'></b>{str(e)}", 
                }
            })

@dataset_bp.route("/", methods=["GET"])
def getFiles():
    folder_path = "backend/data/uploads"
    files = []
    if os.path.exists(folder_path) and os.path.isdir(folder_path):
        dir_files = os.listdir(folder_path)
        filenames = [file for file in dir_files if os.path.isfile(os.path.join(folder_path, file))]
        if filenames:
            from libs.VERData import get_files
            files = [get_files(os.path.join(folder_path,filename)) for filename in filenames]
        return jsonify({
            'notif': {
                'type': "success",
                'msg': f"Files <b data-time='{get_time()}'></b>fetched successfully", 
            },
            'data': files,
        })
    else:
        return jsonify({
            'notif': {
                'type': "danger", 
                'msg': f"Folder does not exist or is not a directory<b data-time='{get_time()}'></b>", 
            }
        })

@dataset_bp.route("/<filename>", methods=["DELETE"])
def deleteFile(filename):
    try:
        save_folder = "backend/data/uploads"
        path = os.path.join(save_folder, filename)

        if os.path.exists(path):
            os.remove(path)
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': f"File <b data-time='{get_time()}'>{filename}</b> deleted successfully.",
                }
            })
        else:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to delete file: File <b data-time='{get_time()}'>{filename}</b> not found.",
                }
            })

    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to delete file: <b data-time='{get_time()}'>{filename}</b> {str(e)}",
            }
        })

@dataset_bp.route("/clean/<filename>", methods=["POST"])
def cleanDataset(filename):
    try:
        save_folder = "backend/data/uploads"
        path = os.path.join(save_folder, filename)
        from libs.VERData import data_cleaning, filter_by_topics
        result = data_cleaning(path)
        if result == True:
            topics_cursor = db.topics.find({"state": True}, {"name": 1})
            topics = [topic["name"] for topic in topics_cursor]
            json_data = filter_by_topics(path, topics)
            if json_data:
                return jsonify({
                    'notif': {
                        'type': "success",
                        'msg': f"File <b data-time='{get_time()}'>{filename}</b> cleaned successfully",
                    },
                    'data': {
                        'emails': json_data,
                        'topics': topics,
                    }
                })
        else:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to clean file: <b data-time='{get_time()}'>{filename}</b> is empty",
                }
            })

    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to clean file: <b data-time='{get_time()}'>{filename}</b> {str(e)}",
            }
        })

@dataset_bp.route("/label/<filename>", methods=["POST"])
def labelDataset(filename):
    try:
        save_folder = "backend/data/uploads"
        path = os.path.join(save_folder, filename)
        json_data = request.json

        from libs.VERData import data_labeling
        result = data_labeling(path, json_data=json_data)
        if result == True:
            return jsonify({
                'notif': {
                    'type': "success",
                    'msg': f"File changes saved to <b data-time='{get_time()}'>{filename}</b>",
                }
            })
        else:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to save changes: <b data-time='{get_time()}'>{filename}</b> is empty",
                }
            })

    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to save changes: <b data-time='{get_time()}'>{filename}</b> {str(e)}",
            }
        })
    
@dataset_bp.route("/transform/<filename>", methods=["POST"])
def transformDataset(filename):
    try:
        save_folder = "backend/data/uploads"
        path = os.path.join(save_folder, filename)

        actions = {}
        action_cursor = db.topics.find({"state": True}, {"name": 1, "desc": 1})
        for item in action_cursor:
            actions[item["name"]] = item["desc"]

        from libs.VERData import data_reduction, data_augmentation
        condition = data_reduction(path, actions)

        if condition == True:
            condition, data, stats = data_augmentation(path)
            if condition == True:
                result = db.dataset.insert_many(data)
                if result.inserted_ids:
                    return jsonify({
                        'notif': {
                            'type': "success",
                            'msg': f"File <b data-time='{get_time()}'>{filename}</b> saved succesfully to global dataset",
                        },
                        'data': stats,
                    })
                else:
                    return jsonify({
                        'notif': {
                            'type': "danger",
                            'msg': f"Failed to augmente file <b data-time='{get_time()}'>{filename}</b> is empty",
                        },
                    })
        else:
            return jsonify({
                'notif': {
                    'type': "danger",
                    'msg': f"Failed to reduce file: <b data-time='{get_time()}'>{filename}</b> is empty",
                }
            })

    except Exception as e:
        return jsonify({
            'notif': {
                'type': "danger",
                'msg': f"Failed to transform file: <b data-time='{get_time()}'>{filename}</b> {str(e)}",
            }
        })
