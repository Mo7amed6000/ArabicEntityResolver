# Recognition and disambiguation of named entities in Arabic

## Description

Build a web platform that identifies and disambiguates named entities (people, places, organizations) in Arabic texts, by exploiting lexical databases adapted to the Arabic language and its dialects.
### Key Features:
- Text preprocessing to extract potential named entities.
- Use of lexical databases to disambiguate entities based on context.
- Web interface allowing users to submit texts and view identified named entities.
### Sources and resources to use:
- Corpus: Collection of texts in Arabic containing named entities.
- Lexical Databases: Use of Arabic lexical databases for entity disambiguation.
- Structured Datasets: Use of annotated datasets for training entity recognition models.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

Here is the installation process. Please make sure you have Python 3 installed as your main kernel. You can use any text editor, but we recommend using VSCode for development.

# installation steps

1. Clone the repository:
```bash
git clone https://github.com/Mo7amed6000/ArabicEntityResolver.git
```
3. Navigate into the project directory:
```bash
cd ArabicEntityResolver
```
5. Create a virtual environment:
```bash
python -m venv .venv
```
7. Activate the virtual environment:
On Windows:
```bash
.venv\Scripts\activate
```
On macOS/Linux:
```bash
source .venv/bin/activate
```
9. Install dependencies:
```bash
pip install -r requirements.txt
```
11. Apply migrations:
```bash
python manage.py migrate
```
13. To run the development server:
```bash
python manage.py runserver
```
