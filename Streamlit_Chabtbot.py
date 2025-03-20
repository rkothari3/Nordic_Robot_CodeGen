import streamlit as st
from google import genai
from dotenv import load_dotenv
import os

# Page configuration
st.set_page_config(
    page_title="Nordic-Robot Code Generator",
    layout="centered"
)

# Custom CSS for better appearance
st.markdown("""
<style>
    .chat-message {
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
    }
    .chat-message.user {
        background-color: #e0f7fa;
    }
    .chat-message.bot {
        background-color: #f5f5f5;
    }
    .chat-message .avatar {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 0.25rem;
        margin-right: 0.5rem;
        background-color: #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .chat-message .user-avatar {
        background-color: #2196f3;
        color: white;
    }
    .chat-message .bot-avatar {
        background-color: #ff9800;
        color: white;
    }
    .chat-message .content {
        margin-top: 0.5rem;
    }
    .stTextInput {
        position: fixed;
        bottom: 3rem;
        width: 100%;
    }
</style>
""", unsafe_allow_html=True)

# Load environment variables and API key
@st.cache_resource
def initialize_gemini():
    load_dotenv()
    API_KEY = os.getenv("GEMINI_API_KEY")
    if not API_KEY:
        st.error("API key not found. Please set GEMINI_API_KEY in your .env file.")
        st.stop()
    return genai.Client(api_key=API_KEY)

# Initialize Gemini client
client = initialize_gemini()

# App title
st.title("Nordic-Robot AI Code Generator")
st.markdown("Ask anything and get responses from Gemini 2.0 Flash AI model")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat messages from history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Function to generate and stream responses
def generate_response(prompt):
    response_container = st.empty()
    full_response = ""
    
    try:
        # Show a spinner while waiting for the first token
        with st.spinner("Thinking..."):
            response_stream = client.models.generate_content_stream(
                model="gemini-2.0-flash", 
                contents=prompt
            )
        
        # Stream the response
        for chunk in response_stream:
            if hasattr(chunk, 'text'):
                full_response += chunk.text
                response_container.markdown(full_response)
                
        return full_response
    except Exception as e:
        st.error(f"Error: {e}")
        return None

# Chat input and response
if prompt := st.chat_input("Ask something..."):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Display user message
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Display assistant response
    with st.chat_message("assistant"):
        response = generate_response(prompt)
        if response:
            st.session_state.messages.append({"role": "assistant", "content": response})

# Add a sidebar with information
with st.sidebar:
    st.title("About")
    st.markdown("""
    Chatbot for Georgia Tech's VIP Group 3

    ### Purpose:
    - Proof-of-concept for Nordic's code generator.
    
    ### Features:
    - Real-time response streaming
    - Chat history preservation
    - Simple, clean interface
    
    ### Model Information:
    - **Model**: Gemini 2.0 Flash
    - **Provider**: Google
                
    ### Created By:
    - Raj Kothari
    """)

    
    # Add a clear conversation button
    if st.button("Clear Conversation"):
        st.session_state.messages = []
        st.rerun()