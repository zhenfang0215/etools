#!/usr/bin/python3

import json
import os


data = os.getenv('TASKLIST')
tasks = json.loads(data)

items = []
for task in tasks["items"]:
    items.append(
            {
                "uid": task["title"],
                "type": "file",
                "title": task["title"],
                "subtitle": f"创建一个新任务 {task['title'],}",
            }
    )

output = json.dumps({
    "items": items
})
print(output)



