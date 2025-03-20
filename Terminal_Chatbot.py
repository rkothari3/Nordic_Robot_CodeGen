# Import necessary libraries
import streamlit as st
from google import genai  # For interacting with Gemini 2.0 Flash API
from dotenv import load_dotenv  # For loading environment variables from .env file
import os  # For accessing environment variables

# Load environment variables from .env file
load_dotenv()

# Retrieve the API key from the environment variables
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("API key not found. Please set GEMINI_API_KEY in your .env file.")

# Initialize the Gemini client with the API key
client = genai.Client(api_key=API_KEY)

# Function to stream responses from Gemini 2.0 Flash
def stream_response(prompt):
    """
    Sends a prompt to Gemini 2.0 Flash and streams the response token by token.

    Args:
        prompt (str): The user's input message.

    Returns:
        None: Prints the response tokens to the terminal.
    """
    try:
        # Stream the response from Gemini 2.0 Flash model
        print("Bot: ", end="", flush=True)
        for chunk in client.models.generate_content_stream(
            model="gemini-2.0-flash", contents=prompt
        ):
            print(chunk.text, end="", flush=True)  # Print each token as it arrives
        print()  # Add a newline after the response is complete
    except Exception as e:
        print(f"\nError: {e}")

# Main function to handle chatbot interaction
def main():
    """
    Main loop for user-chatbot interaction in the terminal.
    Continuously accepts user input and fetches responses from Gemini 2.0 Flash.
    """
    print("Welcome to the Gemini Chatbot! Type 'exit' to quit.\n")

    while True:
        # Get user input
        user_input = input("You: ")
        
        # Exit condition
        if user_input.lower() == "exit":
            print("Goodbye!")
            break
        
        # Send user input to Gemini and stream the response
        stream_response(user_input)

# Run the chatbot program if this file is executed directly
if __name__ == "__main__":
    main()
