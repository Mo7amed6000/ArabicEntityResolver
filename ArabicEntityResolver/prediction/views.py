from django.shortcuts import render
from tensorflow.keras.models import load_model
from keras.preprocessing.sequence import pad_sequences
from django.http import JsonResponse,HttpResponse
import numpy as np
import re
import os
import json
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical
from django.views.decorators.csrf import csrf_exempt

lstm_model = load_model('prediction/Predictors/final_model.keras')
MAX_SEQUENCE_LENGTH = 40
vocab = set()
sentences = []
tags = []

def clean_str(text):
    search = ["أ","إ","آ","ة","_","-","/",".","،"," و "," يا ",'"',"ـ","'","ى","\\",'\n', '\t','&quot;','?','؟','!']
    replace = ["ا","ا","ا","ه"," "," ","","",""," و"," يا","","","","ي","",' ', ' ',' ',' ? ',' ؟ ',' ! ']

    # Remove tashkeel
    p_tashkeel = re.compile(r'[\u0617-\u061A\u064B-\u0652]')
    text = re.sub(p_tashkeel,"", text)

    # Remove longation
    p_longation = re.compile(r'(.)\1+')
    subst = r"\1\1"
    text = re.sub(p_longation, subst, text)

    text = text.replace('وو', 'و')
    text = text.replace('يي', 'ي')
    text = text.replace('اا', 'ا')

    for i in range(0, len(search)):
        text = text.replace(search[i], replace[i])

    # Trim
    text = text.strip()

    return text


def re_clean(old_sentence, old_tags):
  space_regex = re.compile("\s+")
  new_sentence = []
  new_tags = []
  for j in range(len(old_sentence)):
    # add word if not empty and doesn't contain spaces only
    if old_sentence[j]!="" and space_regex.match(old_sentence[j])==None:
      new_sentence.append(old_sentence[j])
      new_tags.append(old_tags[j])

  return new_sentence, new_tags

# Entity Cleaner: Unites entity tags and fixs misspellings
def tags_cleaner(entity):
  entity = re.sub('\n','',entity) # Remove the newline (\n)
  if entity in ['B-LOC', 'B-MIS', 'B-ORG','B-PER','I-LOC','I-MIS','I-ORG','I-PER','O']:
    return entity
  elif entity in ['B-MIS0','B-MIS1', 'B-MIS2', 'B-MIS3', 'B-MIS-1','B-MIS-2', 'B-MIS1`', 'B-MISS1']:
    return 'B-MIS'
  elif entity in ['I-MIS0','I-MIS1', 'I-MIS2', 'I-MIS3']:
    return 'I-MIS'
  elif entity in ['B-ENGLISH', 'B-SPANISH', 'OO', 'IO']:
    return 'O'
  elif entity == 'I--ORG':
    return 'I-ORG'
  else:
    print('Error with entity:', entity)

corpus_path = "prediction/Predictors/content/"
for file in os.listdir(corpus_path):
  if file.endswith('.txt'): # Get txt files only
    print('Processing:', file)
    topic = open(corpus_path+file)
    sentence = []
    entity = []
    for line in topic.readlines():
      if line == '\n': # Sentence end
        recleaned = re_clean(sentence, entity)
        sentences.append(recleaned[0].copy())
        tags.append(recleaned[1].copy())
        sentence.clear()
        entity.clear()
      else:
        line = line.split(sep=' ')
        clean_word = clean_str(line[0])       # Cleaning word
        vocab.add(clean_word)                 # Add word to the vocab
        sentence.append(clean_word)           # Add the word
        entity.append(tags_cleaner(line[1]))  # Clean and add entity


print('Done [Sentences:', len(sentences), ', Tags:', len(tags), ', Unique Words:', len(vocab))

word2id = {word:id for  id, word in enumerate(vocab)}
id2word = {id:word for  id, word in enumerate(vocab)}

def encode_sentence(old_sentence):
  encoded_sentence = []
  for word in old_sentence:
    try:
      encoded_sentence.append(word2id[word])
    except KeyError:
      encoded_sentence.append(0) # A dummy digit for out of vocab

  return encoded_sentence


def lstm_predict(sentence:str):
  result = []
  sentence = sentence.split(sep=' ')
  # Keeping track of words so not to process 40 words every time
  word_count = len(sentence)
  # Clean sentence
  ready_sentence = [clean_str(word) for word in sentence]
  # Encode sentence
  ready_sentence = encode_sentence(ready_sentence)
  # Padding sentence
  ready_sentence = pad_sequences(sequences = [ready_sentence],
                                 maxlen=MAX_SEQUENCE_LENGTH,
                                 dtype='int32',
                                 padding='post',
                                 truncating='post',
                                 value = 0)

  # Predict and return actual words only
  predictions = lstm_model.predict(ready_sentence)[0][0:word_count]

  i = 0
  for prediction in predictions:
    tags_onehot = {
      'B-LOC':np.array([1., 0., 0., 0., 0., 0., 0., 0., 0.]),
      'B-MIS':np.array([0., 1., 0., 0., 0., 0., 0., 0., 0.]),
      'B-ORG':np.array([0., 0., 1., 0., 0., 0., 0., 0., 0.]),
      'B-PER':np.array([0., 0., 0., 1., 0., 0., 0., 0., 0.]),
      'I-LOC':np.array([0., 0., 0., 0., 1., 0., 0., 0., 0.]),
      'I-MIS':np.array([0., 0., 0., 0., 0., 1., 0., 0., 0.]),
      'I-ORG':np.array([0., 0., 0., 0., 0., 0., 1., 0., 0.]),
      'I-PER':np.array([0., 0., 0., 0., 0., 0., 0., 1., 0.]),
      'O':    np.array([0., 0., 0., 0., 0., 0., 0., 0., 1.]),
    }
    tags_scores = {
      'B-LOC':0,
      'B-MIS':0,
      'B-ORG':0,
      'B-PER':0,
      'I-LOC':0,
      'I-MIS':0,
      'I-ORG':0,
      'I-PER':0,
      'O':0
    }
    for tag in list(tags_onehot.keys()):
      tags_scores[tag] = np.linalg.norm(tags_onehot[tag] - prediction)

    result.append("{}:{}".format(sentence[i], min(tags_scores, key=tags_scores.get)))
    print(sentence[i],':',min(tags_scores, key=tags_scores.get))

    i+=1
  return result
  

tags_encoding = {
    'B-LOC':0,
    'B-MIS':1,
    'B-ORG':2,
    'B-PER':3,
    'I-LOC':4,
    'I-MIS':5,
    'I-ORG':6,
    'I-PER':7,
    'O':8
  }
def encode_tags(old_tags):
  new_tags = [tags_encoding[tag] for tag in old_tags]
  new_tags = to_categorical(y = new_tags, num_classes=9)
  return new_tags

# Encoding
sentences_encoded = []
tags_encoded = []

for i in range(len(sentences)):
  sentences_encoded.append(encode_sentence(sentences[i]))
  tags_encoded.append(encode_tags(tags[i]))

sentences_padded = pad_sequences(sequences = sentences_encoded,
                                 maxlen=MAX_SEQUENCE_LENGTH,
                                 dtype='int32',
                                 padding='post',
                                 truncating='post',
                                 value = 0)
tags_padded = pad_sequences(sequences = tags_encoded,
                                 maxlen=MAX_SEQUENCE_LENGTH,
                                 dtype='int32',
                                 padding='post',
                                 truncating='post',
                                 value = np.array([0., 0., 0., 0., 0., 0., 0., 0., 1.]))

# Splitting data
train_sentences, test_sentences, train_labels, test_labels = train_test_split(sentences_padded,
                                                                              tags_padded,
                                                                              train_size=0.8,
                                                                              random_state=42)

@csrf_exempt
def predict(request):
    lstm_model.evaluate(test_sentences, test_labels)
    # Use the model for prediction or any other tasks
    prediction = lstm_predict('زار احمد الاهرامات في دولة مصر')
    print(prediction)
    # Return some response
    prediction_json = json.dumps({'prediction': prediction}, ensure_ascii=False)
    print(prediction_json)
    # Return JsonResponse with the manually created JSON string
    return HttpResponse(prediction_json)

@csrf_exempt
def prediction(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))  # Parse JSON data
            text = data.get('text', '')  # Get the value of 'text' from the JSON data
            print(text)
            # Use your prediction logic here
            prediction = lstm_predict(text)
            return JsonResponse({'prediction': prediction})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)