from transformers import pipeline
import sys

pipe = pipeline("text-generation", model="tanusrich/Mental_Health_Chatbot")

def get_response(prompt):
    result = pipe(prompt, max_length=128, do_sample=True, temperature=0.7)
    return result[0]['generated_text']

if __name__ == "__main__":
    prompt = sys.argv[1]
    print(get_response(prompt)) 