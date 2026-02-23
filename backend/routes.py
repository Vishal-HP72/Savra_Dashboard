from flask import jsonify, request
from app import app, mongo
from datetime import datetime

collection = mongo.db.activities


# ==========================
# SUMMARY PER TEACHER
# ==========================
@app.route("/summary")
def summary():
    pipeline = [
        {
            "$group": {
                "_id": "$Teacher_name",

                "lessons": {
                    "$sum": {
                        "$cond": [
                            {"$regexMatch": {"input": "$Activity_type", "regex": "Lesson", "options": "i"}},
                            1,
                            0
                        ]
                    }
                },

                "quizzes": {
                    "$sum": {
                        "$cond": [
                            {"$regexMatch": {"input": "$Activity_type", "regex": "Quiz", "options": "i"}},
                            1,
                            0
                        ]
                    }
                },
                "assessments": {
                    "$sum": {
                        "$cond": [
                            {"$regexMatch": {"input": "$Activity_type", "regex": "Question Paper|Assessment", "options": "i"}},
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {"$sort": {"_id": 1}}
    ]

    return jsonify(list(collection.aggregate(pipeline)))


# ==========================
# WEEKLY TREND
# ==========================
@app.route("/weekly")
def weekly():
    # Get the filter type from the URL query parameters
    activity_type = request.args.get('type', 'all').lower()

    # Step 1: Create a match stage to filter by activity type if needed
    match_stage = {}
    if activity_type != 'all':
        if activity_type == 'lessons':
            match_stage = {"Activity_type": {"$regex": "Lesson", "$options": "i"}}
        elif activity_type == 'quizzes':
            match_stage = {"Activity_type": {"$regex": "Quiz", "$options": "i"}}
        elif activity_type == 'assessments':
            match_stage = {"Activity_type": {"$regex": "Question Paper|Assessment", "$options": "i"}}

    # Step 2: Build the pipeline
    pipeline = []
    
    # Only add the match stage if we are filtering
    if match_stage:
        pipeline.append({"$match": match_stage})

    # Add the grouping logic
    pipeline.extend([
        {
            "$addFields": {
                "created_date": {
                    "$dateFromString": {
                        "dateString": "$Created_at"
                    }
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%U",
                        "date": "$created_date"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ])

    return jsonify(list(collection.aggregate(pipeline)))

# ==========================
# PER TEACHER DETAILS
# ==========================

@app.route("/teacher/<name>")
def teacher(name):
    data = list(
        collection.find({"Teacher_name": name}, {"_id": 0})
    )
    return jsonify(data)



# ==========================
# MONTHLY TREND
# ==========================
@app.route("/monthly")
def monthly():
    activity_type = request.args.get('type', 'all').lower()

    match_stage = {}
    if activity_type != 'all':
        if activity_type == 'lessons':
            match_stage = {"Activity_type": {"$regex": "Lesson", "$options": "i"}}
        elif activity_type == 'quizzes':
            match_stage = {"Activity_type": {"$regex": "Quiz", "$options": "i"}}
        elif activity_type == 'assessments':
            match_stage = {"Activity_type": {"$regex": "Question Paper|Assessment", "$options": "i"}}

    pipeline = []
    if match_stage:
        pipeline.append({"$match": match_stage})

    pipeline.extend([
        {
            "$addFields": {
                "created_date": {
                    "$dateFromString": {
                        "dateString": "$Created_at"
                    }
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m", # <--- CHANGED TO %Y-%m FOR MONTHLY GROUPING
                        "date": "$created_date"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ])

    return jsonify(list(collection.aggregate(pipeline)))