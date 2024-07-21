import threading

from pandas import Timestamp
import pandas as pd
import numpy as np

import pytesseract
import PyPDF2
import imaplib
import tabula
import spacy
import email
import json
import mimetypes
import fitz
import base64

import sys
import os
import re
import string
import random

from pdf2image import convert_from_path
from extract_msg import Message
from datetime import datetime
from pptx import Presentation
from docx import Document
from concurrent.futures import ThreadPoolExecutor

import torch
from transformers import BertForSequenceClassification, BertTokenizer, BertForMaskedLM, pipeline
from sklearn.metrics import precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from torch.utils.data import Dataset, DataLoader
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from transformers.utils import logging
logging.get_logger("transformers").setLevel(logging.ERROR)

import warnings
warnings.filterwarnings("ignore", message="errors='ignore' is deprecated.*")
warnings.filterwarnings("ignore", message="Downcasting behavior in `replace` is deprecated.*")
warnings.filterwarnings("ignore", message="`huggingface_hub` cache-system uses symlinks.*")
