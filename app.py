#!/usr/bin/env python3
"""
Hugging Face Spaces wrapper for Emotional Codex Companion
Launches the Node.js application for Hugging Face Spaces deployment
"""

import subprocess
import sys
import os
import time
import signal
import threading

def install_node_dependencies():
    """Install Node.js dependencies"""
    print("📦 Installing Node.js dependencies...")
    try:
        subprocess.run(["npm", "install"], check=True, cwd=".")
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)

def build_application():
    """Build the React application"""
    print("🔨 Building React application...")
    try:
        subprocess.run(["npm", "run", "build"], check=True, cwd=".")
        print("✅ Application built successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to build application: {e}")
        sys.exit(1)

def start_server():
    """Start the Node.js server"""
    print("🚀 Starting Emotional Codex Companion server...")
    
    # Set environment variables for Hugging Face Spaces
    env = os.environ.copy()
    env["NODE_ENV"] = "production"
    env["PORT"] = "7860"  # Hugging Face Spaces default port
    
    try:
        # Start the Node.js server
        process = subprocess.Popen(
            ["npm", "start"], 
            env=env,
            cwd=".",
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        def log_output():
            for line in process.stdout:
                print(f"[SERVER] {line.strip()}")
        
        # Start logging in a separate thread
        log_thread = threading.Thread(target=log_output)
        log_thread.daemon = True
        log_thread.start()
        
        print("✅ Server started successfully on port 7860")
        print("🌐 Emotional Codex Companion is now running!")
        print("📊 Features: 91+ emotion variants, professional analysis, cultural context")
        
        # Keep the process running
        process.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down server...")
        process.terminate()
        process.wait()
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

def main():
    """Main function to set up and run the application"""
    print("🧠 Emotional Codex Companion - Hugging Face Spaces")
    print("=" * 50)
    
    # Check if Node.js is available
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True)
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js and npm are required but not found")
        sys.exit(1)
    
    # Install dependencies and build
    install_node_dependencies()
    build_application()
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()