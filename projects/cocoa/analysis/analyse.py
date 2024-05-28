import sys
from lexer import *
from tokens import *
from translator import *
from ds import *
from storageWorker import *
from vulnDetector import *
from cripto import *
import yaml
import time
import pickle
#from lib.ore_wrapper import getInitiatedParams, OreVal
#from decryptor import decrypt_lineno
from preprocessor import preprocess_php
#perf counter to measure time more accurately
from time import perf_counter
from pyscript import when, display

def create_index(php_file, Kd_key=None, Kr_key=None, preprocess_flag=True):
    #Kd_key = Random.new().read(AES.block_size)
    
    flag = Kd_key != None and Kr_key != None
    ore_params = None #ore depends on the flag -o
    
    # source ==> lextoken stream
    input_data = php_file
    # --- Preprocessor ---
    start_time = time.time()
    
    if preprocess_flag:
        input_data = preprocess_php(input_data)
        end_time = time.perf_counter()
        display("---Preprocessor %s seconds ---" % (end_time - start_time))

    # --- Lexer ---
    start_time = time.perf_counter()
    lexer.lineno = 1
    lexer.input(input_data)
    lextokens = []
    while True:
        tok = lexer.token()
        if not tok:
            break      # No more input
        lextokens.append(tok)
        #display(tok)
    end_time = time.perf_counter()
    display("---Lexer %s seconds ---" % (end_time - start_time))

    # --- Translator ---
    start_time = time.perf_counter()
    # lextoken stream ==> intermediate language
    intermediate = translator.translate(lextokens)
    #display(*intermediate, sep='\n')
    end_time = time.perf_counter()
    display("---Translator %s seconds ---" % (end_time - start_time))

    # --- Encryptor ---
    # Create encypted index
    start_time = time.perf_counter()
    # intermediate ==> data structure
    data = DataStructure()
    wrk = Worker(data, intermediate, Kd_key,Kr_key,ore_params) if flag else Worker(data,intermediate) 
    wrk.store(0)
    # display(data.data)
    end_time = time.perf_counter()
    display("---Encryptor %s seconds ---" % (end_time - start_time))
    
    # --- Vulnerability Detection ---
    start_time = time.perf_counter()
    #if ore_params != None:
    #    results = decrypt_lineno(results, ore_params[0],100)

    return data

 #wc -l

