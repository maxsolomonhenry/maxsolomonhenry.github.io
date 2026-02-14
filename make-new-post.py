from datetime import date
import argparse
import os
import re

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a new blog post dated today.")
    parser.add_argument("title", help="Title of the blog post")
    args = parser.parse_args()

    title = args.title
    content = f"---\nlayout: post\ntitle: \"{title}\"\n---\n\n# {title}"

    title = title.replace(" ", "-")
    title = re.sub(r"[^a-z0-9\-]", "", title.rstrip("-").lower())

    today = date.today().isoformat()
    fname = f"{today}-{title}.md"

    fpath = os.path.join("_posts", fname)
    with open(fpath, 'w') as f:
        f.write(content)