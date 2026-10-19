import os
from threading import Thread
from typing import Dict

import requests

DOWNLOAD_DIR = os.path.join(".tmp", "files")
os.makedirs(DOWNLOAD_DIR, exist_ok = True)


class TaskManager(object):
    def __init__(self):
        self.task_id = 1000
        self.tasks = {}  # type: Dict[int, str]
        self.task_threads = {}  # type: Dict[int, Thread]

    def add_task(self, task: str) -> int:
        print("creating task", task, self.task_id)
        thread = Thread(target = download_file, args = [task], daemon = True)
        thread.start()
        curr_id = self.task_id
        self.tasks[curr_id] = task
        self.task_threads[curr_id] = thread
        self.task_id += 1
        return curr_id

    def get_task_status(self, task_id: int) -> bool:
        print("getting task status", task_id)
        if task_id not in self.tasks:
            return False
        return os.path.exists(resolve_file_name(self.tasks[task_id]))

    def del_task(self, task_id: int):
        print("deleting task", task_id)
        if task_id not in self.tasks:
            return
        target_file = resolve_file_name(self.tasks[task_id])
        if os.path.exists(target_file):
            try:
                os.remove(target_file)
            except Exception as e:
                print(f"Error removing file {target_file}: {e}")
        self.tasks.pop(task_id, None)
        self.task_threads.pop(task_id, None)


def download_file(url: str):
    try:
        print("downloading file", url)
        resp = requests.head(url, allow_redirects = True)
        target_url = resp.url if resp.status_code == 200 else url
        file_resp = requests.get(target_url, allow_redirects = True, stream = True)
        file_resp.raise_for_status()
        out_path = resolve_file_name(url)
        with open(out_path, "wb") as fh:
            for chunk in file_resp.iter_content(chunk_size = 8192):
                if chunk:
                    fh.write(chunk)
        print("downloaded", url)
    except Exception:
        from traceback import print_exc
        print_exc()


def resolve_file_name(url: str):
    clean_name = url.split('/')[-1].split('?')[0]
    return os.path.join(DOWNLOAD_DIR, clean_name)
